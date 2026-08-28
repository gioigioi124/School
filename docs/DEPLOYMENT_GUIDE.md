# Cẩm Nang Triển Khai Kinderly LMS Lên Render & Vercel

Tài liệu này hướng dẫn chi tiết từng bước để triển khai toàn bộ hệ thống **Kinderly LMS** lên môi trường Production với kiến trúc:
- **Database & Authentication**: Supabase (PostgreSQL + Supabase Auth)
- **Backend**: NestJS Web Service trên **Render**
- **Frontend**: Next.js 16 App Router trên **Vercel**

---

## Kiến Trúc Tổng Thể

```
+-------------------------------------------------------------+
|                      NGƯỜI DÙNG                             |
|          (Học sinh / Giáo viên / Phụ huynh / Admin)         |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                     VERCEL (Frontend)                       |
|         Domain: https://your-project.vercel.app             |
|   - Next.js 16 (React 19, Tailwind CSS v4, Zustand)         |
|   - Server / Client Components, Server Actions              |
+---------------+-----------------------------+---------------+
                |                             |
                | (API Requests + Bearer JWT) | (Auth Session)
                v                             v
+-------------------------------+ +---------------------------+
|       RENDER (Backend)        | |    SUPABASE (Auth & DB)   |
| Domain: ...onrender.com/api   | | - Supabase Auth (JWT)     |
| - NestJS 11 Web Service       | | - PostgreSQL Database     |
| - Prisma ORM (PgPooler)       | | - Profiles & Roles Trigger|
+---------------+---------------+ +-------------+-------------+
                |                               ^
                +----------(SQL Queries)--------+
```

---

## Phần 1: Chuẩn Bị & Cấu Hình Supabase

### 1. Tạo hoặc cấu hình dự án Supabase
1. Đăng nhập vào [Supabase Dashboard](https://supabase.com/dashboard).
2. Tạo New Project (hoặc chọn project hiện tại của bạn).
3. Đặt Database Password an toàn và chọn Region gần bạn (ví dụ: `ap-southeast-1` Singapore).

### 2. Lấy thông tin kết nối và API Key
Vào mục **Project Settings** trên thanh điều hướng trái của Supabase:
1. **Database Settings** (`Project Settings` -> `Database`):
   - Tìm mục **Connection string** -> chọn tab **URI**.
   - Chọn mode **Session** hoặc **Transaction** (khuyên dùng port `6543` với pooler hoặc port `5432`).
   - Lưu chuỗi `DATABASE_URL` (thay `[YOUR-PASSWORD]` bằng mật khẩu DB thật).
2. **API Settings** (`Project Settings` -> `API` hoặc `Auth`):
   - **Project URL**: `https://<your-project-id>.supabase.co`
   - **anon / public key**: `eyJhbGciOi...` (Dùng cho Frontend `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
   - **JWT Secret** (`Project Settings` -> `Auth` -> `JWT Settings`): Lấy `JWT Secret` dùng cho Backend `SUPABASE_JWT_SECRET`.

### 3. Đồng bộ Database Schema & Trigger
Mở terminal tại máy local hoặc chạy SQL trong **Supabase SQL Editor**:

1. **Đồng bộ Prisma Schema lên DB**:
   ```bash
   cd backend
   npx prisma db push
   ```
2. **Chạy Trigger tự động tạo Profile khi người dùng đăng ký**:
   Mở **Supabase SQL Editor** -> Tạo New Query -> Dán nội dung sau và nhấn **Run**:
   ```sql
   -- Hàm tự động tạo profile khi có user mới trong auth.users
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS trigger AS $$
   BEGIN
     INSERT INTO public.profiles (id, email, display_name, school, created_at, updated_at)
     VALUES (
       NEW.id,
       NEW.email,
       COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
       NEW.raw_user_meta_data->>'school',
       NOW(),
       NOW()
     )
     ON CONFLICT (id) DO UPDATE SET
       email = EXCLUDED.email,
       display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
       school = COALESCE(EXCLUDED.school, profiles.school),
       updated_at = NOW();

     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

   -- Xóa trigger cũ nếu tồn tại
   DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

   -- Tạo trigger
   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
   ```

3. **Khởi tạo dữ liệu mẫu / Phân quyền ban đầu (Seed Roles)**:
   Tại **Supabase SQL Editor**, chạy tiếp câu lệnh:
   ```sql
   INSERT INTO roles (id, name, description)
   VALUES 
     (gen_random_uuid(), 'admin', 'System Administrator'),
     (gen_random_uuid(), 'teacher', 'Teacher'),
     (gen_random_uuid(), 'student', 'Student'),
     (gen_random_uuid(), 'parent', 'Parent')
   ON CONFLICT (name) DO NOTHING;
   ```

---

## Phần 2: Triển Khai Backend Lên Render

### Cách 1: Triển khai tự động bằng Blueprint (`render.yaml`)
1. Đẩy toàn bộ source code đã commit lên GitHub repository.
2. Đăng nhập [Render Dashboard](https://dashboard.render.com).
3. Nhấp vào **New +** -> Chọn **Blueprint**.
4. Chọn repository GitHub của dự án -> Render sẽ tự động đọc file `render.yaml`.
5. Điền giá trị các biến môi trường được yêu cầu (xem bảng bên dưới) và nhấn **Apply**.

### Cách 2: Triển khai thủ công (Web Service)
1. Trên [Render Dashboard](https://dashboard.render.com), chọn **New +** -> **Web Service**.
2. Chọn kết nối với GitHub repository của bạn.
3. Thiết lập thông số như sau:
   - **Name**: `kinderly-lms-backend` (hoặc tên tuỳ chọn)
   - **Region**: `Singapore (Southeast Asia)` (hoặc vùng gần bạn nhất)
   - **Branch**: `main`
   - **Root Directory**: `backend` *(QUAN TRỌNG: Phải điền `backend`)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Instance Type**: `Free` (hoặc Starter nếu muốn không bị sleep)
4. Mở rộng phần **Advanced** -> **Health Check Path**:
   - Điền: `/api/health`
5. Trong mục **Environment Variables**, thêm các biến sau:

| Tên biến | Giá trị mẫu | Giải thích |
|---|---|---|
| `NODE_ENV` | `production` | Chế độ Production |
| `PORT` | `10000` (Render tự quản lý) | Cổng backend |
| `DATABASE_URL` | `postgresql://postgres.[ref]:[pass]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true` | Chuỗi kết nối Supabase Pooler |
| `SUPABASE_URL` | `https://[ref].supabase.co` | URL dự án Supabase |
| `SUPABASE_JWT_SECRET` | `[your-jwt-secret]` | Khóa bí mật JWT Supabase |
| `FRONTEND_URL` | `https://[your-frontend].vercel.app` | Domain Vercel (có thể cập nhật sau khi deploy Vercel) |

6. Nhấn **Create Web Service**.
7. Đợi Render build hoàn tất (khoảng 1-2 phút). Sau khi Deploy thành công, copy địa chỉ URL của backend (ví dụ: `https://kinderly-lms-backend.onrender.com`).
8. Kiểm tra thử trên trình duyệt: `https://kinderly-lms-backend.onrender.com/api/health` sẽ trả về `{"status":"ok", ...}`.

---

## Phần 3: Triển Khai Frontend Lên Vercel

1. Đăng nhập [Vercel Dashboard](https://vercel.com/dashboard).
2. Nhấp vào **Add New...** -> **Project**.
3. Chọn repository GitHub của dự án.
4. Trong màn hình **Configure Project**:
   - **Project Name**: `kinderly-lms` (hoặc tên tuỳ ý)
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Nhấp **Edit** -> Chọn thư mục `frontend` -> Nhấn **Continue** *(QUAN TRỌNG)*
5. Mở rộng mục **Environment Variables** và thêm 3 biến:

| Tên biến | Giá trị |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[your-ref].supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOi...` (Supabase Anon Key) |
| `NEXT_PUBLIC_API_URL` | `https://[your-render-app].onrender.com/api` (URL Backend từ Bước 2) |

6. Nhấn **Deploy**.
7. Đợi Vercel hoàn tất build trong khoảng 1 phút. Sau khi hoàn thành, bạn sẽ có URL Vercel (ví dụ: `https://kinderly-lms.vercel.app`).

---

## Phần 4: Cập Nhật CORS & Supabase Auth Redirects

Sau khi có URL của Vercel (`https://your-frontend.vercel.app`):

### 1. Cập nhật Supabase Auth Settings
1. Vào **Supabase Dashboard** -> **Authentication** -> **URL Configuration**.
2. **Site URL**: Đổi thành `https://your-frontend.vercel.app`.
3. **Redirect URLs**: Thêm các URL:
   - `https://your-frontend.vercel.app/**`
   - `https://your-frontend.vercel.app/portal`
   - `http://localhost:3000/**` (cho môi trường local)
4. Nhấn **Save**.

### 2. Cập nhật FRONTEND_URL trên Render
1. Vào **Render Dashboard** -> Chọn dịch vụ `kinderly-lms-backend`.
2. Vào tab **Environment** -> Cập nhật biến `FRONTEND_URL` thành domain Vercel của bạn (ví dụ: `https://your-frontend.vercel.app`).
3. Nhấn **Save Changes** -> Render sẽ tự động Redeploy trong vài giây.

---

## Phần 5: Bảng Kiểm Tra Sau Khi Triển Khai (Checklist)

- [ ] Truy cập `https://[your-render-url]/api/health` -> Nhận JSON `{"status": "ok"}`.
- [ ] Truy cập `https://[your-render-url]/api/docs` -> Xem Swagger API Docs hoạt động.
- [ ] Truy cập `https://[your-vercel-url]` -> Trang chủ hiển thị đẹp mắt, không có lỗi console.
- [ ] Thử đăng ký tài khoản mới (`/register`) -> Kiểm tra Supabase Auth & Profile được tạo tự động.
- [ ] Thử đăng nhập (`/login`) -> Chuyển hướng đúng vai trò (Teacher `/dashboard` hoặc Student `/portal`).
- [ ] Cập nhật hồ sơ trong Settings (`/settings`) -> Dữ liệu lưu thành công về database Supabase.
- [ ] Học sinh vào làm bài tập / xem video bài giảng (`/learn`, `/videos`) -> Hoạt động trơn tru.

---

## Xử Lý Sự Cố Thường Gặp (Troubleshooting)

### 1. Lỗi CORS khi gọi API từ Vercel sang Render
- **Nguyên nhân**: `FRONTEND_URL` trên Render chưa chính xác hoặc backend chưa nhận biến.
- **Khắc phục**: Kiểm tra tab Environment trên Render. Backend hiện đã được cấu hình regex hỗ trợ mọi domain `*.vercel.app`.

### 2. Render Free Tier phản hồi chậm ở request đầu tiên
- **Nguyên nhân**: Free tier tự động ngủ sau 15 phút không hoạt động.
- **Khắc phục**: Dùng dịch vụ giám sát miễn phí (như UptimeRobot, BetterStack) ping định kỳ `GET https://your-backend.onrender.com/api/health` mỗi 10 phút.

### 3. Vercel build báo lỗi "Root Directory"
- **Nguyên nhân**: Chọn sai thư mục gốc khi import dự án.
- **Khắc phục**: Vào `Vercel Settings` -> `General` -> `Root Directory` -> Đổi thành `frontend` -> Save & Redeploy.
