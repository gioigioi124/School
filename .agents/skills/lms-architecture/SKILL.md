---
name: lms-architecture
description: Handles feature modules, folder boundaries, and dependency additions for the LMS project.
---

# Kỹ năng LMS Architecture

Khi thêm tính năng mới cho LMS:
1. **Frontend**: Đặt trong đúng thư mục theo route groups `(auth)`, `(public)`, `(teacher)`, `(student)`, `(admin)`. Component chung vào `components/common/`, đặc thù vào thư mục con `components/teacher/`, v.v.
2. **Backend**: Khởi tạo Module NestJS mới (vd: `games.module.ts`). Đảm bảo kết nối module vào `app.module.ts`.
3. **Database**: Các bảng mới phải bám sát convention `snake_case` số nhiều cho bảng, `snake_case` cho cột, và gắn RLS.
4. Tránh cyclic dependencies ở backend. Cập nhật `DEVELOPMENT_PLAN.md` nếu có thay đổi kiến trúc lớn.
