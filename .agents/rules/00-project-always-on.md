# 00 Project Always On

**Tên dự án**: Learning Management System (LMS) cho Tiểu học
**Mục tiêu**: Platform học tập gamified dành cho học sinh tiểu học
**Tech Stack**: Next.js 16 App Router + NestJS + Supabase + Prisma

## Quy tắc cơ bản cho Agent
1. **Luôn đọc workspace rules** (đặc biệt là 10-architecture) trước khi thay đổi kiến trúc.
2. **Tự chọn relevant skill** (.agents/skills) khi làm việc với một khía cạnh cụ thể; người dùng không cần nhắc lại.
3. **Kiểm tra existing code/schema** trước khi tạo file mới để tránh trùng lặp.
4. **Không thay đổi API/database contract** ngầm (ví dụ: tự ý thêm cột, sửa kiểu dữ liệu mà không báo trước hoặc chưa có file migration).
5. Sau khi thay đổi, hãy chạy typecheck/lint/tests/build phù hợp.
6. Mọi thiết kế UI phải mang hơi hướng **gamification**, thân thiện với trẻ em (màu sắc tươi sáng, micro-animations, v.v.).
