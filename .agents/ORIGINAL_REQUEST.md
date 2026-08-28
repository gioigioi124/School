# Original User Request

## 2026-08-27T03:11:38Z

<USER_REQUEST>
Xây dựng tính năng Cài đặt (Teacher Settings) toàn diện ở trang của giáo viên cho hệ thống Kinderly LMS. Tự động phân rã nhiệm vụ cho nhóm 3 Subagents (1 Agent lên kế hoạch, 1 Agent dev viết code, 1 Agent kiểm tra chất lượng) để xuất mã nguồn sạch lỗi và kiểm tra logic kỹ lưỡng.

Working directory: c:/Users/Administrator/Desktop/School/lms-project
Integrity mode: development

## Requirements

### R1. Giao diện trang Cài đặt Giáo viên (Teacher Settings UI)
- Tạo trang `/settings` trong nhóm route `(teacher)` của Next.js App Router (`app/(teacher)/settings/page.tsx`).
- Bố cục giao diện hiện đại, trực quan, thân thiện (Kinderly LMS Design System) với các tab chức năng:
  - **Thông tin cá nhân (Profile Settings)**: Cập nhật Tên hiển thị (`displayName`), Số điện thoại (`phone`), Trường học (`school`), URL ảnh đại diện (`avatarUrl`) hoặc bộ chọn avatar mặc định dễ thương.
  - **Bảo mật & Tài khoản (Security Settings)**: Đổi mật khẩu tài khoản thông qua Supabase Auth SDK (`updateUser`), hiển thị email tài khoản hiện tại.
  - **Tùy chọn thông báo (Notification Settings)**: Quản lý bật/tắt nhận thông báo bài nộp mới của học sinh, thông báo lớp học, âm thanh thông báo.
  - **Tùy chỉnh hệ thống (Preferences)**: Tùy chỉnh giao diện / ngôn ngữ hiển thị.
- Tích hợp phản hồi người dùng mượt mà với toast notifications (`react-hot-toast`), trạng thái loading và validation lỗi chi tiết.

### R2. Mở rộng Backend API & Data Access Layer (NestJS + Prisma)
- Cập nhật module `backend/src/modules/users`:
  - Mở rộng `UpdateProfileDto` hỗ trợ các trường: `displayName`, `phone`, `school`, `avatarUrl`.
  - Cập nhật `users.service.ts` để lưu đúng và đủ các trường trên vào bảng `profiles` thông qua Prisma Client.
  - Đảm bảo `GET /api/users/profile` trả về đầy đủ dữ liệu hồ sơ cá nhân và vai trò của giáo viên.
- Đảm bảo API bảo mật với `SupabaseAuthGuard` và xử lý ngoại lệ chặt chẽ.

### R3. Quy trình làm việc và Phân công 3 Subagents
- **Planning Agent**: Khảo sát hiện trạng codebase (NestJS DTO/Service, Prisma Schema, Next.js Layout/Sidebar), lập kế hoạch chi tiết các file cần thêm/sửa, xác định rõ contract API.
- **Developer Agent**: Thực hiện viết toàn bộ mã nguồn frontend và backend theo đúng kế hoạch, tuân thủ TypeScript strict mode, Tailwind CSS và shadcn/ui.
- **QA/Testing Agent**: Thực hiện kiểm tra toàn diện: chạy typecheck (`npm run build` hoặc `tsc --noEmit`), rà soát logic validation, đảm bảo không có lỗi runtime/compile time trước khi hoàn tất.

## Acceptance Criteria

### Giao diện người dùng (UI & UX)
- [ ] Truy cập đường dẫn `/settings` hiển thị đầy đủ các tab cài đặt với giao diện responsive, chuẩn UX giáo dục.
- [ ] Form hồ sơ hiển thị sẵn thông tin hiện tại của giáo viên và cho phép cập nhật mượt mà.
- [ ] Form đổi mật khẩu kiểm tra độ dài tối thiểu (>= 6 ký tự) và khớp giữa 2 ô nhập mật khẩu.
- [ ] Hiển thị thông báo toast thành công hoặc cảnh báo lỗi rõ ràng khi tương tác.

### Backend & Cơ sở dữ liệu
- [ ] Endpoint `PATCH /api/users/profile` nhận payload và cập nhật thành công các trường vào database.
- [ ] Endpoint `GET /api/users/profile` trả về chính xác thông tin giáo viên đang đăng nhập.
- [ ] DTO validate dữ liệu đầu vào đúng kiểu, từ chối dữ liệu không hợp lệ.

### Chất lượng mã nguồn & Build
- [ ] Frontend Next.js build và typecheck vượt qua không có lỗi TypeScript.
- [ ] Backend NestJS build và typecheck vượt qua không có lỗi.
- [ ] Mã nguồn được viết sạch sẽ, dễ bảo trì, có chú thích rõ ràng.

</USER_REQUEST>
