export const config = { runtime: 'edge' };

export default async function handler(req) {
  // Only allow POST
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { file_url, user_id } = await req.json();

    if (!file_url) {
      return new Response(JSON.stringify({ error: 'file_url is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Step 1: Fetch the PDF from Supabase Storage
    const pdfResponse = await fetch(file_url);
    if (!pdfResponse.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch PDF', status: pdfResponse.status }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Step 2: Convert to base64
    const pdfBuffer = await pdfResponse.arrayBuffer();
    const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));

    // Step 3: Send to Claude API with PDF as document
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'document',
                source: {
                  type: 'base64',
                  media_type: 'application/pdf',
                  data: pdfBase64
                }
              },
              {
                type: 'text',
                text: `You are extracting VA disability claim data from this document.

Extract every condition you find — service connected, not service connected, and deferred.

Return ONLY a valid JSON array with no other text, no markdown, no explanation.

Format:
[
  {
    "condition_name": "PTSD",
    "diagnostic_code": "9411",
    "rating": 70,
    "decision": "service connected",
    "effective_date": "2023-09-03"
  }
]

Rules:
- rating must be a number (integer), not a string
- decision must be one of: "service connected", "not service connected", "deferred"
- effective_date format: YYYY-MM-DD, or null if not found
- diagnostic_code is a string (e.g. "9411"), or null if not found
- Include ALL conditions in the document, even denied ones`
              }
            ]
          }
        ]
      })
    });

    if (!claudeResponse.ok) {
      const err = await claudeResponse.text();
      return new Response(JSON.stringify({ error: 'Claude API error', details: err }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const claudeData = await claudeResponse.json();
    const rawText = claudeData.content?.[0]?.text || '[]';

    // Step 4: Parse Claude's JSON response
    let conditions;
    try {
      // Strip any accidental markdown fences
      const cleaned = rawText.replace(/```json|```/g, '').trim();
      conditions = JSON.parse(cleaned);
    } catch (parseErr) {
      return new Response(JSON.stringify({
        error: 'Failed to parse Claude response as JSON',
        raw: rawText
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Step 5: Return the extracted conditions
    return new Response(JSON.stringify({
      success: true,
      user_id: user_id || null,
      conditions: conditions,
      count: conditions.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
