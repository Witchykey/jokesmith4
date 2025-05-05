export async function onRequest(context) {
  try {
    const { request, env } = context;

    // Verify API key exists
    if (!env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured");
    }

    // Read incoming request body
    const { joke_type, topic } = await request.json();

    // Validate input
    if (!joke_type || !topic) {
      throw new Error("Joke type and topic are required");
    }

    // Call OpenAI API using the chat completions endpoint
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            "role": "system",
            "content": "You are a witty joke generator. Create family-friendly jokes."
          },
          {
            "role": "user",
            "content": `Tell me a ${joke_type} joke about ${topic}`
          }
        ],
        max_tokens: 150,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const joke = data.choices?.[0]?.message?.content?.trim() || "Sorry, no joke was generated.";

    return new Response(JSON.stringify({ joke }), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"  // Add CORS header
      }
    });

  } catch (err) {
    console.error('Error:', err);
    return new Response(JSON.stringify({ 
      error: err.message || "An unexpected error occurred"
    }), {
      status: err.message.includes("required") ? 400 : 500,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"  // Add CORS header
      }
    });
  }
}
