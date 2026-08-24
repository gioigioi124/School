# 30 Workflow & Definition of Done

## Quy trình làm việc
1. **Frontend**: Code đặt trong `frontend/`. Chỉ dùng `proxy.ts` cho session, không lạm dụng API routes (Route Handlers) để viết logic thay cho NestJS.
2. **Backend**: Code đặt trong `backend/`. Tuân thủ chuẩn NestJS (Module, Controller, Service).
3. **Database**: Khi thay đổi cấu trúc bảng, phải sửa/tạo qua **Supabase Migration** ở `supabase/migrations/` và update `docs/DB_SCHEMA.md` tương ứng. Sau đó cập nhật `backend/prisma/schema.prisma` cho đồng bộ. Không dùng Prisma Migrate làm nguồn gốc schema.

## Definition of Done (DoD)
Trước khi coi một task là hoàn thành, Agent cần kiểm tra:
- [ ] Kiến trúc hệ thống không bị phá vỡ (đặc biệt Auth Flow).
- [ ] DB migration/RLS đã được cập nhật nếu schema thay đổi.
- [ ] DTO + Validation + Authorization đã được thêm cho API mới.
- [ ] Frontend có trạng thái Loading/Error/Empty state.
- [ ] Typecheck và Linter không báo lỗi.
- [ ] Các unit/integration tests liên quan vượt qua.
- [ ] Tài liệu (API docs/DB docs) đã được cập nhật.
