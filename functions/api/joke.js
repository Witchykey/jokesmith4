export async function onRequest(context) {
  try {
    const { request, env } = context;

    // Read incoming request body
    const { joke_type, topic } = await request.json();

    if (!joke_type || !topic) {
      throw new Error("Joke type and topic are required");
    }

    if (!env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured");
    }

    // Create the prompt for OpenAI
    const prompt = `Create a ${joke_type} about ${topic}. Make it family-friendly and clever.`;

    // Call OpenAI API with GPT-4
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            "role": "system",
            "content": "You are a witty, family-friendly joke writer skilled at creating various types of jokes."
          },
          {
            "role": "user",
            "content": prompt
          }
        ],
        max_tokens: 200
      })
    });

    if (!response.ok) {
      const error = await response.json();
      const errorMessage = error.error?.message || "Failed to fetch joke from OpenAI";
      
      // Handle specific error cases
      if (errorMessage.includes("insufficient_quota") || errorMessage.includes("exceeded your current quota")) {
        throw new Error("OpenAI API quota exceeded. Please check your OpenAI account billing details.");
      } else if (errorMessage.toLowerCase().includes("rate limit")) {
        throw new Error("Rate limit reached. Please try again in a few moments.");
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const joke = data.choices?.[0]?.message?.content?.trim() || "Sorry, no joke was generated.";

    return new Response(JSON.stringify({ joke }), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ 
      error: err.message || "An unexpected error occurred"
    }), {
      status: err.message.includes("required") ? 400 : 500,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
