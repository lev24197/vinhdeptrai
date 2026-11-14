# Cloudflare Worker Proxy cho Đồng Bộ AnkiWeb

Microservice Serverless trung gian giúp website tự động kích hoạt máy ảo GitHub Actions mà **không cần lưu GitHub Personal Access Token (PAT) trên trình duyệt**, bảo vệ an toàn 100% cho tài khoản GitHub của bạn.

## Các bước thiết lập trên Cloudflare (2 phút, miễn phí 100%):

1. **Đăng nhập vào Cloudflare:**
   - Truy cập: https://dash.cloudflare.com/
   - Vào mục **Workers & Pages** -> Bấm **Create Application** (hoặc **Create Worker**).

2. **Dán mã nguồn:**
   - Đặt tên cho Worker (ví dụ: `anki-sync-proxy`).
   - Bấm **Deploy**.
   - Bấm tiếp **Edit code**, xóa code mặc định và dán toàn bộ nội dung từ file `worker.js` vào -> Bấm **Deploy**.

3. **Cài đặt biến bí mật (Secret PAT):**
   - Vào lại trang quản lý của Worker vừa tạo -> Tab **Settings** -> Mục **Variables and Secrets**.
   - Bấm **Add** và điền:
     - Variable name: `GITHUB_PAT`
     - Value: `<Mã GitHub PAT của bạn>` (ví dụ mã ghp_... của bạn)
     - Bấm **Encrypt** -> **Save and Deploy**.

4. **Sử dụng:**
   - Sao chép đường link Worker (ví dụ: `https://anki-sync-proxy.lev24197.workers.dev`).
   - Mở website -> Cài đặt (Cấu hình API) -> Dán link này vào mục **Proxy Đồng Bộ Cloud**.
   - Từ nay về sau, mọi thiết bị (kể cả điện thoại mới) chỉ cần bấm **ĐỒNG BỘ ANKIWEB** là máy ảo tự chạy!
