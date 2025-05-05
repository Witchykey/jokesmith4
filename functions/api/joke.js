export async function onRequest(context) {
  try {
    const { request, env } = context;
    const { joke_type, topic } = await request.json();

    const prompt = `Tell me a ${joke_type || 'funny'} joke about ${topic || 'cats'}.`;

    const response = await fetch("https://api.openai.com/v1/completions", {
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

    const data = await response.json();

    // Optional: log to help with debugging in Cloudflare dashboard
    console.log("OpenAI response:", JSON.stringify(data, null, 2));

    const joke = data.choices?.[0]?.text?.trim();
    return new Response(JSON.stringify({
      joke: joke || "No joke found.",
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({
      error: err.message || "An unexpected error occurred"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
