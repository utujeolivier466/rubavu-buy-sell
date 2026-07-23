// @ts-nocheck
// Supabase Edge Function: send-submission-email
// Deploy with: supabase functions deploy send-submission-email --no-verify-jwt
// (--no-verify-jwt is required because this is called by anonymous
// property owners on the public "Sell Your Property" form, not logged-in users)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const COMPANY_EMAIL = Deno.env.get('COMPANY_EMAIL') || 'utujeolivier013@gmai.com';
const FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') || 'onboarding@resend.dev'; // swap once your domain is verified in Resend

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const submission: SubmissionPayload = await req.json();

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const photosHtml = submission.photo_urls?.length
      ? submission.photo_urls.map((url) => `<img src="${url}" width="150" style="margin-right:8px;border-radius:6px;" />`).join('')
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

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
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
      console.error('Resend error:', errText);
      return new Response(JSON.stringify({ error: 'Failed to send email' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('send-submission-email error:', err);
    return new Response(JSON.stringify({ error: 'Unexpected error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});