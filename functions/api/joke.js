export async function onRequest(context) {
  try {
    const { request, env } = context;
    const { joke_type, topic } = await request.json();

    // Force a working prompt even if inputs are empty
    const prompt = `Tell me a ${joke_type || 'funny'} joke about ${topic || 'cats'}.`;

    // OpenAI API call
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

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();

    // Extract and clean up the joke result
    const joke = data.choices?.[0]?.text?.trim() || "Could not generate a joke";

    return new Response(JSON.stringify({
      joke,
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
