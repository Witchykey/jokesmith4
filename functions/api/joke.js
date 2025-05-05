export async function onRequest(context) {
  try {
    const { request, env } = context;
    const { joke_type, topic } = await request.json();

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

    const data = await response.json();

    return new Response(JSON.stringify({ joke: data.choices?.[0]?.text?.trim() || "No joke found." }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || "Error generating joke" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
