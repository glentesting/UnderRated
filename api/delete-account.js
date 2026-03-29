// Environment variables needed:
// SUPABASE_SERVICE_ROLE_KEY — from Supabase dashboard > Settings > API > service_role key
//
// FLOW:
// 1. Frontend sends POST with { userId } + Authorization: Bearer <user_jwt>
// 2. We create a Supabase admin client using the SERVICE ROLE KEY (not anon key)
// 3. We verify the JWT to confirm the user is deleting their own account
// 4. We call adminClient.auth.admin.deleteUser(userId)
//    - This deletes from auth.users
//    - If profiles has ON DELETE CASCADE on user_id FK, the profile row is auto-deleted
//    - If not, we manually delete conditions, uploads, and profiles first
// 5. Return success — frontend signs out and redirects

import { createClient } from '@supabase/supabase-js';

export const config = { runtime: 'edge' };

const SUPABASE_URL = 'https://bglhfmwjfnmybcrjlscm.supabase.co';

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized — no auth header.' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!SUPABASE_KEY) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables');
    return new Response(JSON.stringify({ error: 'Server configuration error — SUPABASE_SERVICE_ROLE_KEY is missing. Please email support@underratedvets.com.' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body.' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  // ── DIAGNOSTIC TEST MODE — POST { test: true } to check config ──
  if (body.test === true) {
    const adminClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    const diag = {
      hasServiceRoleKey: true,
      serviceRoleKeyLength: SUPABASE_KEY.length,
      hasAuthHeader: !!authHeader
    };
    try {
      const { data, error } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1 });
      diag.adminApiWorks = !error;
      diag.adminApiError = error ? error.message : null;
    } catch (e) {
      diag.adminApiWorks = false;
      diag.adminApiError = e.message;
    }
    return new Response(JSON.stringify(diag), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  // ── ACTUAL DELETION ──
  const { userId } = body;
  if (!userId) {
    return new Response(JSON.stringify({ error: 'User ID is required.' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  // Create admin client with service role key
  const adminClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    // Step 1: Verify the JWT belongs to the user requesting deletion
    const token = authHeader.replace('Bearer ', '');
    const { data: { user: jwtUser }, error: jwtError } = await adminClient.auth.getUser(token);

    if (jwtError || !jwtUser) {
      console.error('JWT verification failed:', jwtError?.message);
      return new Response(JSON.stringify({ error: 'Session expired — please refresh the page, log in, and try again.' }), {
        status: 401, headers: { 'Content-Type': 'application/json' }
      });
    }

    if (jwtUser.id !== userId) {
      return new Response(JSON.stringify({ error: 'You can only delete your own account.' }), {
        status: 403, headers: { 'Content-Type': 'application/json' }
      });
    }

    // Step 2: Delete user data from tables (in case no CASCADE)
    const { error: condError } = await adminClient
      .from('conditions')
      .delete()
      .eq('user_id', userId);
    console.log('Delete conditions:', condError ? condError.message : 'ok');

    const { error: uploadError } = await adminClient
      .from('uploads')
      .delete()
      .eq('user_id', userId);
    console.log('Delete uploads:', uploadError ? uploadError.message : 'ok');

    const { error: profError } = await adminClient
      .from('profiles')
      .delete()
      .eq('user_id', userId);
    console.log('Delete profile:', profError ? profError.message : 'ok');

    // Step 3: Delete from auth.users — THE CRITICAL STEP
    // This is what prevents "user already registered" on re-signup
    const { error: authError } = await adminClient.auth.admin.deleteUser(userId);

    if (authError) {
      console.error('auth.admin.deleteUser FAILED:', authError.message);
      return new Response(JSON.stringify({
        success: false,
        error: `Could not delete your login (${authError.message}). Your data was removed but your email is still registered. Please email support@underratedvets.com to complete the deletion.`
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    console.log('auth.admin.deleteUser SUCCESS for:', userId);
    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Delete account exception:', err.message, err.stack);
    return new Response(JSON.stringify({ error: 'Account deletion failed — ' + err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}
