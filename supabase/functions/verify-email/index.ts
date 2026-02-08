import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { token } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: "missing_token", message: "Verification token is required." }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Email verification attempt with token: ${token.substring(0, 8)}...`);

    // Find registration by verification token
    const { data: registration, error: findError } = await supabase
      .from("investor_registrations")
      .select("id, email, company_name, phone_number, email_verified, verification_token_expires_at")
      .eq("verification_token", token)
      .maybeSingle();

    if (findError || !registration) {
      console.log("Verification token not found");
      return new Response(
        JSON.stringify({ success: false, error: "invalid_token", message: "This verification link is invalid or has already been used." }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if already verified
    if (registration.email_verified) {
      return new Response(
        JSON.stringify({ success: true, alreadyVerified: true, message: "Your email has already been verified. Your request is under review." }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check expiry
    if (registration.verification_token_expires_at && new Date(registration.verification_token_expires_at) < new Date()) {
      console.log("Verification token expired");
      return new Response(
        JSON.stringify({ success: false, error: "token_expired", message: "This verification link has expired. Please register again." }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Mark email as verified, clear token
    const { error: updateError } = await supabase
      .from("investor_registrations")
      .update({
        email_verified: true,
        verification_token: null,
        verification_token_expires_at: null,
      })
      .eq("id", registration.id);

    if (updateError) {
      console.error("Update error:", updateError);
      throw new Error("Failed to verify email");
    }

    console.log(`Email verified for ${registration.email}`);

    // Notify admins about new verified registration pending approval
    try {
      const { data: adminRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      if (adminRoles && adminRoles.length > 0) {
        const adminEmails: string[] = [];
        for (const role of adminRoles) {
          const { data: userData } = await supabase.auth.admin.getUserById(role.user_id);
          if (userData?.user?.email) {
            adminEmails.push(userData.user.email);
          }
        }

        if (adminEmails.length > 0) {
          const appUrl = "https://golden-dubai-whisper.lovable.app";
          const companyName = registration.company_name || registration.email.split("@")[1]?.split(".")[0] || "Unknown";

          await resend.emails.send({
            from: "Investment Team <onboarding@resend.dev>",
            to: adminEmails,
            subject: `✅ Email Verified – New Access Request: ${companyName} (${registration.email})`,
            html: buildAdminNotificationEmail(registration.email, registration.phone_number || "N/A", companyName, appUrl),
          });
          console.log(`Admin notification sent to ${adminEmails.join(", ")}`);
        }
      }
    } catch (adminEmailErr) {
      console.error("Admin notification email error:", adminEmailErr);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Your email has been verified! Our team will review your request and notify you once approved." }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Email verification error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

function buildAdminNotificationEmail(email: string, phone: string, companyName: string, appUrl: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="background: #1a1a2e; color: #ffffff; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 20px; letter-spacing: 2px;">NEW ACCESS REQUEST</h1>
        <p style="margin: 8px 0 0; font-size: 12px; opacity: 0.7; letter-spacing: 3px;">CONFIDENTIAL INVESTMENT PLATFORM</p>
      </div>
      <div style="padding: 30px; background: #ffffff; border: 1px solid #e5e5e5;">
        <div style="border-left: 4px solid #27ae60; padding: 12px 16px; background: #f0fdf4; margin-bottom: 20px;">
          <h2 style="color: #1a1a2e; margin: 0; font-size: 18px;">✅ Email Verified – Pending Your Approval</h2>
        </div>
        <p style="color: #555; line-height: 1.6;">A new investor has verified their email and is awaiting your approval to access the investment teaser.</p>
        <div style="background: #f8f8f8; padding: 16px; margin: 20px 0;">
          <table style="width: 100%; font-size: 13px; color: #555;">
            <tr><td style="padding: 4px 0; font-weight: 600;">Company:</td><td>${companyName}</td></tr>
            <tr><td style="padding: 4px 0; font-weight: 600;">Email:</td><td>${email}</td></tr>
            <tr><td style="padding: 4px 0; font-weight: 600;">Phone:</td><td>${phone}</td></tr>
            <tr><td style="padding: 4px 0; font-weight: 600;">Verified at:</td><td>${new Date().toLocaleString("en-US", { timeZone: "Asia/Dubai" })}</td></tr>
          </table>
        </div>
        <div style="margin: 24px 0; text-align: center;">
          <a href="${appUrl}/admin" style="display: inline-block; background: #c9a84c; color: #1a1a2e; padding: 14px 28px; text-decoration: none; font-weight: 600; letter-spacing: 1px;">
            REVIEW IN DASHBOARD
          </a>
        </div>
      </div>
      <div style="text-align: center; padding: 20px; color: #aaa; font-size: 11px;">
        <p>Automated notification from the investment platform.</p>
      </div>
    </div>
  `;
}
