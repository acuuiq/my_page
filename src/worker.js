export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS, DELETE",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // ===== API: جلب كل المودات =====
    if (path === "/api/mods" && request.method === "GET") {
      try {
        const { results } = await env.DB.prepare(
          "SELECT * FROM mods ORDER BY created_at DESC",
        ).all();
        return new Response(JSON.stringify(results), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ===== API: إضافة مود جديد =====
    if (path === "/api/mods" && request.method === "POST") {
      try {
        const body = await request.json();
        const { title, description, image_url, download_url, category } = body;

        if (!title) {
          return new Response(JSON.stringify({ error: "Title is required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const result = await env.DB.prepare(
          "INSERT INTO mods (title, description, image_url, download_url, category) VALUES (?, ?, ?, ?, ?)",
        )
          .bind(
            title,
            description || "",
            image_url || "",
            download_url || "",
            category || "mods",
          )
          .run();

        return new Response(
          JSON.stringify({ success: true, id: result.meta.last_row_id }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ===== API: حذف مود =====
    if (path.startsWith("/api/mods/") && request.method === "DELETE") {
      try {
        const id = path.split("/")[3];
        await env.DB.prepare("DELETE FROM mods WHERE id = ?").bind(id).run();
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ===== الموقع الثابت (HTML/CSS/JS) =====
    return env.ASSETS
      ? env.ASSETS.fetch(request)
      : new Response("LEON API", {
          headers: corsHeaders,
        });
  },
};
