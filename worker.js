export default {
  async fetch(request, env, ctx) {
    return new Response(env.ASSETS.fetch(request));
  },
};
