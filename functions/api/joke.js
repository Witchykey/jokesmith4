export async function onRequest(context) {
  try {
    const { request, env } = context;

    // ✅ Parse incoming JSON
    const { joke_type, topic } = await request.json();

    // ✅ Create a reliable prompt for testing
    const prompt = `Tell me a ${joke_type || 'funny'} joke about ${topic || 'bananas'}.`;

    // ✅ Send request to OpenAI Completion API
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

    // ✅ Get the actual response from OpenAI
    const joke = data.choices?.[0]?.text?.trim();

    // ✅ Return raw data for debugging
    return new Response(JSON.stringify({
      joke: joke,
      raw: data
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({
      error: err.message || "Unexpected error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
