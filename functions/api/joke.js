export async function onRequest(context) {
  try {
    const { request, env } = context;
    const { joke_type, topic } = await request.json();

    const prompt = `Tell me a ${joke_type || 'funny'} joke about ${topic || 'bananas'}.`;

    const openaiRes = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt,
        max_tokens: 60,
        temperature: 0.8
      })
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      return new Response(JSON.stringify({
        error: `OpenAI API error: ${openaiRes.status}`,
        message: errText
      }), { status: 500 });
    }

    const data = await openaiRes.json();
    const joke = data?.choices?.[0]?.text?.trim();

    if (!joke) {
      return new Response(JSON.stringify({
        error: "No joke returned from OpenAI",
        raw: data
      }), { status: 502 });
    }

    return new Response(JSON.stringify({ joke, raw: data }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({
      error: "Function crashed",
      message: err.message
    }), { status: 500 });
  }
}
