export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. CRITICAL FIXED LOGIC: Route root requests directly to your static asset files
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return env.ASSETS.fetch(request);
    }

    // 2. Live Streaming AI Telematics API Endpoint
    if (url.pathname === "/api/diagnose" && request.method === "POST") {
      try {
        const { vehicle, dtc, health, recommendation } = await request.json();

        if (!env.AI) {
          return new Response(JSON.stringify({ error: "AI binding missing in wrangler.toml" }), { status: 500 });
        }

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

        return new Response(aiResponse, {
          headers: { "Content-Type": "text/event-stream" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
      }
    }

    // 3. Fallback Asset Routing Matcher
    return env.ASSETS.fetch(request);
  },
};
