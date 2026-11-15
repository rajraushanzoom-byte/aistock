// Cloudflare Worker: free, keyless news proxy for NeuroTrade.
// Deploy at workers.cloudflare.com, then paste the worker URL into the site's
// "Optional: use your own news proxy" box.
const dec = s => s.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
export default {
  async fetch(req) {
    const q = (new URL(req.url).searchParams.get("q") || "Nifty 50").slice(0, 100);
    const r = await fetch("https://news.google.com/rss/search?q=" + encodeURIComponent(q + " stock when:7d") + "&hl=en-IN&gl=IN&ceid=IN:en");
    const xml = await r.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 15).map(m => {
      const g = t => (m[1].match(new RegExp("<" + t + "[^>]*>([\\s\\S]*?)</" + t + ">")) || [])[1] || "";
      return { title: dec(g("title")).replace(/ - [^-]+$/, ""), link: dec(g("link")), date: g("pubDate"), source: dec(g("source")) };
    });
    return new Response(JSON.stringify({ items }), {
      headers: { "content-type": "application/json", "access-control-allow-origin": "*", "cache-control": "public, max-age=300" }
    });
  }
};
