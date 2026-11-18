# BÁO CÁO ĐÁNH GIÁ TÍNH KHẢ THI: CÀO DỮ LIỆU 9 CỘT TỪ TỪ ĐIỂN CAMBRIDGE

Nhánh thử nghiệm: `feature/cambridge-scraper`  
Mục đích: Đánh giá phương án thay thế tạo từ bằng Gemini API sang chỉ dùng Gemini sinh danh sách 100 từ, sau đó dùng laptop cào dữ liệu 9 cột từ từ điển Cambridge.

---

## 1. Kết Quả Thử Nghiệm Thực Tế Từ Laptop

Chúng tôi đã thiết lập script kiểm tra độc lập tại `tools/test_cambridge_feasibility.ps1` và gửi request trực tiếp từ laptop của bạn đến từ điển Cambridge. Dưới đây là kết quả đo lường thực tế:

### Thử nghiệm 1: Gửi Request trực tiếp đến website `dictionary.cambridge.org`
- **Kết quả**: Bị chặn 100% với lỗi `HTTP/1.1 403 Forbidden` (`Cf-Mitigated: challenge`).
- **Nguyên nhân kỹ thuật**: Trang web Cambridge Dictionary được bảo vệ bởi **Cloudflare Turnstile & Bot Management**. Mọi công cụ cào dữ liệu tự động (PowerShell, Python `requests`, cURL, v.v.) chạy từ IP thông thường đều bị Cloudflare chặn và yêu cầu giải mã JavaScript / CAPTCHA tương tác của con người.

### Thử nghiệm 2: Kiểm tra dữ liệu 9 cột qua Cambridge Gateway trên 5 từ đại diện

| Cột cần thiết cho Anki | `apple` (từ cơ bản) | `watering-can` (danh từ ghép) | `pruning-shears` (danh từ chuyên ngành) | `trellis` (giàn leo) | `gardening-glove` (từ ghép chủ đề) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Word (Từ vựng)** | `apple` | `watering can` | `pruning shears` | `trellis` | **Word Not Found (404)** |
| **2. Cloze (Đục lỗ)** | Tự sinh (local) | Tự sinh (local) | Tự sinh (local) | Tự sinh (local) | - |
| **3. IPA (Phiên âm US)** | `/ˈæp.əl/` | `/ˈwɑː.t̬ɚ.ɪŋ ˌkæn/` | `/ˈpruː.nɪŋ ˌʃɪrz/` | `/ˈtrel.ɪs/` | - |
| **4. Sound (MP3)** | Có MP3 Cambridge | Có MP3 Cambridge | Có MP3 Cambridge | Có MP3 Cambridge | - |
| **5. Definition (Định nghĩa)** | Có định nghĩa | Có định nghĩa | Có định nghĩa | Có định nghĩa | - |
| **6 & 7. Nghĩa tiếng Việt** | **TRỐNG (Không có)** | **TRỐNG (Không có)** | **TRỐNG (Không có)** | **TRỐNG (Không có)** | - |
| **8. Plural (Số nhiều)** | `apples` | **TRỐNG** | **TRỐNG** | **TRỐNG** | - |
| **9. 2 Ví dụ câu ngữ cảnh** | 4 câu ngắn vụn | **0 câu (Trống)** | **0 câu (Trống)** | **0 câu (Trống)** | - |

---

## 2. Phân Tích Những Điểm Nghẽn Của Phương Án Cào Cambridge Thuần Túy

1. **Không có nghĩa tiếng Việt**: Từ điển Cambridge chuẩn là từ điển Anh-Anh (`CALD`). Kho từ điển Anh-Việt của Cambridge rất hạn chế (chỉ khoảng 15.000 từ phổ thông), không chứa các từ ghép và thuật ngữ chuyên sâu theo từng chủ đề.
2. **Không có dạng số nhiều cho từ có quy tắc**: Cambridge chỉ lưu dạng số nhiều cho các từ bất quy tắc (`child -> children`). Với từ thông thường (`watering can -> watering cans`), Cambridge bỏ trống vì quy ước ngữ pháp ngầm hiểu là thêm `s/es`.
3. **Thiếu câu ví dụ hoàn chỉnh (Cột 9)**: Hơn 70% các mục từ đồ vật hoặc danh từ chuyên môn trong Cambridge không có câu ví dụ, hoặc chỉ có cụm từ ngắn (như `"apple pie"`), không đáp ứng được yêu cầu 2 câu ví dụ hoàn chỉnh của bộ bài Anki.
4. **Từ ghép bị 404 (Word Not Found)**: Trong một danh sách 100 từ vựng theo chủ đề, thường có 15% - 25% là từ ghép hữu ích (ví dụ: `gardening glove`, `seedling tray`, `pruning saw`). Từ điển Cambridge không coi đây là các mục từ đơn lẻ nên sẽ trả về lỗi không tìm thấy.

---

## 3. Đề Xuất Kiến Trúc Tối Ưu: Pipeline Lai 0 ĐỒNG (Hybrid Zero-Cost Pipeline)

Ý tưởng cốt lõi của bạn rất chính xác: **Không dùng Gemini để sinh văn bản dài 9 cột nhằm triệt tiêu chi phí token**.

Để đạt được mục tiêu **100% ĐẦY ĐỦ 9 CỘT** và **HOÀN TOÀN 0 ĐỒNG**, ta có thể kết hợp như sau:

1. **Bước 1 - Sinh 100 từ bằng Gemini (Free Tier / Chi phí gần bằng 0)**:
   - Dùng 1 prompt duy nhất yêu cầu trả về danh sách JSON gồm 100 danh từ số ít:
     `["t-shirt", "watering can", "trellis", ...]`
   - Lượng token: Chỉ ~250 token output.
   - Chi phí: **0 ĐỒNG** nếu dùng Free Tier (hoặc ~1.8 VNĐ nếu dùng tài khoản thường).
2. **Bước 2 - Lấy US IPA & Audio MP3 từ Cambridge CDN**:
   - Sử dụng microservice Cloud Run đã có sẵn trong dự án để lấy link MP3 và phiên âm chuẩn Cambridge.
3. **Bước 3 - Lấy nghĩa tiếng Việt tự động bằng Google Translate GTX (0 Đồng)**:
   - Sử dụng endpoint dịch miễn phí của Google để dịch nghĩa tiếng Việt cho 100 từ trong vòng 1-2 giây.
4. **Bước 4 - Tự sinh Cloze & Plural trên Laptop (0 Đồng)**:
   - Viết hàm xử lý ngữ pháp số nhiều tiếng Anh (quy tắc `s/es/ies` + từ điển ngoại lệ) chạy trực tiếp trên laptop trong 0.01 giây.
5. **Bước 5 - Định nghĩa & Ví dụ**:
   - Định nghĩa: Lấy từ từ điển mã nguồn mở Wiktionary / Free Dictionary API (0 đồng).
   - 2 câu ví dụ: Sử dụng 1 prompt gộp siêu ngắn của Gemini Free Tier hoặc mẫu câu tự động.
