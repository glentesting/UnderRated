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
    return new Response(JSON.stringify({ error: 'You\u2019ve generated several documents recently. Wait a couple minutes before generating another.' }), {
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
    const { appeal_lane, condition_name, denial_reason, denial_text, action_items, veteran_name, decision_date } = await req.json();

    if (!appeal_lane || !condition_name || !denial_reason) {
      return new Response(JSON.stringify({ error: 'Appeal lane, condition, and denial reason are required.' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    const laneInstructions = {
      supplemental: `Write a Supplemental Claim cover letter (VA Form 20-0995 supporting statement). The letter should:
- Summarize what new and relevant evidence is being submitted
- Explain specifically how the new evidence addresses the prior denial reason
- Reference the original decision date and the condition denied
- Be professional, concise (1-2 pages), and focused on the new evidence
- Use clear headers: RE line, Introduction, New Evidence Summary, Conclusion
- End with a request for the claim to be reconsidered based on the new evidence`,

      hlr: `Write a Higher-Level Review request statement (VA Form 20-0996 supporting argument). The letter should:
- Identify the specific error made in the original rating decision
- Explain why the existing evidence supports service connection or a higher rating
- Reference specific regulations, rating criteria, or legal standards the rater misapplied
- Note any favorable evidence in the record that was ignored or given insufficient weight
- Be professional and focused on duty-to-assist errors, benefit-of-the-doubt failures, or misapplication of rating criteria
- Do NOT reference any new evidence — HLR does not allow new evidence`,

      bva_direct: `Write a brief for Board of Veterans Appeals (BVA) direct review. The letter should:
- Lay out the veteran's argument for why the denial was wrong
- Reference the evidence already in the record that supports the claim
- Cite the benefit-of-the-doubt doctrine (38 USC § 5107(b))
- Be structured as: Statement of the Case, Argument, Conclusion
- Be clear enough for a Veterans Law Judge to follow`,

      bva_evidence: `Write a brief for Board of Veterans Appeals (BVA) with new evidence submission. The letter should:
- Summarize the new evidence being submitted to the Board
- Explain how this evidence addresses the prior denial
- Lay out the full argument for service connection or increased rating
- Reference both existing record evidence and the new submissions
- Be structured as: Statement of the Case, New Evidence, Argument, Conclusion`,

      bva_hearing: `Write a brief for Board of Veterans Appeals (BVA) hearing request. The letter should:
- Prepare a written statement the veteran can use at their hearing
- Outline the key points to make during testimony
- Reference evidence in the record that supports each point
- Address the denial reason directly
- Include suggested questions the veteran's representative should ask
- Note what the veteran should emphasize in their own words`
    };

    const systemPrompt = `You are a VA disability claims expert drafting an appeal response document. Write a professional, well-structured document that a veteran or their VSO representative can use.

${laneInstructions[appeal_lane] || laneInstructions.supplemental}

Important:
- Label the document as "DRAFT — FOR REVIEW" at the top
- Use the veteran's name and the specific condition name throughout
- Reference the original denial date
- Keep the tone professional but clear — avoid excessive legalese
- This is a template that should be reviewed by a VSO or accredited attorney before submission`;

    const userPrompt = `Draft an appeal response for:

Veteran: ${veteran_name || '[Veteran Name]'}
Condition denied: ${condition_name}
Original decision date: ${decision_date || '[Decision Date]'}
Appeal lane: ${appeal_lane}
Denial reason: ${denial_reason}

Original denial text:
"""
${denial_text || 'Not provided'}
"""

Key action items to address:
${(action_items || []).map((item, i) => `${i + 1}. ${item}`).join('\n')}

Write the appeal response document now.`;

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    if (!claudeResponse.ok) {
      return new Response(JSON.stringify({ error: 'The AI could not generate your appeal response right now — this is usually temporary. Wait a few seconds and try again.' }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }

    const claudeData = await claudeResponse.json();
    const responseText = claudeData.content?.[0]?.text || '';

    return new Response(JSON.stringify({ success: true, response: responseText }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Something unexpected happened on our end. Please try again — if this keeps happening, email support@getunderrated.com.' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}
