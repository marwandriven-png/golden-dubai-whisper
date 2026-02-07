import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NotifyRequest {
  investorId: string;
  action: "approved" | "rejected";
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify caller is admin
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      throw new Error("Admin access required");
    }

    const { investorId, action }: NotifyRequest = await req.json();
    console.log(`Processing ${action} notification for investor ${investorId}`);

    // Fetch investor details
    const { data: investor, error: investorError } = await supabase
      .from("investor_registrations")
      .select("*")
      .eq("id", investorId)
      .single();

    if (investorError || !investor) {
      throw new Error("Investor not found");
    }

    const investorEmail = investor.email;
    const teaserUrl = `${supabaseUrl.replace('.supabase.co', '')}.supabase.co/storage/v1/object/public/teaser/Confidential-Hotel-Investment-Deira-Dubai.pdf`;

    // Build the published app URL for the teaser page
    const appUrl = "https://golden-dubai-whisper.lovable.app";

    let subject: string;
    let html: string;

    if (action === "approved") {
      subject = "Your Investment Access Has Been Approved";
      html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: #1a1a2e; color: #ffffff; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">GOLDEN DUBAI WHISPER</h1>
            <p style="margin: 8px 0 0; font-size: 12px; opacity: 0.7; letter-spacing: 3px;">CONFIDENTIAL INVESTMENT</p>
          </div>
          
          <div style="padding: 30px; background: #ffffff; border: 1px solid #e5e5e5;">
            <h2 style="color: #1a1a2e; margin-top: 0;">Access Approved</h2>
            <p style="color: #555; line-height: 1.6;">
              Your registration has been reviewed and approved. You now have access to the confidential hotel investment opportunity in Deira, Dubai.
            </p>
            
            <div style="margin: 24px 0;">
              <a href="${appUrl}/teaser" 
                 style="display: inline-block; background: #c9a84c; color: #1a1a2e; padding: 14px 28px; text-decoration: none; font-weight: 600; letter-spacing: 1px;">
                VIEW INVESTMENT TEASER
              </a>
            </div>
            
            <p style="color: #888; font-size: 13px; line-height: 1.5;">
              Please remember that all information shared is confidential as per the NDA you accepted. 
              Do not share or forward this email.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #aaa; font-size: 11px;">
            <p>This is a confidential communication. If you received this in error, please delete it immediately.</p>
          </div>
        </div>
      `;
    } else {
      subject = "Investment Access Update";
      html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: #1a1a2e; color: #ffffff; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">GOLDEN DUBAI WHISPER</h1>
            <p style="margin: 8px 0 0; font-size: 12px; opacity: 0.7; letter-spacing: 3px;">CONFIDENTIAL INVESTMENT</p>
          </div>
          
          <div style="padding: 30px; background: #ffffff; border: 1px solid #e5e5e5;">
            <h2 style="color: #1a1a2e; margin-top: 0;">Registration Update</h2>
            <p style="color: #555; line-height: 1.6;">
              Thank you for your interest in our investment opportunity. After careful review, we are unable to grant access at this time.
            </p>
            <p style="color: #555; line-height: 1.6;">
              If you believe this is an error or would like to discuss further, please reply to this email.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #aaa; font-size: 11px;">
            <p>This is a confidential communication.</p>
          </div>
        </div>
      `;
    }

    console.log(`Sending ${action} email to ${investorEmail}`);

    const emailResponse = await resend.emails.send({
      from: "Investment Team <onboarding@resend.dev>",
      to: [investorEmail],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in notify-investor:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: error.message === "Unauthorized" || error.message === "Admin access required" ? 403 : 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
