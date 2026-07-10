// @ts-nocheck
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const COMPANY_EMAIL = Deno.env.get("COMPANY_EMAIL") || "utujeolivier013@gmail.com";
const FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubmissionPayload {
  full_name: string;
  phone: string;
  location_text: string;
  price: number;
  currency: string;
  property_type: string;
  upi?: string;
  photo_urls: string[];
}

export default {
  fetch: async (req) => {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    try {
      const submission: SubmissionPayload = await req.json();

      if (!RESEND_API_KEY) {
        return new Response(JSON.stringify({ error: "Email service not configured" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const photosHtml = submission.photo_urls?.length
        ? submission.photo_urls
            .map(
              (url) =>
                `<img src="${url}" width="150" style="margin-right:8px;border-radius:6px;" />`,
            )
            .join("")
        : '<p style="color:#888;">No photos attached</p>';

      const html = `
        <div style="font-family: sans-serif; max-width: 600px;">
          <h2 style="color:#0D1F3C;">New Property Submission</h2>
          <p>A property owner submitted a listing through the website.</p>
          <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding:6px 0; color:#666;">Full Name</td><td><strong>${submission.full_name}</strong></td></tr>
            <tr><td style="padding:6px 0; color:#666;">Phone</td><td><strong>${submission.phone}</strong></td></tr>
            <tr><td style="padding:6px 0; color:#666;">Location</td><td><strong>${submission.location_text}</strong></td></tr>
            <tr><td style="padding:6px 0; color:#666;">Price</td><td><strong>${submission.currency} ${Number(submission.price).toLocaleString()}</strong></td></tr>
            <tr><td style="padding:6px 0; color:#666;">Property Type</td><td><strong>${submission.property_type}</strong></td></tr>
            <tr><td style="padding:6px 0; color:#666;">UPI</td><td><strong>${submission.upi || '—'}</strong></td></tr>
          </table>
          <p style="color:#666;">Photos:</p>
          <div>${photosHtml}</div>
          <p style="margin-top:24px; color:#888; font-size:12px;">
            Log in to the admin dashboard to review and manage this submission.
          </p>
        </div>
      `;

      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: COMPANY_EMAIL,
          subject: `New Property Submission: ${submission.full_name} — ${submission.location_text}`,
          html,
        }),
      });

      if (!emailRes.ok) {
        const errText = await emailRes.text();
        console.error("Resend error:", errText);
        return new Response(JSON.stringify({ error: "Failed to send email" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("send-submission-email error:", err);
      return new Response(JSON.stringify({ error: "Unexpected error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-submission-email' \
    --header 'apiKey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH' \
    --data '{"name":"Functions"}'

*/
