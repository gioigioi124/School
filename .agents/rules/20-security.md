# 20 Security

## Authentication & Authorization
- Xác thực dựa hoàn toàn vào **Supabase Auth**. Không tự xây dựng hệ thống cấp phát, ký, hay mã hóa mật khẩu, JWT.
- API layer (NestJS) dùng `SupabaseAuthGuard` để validate Supabase Access Token.
- **Phân quyền (Authorization)**: Nằm tại NestJS (Service layer) dựa trên Role và Business logic (vd: kiểm tra học sinh có thuộc lớp không qua `class_enrollments`). Không phụ thuộc tuyệt đối vào role từ client gửi lên.

## Row Level Security (RLS) & Database
- Bật RLS như một lớp bảo vệ (defense-in-depth) trên các bảng public chứa dữ liệu nhạy cảm.
- Prisma query từ backend thường dùng service_role connection; do đó, mọi policy bảo mật phải được xử lý ở NestJS. Không giả định Prisma tự động pass `auth.uid()`.

## API Security
- Xác thực đầu vào chặt chẽ qua DTO (`class-validator`).
- Không lộ `SUPABASE_SECRET_KEY` xuống client (Next.js config chỉ dùng `NEXT_PUBLIC_*`).
