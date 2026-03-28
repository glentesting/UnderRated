export const config = { runtime: 'edge' };

const requestLog = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 120 * 1000;
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
    return new Response(JSON.stringify({ error: 'Too many requests. Please wait a couple minutes.' }), {
      status: 429, headers: { 'Content-Type': 'application/json' }
    });
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { conditions } = await req.json();

    if (!conditions || !conditions.length) {
      return new Response(JSON.stringify({ error: 'No conditions provided.' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    const SUPABASE_URL = 'https://bglhfmwjfnmybcrjlscm.supabase.co';
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Search CFR for each condition
    const cfrResults = [];
    for (const cond of conditions) {
      const searchTerm = cond.name.replace(/[—\-\/]/g, ' ').replace(/\(.*?\)/g, '').trim();
      try {
        const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/search_cfr`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
          },
          body: JSON.stringify({ search_term: searchTerm })
        });
        const chunks = await rpcRes.json();
        cfrResults.push({
          condition: cond.name,
          rating: cond.rating,
          decision: cond.decision || 'service connected',
          cfr_text: Array.isArray(chunks) ? chunks.slice(0, 3).map(c => c.content || c.chunk_text || '').join('\n\n') : ''
        });
      } catch {
        cfrResults.push({
          condition: cond.name,
          rating: cond.rating,
          decision: cond.decision || 'service connected',
          cfr_text: ''
        });
      }
    }

    const conditionSummary = cfrResults.map(c => {
      let entry = `Condition: ${c.condition}\nCurrent rating: ${c.rating}%\nDecision: ${c.decision}`;
      if (c.cfr_text) entry += `\n\n38 CFR Part 4 criteria:\n${c.cfr_text}`;
      return entry;
    }).join('\n\n---\n\n');

    const systemPrompt = `You are a VA disability benefits analyst with deep expertise in 38 CFR Part 4 rating criteria. Analyze each of the veteran's conditions against the CFR criteria provided and return ONLY a valid JSON array.

For each condition, return an object with:
- "condition_name": the condition name exactly as provided
- "current_rating": the current rating number
- "cfr_analysis": 2-3 sentences explaining what the CFR criteria say about rating this condition — what symptoms correspond to what rating levels. Write in plain English.
- "gap_assessment": one of "underpaid", "accurate", or "needs_more_info"
  - "underpaid" = the current rating seems low based on typical symptom presentation and CFR criteria
  - "accurate" = the rating appears to match common criteria
  - "needs_more_info" = cannot determine without more clinical detail
- "recommended_rating": a number (the next higher rating that may apply) or null if accurate/unknown
- "why_higher": 1-2 sentences explaining why a higher rating may apply (only if underpaid)
- "evidence_needed": array of 2-4 specific evidence items that would support a higher rating
- "secondary_conditions": array of 2-4 related conditions commonly secondary to this one that the veteran may not have claimed

Be conservative but honest. If a condition is commonly underrated by the VA (like PTSD, back conditions, migraines), note that. Base your analysis on the CFR criteria provided, not guesses.

Return ONLY the JSON array — no markdown, no explanation, no wrapping.`;

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        system: systemPrompt,
        messages: [{ role: 'user', content: `Analyze these veteran's conditions against 38 CFR Part 4:\n\n${conditionSummary}` }]
      })
    });

    if (!claudeResponse.ok) {
      return new Response(JSON.stringify({ error: 'AI analysis failed. Please try again.' }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }

    const claudeData = await claudeResponse.json();
    const rawText = claudeData.content?.[0]?.text || '[]';

    let parsed;
    try {
      const cleaned = rawText.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return new Response(JSON.stringify({ error: 'Failed to parse AI response.' }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, analysis: parsed }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}
