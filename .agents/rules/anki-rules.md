---
name: anki-vocabulary-guardrails
description: Quy tắc cốt lõi về kiểm soát chi phí token, mô hình AI, và cấu trúc dữ liệu 9 cột cho dự án Anki Dictionary.
always_on: true
---

# ANKI VOCABULARY GENERATION GUARDRAILS

## 1. Kiểm soát Mô hình & Chi phí Token (Strict Cost Guardrail)
- Tuyệt đối KHÔNG sử dụng hoặc cấu hình fallback đến các mô hình giá cao (như `gemini-2.5-flash`, `gemini-pro`).
- Bắt buộc khóa cứng mô hình ở phân khúc siêu tiết kiệm: `gemini-3.5-flash-lite`, `gemini-flash-lite-latest`, hoặc `gemini-3.1-flash-lite`.
- Ưu tiên sử dụng Free Tier API Key ($0/tháng).

## 2. Kiến trúc Sinh Dữ liệu Tách rời (Decoupled Pipeline)
- KHÔNG bắt LLM sinh các trường tĩnh dài (như phiên âm IPA, thẻ âm thanh, từ đục lỗ cloze).
- LLM chỉ sinh mảng JSON 5 trường ngắn gọn:
  - `w`: Danh từ số ít tiếng Anh
  - `vi`: Nghĩa tiếng Việt theo ngữ cảnh
  - `syn`: 1-2 từ đồng nghĩa tiếng Anh
  - `ex1`: Câu ví dụ thứ nhất
  - `ex2`: Câu ví dụ thứ hai
- Phiên âm US IPA và định nghĩa tiếng Anh được lấy qua cổng Cambridge API Gateway.
- Từ đục lỗ (Cloze) và thẻ âm thanh (`[sound:word.mp3]`) được tự động tính toán bằng thuật toán local trên máy.

## 3. Tiêu chuẩn Định dạng 9 Cột Bắt buộc
Mỗi chủ đề bắt buộc có đúng 100 dòng, phân tách bằng dấu Tab (`\t`), theo thứ tự:
1. `Word`: Danh từ tiếng Anh số ít
2. `Cloze`: Dạng đục lỗ (ví dụ: `s_____r`)
3. `IPA`: Phiên âm US chuẩn Cambridge
4. `Sound`: Thẻ Anki `[sound:clean_word.mp3]`
5. `Definition`: Định nghĩa tiếng Anh chuẩn Cambridge
6. `Meaning_VI`: Nghĩa tiếng Việt
7. `Meaning_VI_2`: Nghĩa tiếng Việt bổ sung
8. `Synonyms`: Từ đồng nghĩa tiếng Anh (Thay thế cột số nhiều cũ)
9. `Examples`: 2 câu ví dụ ghép (`1. Sentence one.  2. Sentence two.`)

## 4. Quản lý Tệp Tin Âm thanh (Audio Media Management)
- Tệp âm thanh MP3 và ZIP âm thanh phải được lưu trữ trên laptop cá nhân (`output/audio/`).
- KHÔNG đẩy hàng ngàn file MP3 rời lên kho lưu trữ GitHub để tránh làm phình dung lượng Git.
- Cấu hình `.gitignore` chặn tệp MP3 rời (`output/audio/*/*.mp3`).
