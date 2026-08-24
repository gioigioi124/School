# 🚀 API Specification

Dự án sử dụng **NestJS** làm backend, tài liệu API thực tế sẽ được tự động sinh ra bởi Swagger UI tại `/api/docs`. Dưới đây là hợp đồng (contract) và các quy chuẩn thiết kế API.

## 1. Chuẩn Định Dạng Phản Hồi (Response Format)

Tất cả các API (thành công hoặc lỗi đã handle) đều trả về một định dạng thống nhất nhờ `TransformInterceptor`.

```json
{
  "success": true,
  "data": { ... },
  "meta": { "requestId": "1234-abcd" },
  "timestamp": "2026-08-24T10:30:00Z"
}
```

Với API có phân trang (Pagination):
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10
  },
  "timestamp": "2026-08-24T10:30:00Z"
}
```

## 2. Lỗi Phản Hồi (Error Handling)

Khi có lỗi (được Global `ExceptionFilter` bắt lại):
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Validation failed",
    "details": ["email must be an email"]
  },
  "timestamp": "2026-08-24T10:30:00Z"
}
```

## 3. Các Endpoints Chính (Theo từng giai đoạn)

### Phase 1: Profiles & Auth
- `GET /users/profile`: Lấy thông tin người dùng hiện tại (Lấy qua Bearer Token Supabase).
- `PATCH /users/profile`: Cập nhật thông tin (avatar, display name).

### Phase 2: Classes
- `POST /classes`: Giáo viên tạo lớp (sinh `class_code`).
- `GET /classes`: Lấy danh sách lớp (giáo viên lấy lớp mình dạy, học sinh lấy lớp đang học).
- `POST /class-enrollments/join`: Học sinh xin vào lớp bằng `class_code`.
- `PATCH /class-enrollments/:id/approve`: Giáo viên duyệt học sinh vào lớp.

### Phase 3: Lessons & Gamification
- `GET /lessons`: Danh sách bài giảng trong lớp.
- `GET /gamification/profile`: Lấy cấp độ (Level), XP, Badge, và Streak hiện tại.
- `GET /gamification/leaderboard`: Xếp hạng trong lớp.
