import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  const array = new Uint8Array(48);
  crypto.getRandomValues(array);
  for (const byte of array) {
    token += chars[byte % chars.length];
  }
  return token;
}

function getDomainFromEmail(email: string): string {
  const domain = email.split("@")[1] || "";
  return domain.split(".")[0] || "Unknown";
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, phoneNumber, ndaAcceptedAt } = await req.json();

    if (!email || !phoneNumber) {
      throw new Error("Email and phone number are required");
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phoneNumber.trim();
    const companyName = capitalizeFirst(getDomainFromEmail(cleanEmail));

    console.log(`Registration attempt: ${cleanEmail}, phone: ${cleanPhone}`);

    // Check for duplicate
    const { data: existing } = await supabase
      .from("investor_registrations")
      .select("id, approval_status")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existing) {
      // If already approved, just resend access info
      if (existing.approval_status === "approved") {
        return new Response(
          JSON.stringify({ 
            success: true, 
            autoApproved: true,
            message: "You're already approved! Check your email for the access link." 
          }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // If pending/rejected, check if they're now on the pre-approved list and auto-approve
      const { data: preApproved } = await supabase
        .from("pre_approved_contacts")
        .select("id, source")
        .eq("is_active", true)
        .or(`phone.eq.${cleanPhone},email.eq.${cleanEmail}`);

      if (preApproved && preApproved.length > 0) {
        console.log(`Auto-approving existing registration ${existing.id}`);
        const source = preApproved[0].source || "local_db";
        const token = generateToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        const { data: tokenData } = await supabase
          .from("access_tokens")
          .insert({ investor_id: existing.id, token, expires_at: expiresAt })
          .select()
          .single();

        await supabase
          .from("investor_registrations")
          .update({
            approval_status: "approved",
            approved_at: new Date().toISOString(),
            approval_source: source,
            access_token_id: tokenData?.id || null,
            phone_number: cleanPhone,
          })
          .eq("id", existing.id);

        const appUrl = "https://golden-dubai-whisper.lovable.app";
        const teaserLink = `${appUrl}/teaser?token=${token}`;

        try {
          await resend.emails.send({
            from: "Investment Team <onboarding@resend.dev>",
            to: [cleanEmail],
            subject: "Your Investment Access Has Been Approved",
            html: buildApprovalEmail(teaserLink, companyName),
          });
        } catch (emailErr) {
          console.error("Email send error:", emailErr);
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            autoApproved: true,
            message: "Your registration has been approved. Check your email for access." 
          }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "already_registered",
          message: "This email is already registered. Please wait for approval.",
          status: existing.approval_status 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Insert registration
    const { data: registration, error: insertError } = await supabase
      .from("investor_registrations")
      .insert({
        email: cleanEmail,
        full_name: cleanEmail,
        phone_number: cleanPhone,
        company_name: companyName,
        company_domain: getDomainFromEmail(cleanEmail),
        investor_type: "private_investor",
        investment_capacity: "under_5m",
        nda_accepted_at: ndaAcceptedAt || new Date().toISOString(),
        approval_source: "manual",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error(insertError.message);
    }

    console.log(`Registration created: ${registration.id}`);

    // Check pre_approved_contacts for auto-approval
    const { data: preApproved } = await supabase
      .from("pre_approved_contacts")
      .select("id, source")
      .eq("is_active", true)
      .or(`phone.eq.${cleanPhone},email.eq.${cleanEmail}`);

    const isAutoApproved = preApproved && preApproved.length > 0;

    if (isAutoApproved) {
      console.log(`Auto-approving investor ${registration.id} (matched pre-approved contact)`);
      const source = preApproved[0].source || "local_db";

      // Generate access token
      const token = generateToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const { data: tokenData, error: tokenError } = await supabase
        .from("access_tokens")
        .insert({
          investor_id: registration.id,
          token,
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (tokenError) {
        console.error("Token generation error:", tokenError);
      }

      // Update registration to approved
      await supabase
        .from("investor_registrations")
        .update({
          approval_status: "approved",
          approved_at: new Date().toISOString(),
          approval_source: source,
          access_token_id: tokenData?.id || null,
        })
        .eq("id", registration.id);

      // Send approval email with tokenized link
      const appUrl = "https://golden-dubai-whisper.lovable.app";
      const teaserLink = `${appUrl}/teaser?token=${token}`;

      try {
        await resend.emails.send({
          from: "Investment Team <onboarding@resend.dev>",
          to: [cleanEmail],
          subject: "Your Investment Access Has Been Approved",
          html: buildApprovalEmail(teaserLink, companyName),
        });
        console.log(`Approval email sent to ${cleanEmail}`);
      } catch (emailErr) {
        console.error("Email send error:", emailErr);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          autoApproved: true,
          message: "Your registration has been auto-approved. Check your email for access." 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Not auto-approved — notify admin (best effort)
    console.log(`Registration pending manual approval: ${registration.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        autoApproved: false,
        message: "Registration submitted. Our team will review your request." 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

function buildApprovalEmail(teaserLink: string, companyName: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="background: #1a1a2e; color: #ffffff; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">CONFIDENTIAL INVESTMENT</h1>
        <p style="margin: 8px 0 0; font-size: 12px; opacity: 0.7; letter-spacing: 3px;">HOTEL ASSET • DEIRA, DUBAI</p>
      </div>
      
      <div style="padding: 30px; background: #ffffff; border: 1px solid #e5e5e5;">
        <h2 style="color: #1a1a2e; margin-top: 0;">Access Approved</h2>
        <p style="color: #555; line-height: 1.6;">
          Dear ${companyName} team,<br><br>
          Your registration has been verified and approved. You now have exclusive access to the confidential hotel investment opportunity in Deira, Dubai.
        </p>
        
        <div style="margin: 24px 0; text-align: center;">
          <a href="${teaserLink}" 
             style="display: inline-block; background: #c9a84c; color: #1a1a2e; padding: 14px 28px; text-decoration: none; font-weight: 600; letter-spacing: 1px;">
            VIEW INVESTMENT TEASER
          </a>
        </div>
        
        <div style="background: #f8f8f8; padding: 16px; margin: 20px 0; border-left: 3px solid #c9a84c;">
          <p style="margin: 0; color: #555; font-size: 13px;">
            <strong>⏰ Time-Limited Access:</strong> This link expires in 24 hours and is bound to your device for security.
          </p>
        </div>
        
        <p style="color: #888; font-size: 13px; line-height: 1.5;">
          All information shared is strictly confidential per the NDA you accepted. Do not share or forward this link.
        </p>
      </div>
      
      <div style="text-align: center; padding: 20px; color: #aaa; font-size: 11px;">
        <p>This is a confidential communication. Unauthorized distribution is prohibited.</p>
      </div>
    </div>
  `;
}
