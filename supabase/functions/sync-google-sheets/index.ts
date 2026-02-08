import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error("Unauthorized");

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) throw new Error("Admin access required");

    // Get active Google Sheets config
    const { data: config, error: configError } = await supabase
      .from("google_sheets_config")
      .select("*")
      .eq("is_active", true)
      .maybeSingle();

    if (configError || !config) {
      throw new Error("No active Google Sheets configuration found");
    }

    console.log(`Syncing sheet: ${config.sheet_id}, name: ${config.sheet_name}`);

    // Update sync status
    await supabase
      .from("google_sheets_config")
      .update({ sync_status: "syncing", sync_error: null })
      .eq("id", config.id);

    // Fetch CSV from Google Sheets (public export URL)
    const sheetName = config.sheet_name || "Sheet1";
    const csvUrl = `https://docs.google.com/spreadsheets/d/${config.sheet_id}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
    
    console.log(`Fetching CSV from: ${csvUrl}`);
    const csvResponse = await fetch(csvUrl);

    if (!csvResponse.ok) {
      const errText = await csvResponse.text();
      console.error("CSV fetch failed:", errText);
      await supabase
        .from("google_sheets_config")
        .update({ 
          sync_status: "error", 
          sync_error: "Failed to fetch sheet. Make sure the sheet is publicly accessible (Anyone with the link can view)." 
        })
        .eq("id", config.id);
      throw new Error("Failed to fetch Google Sheet. Ensure it's publicly accessible.");
    }

    const csvText = await csvResponse.text();
    const rows = parseCSV(csvText);
    
    console.log(`Parsed ${rows.length} rows from sheet`);

    if (rows.length === 0) {
      await supabase
        .from("google_sheets_config")
        .update({ sync_status: "success", sync_error: null, last_synced_at: new Date().toISOString(), total_contacts_synced: 0 })
        .eq("id", config.id);
      return new Response(
        JSON.stringify({ success: true, contactsSynced: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Find header row (look for email/phone columns)
    const headers = rows[0].map((h: string) => h.toLowerCase().trim());
    const emailIdx = headers.findIndex((h: string) => h.includes("email"));
    const phoneIdx = headers.findIndex((h: string) => h.includes("phone") || h.includes("mobile") || h.includes("whatsapp"));
    const companyIdx = headers.findIndex((h: string) => h.includes("company") || h.includes("organization"));
    const notesIdx = headers.findIndex((h: string) => h.includes("notes") || h.includes("comment"));

    if (emailIdx === -1 && phoneIdx === -1) {
      await supabase
        .from("google_sheets_config")
        .update({ sync_status: "error", sync_error: "No 'email' or 'phone' column found in sheet headers." })
        .eq("id", config.id);
      throw new Error("Sheet must have an 'email' or 'phone' column header");
    }

    let synced = 0;
    const dataRows = rows.slice(1);

    for (const row of dataRows) {
      const email = emailIdx >= 0 ? (row[emailIdx] || "").trim().toLowerCase() : null;
      const phone = phoneIdx >= 0 ? (row[phoneIdx] || "").trim() : null;
      const company = companyIdx >= 0 ? (row[companyIdx] || "").trim() : null;
      const notes = notesIdx >= 0 ? (row[notesIdx] || "").trim() : null;

      if (!email && !phone) continue;

      // Upsert contact - use email or phone as unique identifier
      const contactData: Record<string, unknown> = {
        source: "google_sheets",
        is_active: true,
        updated_at: new Date().toISOString(),
      };
      if (email) contactData.email = email;
      if (phone) contactData.phone = phone;
      if (company) contactData.company_name = company;
      if (notes) contactData.notes = notes;

      // Try to find existing by email or phone
      let existingId: string | null = null;
      if (email) {
        const { data: existing } = await supabase
          .from("pre_approved_contacts")
          .select("id")
          .eq("email", email)
          .maybeSingle();
        if (existing) existingId = existing.id;
      }
      if (!existingId && phone) {
        const { data: existing } = await supabase
          .from("pre_approved_contacts")
          .select("id")
          .eq("phone", phone)
          .maybeSingle();
        if (existing) existingId = existing.id;
      }

      if (existingId) {
        await supabase
          .from("pre_approved_contacts")
          .update(contactData)
          .eq("id", existingId);
      } else {
        await supabase
          .from("pre_approved_contacts")
          .insert(contactData);
      }
      synced++;
    }

    // Update config with success
    await supabase
      .from("google_sheets_config")
      .update({
        sync_status: "success",
        sync_error: null,
        last_synced_at: new Date().toISOString(),
        total_contacts_synced: synced,
      })
      .eq("id", config.id);

    console.log(`Successfully synced ${synced} contacts`);

    return new Response(
      JSON.stringify({ success: true, contactsSynced: synced }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Sync error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: error.message === "Unauthorized" || error.message === "Admin access required" ? 403 : 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        row.push(current);
        current = "";
      } else if (char === "\n" || (char === "\r" && next === "\n")) {
        row.push(current);
        current = "";
        if (row.some(cell => cell.trim())) rows.push(row);
        row = [];
        if (char === "\r") i++;
      } else {
        current += char;
      }
    }
  }
  if (current || row.length > 0) {
    row.push(current);
    if (row.some(cell => cell.trim())) rows.push(row);
  }
  return rows;
}
