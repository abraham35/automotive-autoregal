export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. FIXED ROOT ROUTER: Force root path to serve index.html from your assets
    if (url.pathname === "/" || url.pathname === "") {
      return env.ASSETS.fetch(new Request(new URL("/index.html", request.url), request));
    }

    // 2. Live Streaming AI Telematics API Endpoint
    if (url.pathname === "/api/diagnose" && request.method === "POST") {
      try {
        const body = await request.json();
        const vehicle = body.vehicle || "Unknown Asset";
        const dtc = body.dtc || [];
        const health = body.health || 100;
        const recommendation = body.recommendation || "";

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
