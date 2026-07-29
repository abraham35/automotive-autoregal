export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Dedicated AI Telematics API Endpoint
    if (url.pathname === "/api/diagnose" && request.method === "POST") {
      try {
        const { vehicle, dtc, health, recommendation } = await request.json();

        // Safe check to verify Cloudflare Workers AI binding is mounted
        if (!env.AI) {
          return new Response(JSON.stringify({ error: "AI binding missing in wrangler.toml" }), { status: 500 });
        }

        // Run the native GLM-4.7-Flash reasoning model
        const aiResponse = await env.AI.run("@cf/zai-org/glm-4.7-flash", {
          messages: [
            {
              role: "system",
              content: "You are the advanced automotive AI engine inside the AutoRegal SaaS dashboard. Analyze diagnostic trouble codes (DTC), vehicle performance data, and telemetry logs. Provide structural insights, mechanical diagnoses, and pinpoint localized solutions for professional shop mechanics."
            },
            {
              role: "user",
              content: `Asset Profile: ${vehicle}\nHealth Index: ${health}%\nActive Diagnostic Codes (DTC): ${JSON.stringify(dtc)}\nTelemetry Narrative: ${recommendation}`
            }
          ]
        });

        return new Response(JSON.stringify(aiResponse), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
      }
    }

    // 2. Your Existing Fallback: Serve static index.html or application files safely
    return env.ASSETS.fetch(request);
  },
};
