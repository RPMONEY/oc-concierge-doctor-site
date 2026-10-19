// Logs one line per page view (not images/CSS) to Workers Logs, then serves the static site.
// Dashboard: Workers & Pages > this worker > Observability. Filter on "visit".
// Send prospects links like /?r=lastname so their visits are labeled. Use ?r=ryan for your own checks.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/__track") return new Response("tracking on");
    const res = await env.ASSETS.fetch(request);
    if ((request.headers.get("accept") || "").includes("text/html")) {
      const cf = request.cf || {};
      console.log(JSON.stringify({
        visit: true,
        r: url.searchParams.get("r") || "",
        path: url.pathname,
        status: res.status,
        city: cf.city || "", region: cf.region || "", country: cf.country || "",
        ref: request.headers.get("referer") || "",
        ua: request.headers.get("user-agent") || ""
      }));
    }
    return res;
  }
};
