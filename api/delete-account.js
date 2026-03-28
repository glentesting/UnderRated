// Environment variables needed:
// SUPABASE_SERVICE_ROLE_KEY — from Supabase dashboard > Settings > API > service_role key

export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { userId } = await req.json();
    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required.' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    const SUPABASE_URL = 'https://bglhfmwjfnmybcrjlscm.supabase.co';
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Verify the JWT belongs to the user requesting deletion
    const verifyRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': authHeader
      }
    });
    const verifyData = await verifyRes.json();
    if (!verifyData.id || verifyData.id !== userId) {
      return new Response(JSON.stringify({ error: 'You can only delete your own account.' }), {
        status: 403, headers: { 'Content-Type': 'application/json' }
      });
    }

    // 1. Delete conditions
    const condRes = await fetch(`${SUPABASE_URL}/rest/v1/conditions?user_id=eq.${userId}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal'
      }
    });
    if (!condRes.ok && condRes.status !== 404) {
      console.error('Failed to delete conditions:', condRes.status);
    }

    // 2. Delete profile
    const profRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${userId}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal'
      }
    });
    if (!profRes.ok && profRes.status !== 404) {
      console.error('Failed to delete profile:', profRes.status);
    }

    // 3. Delete auth user (requires service role — this is the critical step)
    const authRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    if (!authRes.ok) {
      const authErr = await authRes.text();
      console.error('Failed to delete auth user:', authRes.status, authErr);
      return new Response(JSON.stringify({ error: 'Could not fully delete your account from authentication. Please email support@getunderrated.com for help.' }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Account deletion failed \u2014 please try again or email support@getunderrated.com.' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}
