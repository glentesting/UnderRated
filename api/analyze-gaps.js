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

// Helper: query Supabase REST API
async function sbQuery(url, key, path) {
  const res = await fetch(`${url}/rest/v1/${path}`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  if (!res.ok) return [];
  return await res.json();
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
  if (isRateLimited(ip)) {
    return new Response(JSON.stringify({ error: 'You\u2019ve run several analyses recently. Wait a couple minutes before trying again.' }), {
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
    const { conditions, veteranContext } = await req.json();

    if (!conditions || !conditions.length) {
      return new Response(JSON.stringify({ error: 'No conditions provided.' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    const SUPABASE_URL = 'https://bglhfmwjfnmybcrjlscm.supabase.co';
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const conditionNames = conditions.map(c => c.name);

    // ── 1. Search CFR text chunks (existing search_cfr RPC) ──
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

    // ── 2. Query secondary_connections for veteran's conditions ──
    let secondaryContext = '';
    try {
      // Build OR filter for case-insensitive match
      const orFilter = conditionNames.map(n => `primary_condition.ilike.*${encodeURIComponent(n.replace(/[^a-zA-Z0-9 ]/g, '%'))}*`).join(',');
      const secondaries = await sbQuery(SUPABASE_URL, SUPABASE_KEY,
        `secondary_connections?or=(${orFilter})&select=primary_condition,secondary_condition,relationship_strength,medical_rationale`
      );
      if (secondaries.length > 0) {
        secondaryContext = '\n\nSECONDARY CONDITIONS DOCUMENTED IN VA LITERATURE:\n' +
          secondaries.map(s =>
            `- ${s.primary_condition} → ${s.secondary_condition} (${s.relationship_strength}): ${s.medical_rationale}`
          ).join('\n');
      }
    } catch { /* non-fatal */ }

    // ── 3. Query mos_risk_profiles if MOS present in veteranContext ──
    let mosContext = '';
    try {
      if (veteranContext) {
        const mosMatch = veteranContext.match(/MOS\/Rate:\s*(\S+)/i);
        if (mosMatch && mosMatch[1] !== 'Not') {
          const mosCode = mosMatch[1];
          const mosProfiles = await sbQuery(SUPABASE_URL, SUPABASE_KEY,
            `mos_risk_profiles?mos_code=eq.${encodeURIComponent(mosCode)}&select=mos_code,mos_title,high_risk_conditions,common_claims`
          );
          if (mosProfiles.length > 0) {
            const mp = mosProfiles[0];
            mosContext = `\n\nMOS RISK PROFILE (${mp.mos_code} - ${mp.mos_title}):\nHigh risk conditions: ${(mp.high_risk_conditions || []).join(', ')}\nCommon claims for this MOS: ${(mp.common_claims || []).join(', ')}`;
          }
        }
      }
    } catch { /* non-fatal */ }

    // ── 4. Query diagnostic_codes for current conditions ──
    let ratingCriteriaContext = '';
    try {
      const allDiagCodes = await sbQuery(SUPABASE_URL, SUPABASE_KEY,
        `diagnostic_codes?select=code,condition_name,rating_0_criteria,rating_10_criteria,rating_20_criteria,rating_30_criteria,rating_40_criteria,rating_50_criteria,rating_60_criteria,rating_70_criteria,rating_80_criteria,rating_100_criteria`
      );
      if (allDiagCodes.length > 0) {
        const ratingTiers = ['0','10','20','30','40','50','60','70','80','100'];
        const lines = [];
        for (const cond of conditions) {
          const rating = parseInt(cond.rating) || 0;
          // Find matching diagnostic code by condition name (fuzzy)
          const condLower = cond.name.toLowerCase();
          const match = allDiagCodes.find(d => {
            const dLower = d.condition_name.toLowerCase();
            return dLower.includes(condLower) || condLower.includes(dLower) ||
              condLower.split(' ').some(w => w.length > 3 && dLower.includes(w));
          });
          if (match) {
            // Find current tier criteria and next tier
            const nextTier = ratingTiers.find(t => parseInt(t) > rating);
            const nextCriteriaKey = nextTier ? `rating_${nextTier}_criteria` : null;
            const nextCriteria = nextCriteriaKey ? match[nextCriteriaKey] : null;
            const currentCriteriaKey = `rating_${rating}_criteria`;
            const currentCriteria = match[currentCriteriaKey] || '';
            let line = `${cond.name} (DC ${match.code}): Currently rated ${rating}%.`;
            if (currentCriteria) line += ` Current tier criteria: "${currentCriteria}"`;
            if (nextCriteria) line += ` Next tier (${nextTier}%) requires: "${nextCriteria}"`;
            lines.push(line);
          }
        }
        if (lines.length > 0) {
          ratingCriteriaContext = '\n\nCURRENT CONDITION RATING CRITERIA:\n' + lines.join('\n');
        }
      }
    } catch { /* non-fatal */ }

    // ── Build condition summary ──
    const conditionSummary = cfrResults.map(c => {
      let entry = `Condition: ${c.condition}\nCurrent rating: ${c.rating}%\nDecision: ${c.decision}`;
      if (c.cfr_text) entry += `\n\n38 CFR Part 4 criteria:\n${c.cfr_text}`;
      return entry;
    }).join('\n\n---\n\n');

    // ── Build system prompt with database context ──
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
- "diagnostic_code": the likely VA diagnostic code (e.g. "DC 9411")

Be conservative but honest. If a condition is commonly underrated by the VA (like PTSD, back conditions, migraines), note that.${secondaryContext}${mosContext}${ratingCriteriaContext}

For each gap identified, cite the specific secondary connection, MOS exposure, or rating criteria that supports the claim. Name the likely diagnostic code. Tell the veteran exactly why their existing service or conditions support this new claim. Be specific — no generic advice.

Return ONLY the JSON array — no markdown, no explanation, no wrapping.`;

    const effectivePrompt = veteranContext
      ? systemPrompt + '\n\nAdditional veteran context:\n\n' + veteranContext
      : systemPrompt;

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
        system: effectivePrompt,
        messages: [{ role: 'user', content: `Analyze these veteran's conditions against 38 CFR Part 4:\n\n${conditionSummary}` }]
      })
    });

    if (!claudeResponse.ok) {
      return new Response(JSON.stringify({ error: 'The AI could not analyze your conditions right now \u2014 this is usually temporary. Wait a few seconds and try again.' }), {
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
      return new Response(JSON.stringify({ error: 'We had trouble processing the AI\u2019s response. Try again \u2014 if the issue persists, try removing unusual characters from your condition names.' }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, analysis: parsed }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Something unexpected happened on our end. Please try again \u2014 if this keeps happening, email support@getunderrated.com.' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}
