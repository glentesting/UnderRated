// Environment variables: ANTHROPIC_API_KEY, SUPABASE_SERVICE_ROLE_KEY

export const config = { runtime: 'edge' };

const SUPABASE_URL = 'https://bglhfmwjfnmybcrjlscm.supabase.co';

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
    const { conditionName, answers, veteranContext } = await req.json();

    if (!conditionName || !answers) {
      return new Response(JSON.stringify({ error: 'Condition and answers are required.' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Query dbq_criteria for this condition
    let dbqContext = '';
    try {
      const searchTerm = conditionName.replace(/[^a-zA-Z0-9 ]/g, '%');
      const res = await fetch(`${SUPABASE_URL}/rest/v1/dbq_criteria?condition_name=ilike.*${encodeURIComponent(searchTerm)}*&limit=1`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      const rows = await res.json();
      if (Array.isArray(rows) && rows.length > 0) {
        const d = rows[0];
        dbqContext = `\n\nDBQ EXAM DATA FOR THIS CONDITION:`;
        if (d.dbq_form_number) dbqContext += `\nForm: ${d.dbq_form_number}`;
        if (d.key_symptoms && d.key_symptoms.length) dbqContext += `\nKey symptoms the examiner evaluates: ${d.key_symptoms.join(', ')}`;
        if (d.exam_tips) dbqContext += `\nExam tips: ${d.exam_tips}`;
        if (d.common_mistakes) dbqContext += `\nCommon mistakes veterans make: ${d.common_mistakes}`;
      }
    } catch { /* non-fatal */ }

    const answersText = Object.entries(answers).map(([q, a]) => `Q: ${q}\nA: ${a}`).join('\n\n');

    const systemPrompt = `You are a C&P exam preparation coach for VA disability claims. You help veterans accurately and completely describe their symptoms for Compensation & Pension examinations.

CRITICAL RULE: Never coach the veteran to lie or exaggerate. Only help them accurately and completely describe symptoms they actually experience. The goal is ensuring the VA has full and accurate information — nothing more.

Based on the veteran's condition and their interview answers, generate a prep sheet with EXACTLY these 5 sections:

1. **WHAT TO TELL THE EXAMINER**
Specific symptom language the veteran should use based on what they reported. Frame their actual experiences in the clinical language that C&P examiners document. 4-6 bullet points.

2. **WHAT NOT TO SAY**
Common phrases and behaviors that result in lower ratings. Based on the specific condition and known DBQ criteria. 3-4 bullet points.

3. **SYMPTOMS YOU MAY BE FORGETTING TO MENTION**
Based on the condition type and what the veteran reported, flag related symptoms they didn't mention but commonly co-occur. 3-5 bullet points.

4. **HOW TO DESCRIBE YOUR WORST DAY**
A 3-4 sentence paragraph the veteran can use as a template to describe their worst symptom days, using their own reported details.

5. **ONE PARAGRAPH SUMMARY — READ THIS BEFORE YOU WALK IN**
A confident, grounding paragraph reminding the veteran to describe their worst days, not minimize, and that this exam determines their compensation.

Be direct and veteran-to-veteran in tone. No corporate language.${dbqContext}${veteranContext ? '\n\nVETERAN CONTEXT:\n' + veteranContext : ''}`;

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1800,
        system: systemPrompt,
        messages: [{ role: 'user', content: `Generate a C&P exam prep sheet for: ${conditionName}\n\nVeteran's interview answers:\n${answersText}` }]
      })
    });

    if (!claudeResponse.ok) {
      return new Response(JSON.stringify({ error: 'The AI could not generate your prep sheet right now. Wait a few seconds and try again.' }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await claudeResponse.json();
    const prepSheet = data.content?.[0]?.text || '';

    return new Response(JSON.stringify({ success: true, prepSheet }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Something unexpected happened. Please try again.' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}
