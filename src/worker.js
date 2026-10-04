export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // ============================================
    // ===== API: المودات =====
    // ============================================

    // جلب كل المودات
    if (path === "/api/mods" && request.method === "GET") {
      try {
        const { results } = await env.DB.prepare(
          "SELECT * FROM mods ORDER BY created_at DESC",
        ).all();
        return jsonResponse(results, corsHeaders);
      } catch (e) {
        return errorResponse(e.message, 500, corsHeaders);
      }
    }

    // جلب مود واحد بالتفصيل
    if (path.match(/^\/api\/mods\/\d+$/) && request.method === "GET") {
      try {
        const id = path.split("/")[3];

        // بيانات المود
        const mod = await env.DB.prepare("SELECT * FROM mods WHERE id = ?")
          .bind(id)
          .first();

        if (!mod) {
          return errorResponse("Mod not found", 404, corsHeaders);
        }

        // الإصدارات
        const versions = await env.DB.prepare(
          "SELECT * FROM mod_versions WHERE mod_id = ? ORDER BY created_at DESC",
        )
          .bind(id)
          .all();

        // الصور
        const images = await env.DB.prepare(
          "SELECT * FROM mod_images WHERE mod_id = ? ORDER BY sort_order ASC",
        )
          .bind(id)
          .all();

        return jsonResponse(
          {
            ...mod,
            versions: versions.results,
            images: images.results,
          },
          corsHeaders,
        );
      } catch (e) {
        return errorResponse(e.message, 500, corsHeaders);
      }
    }

    // إضافة مود جديد
    if (path === "/api/mods" && request.method === "POST") {
      try {
        const body = await request.json();
        const {
          title,
          description,
          full_description,
          image_url,
          download_url,
          category,
          edition,
          video_url,
        } = body;

        if (!title) {
          return errorResponse("Title is required", 400, corsHeaders);
        }

        const result = await env.DB.prepare(
          `INSERT INTO mods 
            (title, description, full_description, image_url, download_url, category, edition, video_url) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        )
          .bind(
            title,
            description || "",
            full_description || "",
            image_url || "",
            download_url || "",
            category || "mods",
            edition || "java",
            video_url || "",
          )
          .run();

        return jsonResponse(
          { success: true, id: result.meta.last_row_id },
          corsHeaders,
        );
      } catch (e) {
        return errorResponse(e.message, 500, corsHeaders);
      }
    }
    // تعديل مود
    if (path.match(/^\/api\/mods\/\d+$/) && request.method === "PUT") {
      try {
        const id = path.split("/")[3];
        const body = await request.json();
        const {
          title,
          description,
          full_description,
          image_url,
          download_url,
          category,
          edition,
          video_url,
        } = body;

        if (!title) {
          return errorResponse("Title is required", 400, corsHeaders);
        }

        await env.DB.prepare(
          `UPDATE mods SET 
            title = ?, 
            description = ?, 
            full_description = ?, 
            image_url = ?, 
            download_url = ?, 
            category = ?, 
            edition = ?, 
            video_url = ? 
           WHERE id = ?`,
        )
          .bind(
            title,
            description || "",
            full_description || "",
            image_url || "",
            download_url || "",
            category || "mods",
            edition || "java",
            video_url || "",
            id,
          )
          .run();

        return jsonResponse({ success: true }, corsHeaders);
      } catch (e) {
        return errorResponse(e.message, 500, corsHeaders);
      }
    }
    // حذف مود
    if (path.match(/^\/api\/mods\/\d+$/) && request.method === "DELETE") {
      try {
        const id = path.split("/")[3];
        await env.DB.prepare("DELETE FROM mod_versions WHERE mod_id = ?")
          .bind(id)
          .run();
        await env.DB.prepare("DELETE FROM mod_images WHERE mod_id = ?")
          .bind(id)
          .run();
        await env.DB.prepare("DELETE FROM mods WHERE id = ?").bind(id).run();
        return jsonResponse({ success: true }, corsHeaders);
      } catch (e) {
        return errorResponse(e.message, 500, corsHeaders);
      }
    }

    // ============================================
    // ===== API: الإصدارات =====
    // ============================================

    // جلب إصدارات مود معين
    if (
      path.match(/^\/api\/mods\/\d+\/versions$/) &&
      request.method === "GET"
    ) {
      try {
        const modId = path.split("/")[3];
        const { results } = await env.DB.prepare(
          "SELECT * FROM mod_versions WHERE mod_id = ? ORDER BY created_at DESC",
        )
          .bind(modId)
          .all();
        return jsonResponse(results, corsHeaders);
      } catch (e) {
        return errorResponse(e.message, 500, corsHeaders);
      }
    }

    // إضافة إصدار جديد
    if (
      path.match(/^\/api\/mods\/\d+\/versions$/) &&
      request.method === "POST"
    ) {
      try {
        const modId = path.split("/")[3];
        const body = await request.json();
        const { version, minecraft_version, download_url, changelog } = body;

        if (!version || !download_url) {
          return errorResponse(
            "Version and download_url are required",
            400,
            corsHeaders,
          );
        }

        const result = await env.DB.prepare(
          `INSERT INTO mod_versions 
            (mod_id, version, minecraft_version, download_url, changelog) 
           VALUES (?, ?, ?, ?, ?)`,
        )
          .bind(
            modId,
            version,
            minecraft_version || "",
            download_url,
            changelog || "",
          )
          .run();

        return jsonResponse(
          { success: true, id: result.meta.last_row_id },
          corsHeaders,
        );
      } catch (e) {
        return errorResponse(e.message, 500, corsHeaders);
      }
    }

    // حذف إصدار
    if (path.match(/^\/api\/versions\/\d+$/) && request.method === "DELETE") {
      try {
        const id = path.split("/")[3];
        await env.DB.prepare("DELETE FROM mod_versions WHERE id = ?")
          .bind(id)
          .run();
        return jsonResponse({ success: true }, corsHeaders);
      } catch (e) {
        return errorResponse(e.message, 500, corsHeaders);
      }
    }

    // ============================================
    // ===== API: الصور =====
    // ============================================

    // إضافة صورة
    if (path.match(/^\/api\/mods\/\d+\/images$/) && request.method === "POST") {
      try {
        const modId = path.split("/")[3];
        const body = await request.json();
        const { image_url, sort_order } = body;

        if (!image_url) {
          return errorResponse("image_url is required", 400, corsHeaders);
        }

        const result = await env.DB.prepare(
          `INSERT INTO mod_images (mod_id, image_url, sort_order) VALUES (?, ?, ?)`,
        )
          .bind(modId, image_url, sort_order || 0)
          .run();

        return jsonResponse(
          { success: true, id: result.meta.last_row_id },
          corsHeaders,
        );
      } catch (e) {
        return errorResponse(e.message, 500, corsHeaders);
      }
    }

    // حذف صورة
    if (path.match(/^\/api\/images\/\d+$/) && request.method === "DELETE") {
      try {
        const id = path.split("/")[3];
        await env.DB.prepare("DELETE FROM mod_images WHERE id = ?")
          .bind(id)
          .run();
        return jsonResponse({ success: true }, corsHeaders);
      } catch (e) {
        return errorResponse(e.message, 500, corsHeaders);
      }
    }

    // ============================================
    // ===== API: عدّاد الزيارات =====
    // ============================================

    // جلب عدد الزيارات
    if (path === "/api/views" && request.method === "GET") {
      try {
        // إنشاء الجدول إذا لم يكن موجوداً
        await env.DB.prepare(
          `CREATE TABLE IF NOT EXISTS site_views (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            count INTEGER DEFAULT 0,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`,
        ).run();

        // إضافة صف أولي إذا لم يكن موجوداً
        const existing = await env.DB.prepare(
          "SELECT COUNT(*) as c FROM site_views",
        ).first();

        if (existing.c === 0) {
          await env.DB.prepare(
            "INSERT INTO site_views (count) VALUES (0)",
          ).run();
        }

        // جلب العدد
        const row = await env.DB.prepare(
          "SELECT count FROM site_views ORDER BY id LIMIT 1",
        ).first();

        return jsonResponse({ views: row ? row.count : 0 }, corsHeaders);
      } catch (e) {
        return errorResponse(e.message, 500, corsHeaders);
      }
    }

    // زيادة عدد الزيارات
    if (path === "/api/views/increment" && request.method === "POST") {
      try {
        // إنشاء الجدول إذا لم يكن موجوداً
        await env.DB.prepare(
          `CREATE TABLE IF NOT EXISTS site_views (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            count INTEGER DEFAULT 0,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`,
        ).run();

        // إضافة صف أولي إذا لم يكن موجوداً
        const existing = await env.DB.prepare(
          "SELECT COUNT(*) as c FROM site_views",
        ).first();

        if (existing.c === 0) {
          await env.DB.prepare(
            "INSERT INTO site_views (count) VALUES (1)",
          ).run();
        } else {
          // زيادة العدد
          await env.DB.prepare(
            "UPDATE site_views SET count = count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT id FROM site_views ORDER BY id LIMIT 1)",
          ).run();
        }

        // جلب العدد الجديد
        const row = await env.DB.prepare(
          "SELECT count FROM site_views ORDER BY id LIMIT 1",
        ).first();

        return jsonResponse({ views: row ? row.count : 0 }, corsHeaders);
      } catch (e) {
        return errorResponse(e.message, 500, corsHeaders);
      }
    }

    // ============================================
    // ===== الملفات الثابتة =====
    // ============================================
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response("Not found", { status: 404 });
  },
};

// ===== دوال مساعدة =====
function jsonResponse(data, corsHeaders) {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorResponse(message, status, corsHeaders) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}