---
name: lms-architecture
description: Handles feature modules, folder boundaries, and dependency additions for the LMS project.
---

# Kỹ năng LMS Architecture

> [!IMPORTANT]
> **ĐỊNH HƯỚNG DỰ ÁN**: Hệ thống phục vụ **HỌC SINH & GIÁO VIÊN TIỂU HỌC (LỚP 1 - LỚP 5)**. KHÔNG PHẢI MẦM NON. Toàn bộ logic phân lớp, môn học, bài giảng và thời khóa biểu phải theo khối Tiểu học.

Khi thêm tính năng mới cho LMS:
1. **Frontend**: Đặt trong đúng thư mục theo route groups `(auth)`, `(public)`, `(teacher)`, `(student)`, `(admin)`. Component chung vào `components/common/`, đặc thù vào thư mục con `components/teacher/`, `components/schedules/`, v.v.
2. **Backend**: Khởi tạo Module NestJS mới (vd: `schedules.module.ts`). Đảm bảo kết nối module vào `app.module.ts`.
3. **Database**: Các bảng mới phải bám sát convention `snake_case` số nhiều cho bảng, `snake_case` cho cột, và gắn RLS.
4. Tránh cyclic dependencies ở backend. Cập nhật tài liệu kiến trúc nếu có thay đổi lớn.
