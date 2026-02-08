import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SecurityEventRequest {
  eventType: "link_forwarded" | "device_mismatch" | "credential_misuse" | "token_expired" | "access_revoked";
  originalEmail: string;
  attemptedFingerprint?: string;
  originalFingerprint?: string;
  attemptedIp?: string;
  attemptedUserAgent?: string;
  tokenId?: string;
  investorId?: string;
  details?: Record<string, unknown>;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const event: SecurityEventRequest = await req.json();
    console.log(`Security event: ${event.eventType} for ${event.originalEmail}`);

    // Get admin emails
    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (!adminRoles || adminRoles.length === 0) {
      console.log("No admin users found to notify");
      return new Response(
        JSON.stringify({ success: true, message: "No admins to notify" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get admin emails from auth
    const adminEmails: string[] = [];
    for (const role of adminRoles) {
      const { data: userData } = await supabase.auth.admin.getUserById(role.user_id);
      if (userData?.user?.email) {
        adminEmails.push(userData.user.email);
      }
    }

    if (adminEmails.length === 0) {
      console.log("No admin emails found");
      return new Response(
        JSON.stringify({ success: true, message: "No admin emails" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // If link forwarded, auto-revoke the token
    if (event.eventType === "link_forwarded" && event.tokenId) {
      await supabase
        .from("access_tokens")
        .update({ is_revoked: true })
        .eq("id", event.tokenId);
      console.log(`Token ${event.tokenId} auto-revoked due to forwarded link`);
    }

    const appUrl = "https://golden-dubai-whisper.lovable.app";
    const adminLink = `${appUrl}/admin`;

    let eventTitle = "";
    let eventDescription = "";
    let eventColor = "#e74c3c";

    switch (event.eventType) {
      case "link_forwarded":
        eventTitle = "🚨 Forwarded Link Detected";
        eventDescription = `A forwarded access link was detected. The link originally issued to <strong>${event.originalEmail}</strong> was accessed from a different device. The token has been automatically revoked.`;
        break;
      case "device_mismatch":
        eventTitle = "⚠️ Device Mismatch Alert";
        eventDescription = `Access attempt from a new device for <strong>${event.originalEmail}</strong>. The original device fingerprint does not match.`;
        break;
      case "credential_misuse":
        eventTitle = "🔴 Credential Misuse Attempt";
        eventDescription = `Pre-approved credentials for <strong>${event.originalEmail}</strong> were used with a mismatched device or link.`;
        eventColor = "#c0392b";
        break;
      case "token_expired":
        eventTitle = "⏰ Access Token Expired";
        eventDescription = `Access for <strong>${event.originalEmail}</strong> has expired after 24 hours.`;
        eventColor = "#f39c12";
        break;
      case "access_revoked":
        eventTitle = "🔒 Access Revoked";
        eventDescription = `Access for <strong>${event.originalEmail}</strong> has been revoked.`;
        eventColor = "#95a5a6";
        break;
    }

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: #1a1a2e; color: #ffffff; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 20px; letter-spacing: 2px;">SECURITY ALERT</h1>
          <p style="margin: 8px 0 0; font-size: 12px; opacity: 0.7; letter-spacing: 3px;">CONFIDENTIAL INVESTMENT PLATFORM</p>
        </div>
        
        <div style="padding: 30px; background: #ffffff; border: 1px solid #e5e5e5;">
          <div style="border-left: 4px solid ${eventColor}; padding: 12px 16px; background: #fafafa; margin-bottom: 20px;">
            <h2 style="color: #1a1a2e; margin: 0; font-size: 18px;">${eventTitle}</h2>
          </div>
          
          <p style="color: #555; line-height: 1.6;">${eventDescription}</p>
          
          <div style="background: #f8f8f8; padding: 16px; margin: 20px 0;">
            <table style="width: 100%; font-size: 13px; color: #555;">
              <tr><td style="padding: 4px 0; font-weight: 600;">Original Email:</td><td>${event.originalEmail}</td></tr>
              ${event.attemptedFingerprint ? `<tr><td style="padding: 4px 0; font-weight: 600;">New Device ID:</td><td>${event.attemptedFingerprint}</td></tr>` : ""}
              ${event.originalFingerprint ? `<tr><td style="padding: 4px 0; font-weight: 600;">Original Device ID:</td><td>${event.originalFingerprint}</td></tr>` : ""}
              ${event.attemptedIp ? `<tr><td style="padding: 4px 0; font-weight: 600;">Attempted IP:</td><td>${event.attemptedIp}</td></tr>` : ""}
              <tr><td style="padding: 4px 0; font-weight: 600;">Timestamp:</td><td>${new Date().toISOString()}</td></tr>
            </table>
          </div>
          
          <div style="margin: 24px 0; text-align: center;">
            <a href="${adminLink}" style="display: inline-block; background: #c9a84c; color: #1a1a2e; padding: 14px 28px; text-decoration: none; font-weight: 600; letter-spacing: 1px; margin: 4px;">
              VIEW ADMIN DASHBOARD
            </a>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #aaa; font-size: 11px;">
          <p>Automated security notification. Do not reply.</p>
        </div>
      </div>
    `;

    try {
      await resend.emails.send({
        from: "Security Alert <onboarding@resend.dev>",
        to: adminEmails,
        subject: `[SECURITY] ${eventTitle} - ${event.originalEmail}`,
        html,
      });
      console.log(`Security alert sent to ${adminEmails.join(", ")}`);
    } catch (emailErr) {
      console.error("Email send error:", emailErr);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Security notification error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
