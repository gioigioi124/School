# 📊 Database Schema

Dự án sử dụng **Supabase (PostgreSQL)** làm database duy nhất và **Prisma** làm ORM tại Backend (NestJS). Source of truth của cấu trúc bảng nằm ở Supabase Migrations (`supabase/migrations/*.sql`).

## 1. Nguyên Tắc Thiết Kế
- **Naming conventions**: 
  - Tên bảng: `snake_case` số nhiều (vd: `profiles`, `classes`).
  - Tên cột: `snake_case` (vd: `created_at`).
  - Khóa ngoại: `{table_singular}_id` (vd: `profile_id`, `class_id`).
- Mọi bảng đều có `created_at` và `updated_at`.
- Những dữ liệu quan trọng dùng `deleted_at` (soft delete) thay vì xoá cứng.
- **Row Level Security (RLS)** bắt buộc được bật cho các bảng dữ liệu public.

## 2. Sơ đồ các bảng chính

### Core & Auth
- `auth.users`: Bảng gốc của Supabase quản lý danh tính (Identity, Password).
- `profiles`: Lưu thông tin app-specific, liên kết `profiles.id = auth.users.id`.
- `roles`: Danh sách các quyền (Admin, Teacher, Student, Parent).
- `role_assignments`: Bảng trung gian nối `profiles` và `roles`.

### Multi-tenant (Classes)
- `classes`: Quản lý lớp học (`class_code`, `teacher_id`).
- `class_enrollments`: Học sinh tham gia lớp (`student_id`, `class_id`, `status: pending/approved`).
- `parent_student_links`: Phụ huynh theo dõi học sinh.

### Học Tập (Learning)
- `attendance`: Điểm danh (`student_id`, `class_id`, `date`, `status: present/absent/late`).
- `lessons`: Bài giảng (`class_id`, `video_url`).
- `assignments`: Bài tập của bài giảng.
- `submissions`: Bài làm của học sinh.

### Gamification & Tương tác
- `announcements`: Thông báo của lớp (`teacher_id`, `class_id`, `is_important`). Tích hợp Realtime.
- `user_xp`: Tổng hợp XP và Level hiện tại của học sinh.
- `xp_history`: Lịch sử nhận điểm kinh nghiệm.
- `user_badges`: Huy hiệu học sinh đạt được.
