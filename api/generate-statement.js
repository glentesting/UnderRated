// Environment variables: ANTHROPIC_API_KEY

export const config = { runtime: 'edge' };

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
    const { statementType, conditionName, answers, veteranContext } = await req.json();

    if (!statementType || !conditionName || !answers) {
      return new Response(JSON.stringify({ error: 'Statement type, condition, and answers are required.' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    const typeLabel = statementType === 'buddy' ? 'buddy statement' : 'lay statement';
    const answersText = Object.entries(answers).map(([q, a]) => `Q: ${q}\nA: ${a}`).join('\n\n');

    const systemPrompt = `Generate a VA ${typeLabel} for the condition: ${conditionName}.

The statement must:
- Use first-person narrative
- Include specific details, dates, and observations from the interview answers provided
- Describe functional impact on duty performance and daily life
- Be written in plain, credible language — not legal jargon
- Be 350-500 words — substantial enough to be credible
- End with a signature block: "I certify that the statements above are true and correct to the best of my knowledge and belief."
- NOT fabricate any details not provided in the interview
- NOT make medical diagnoses or conclusions

Format with clear paragraphs. No bullet points. Write in a natural, conversational tone that sounds like a real person — not a lawyer or AI.${veteranContext ? '\n\nVeteran context:\n' + veteranContext : ''}`;

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
        system: systemPrompt,
        messages: [{ role: 'user', content: `Generate the ${typeLabel} based on these interview answers:\n\n${answersText}` }]
      })
    });

    if (!claudeResponse.ok) {
      return new Response(JSON.stringify({ error: 'Could not generate your statement right now. Wait a few seconds and try again.' }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await claudeResponse.json();
    const statement = data.content?.[0]?.text || '';

    return new Response(JSON.stringify({ success: true, statement }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Something unexpected happened. Please try again.' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}
