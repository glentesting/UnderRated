export const config = { runtime: 'edge' };

const requestLog = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 3;
  const key = ip || 'unknown';
  const requests = requestLog.get(key) || [];
  const recent = requests.filter(t => now - t < windowMs);
  if (recent.length >= maxRequests) return true;
  recent.push(now);
  requestLog.set(key, recent);
  return false;
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
  if (isRateLimited(ip)) {
    return new Response(JSON.stringify({ error: 'You\u2019ve generated several letters recently. Wait a minute before generating another.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Your session has expired. Please refresh the page and log in again.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    const { secondary_condition, primary_condition, connection_type, onset_date, diagnosed, doctor_info, has_treatment, description, veteran_name, service_branch } = body;

    if (!secondary_condition || !primary_condition) {
      return new Response(JSON.stringify({ error: 'Both conditions are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const connectionVerb = connection_type === 'aggravated' ? 'aggravated by' : 'caused by';

    const systemPrompt = `You are a medical professional drafting a nexus letter template for a VA disability claim. Write a professional nexus letter that:

1. Is written in first person from the perspective of a treating medical provider
2. Uses the VA standard "at least as likely as not" (50% or greater probability) language
3. References the specific conditions by name
4. Explains the medical rationale for why the secondary condition is ${connectionVerb} the primary condition
5. Is 2-3 paragraphs long
6. Includes a header with the veteran's name, the date, and "RE: Nexus Letter"
7. Ends with a signature line for the provider's name, credentials, and license number
8. Is clearly labeled at the top as "DRAFT — FOR REVIEW BY LICENSED MEDICAL PROFESSIONAL"

Use professional medical language but keep it clear. Do not invent specific medical record dates or exam findings — use placeholders like [date of examination] where specifics would go.`;

    const userPrompt = `Draft a nexus letter for this veteran:

Veteran name: ${veteran_name || '[Veteran Name]'}
Service branch: ${service_branch || '[Branch]'}
Secondary condition (being claimed): ${secondary_condition}
Primary service-connected condition: ${primary_condition}
Connection: The secondary condition was ${connectionVerb} the primary condition
Onset/worsening: ${onset_date || 'Not specified'}
Diagnosed by doctor: ${diagnosed ? 'Yes' + (doctor_info ? ' — ' + doctor_info : '') : 'Not yet'}
Currently receiving treatment: ${has_treatment ? 'Yes' : 'No'}
Veteran's description: "${description || 'Not provided'}"

Write the nexus letter now.`;

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [
          { role: 'user', content: userPrompt }
        ],
        system: systemPrompt
      })
    });

    if (!claudeResponse.ok) {
      const errText = await claudeResponse.text();
      console.error('Claude API error:', errText);
      return new Response(JSON.stringify({ error: 'The AI could not generate your letter right now — this is usually temporary. Wait a few seconds and try again.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const claudeData = await claudeResponse.json();
    const letterText = claudeData.content?.[0]?.text || '';

    return new Response(JSON.stringify({ success: true, letter: letterText }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('generate-nexus error:', err);
    return new Response(JSON.stringify({ error: 'Something unexpected happened on our end. Please try again — if this keeps happening, email support@getunderrated.com.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
