---
name: lms-realtime
description: Implementation guide for realtime announcements, notifications, and Supabase Realtime subscriptions.
---

# Kỹ năng LMS Realtime

1. **Supabase Realtime**: Sử dụng tính năng Realtime của Supabase trên các bảng như `announcements` và `notifications`.
2. **Kích hoạt Realtime**: Cần cấu hình `ALTER PUBLICATION supabase_realtime ADD TABLE announcements;` tại file SQL migration (nếu dùng cloud).
3. **Frontend Subscription**:
   - Sử dụng `@supabase/supabase-js` client ở frontend để `.channel('custom-all-channel')` và lắng nghe sự kiện `INSERT`.
   - Update UI (toast notification, chuông báo) ngay khi có message mới.
4. **Fallback**: Thiết kế cơ chế polling (vd 30s/lần bằng TanStack Query) hoặc refetch khi reconnect nếu WebSocket mất kết nối.
