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

// Common disposable email domains
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "tempmail.com", "throwaway.email",
  "yopmail.com", "sharklasers.com", "guerrillamailblock.com", "grr.la",
  "dispostable.com", "trashmail.com", "10minutemail.com", "tempail.com",
  "fakeinbox.com", "mailnesia.com", "maildrop.cc", "discard.email",
  "temp-mail.org", "getnada.com", "emailondeck.com", "33mail.com",
  "guerrillamail.info", "guerrillamail.net", "guerrillamail.org",
  "mailcatch.com", "trash-mail.com", "bugmenot.com", "mintemail.com",
]);

function isValidEmailDomain(email: string): { valid: boolean; reason?: string } {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return { valid: false, reason: "Invalid email format" };
  
  // Check disposable
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { valid: false, reason: "Disposable or temporary email addresses are not accepted. Please use your business email." };
  }
  
  // Check for obviously invalid patterns
  if (domain.length < 4 || !domain.includes(".")) {
    return { valid: false, reason: "This email domain is not valid. Please use a valid business email." };
  }

  return { valid: true };
}

function generateNdaText(email: string): string {
  const domain = email.split("@")[1] || "";
  const companyName = domain.split(".")[0] || "the Recipient";
  const capitalized = companyName.charAt(0).toUpperCase() + companyName.slice(1);
  const now = new Date();
  const expiryDate = new Date(now.getTime() + 2 * 365 * 24 * 60 * 60 * 1000);

  return `CONFIDENTIALITY AND NON-DISCLOSURE AGREEMENT

This Confidentiality and Non-Disclosure Agreement ("Agreement") is entered into as of ${now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}.

PARTIES:
Disclosing Party: The Investment Sponsor ("Sponsor")
Receiving Party: ${capitalized} ("Recipient")

PROJECT: Confidential Hotel Investment Opportunity
ASSET LOCATION: Deira, Dubai, United Arab Emirates
ASSET TYPE: Full-Service Hospitality Asset (120 Keys, 12 Floors)

1. CONFIDENTIAL INFORMATION
The Recipient acknowledges that all information regarding the above-referenced investment opportunity, including but not limited to financial data, tenant information, property specifications, valuation reports, and any other materials provided, constitutes Confidential Information.

2. NON-DISCLOSURE OBLIGATION
The Recipient agrees to:
a) Maintain strict confidentiality of all Confidential Information
b) Not disclose any Confidential Information to any third party without prior written consent
c) Use the Confidential Information solely for evaluating the investment opportunity
d) Not copy, reproduce, or distribute any Confidential Information
e) Not contact the property, tenants, or operators directly

3. RETURN OF MATERIALS
Upon request or upon deciding not to proceed, the Recipient shall return or destroy all Confidential Information received within 5 business days.

4. NO OBLIGATION
This Agreement does not obligate either party to complete any transaction.

5. TERM AND EXPIRY
This Agreement shall remain in effect until ${expiryDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}.

6. GOVERNING LAW
This Agreement shall be governed by the laws of the DIFC, Dubai, UAE.

ACCEPTANCE TIMESTAMP: ${now.toISOString()}
RECIPIENT IDENTIFIER: ${email}

By accepting, the Recipient acknowledges they have read, understood, and agree to be bound by this Agreement.`;
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

    // Validate email domain
    const emailValidation = isValidEmailDomain(cleanEmail);
    if (!emailValidation.valid) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "invalid_email",
          message: emailValidation.reason 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Registration attempt: ${cleanEmail}, phone: ${cleanPhone}`);

    // Check for duplicate
    const { data: existing } = await supabase
      .from("investor_registrations")
      .select("id, approval_status")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existing) {
      if (existing.approval_status === "approved") {
        // Fetch existing valid token or generate a new one
        const { data: existingToken } = await supabase
          .from("access_tokens")
          .select("token, expires_at, is_revoked")
          .eq("investor_id", existing.id)
          .eq("is_revoked", false)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        let tokenStr: string;
        if (existingToken && new Date(existingToken.expires_at) > new Date()) {
          tokenStr = existingToken.token;
        } else {
          // Generate fresh token
          tokenStr = generateToken();
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
          const { data: newToken } = await supabase
            .from("access_tokens")
            .insert({ investor_id: existing.id, token: tokenStr, expires_at: expiresAt })
            .select()
            .single();
          if (newToken) {
            await supabase
              .from("investor_registrations")
              .update({ access_token_id: newToken.id })
              .eq("id", existing.id);
          }
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            autoApproved: true,
            accessToken: tokenStr,
            message: "You're already approved!" 
          }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

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
        const ndaText = generateNdaText(cleanEmail);

        try {
          await resend.emails.send({
            from: "Investment Team <onboarding@resend.dev>",
            to: [cleanEmail],
            subject: "Your Investment Access Has Been Approved",
            html: buildApprovalEmail(teaserLink, companyName),
            attachments: [{
              filename: "NDA-Confidential-Hotel-Investment.txt",
              content: btoa(ndaText),
            }],
          });
        } catch (emailErr) {
          console.error("Email send error:", emailErr);
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            autoApproved: true,
            accessToken: token,
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
      console.log(`Auto-approving investor ${registration.id}`);
      const source = preApproved[0].source || "local_db";
      const token = generateToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const { data: tokenData, error: tokenError } = await supabase
        .from("access_tokens")
        .insert({ investor_id: registration.id, token, expires_at: expiresAt })
        .select()
        .single();

      if (tokenError) console.error("Token generation error:", tokenError);

      await supabase
        .from("investor_registrations")
        .update({
          approval_status: "approved",
          approved_at: new Date().toISOString(),
          approval_source: source,
          access_token_id: tokenData?.id || null,
        })
        .eq("id", registration.id);

      const appUrl = "https://golden-dubai-whisper.lovable.app";
      const teaserLink = `${appUrl}/teaser?token=${token}`;
      const ndaText = generateNdaText(cleanEmail);

      try {
        await resend.emails.send({
          from: "Investment Team <onboarding@resend.dev>",
          to: [cleanEmail],
          subject: "Your Investment Access Has Been Approved",
          html: buildApprovalEmail(teaserLink, companyName),
          attachments: [{
            filename: "NDA-Confidential-Hotel-Investment.txt",
            content: btoa(ndaText),
          }],
        });
        console.log(`Approval email with NDA sent to ${cleanEmail}`);
      } catch (emailErr) {
        console.error("Email send error:", emailErr);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          autoApproved: true,
          accessToken: token,
          message: "Your registration has been auto-approved. Check your email for access." 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Registration pending manual approval: ${registration.id}`);

    // Send confirmation email to investor
    try {
      await resend.emails.send({
        from: "Investment Team <onboarding@resend.dev>",
        to: [cleanEmail],
        subject: "Registration Received – Under Review",
        html: buildConfirmationEmail(companyName),
      });
      console.log(`Confirmation email sent to ${cleanEmail}`);
    } catch (emailErr) {
      console.error("Confirmation email error:", emailErr);
    }

    // Notify admins about new registration
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
          await resend.emails.send({
            from: "Investment Team <onboarding@resend.dev>",
            to: adminEmails,
            subject: `New Access Request: ${companyName} (${cleanEmail})`,
            html: buildAdminNotificationEmail(cleanEmail, cleanPhone, companyName, appUrl),
          });
          console.log(`Admin notification sent to ${adminEmails.join(", ")}`);
        }
      }
    } catch (adminEmailErr) {
      console.error("Admin notification email error:", adminEmailErr);
    }

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

function buildConfirmationEmail(companyName: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="background: #1a1a2e; color: #ffffff; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">CONFIDENTIAL INVESTMENT</h1>
        <p style="margin: 8px 0 0; font-size: 12px; opacity: 0.7; letter-spacing: 3px;">HOTEL ASSET • DEIRA, DUBAI</p>
      </div>
      <div style="padding: 30px; background: #ffffff; border: 1px solid #e5e5e5;">
        <h2 style="color: #1a1a2e; margin-top: 0;">Registration Received</h2>
        <p style="color: #555; line-height: 1.6;">
          Dear ${companyName} team,<br><br>
          Thank you for your interest in this confidential hotel investment opportunity. We have received your registration and NDA acceptance.
        </p>
        <div style="background: #f8f8f8; padding: 16px; margin: 20px 0; border-left: 3px solid #c9a84c;">
          <p style="margin: 0; color: #555; font-size: 13px;">
            <strong>📋 What happens next:</strong><br>
            Our team is reviewing your registration. You will receive a secure access link via email once approved. Review typically takes 24–48 hours.
          </p>
        </div>
        <p style="color: #888; font-size: 13px;">If you have any questions, please reply to this email.</p>
      </div>
      <div style="text-align: center; padding: 20px; color: #aaa; font-size: 11px;">
        <p>Confidential communication. Unauthorized distribution prohibited.</p>
      </div>
    </div>
  `;
}

function buildAdminNotificationEmail(email: string, phone: string, companyName: string, appUrl: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="background: #1a1a2e; color: #ffffff; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 20px; letter-spacing: 2px;">NEW ACCESS REQUEST</h1>
        <p style="margin: 8px 0 0; font-size: 12px; opacity: 0.7; letter-spacing: 3px;">CONFIDENTIAL INVESTMENT PLATFORM</p>
      </div>
      <div style="padding: 30px; background: #ffffff; border: 1px solid #e5e5e5;">
        <div style="border-left: 4px solid #c9a84c; padding: 12px 16px; background: #fafafa; margin-bottom: 20px;">
          <h2 style="color: #1a1a2e; margin: 0; font-size: 18px;">🔔 New Registration Pending Approval</h2>
        </div>
        <p style="color: #555; line-height: 1.6;">A new investor has registered and is awaiting your approval.</p>
        <div style="background: #f8f8f8; padding: 16px; margin: 20px 0;">
          <table style="width: 100%; font-size: 13px; color: #555;">
            <tr><td style="padding: 4px 0; font-weight: 600;">Company:</td><td>${companyName}</td></tr>
            <tr><td style="padding: 4px 0; font-weight: 600;">Email:</td><td>${email}</td></tr>
            <tr><td style="padding: 4px 0; font-weight: 600;">Phone:</td><td>${phone}</td></tr>
            <tr><td style="padding: 4px 0; font-weight: 600;">Submitted:</td><td>${new Date().toLocaleString("en-US", { timeZone: "Asia/Dubai" })}</td></tr>
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
