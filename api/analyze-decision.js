// Environment variables: ANTHROPIC_API_KEY, SUPABASE_SERVICE_ROLE_KEY

export const config = { runtime: 'edge' };

const SUPABASE_URL = 'https://bglhfmwjfnmybcrjlscm.supabase.co';

async function sbQuery(key, path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  if (!res.ok) return [];
  return await res.json();
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Your session has expired. Please refresh and log in again.' }), {
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

    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const conditionNames = conditions.map(c => c.name);

    // 1. Query diagnostic_codes for each condition
    let diagContext = '';
    try {
      const allCodes = await sbQuery(SUPABASE_KEY,
        'diagnostic_codes?select=code,condition_name,rating_0_criteria,rating_10_criteria,rating_20_criteria,rating_30_criteria,rating_40_criteria,rating_50_criteria,rating_60_criteria,rating_70_criteria,rating_80_criteria,rating_100_criteria'
      );
      if (allCodes.length > 0) {
        const tiers = ['0','10','20','30','40','50','60','70','80','100'];
        const lines = [];
        for (const cond of conditions) {
          const condLower = cond.name.toLowerCase();
          const match = allCodes.find(d => {
            const dLower = d.condition_name.toLowerCase();
            return dLower.includes(condLower) || condLower.includes(dLower) ||
              condLower.split(' ').some(w => w.length > 3 && dLower.includes(w));
          });
          if (match) {
            let line = `${cond.name} → DC ${match.code} (${match.condition_name}):`;
            tiers.forEach(t => {
              const key = `rating_${t}_criteria`;
              if (match[key]) line += `\n  ${t}%: ${match[key]}`;
            });
            lines.push(line);
          }
        }
        if (lines.length) diagContext = '\n\nDIAGNOSTIC CODE RATING CRITERIA:\n' + lines.join('\n\n');
      }
    } catch { /* non-fatal */ }

    // 2. Query secondary_connections for unclaimed secondaries
    let secContext = '';
    try {
      const orFilter = conditionNames.map(n =>
        `primary_condition.ilike.*${encodeURIComponent(n.replace(/[^a-zA-Z0-9 ]/g, '%'))}*`
      ).join(',');
      const secs = await sbQuery(SUPABASE_KEY,
        `secondary_connections?or=(${orFilter})&select=primary_condition,secondary_condition,relationship_strength,medical_rationale`
      );
      if (secs.length > 0) {
        // Filter out secondaries the veteran already has
        const claimed = new Set(conditionNames.map(n => n.toLowerCase()));
        const unclaimed = secs.filter(s => !claimed.has(s.secondary_condition.toLowerCase()));
        if (unclaimed.length > 0) {
          secContext = '\n\nUNCLAIMED SECONDARY CONDITIONS (documented in VA literature):\n' +
            unclaimed.map(s => `- ${s.primary_condition} → ${s.secondary_condition} (${s.relationship_strength}): ${s.medical_rationale}`).join('\n');
        }
      }
    } catch { /* non-fatal */ }

    // Build condition summary
    const condSummary = conditions.map(c =>
      `Condition: ${c.name}\nCurrent rating: ${c.rating}%\nDecision: ${c.decision || 'service connected'}`
    ).join('\n---\n');

    const systemPrompt = `You are a VA disability law analyst with expertise in 38 CFR Part 4 rating criteria, VA adjudication procedures, and common rating errors. Review each of the veteran's conditions against the diagnostic criteria provided and return ONLY a valid JSON array.

For each condition, return an object with:
- "condition_name": the condition name exactly as provided
- "current_rating": the current rating number
- "diagnostic_code": the likely VA diagnostic code (e.g. "DC 9411")
- "rating_appears_correct": boolean — whether the rating matches typical symptom presentation for this level
- "issues_found": array of strings — specific problems identified. Check for:
  * Wrong diagnostic code applied (veteran may benefit from a different code)
  * Rating doesn't match symptom criteria at that percentage level
  * Common procedural errors (no C&P exam ordered, conditions not addressed, inadequate reasons and bases, failure to consider lay evidence, failure to apply benefit of the doubt)
  * Failure to rate under the most favorable diagnostic code
  * Conditions rated together that should be separate
- "next_rating_tier": number — what percentage they might qualify for, or null
- "next_tier_criteria": string — what specific symptoms justify the next tier
- "missed_secondaries": array of condition names not yet claimed but documented as secondary to this condition
- "recommended_action": one of "ACCEPT", "SUPPLEMENT", "APPEAL"
  * ACCEPT = rating appears correct, no clear errors
  * SUPPLEMENT = new evidence could raise the rating (supplemental claim)
  * APPEAL = clear error in how the VA applied the law or rating criteria (HLR or Board appeal)
- "action_reason": 1-2 sentences explaining why this action is recommended
- "confidence": one of "HIGH", "MEDIUM", "LOW"

Be specific — cite actual rating criteria thresholds. If a condition is commonly underrated (PTSD, back conditions, migraines, sleep apnea), flag it. Always recommend consulting a VSO or accredited attorney for formal legal advice.${diagContext}${secContext}${veteranContext ? '\n\nVETERAN CONTEXT:\n' + veteranContext : ''}

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
        messages: [{ role: 'user', content: `Analyze this veteran's rating decision:\n\n${condSummary}` }]
      })
    });

    if (!claudeResponse.ok) {
      return new Response(JSON.stringify({ error: 'The AI could not analyze your decision right now. Wait a few seconds and try again.' }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await claudeResponse.json();
    const rawText = data.content?.[0]?.text || '[]';

    let parsed;
    try {
      parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim());
    } catch {
      return new Response(JSON.stringify({ error: 'We had trouble processing the analysis. Try again.' }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, analysis: parsed }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Something unexpected happened. Please try again.' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}
