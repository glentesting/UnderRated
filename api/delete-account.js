// Environment variables needed:
// SUPABASE_SERVICE_ROLE_KEY — from Supabase dashboard > Settings > API > service_role key

export const config = { runtime: 'edge' };

const SUPABASE_URL = 'https://bglhfmwjfnmybcrjlscm.supabase.co';

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const authHeader = req.headers.get('authorization');
  const body = await req.json();

  // ── DIAGNOSTIC TEST MODE ──
  if (body.test === true) {
    const diag = {
      step: 'start',
      hasAuthHeader: !!authHeader,
      authHeaderPrefix: authHeader ? authHeader.substring(0, 12) + '...' : null,
      hasServiceRoleKey: !!SUPABASE_KEY,
      serviceRoleKeyLength: SUPABASE_KEY ? SUPABASE_KEY.length : 0,
      userId: body.userId || null
    };

    if (!SUPABASE_KEY) {
      diag.step = 'FAILED — SUPABASE_SERVICE_ROLE_KEY is not set in environment';
      return new Response(JSON.stringify(diag), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Test 1: Can we verify the JWT?
    if (authHeader) {
      try {
        const verifyRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': authHeader }
        });
        diag.jwtVerifyStatus = verifyRes.status;
        const verifyBody = await verifyRes.json();
        diag.jwtVerifyUserId = verifyBody.id || null;
        diag.jwtVerifyEmail = verifyBody.email || null;
        diag.step = 'jwt_verified';
      } catch (e) {
        diag.jwtVerifyError = e.message;
        diag.step = 'jwt_verify_failed';
      }
    }

    // Test 2: Can we call the admin API?
    try {
      const adminRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=1`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      diag.adminApiStatus = adminRes.status;
      diag.adminApiOk = adminRes.ok;
      diag.step = adminRes.ok ? 'admin_api_accessible' : 'admin_api_denied';
    } catch (e) {
      diag.adminApiError = e.message;
      diag.step = 'admin_api_failed';
    }

    return new Response(JSON.stringify(diag), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  // ── ACTUAL DELETION FLOW ──
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized — no auth header.' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!SUPABASE_KEY) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is not set');
    return new Response(JSON.stringify({ error: 'Server configuration error — please email support@getunderrated.com.' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }

  const { userId } = body;
  if (!userId) {
    return new Response(JSON.stringify({ error: 'User ID is required.' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Verify the JWT belongs to the user requesting deletion
    const verifyRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': authHeader }
    });
    if (!verifyRes.ok) {
      return new Response(JSON.stringify({ error: 'Session expired — please refresh the page, log in, and try again.' }), {
        status: 401, headers: { 'Content-Type': 'application/json' }
      });
    }
    const verifyData = await verifyRes.json();
    if (!verifyData.id || verifyData.id !== userId) {
      return new Response(JSON.stringify({ error: 'You can only delete your own account.' }), {
        status: 403, headers: { 'Content-Type': 'application/json' }
      });
    }

    // Step 1: Delete conditions
    const condRes = await fetch(`${SUPABASE_URL}/rest/v1/conditions?user_id=eq.${userId}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal'
      }
    });
    console.log('Delete conditions:', condRes.status);

    // Step 2: Delete profile
    const profRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${userId}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal'
      }
    });
    console.log('Delete profile:', profRes.status);

    // Step 3: Delete auth user — THE CRITICAL STEP
    const authRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    const authStatus = authRes.status;
    console.log('Delete auth user:', authStatus);

    if (!authRes.ok) {
      const errText = await authRes.text();
      console.error('Auth delete failed:', authStatus, errText);
      return new Response(JSON.stringify({
        success: false,
        error: `Account deletion failed at auth step (${authStatus}). Your conditions and profile were removed but your login still exists. Please email support@getunderrated.com to complete the deletion.`
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Delete account exception:', err);
    return new Response(JSON.stringify({ error: 'Account deletion failed \u2014 ' + err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}
