# Hướng Dẫn Triển Khai Anki Audio Service Lên Google Cloud Run (2 Phút)

Dịch vụ này giúp cào âm thanh từ điển Cambridge (US/UK) và tự động bù đắp bằng Google Cloud Text-to-Speech (Neural2 phát thanh viên) siêu tốc cho toàn bộ từ vựng Anki.

---

## ⚡ Cách 1: Triển khai trực tiếp qua Google Cloud Shell (Khuyên dùng nhất - Không cần cài đặt gì trên máy)

1. Mở trình duyệt và truy cập [Google Cloud Console](https://console.cloud.google.com/) (nơi bạn có 300$ miễn phí).
2. Bấm vào biểu tượng **Activate Cloud Shell** `>_` ở góc trên bên phải màn hình.
3. Trong cửa sổ dòng lệnh Cloud Shell mở ra ở dưới, bạn gõ lệnh tải thư mục mã nguồn:
   ```bash
   git clone https://github.com/lev24197/vinhdeptrai.git
   cd vinhdeptrai/cloud_audio_service
   ```
4. Chạy lệnh triển khai tự động:
   ```bash
   bash deploy.sh
   ```
   *(Hoặc gõ trực tiếp lệnh: `gcloud run deploy anki-audio-service --source . --region asia-southeast1 --allow-unauthenticated`)*
5. Đợi khoảng 1 - 2 phút, Google Cloud sẽ in ra một đường link HTTPS, ví dụ:
   ```
   Service URL: https://anki-audio-service-abc123xyz-as.a.run.app
   ```
6. **Sao chép đường link này** và dán vào ô **"Google Cloud Audio Service URL"** trong phần **Cài đặt (⚙️)** trên Web của bạn.

---

## 💡 Lưu ý về chi phí 300$:
- Cloud Run thiết lập `--min-instances 0`, nghĩa là **khi bạn không bấm tải, máy chủ tự động tắt hoàn toàn (chi phí = 0đ)**.
- Khi bấm tải, 100 từ vựng được tải đa luồng và đóng gói ZIP chỉ trong 3 - 5 giây.
- Mỗi tháng Google tặng miễn phí 2.000.000 lượt gọi Cloud Run, nên bạn gần như không tốn 1 xu nào từ gói 300$.
