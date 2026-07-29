export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Live Streaming AI Telematics API Endpoint
    if (url.pathname === "/api/diagnose" && request.method === "POST") {
      try {
        const { vehicle, dtc, health, recommendation } = await request.url ? await request.json() : {};

        if (!env.AI) {
          return new Response(JSON.stringify({ error: "AI binding missing in wrangler.toml" }), { status: 500 });
        }

        // Call the model with streaming activated
        const aiResponse = await env.AI.run("@cf/zai-org/glm-4.7-flash", {
          stream: true,
          messages: [
            {
              role: "system",
              content: "You are the advanced automotive AI engine inside the AutoRegal SaaS dashboard. Provide real-time, dynamic structural insights, torque specs, and pinpoint localized solutions for professional shop mechanics based on their exact prompt text."
            },
            {
              role: "user",
              content: `Asset Profile: ${vehicle}\nHealth Index: ${health}%\nActive Codes: ${JSON.stringify(dtc)}\nQuery Narrative: ${recommendation}`
            }
          ]
        });

        // Pipe the raw Text/Event-Stream directly back to the user interface
        return new Response(aiResponse, {
          headers: { "Content-Type": "text/event-stream" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
      }
    }

    return env.ASSETS.fetch(request);
  },
};
