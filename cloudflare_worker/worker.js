// ============================================================================
// CLOUDFLARE WORKER: GITHUB ACTIONS DISPATCH PROXY
// Dùng để kích hoạt máy ảo đồng bộ AnkiWeb mà KHÔNG CẦN lưu GitHub PAT trên trình duyệt
// ============================================================================

export default {
  async fetch(request, env) {
    // 1. Xử lý CORS Preflight (OPTIONS request từ trình duyệt)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // 2. Chỉ chấp nhận phương thức POST
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed. Use POST." }), {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // 3. Lấy GitHub Token từ Biến Môi Trường Bí Mật (Environment Secret)
    const token = env.GITHUB_PAT;
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Chưa cấu hình secret GITHUB_PAT trong Cloudflare Worker Settings!" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const owner = env.GITHUB_OWNER || "lev24197";
    const repo = env.GITHUB_REPO || "vinhdeptrai";

    try {
      let body = {};
      try {
        body = await request.json();
      } catch (e) {
        body = {};
      }

      const workflow = body.workflow || "sync_ankiweb.yml";
      const ref = body.ref || "main";
      const inputs = body.inputs || {};

      // 4. Gửi lệnh kích hoạt workflow lên GitHub API
      const ghUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow}/dispatches`;
      const ghRes = await fetch(ghUrl, {
        method: "POST",
        headers: {
          "Accept": "application/vnd.github+json",
          "Authorization": `Bearer ${token}`,
          "User-Agent": "Anki-Sync-Proxy/1.0",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ref, inputs }),
      });

      if (ghRes.status === 204) {
        return new Response(
          JSON.stringify({ success: true, message: "Đã kích hoạt máy ảo GitHub Actions thành công!" }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      } else {
        const errText = await ghRes.text();
        return new Response(
          JSON.stringify({ success: false, status: ghRes.status, error: errText }),
          {
            status: ghRes.status,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }
    } catch (err) {
      return new Response(
        JSON.stringify({ success: false, error: err.message }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  },
};
