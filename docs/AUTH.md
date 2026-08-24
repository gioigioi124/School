# 🔐 Authentication & Authorization Flow

Tài liệu hướng dẫn luồng xác thực và phân quyền (Auth Flow) của toàn bộ ứng dụng LMS.

## 1. Authentication (Xác thực Identity)
Dự án **KHÔNG** tự phát hành JWT hay quản lý mật khẩu. Tất cả mọi thứ đều giao phó cho **Supabase Auth**.

### Luồng Đăng nhập (Login Flow)
1. User nhập Email/Password tại Frontend (Next.js).
2. Frontend gọi Supabase Browser Client để đăng nhập.
3. Supabase trả về Session (Access Token, Refresh Token).
4. Nhờ thư viện `@supabase/ssr`, Next.js middleware/proxy tự động set Session vào Cookies an toàn.

### Giao tiếp Frontend -> Backend
1. Từ Frontend (Client hoặc Server Component), trích xuất `Access Token` của Supabase (qua cookie).
2. Khi gọi API sang NestJS, đính kèm token này: `Authorization: Bearer <Supabase_Access_Token>`.

## 2. Xác thực tại Backend (NestJS)
1. NestJS nhận Request, đi qua `SupabaseAuthGuard`.
2. Guard này verify chữ ký của Access Token dựa trên cấu hình bảo mật.
3. Nếu hợp lệ, gán payload của token vào `req.user`.

## 3. Authorization (Phân quyền nghiệp vụ)
1. **Roles Guard**: Sử dụng `@Roles('teacher')` decorator. Backend truy vấn cơ sở dữ liệu (qua Prisma) xem `req.user.id` có Role tương ứng không.
2. **Business Ownership**: 
   - Quyền truy cập không chỉ phụ thuộc vào Role, mà còn phụ thuộc vào dữ liệu. 
   - Ví dụ: Giáo viên chỉ xóa được thông báo *của lớp mình*. Service layer của NestJS sẽ kiểm tra: `if (announcement.teacher_id !== req.user.id) throw new ForbiddenException()`.
3. **Row Level Security (RLS)**: Cài đặt ở PostgreSQL (Supabase) như một phương pháp phòng ngự nhiều lớp (Defense-in-depth). Prisma Client mặc định chạy với quyền service_role nên sẽ tự bỏ qua RLS, vì vậy phân quyền bắt buộc phải nằm ở logic của NestJS.
