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
      try {
        const assetResponse = await env.ASSETS.fetch(request);

        // ✅ إذا الملف غير موجود (404) وطلبه صفحة HTML → أظهر صفحة 404 مصمّمة
        if (assetResponse.status === 404) {
          const acceptHeader = request.headers.get("Accept") || "";
          const isHtmlRequest =
            acceptHeader.includes("text/html") ||
            path.endsWith(".html") ||
            path === "/";

          if (isHtmlRequest) {
            return new Response(generate404Page(path), {
              status: 404,
              headers: { "Content-Type": "text/html; charset=utf-8" },
            });
          }
        }

        return assetResponse;
      } catch (e) {
        // ✅ في حال حدوث خطأ، أظهر صفحة 500 مصمّمة
        return new Response(generateErrorPage(e.message), {
          status: 500,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }
    }

    // ✅ إذا لم يكن ASSETS مربوطاً
    return new Response(
      generateErrorPage(
        `env.ASSETS غير مربوط. تأكد من wrangler.toml. المسار المطلوب: ${path}`,
      ),
      {
        status: 500,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      },
    );
  },
};

// ============================================
// ===== دوال مساعدة =====
// ============================================

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

// ✅ صفحة 404 مصمّمة بنفس هوية الموقع
function generate404Page(path) {
  return `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>404 — الصفحة غير موجودة | LEON_AT</title>
    <link
      href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap"
      rel="stylesheet"
    />
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family: "Cairo", sans-serif;
        background: #0a0e1a;
        color: #f5f5f7;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        text-align: center;
      }
      .container {
        max-width: 500px;
        padding: 40px 30px;
        background: linear-gradient(135deg, #101827 0%, #1a2444 100%);
        border-radius: 20px;
        border: 1px solid rgba(41, 214, 255, 0.15);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      }
      h1 {
        font-size: 100px;
        font-weight: 900;
        background: linear-gradient(135deg, #29d6ff 0%, #7c3aed 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        line-height: 1;
        margin-bottom: 10px;
      }
      .icon {
        font-size: 60px;
        margin-bottom: 15px;
      }
      h2 {
        font-size: 24px;
        margin-bottom: 12px;
        color: #fff;
      }
      p {
        color: #999;
        font-size: 14px;
        margin-bottom: 10px;
        line-height: 1.7;
        word-break: break-all;
      }
      .path {
        background: rgba(41, 214, 255, 0.08);
        color: #29d6ff;
        padding: 10px 16px;
        border-radius: 10px;
        font-family: monospace;
        font-size: 13px;
        margin: 20px 0;
        border: 1px solid rgba(41, 214, 255, 0.2);
        direction: ltr;
        word-break: break-all;
      }
      .btn {
        display: inline-block;
        background: linear-gradient(135deg, #29d6ff 0%, #7c3aed 100%);
        color: white;
        padding: 14px 32px;
        border-radius: 12px;
        font-weight: 700;
        font-size: 15px;
        text-decoration: none;
        margin-top: 15px;
        transition: all 0.3s;
        box-shadow: 0 4px 20px rgba(41, 214, 255, 0.3);
      }
      .btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 35px rgba(41, 214, 255, 0.5);
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="icon">🔍</div>
      <h1>404</h1>
      <h2>الصفحة غير موجودة</h2>
      <p>الملف الذي تبحث عنه غير موجود في الموقع.</p>
      <div class="path">${escapeHtml(path)}</div>
      <p style="font-size: 12px; color: #666;">
        تأكد من المسار أو عد إلى الصفحة الرئيسية.
      </p>
      <a href="/" class="btn">← العودة للرئيسية</a>
    </div>
  </body>
</html>`;
}

// ✅ صفحة 500 مصمّمة للأخطاء
function generateErrorPage(message) {
  return `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>خطأ في الخادم | LEON_AT</title>
    <link
      href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap"
      rel="stylesheet"
    />
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family: "Cairo", sans-serif;
        background: #0a0e1a;
        color: #f5f5f7;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        text-align: center;
      }
      .container {
        max-width: 600px;
        padding: 40px 30px;
        background: linear-gradient(135deg, #101827 0%, #1a2444 100%);
        border-radius: 20px;
        border: 1px solid rgba(255, 100, 100, 0.2);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      }
      .icon {
        font-size: 60px;
        margin-bottom: 15px;
      }
      h1 {
        font-size: 28px;
        color: #ff5555;
        margin-bottom: 12px;
      }
      p {
        color: #999;
        font-size: 14px;
        line-height: 1.7;
        margin-bottom: 15px;
      }
      .error-msg {
        background: rgba(255, 50, 50, 0.1);
        color: #ff8888;
        padding: 14px 18px;
        border-radius: 10px;
        font-family: monospace;
        font-size: 13px;
        margin: 20px 0;
        border: 1px solid rgba(255, 50, 50, 0.2);
        direction: ltr;
        text-align: left;
        word-break: break-all;
      }
      .btn {
        display: inline-block;
        background: linear-gradient(135deg, #29d6ff 0%, #7c3aed 100%);
        color: white;
        padding: 14px 32px;
        border-radius: 12px;
        font-weight: 700;
        font-size: 15px;
        text-decoration: none;
        margin-top: 15px;
        transition: all 0.3s;
      }
      .btn:hover {
        transform: translateY(-3px);
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="icon">⚠️</div>
      <h1>خطأ في الخادم</h1>
      <p>حدث خطأ أثناء معالجة الطلب.</p>
      <div class="error-msg">${escapeHtml(message || "Unknown error")}</div>
      <a href="/" class="btn">← العودة للرئيسية</a>
    </div>
  </body>
</html>`;
}

// ✅ دالة تأمين النص من XSS
function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
