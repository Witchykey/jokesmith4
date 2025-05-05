export async function onRequest(context) {
  try {
    const { request, env } = context;

    // Read incoming request body
    const { joke_type, topic } = await request.json();

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt: `Tell me a ${joke_type} about ${topic}`,
        max_tokens: 60,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const joke = data.choices?.[0]?.text?.trim() || "Sorry, no joke was generated.";

    return new Response(JSON.stringify({ joke }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
