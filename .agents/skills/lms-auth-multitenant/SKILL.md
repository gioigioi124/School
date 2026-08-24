---
name: lms-auth-multitenant
description: Handling authentication, session, multitenancy (classes, teachers, students), roles, and permissions in LMS.
---

# Kỹ năng LMS Auth & Multi-tenant

1. **Authentication**: Sử dụng **Supabase Auth** để quản lý user identity (đăng ký, đăng nhập). NestJS giải mã token JWT từ Supabase.
2. **Multi-tenant / Data Isolation**:
   - Giáo viên chỉ có quyền sửa/thấy dữ liệu thuộc về `class_id` họ sở hữu (truy vấn bảng `classes` và `class_enrollments`).
   - Học sinh chỉ có quyền đọc/tương tác bài giảng thuộc về `class_id` mà họ đã enrolled và được approved (`status = 'approved'`).
   - Không được dùng `auth.uid() = user_id` làm logic duy nhất để cấp quyền do học sinh và giáo viên chia sẻ dữ liệu qua `class_id`.
3. **Impersonation/Role Handling**: Quyền hạn định nghĩa qua Role (Admin, Teacher, Student, Parent). Authorization ở NestJS service phải kiểm tra role kết hợp relation table.
