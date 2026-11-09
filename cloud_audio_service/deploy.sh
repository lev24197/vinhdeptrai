#!/usr/bin/env bash
# Script triển khai dịch vụ Anki Audio Service lên Google Cloud Run trong 1 lệnh duy nhất!

echo "🚀 Đang triển khai Anki Audio Service lên Google Cloud Run..."

# Bật các dịch vụ cần thiết trên Google Cloud (Cloud Run, Cloud Build, Text-to-Speech)
gcloud services enable run.googleapis.com \
                       cloudbuild.googleapis.com \
                       texttospeech.googleapis.com

# Triển khai dịch vụ Cloud Run
gcloud run deploy anki-audio-service \
  --source . \
  --region asia-southeast1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 5

echo "✅ Hoàn tất! Vui lòng sao chép Service URL (https://anki-audio-service-xxx.a.run.app) và dán vào phần Cài Đặt trên Web của bạn."
