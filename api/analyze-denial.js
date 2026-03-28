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
    return new Response(JSON.stringify({ error: 'You\u2019ve run several analyses recently. Wait a minute before trying again.' }), {
      status: 429, headers: { 'Content-Type': 'application/json' }
    });
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Your session has expired. Please refresh the page and log in again.' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { denial_text, condition_name, decision_date } = await req.json();

    if (!denial_text || !condition_name) {
      return new Response(JSON.stringify({ error: 'Denial text and condition name are required.' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    const systemPrompt = `You are a VA disability claims expert analyzing a denial decision. You must return ONLY a valid JSON object with no other text, no markdown, no explanation.

Format:
{
  "denial_reason": "A 1-2 sentence plain-English summary of why the claim was denied",
  "denial_category": "One of: insufficient_evidence, no_nexus, not_service_connected, not_disabling, missed_deadline, other",
  "recommended_lane": "One of: supplemental, hlr, bva_direct, bva_evidence, bva_hearing",
  "lane_explanation": "2-3 sentences explaining why this appeal lane is the best choice for this specific denial",
  "deadline_note": "A note about the 1-year appeal deadline from the decision date",
  "action_items": ["item 1", "item 2", "item 3", "item 4", "item 5"]
}

Appeal lane guidance:
- supplemental: Best when denied for insufficient evidence and the veteran CAN get new evidence (new medical records, nexus letter, buddy statements). Most common and fastest lane.
- hlr: Best when the evidence is already strong but the rater made a clear error in applying the law or ignored favorable evidence. No new evidence allowed. A senior reviewer looks at it fresh.
- bva_direct: Best when the veteran believes the record is complete and wants a judge to decide based on existing evidence. Slower but thorough.
- bva_evidence: Best when the veteran wants to submit new evidence directly to a judge. Slower than supplemental but sometimes necessary.
- bva_hearing: Best for complex cases where the veteran's testimony would be persuasive, or when the case involves credibility determinations.

Action items should be specific to the denial reason — what evidence, statements, or documentation would be most likely to overturn this specific denial.`;

    const userPrompt = `Analyze this VA denial for the condition "${condition_name}":

Decision date: ${decision_date || 'Not specified'}

Denial text:
"""
${denial_text}
"""

Return the JSON analysis.`;

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1200,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    if (!claudeResponse.ok) {
      return new Response(JSON.stringify({ error: 'The AI could not analyze your denial right now — this is usually temporary. Wait a few seconds and try again.' }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }

    const claudeData = await claudeResponse.json();
    const rawText = claudeData.content?.[0]?.text || '{}';

    let parsed;
    try {
      const cleaned = rawText.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return new Response(JSON.stringify({ error: 'We had trouble processing the AI\u2019s response. Try again — if the denial text is very long, try pasting just the key denial paragraph.' }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, analysis: parsed }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Something unexpected happened on our end. Please try again — if this keeps happening, email support@getunderrated.com.' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}
