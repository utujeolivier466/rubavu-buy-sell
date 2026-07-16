// Supabase Edge Function: list-admin-users
// Deploy with: supabase functions deploy list-admin-users

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Missing authorization' }, 401);
    const jwt = authHeader.replace('Bearer ', '');

    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: userData, error: userError } = await adminClient.auth.getUser(jwt);
    if (userError || !userData.user) {
      return json({ error: 'Invalid session' }, 401);
    }

    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .single();

    if (profileError || profile?.role !== 'owner') {
      return json({ error: 'Only owners can view the user list' }, 403);
    }

    const { data: authUsers, error: listError } = await adminClient.auth.admin.listUsers();
    if (listError) {
      console.error('List users failed:', listError);
      return json({ error: listError.message }, 500);
    }

    const { data: profiles, error: profilesError } = await adminClient
      .from('profiles')
      .select('id, role');

    if (profilesError) {
      console.error('Fetching profiles failed:', profilesError);
      return json({ error: profilesError.message }, 500);
    }

    const roleMap: Record<string, string> = Object.fromEntries(
      (profiles || []).map((p: any) => [p.id, p.role])
    );

    const users = (authUsers?.users || []).map((u: any) => ({
      id: u.id,
      email: u.email,
      role: roleMap[u.id] || 'staff',
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
    }));

    return json({ users });
  } catch (err) {
    console.error('list-admin-users error:', err);
    return json({ error: 'Unexpected error' }, 500);
  }
});
