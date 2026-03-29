// ADMIN ENDPOINT — manually delete a user from auth.users by email
// Use this when account deletion failed and user is stuck with "already registered"
//
// Call from browser console or curl:
// POST /api/admin-delete-user
// Body: { "email": "user@example.com", "adminSecret": "your-secret" }
//
// Set ADMIN_SECRET in Vercel env vars to protect this endpoint.
// After use, consider removing this file or rotating the secret.

import { createClient } from '@supabase/supabase-js';

export const config = { runtime: 'edge' };

const SUPABASE_URL = 'https://bglhfmwjfnmybcrjlscm.supabase.co';

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { email, adminSecret } = await req.json();

    // Protect with a secret (set ADMIN_SECRET in Vercel env vars)
    const expectedSecret = process.env.ADMIN_SECRET;
    if (!expectedSecret || adminSecret !== expectedSecret) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403, headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SUPABASE_KEY) {
      return new Response(JSON.stringify({ error: 'SUPABASE_SERVICE_ROLE_KEY not set' }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }

    const adminClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Find user by email
    const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers();
    if (listError) {
      return new Response(JSON.stringify({ error: 'Could not list users: ' + listError.message }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      return new Response(JSON.stringify({ error: 'No user found with email: ' + email, searched: users.length + ' users' }), {
        status: 404, headers: { 'Content-Type': 'application/json' }
      });
    }

    // Delete their data first
    await adminClient.from('conditions').delete().eq('user_id', user.id);
    await adminClient.from('uploads').delete().eq('user_id', user.id);
    await adminClient.from('profiles').delete().eq('user_id', user.id);

    // Delete from auth.users
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
    if (deleteError) {
      return new Response(JSON.stringify({
        error: 'Failed to delete auth user: ' + deleteError.message,
        userId: user.id
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'User ' + email + ' fully deleted from auth.users and all data tables.',
      userId: user.id
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}
