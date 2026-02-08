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
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { valid: false, reason: "Disposable or temporary email addresses are not accepted. Please use your business email." };
  }
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
          <a href="${teaserLink}" style="display: inline-block; background: #c9a84c; color: #1a1a2e; padding: 14px 28px; text-decoration: none; font-weight: 600; letter-spacing: 1px;">
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

function buildVerificationEmail(verifyLink: string, companyName: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="background: #1a1a2e; color: #ffffff; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">CONFIDENTIAL INVESTMENT</h1>
        <p style="margin: 8px 0 0; font-size: 12px; opacity: 0.7; letter-spacing: 3px;">HOTEL ASSET • DEIRA, DUBAI</p>
      </div>
      <div style="padding: 30px; background: #ffffff; border: 1px solid #e5e5e5;">
        <h2 style="color: #1a1a2e; margin-top: 0;">Verify Your Email</h2>
        <p style="color: #555; line-height: 1.6;">
          Dear ${companyName} team,<br><br>
          Thank you for registering your interest in this confidential hotel investment opportunity. Please verify your email address to complete your registration.
        </p>
        <div style="margin: 24px 0; text-align: center;">
          <a href="${verifyLink}" style="display: inline-block; background: #c9a84c; color: #1a1a2e; padding: 14px 28px; text-decoration: none; font-weight: 600; letter-spacing: 1px;">
            VERIFY EMAIL ADDRESS
          </a>
        </div>
        <div style="background: #f8f8f8; padding: 16px; margin: 20px 0; border-left: 3px solid #c9a84c;">
          <p style="margin: 0; color: #555; font-size: 13px;">
            <strong>⏰ Important:</strong> This verification link expires in 24 hours. After verification, our team will review your request and grant access.
          </p>
        </div>
        <p style="color: #888; font-size: 13px;">If you did not request this, please ignore this email.</p>
      </div>
      <div style="text-align: center; padding: 20px; color: #aaa; font-size: 11px;">
        <p>Confidential communication. Unauthorized distribution prohibited.</p>
      </div>
    </div>
  `;
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

    const emailValidation = isValidEmailDomain(cleanEmail);
    if (!emailValidation.valid) {
      return new Response(
        JSON.stringify({ success: false, error: "invalid_email", message: emailValidation.reason }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Registration attempt: ${cleanEmail}, phone: ${cleanPhone}`);

    // Check for duplicate
    const { data: existing } = await supabase
      .from("investor_registrations")
      .select("id, approval_status, email_verified")
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
          JSON.stringify({ success: true, autoApproved: true, accessToken: tokenStr, message: "You're already approved!" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Check pre-approved for existing pending registration
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
            email_verified: true,
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
            attachments: [{ filename: "NDA-Confidential-Hotel-Investment.txt", content: btoa(ndaText) }],
          });
        } catch (emailErr) {
          console.error("Email send error:", emailErr);
        }

        return new Response(
          JSON.stringify({ success: true, autoApproved: true, accessToken: token, message: "Your registration has been approved." }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({ success: false, error: "already_registered", message: "This email is already registered. Please check your email for verification or wait for approval.", status: existing.approval_status }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Insert new registration - auto-approve everyone
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
        approval_source: "auto_open",
        email_verified: true,
        approval_status: "approved",
        approved_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error(insertError.message);
    }

    console.log(`Registration created & auto-approved: ${registration.id}`);

    // Generate access token
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
      .update({ access_token_id: tokenData?.id || null })
      .eq("id", registration.id);

    // Log the auto-approval in audit log
    await supabase.from("access_audit_log").insert({
      investor_id: registration.id,
      token_id: tokenData?.id || null,
      event_type: "access_granted",
      original_email: cleanEmail,
      details: { auto_approved: true, source: "open_access" },
    });

    const appUrl = "https://golden-dubai-whisper.lovable.app";
    const teaserLink = `${appUrl}/teaser?token=${token}`;
    const ndaText = generateNdaText(cleanEmail);

    try {
      await resend.emails.send({
        from: "Investment Team <onboarding@resend.dev>",
        to: [cleanEmail],
        subject: "Your Investment Access Has Been Approved",
        html: buildApprovalEmail(teaserLink, companyName),
        attachments: [{ filename: "NDA-Confidential-Hotel-Investment.txt", content: btoa(ndaText) }],
      });
      console.log(`Approval email sent to ${cleanEmail}`);
    } catch (emailErr) {
      console.error("Email send error:", emailErr);
    }

    return new Response(
      JSON.stringify({ success: true, autoApproved: true, accessToken: token, message: "Your registration has been approved." }),
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
