---
name: lms-deployment
description: Guidelines for deploying Next.js to Vercel, NestJS to Render/Railway, Supabase, and CI/CD pipelines.
---

# Kỹ năng LMS Deployment & DevOps

1. **Frontend**: Triển khai trên **Vercel**. Các biến môi trường `NEXT_PUBLIC_*` cần được thiết lập đúng.
2. **Backend**: Triển khai trên các nền tảng Node.js cloud (Render, Railway, Fly.io). Phải cấu hình `DATABASE_URL` là chuỗi kết nối connection pooling, `DIRECT_URL` cho migrate.
3. **Database (Supabase)**:
   - Môi trường Production phải dùng dự án Supabase riêng, tách biệt với Local/Staging.
   - Khởi tạo script CI/CD chạy `supabase db push` tự động hoặc migrate qua Prisma tuỳ theo pipeline.
4. **CI/CD**: Sử dụng GitHub Actions. Kịch bản cơ bản:
   - Linter (ESLint, Prettier).
   - Chạy test (Jest, Playwright).
   - Typecheck (tsc).
   - Build.
5. **Monitoring**: Thêm logging (Pino/Winston ở backend) và Sentry ở cả 2 đầu để bắt lỗi.
