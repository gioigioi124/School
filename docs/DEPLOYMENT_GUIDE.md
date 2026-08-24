# 🌍 Deployment Guide

Dự án được chia thành Frontend (Next.js), Backend (NestJS), và Database (Supabase).

## 1. Frontend (Next.js) - Triển khai lên Vercel
- Nền tảng khuyến nghị: **Vercel** (hỗ trợ tối đa cho Next.js App Router).
- **Environment Variables**:
  - `NEXT_PUBLIC_API_URL`: URL của NestJS API (vd: `https://api.lms-project.com/api`).
  - `NEXT_PUBLIC_SUPABASE_URL`: URL dự án Supabase.
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Khóa Publishable ẩn danh của Supabase.
- Build command mặc định: `npm run build`.

## 2. Backend (NestJS) - Triển khai lên Render/Railway/Fly.io
- Nền tảng khuyến nghị: Bất kỳ nền tảng nào hỗ trợ Docker hoặc Node.js (Render, Railway).
- **Environment Variables**:
  - `DATABASE_URL`: Connection string *có Connection Pooling* (PgBouncer/Supavisor) dùng cho Prisma Client runtime.
  - `DIRECT_URL`: Connection string kết nối trực tiếp không qua Pool (dùng khi chạy `prisma migrate/db push`).
  - `SUPABASE_URL`: Tương tự frontend.
  - `SUPABASE_SECRET_KEY`: Khóa Service Role của Supabase (Tuyệt đối bảo mật, cho phép backend bỏ qua RLS).
  - `FRONTEND_URL`: Để cấu hình CORS (vd: `https://lms-project.vercel.app`).
- Lệnh build: `npm run build`. Lệnh chạy: `npm run start:prod`.

## 3. Database (Supabase)
- Tạo một Project mới trên Supabase cho môi trường Production.
- CI/CD hoặc người quản trị chạy lệnh `supabase db push` (nếu dùng Supabase CLI) hoặc `npx prisma migrate deploy` để đẩy cấu trúc bảng lên Prod Database.
- Thiết lập Storage Buckets công khai (ví dụ cho avatar, tài liệu khóa học).

## 4. CI/CD (GitHub Actions)
Tạo pipeline `.github/workflows/main.yml` để:
1. Chạy `npm run lint` trên toàn bộ source.
2. Chạy `npm test` để kiểm tra Unit Tests/E2E Tests.
3. Nếu ở nhánh `main`, kích hoạt webhook deploy lên Vercel và Render.
