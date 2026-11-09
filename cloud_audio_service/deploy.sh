#!/usr/bin/env bash
set -e

echo "🚀 Đang chuẩn bị triển khai Anki Audio Service lên Google Cloud Run..."

PROJECT_ID=$(gcloud config get-value project)
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')

echo "ℹ️ Project ID: $PROJECT_ID | Project Number: $PROJECT_NUMBER"

# 1. Bật các API cần thiết
echo "⚙️ Đang kích hoạt các dịch vụ Google Cloud..."
gcloud services enable run.googleapis.com \
                       cloudbuild.googleapis.com \
                       texttospeech.googleapis.com \
                       artifactregistry.googleapis.com

# 2. Cấp quyền IAM bắt buộc cho Service Account của Cloud Build (Compute SA)
echo "🔑 Đang cấu hình quyền IAM cho Service Account..."
SA_EMAIL="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/storage.admin" \
  --condition=None > /dev/null 2>&1 || true

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/artifactregistry.writer" \
  --condition=None > /dev/null 2>&1 || true

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/logging.logWriter" \
  --condition=None > /dev/null 2>&1 || true

# 3. Triển khai dịch vụ Cloud Run
echo "📦 Đang build và deploy container lên Cloud Run (khu vực asia-southeast1)..."
gcloud run deploy anki-audio-service \
  --source . \
  --region asia-southeast1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 5

echo ""
echo "✅ Hoàn tất! Vui lòng sao chép Service URL ở trên và dán vào phần Cài Đặt trên Web của bạn."
