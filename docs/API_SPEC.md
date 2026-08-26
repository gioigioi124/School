# 🚀 API Specification (LMS System)

Hệ thống API xây dựng trên **NestJS v11**, Swagger UI tự động tích hợp tại `/api/docs`.

---

## 1. Chuẩn Định Dạng Phản Hồi (Response Format)

Tất cả các API thành công trả về cấu trúc thống nhất qua `TransformInterceptor`:

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-08-26T10:30:00.000Z"
}
```

Khi có lỗi xử lý qua `HttpExceptionFilter`:
```json
{
  "statusCode": 400,
  "timestamp": "2026-08-26T10:30:00.000Z",
  "path": "/api/classes",
  "message": "Validation failed",
  "error": "Bad Request"
}
```

---

## 2. Danh Sách Endpoints Theo Module

### 👤 1. Users Module (`/api/users`)
- `GET /api/users/profile` — Lấy thông tin cá nhân kèm vai trò (Roles).
- `PATCH /api/users/profile` — Cập nhật `displayName`, `avatarUrl`.

### 🏫 2. Classes Module (`/api/classes`)
- `POST /api/classes` — Giáo viên tạo lớp học mới (tự động gán quyền giáo viên).
- `GET /api/classes` — Lấy danh sách lớp học của người dùng kèm sĩ số học sinh.
- `GET /api/classes/:id` — Xem chi tiết lớp học kèm danh sách học sinh và giáo viên.
- `PATCH /api/classes/:id` — Chỉnh sửa thông tin lớp học (Tên, Khối, Mô tả, Trường, Ảnh đại diện).
- `DELETE /api/classes/:id` — Xoá lớp học.

### 👥 3. Class Enrollments Module (`/api/class-enrollments`)
- `POST /api/class-enrollments` — Thêm học sinh vào lớp học.
- `GET /api/class-enrollments/class/:classId` — Lấy danh sách thành viên trong lớp.
- `DELETE /api/class-enrollments/class/:classId/student/:studentId` — Xoá học sinh khỏi lớp.

### 📅 4. Attendance Module (`/api/attendance`)
- `POST /api/attendance/batch` — Điểm danh cả lớp theo ngày (`present`, `absent`, `late`, `leave`).
- `GET /api/attendance/class/:classId?date=YYYY-MM-DD` — Lấy danh sách điểm danh lớp theo ngày.
- `GET /api/attendance/student/:studentId/streak` — Tính chuỗi ngày chuyên cần (Streak) của học sinh.

### 📢 5. Announcements Module (`/api/announcements`)
- `POST /api/announcements` — Tạo thông báo lớp (tự động đẩy notification đến học sinh).
- `GET /api/announcements/feed` — Xem bảng tin tất cả các lớp của người dùng.
- `GET /api/announcements/class/:classId` — Xem thông báo theo lớp học.
- `GET /api/announcements/:id` — Xem chi tiết thông báo.
- `PATCH /api/announcements/:id` — Sửa thông báo.
- `DELETE /api/announcements/:id` — Xoá thông báo.

### 🔔 6. Notifications Module (`/api/notifications`)
- `GET /api/notifications` — Lấy danh sách thông báo kèm số lượng chưa đọc (`unreadCount`).
- `PATCH /api/notifications/:id/read` — Đánh dấu thông báo là đã đọc.
- `PATCH /api/notifications/read-all` — Đánh dấu tất cả thông báo là đã đọc.

### 📚 7. Lessons Module (`/api/lessons`)
- `POST /api/lessons` — Tạo bài giảng mới (kèm link video, thời lượng, nội dung).
- `GET /api/lessons/class/:classId` — Danh sách bài giảng trong lớp kèm trạng thái hoàn thành.
- `GET /api/lessons/:id` — Xem chi tiết bài giảng, video và bài tập.
- `PATCH /api/lessons/:id` — Chỉnh sửa bài giảng.
- `DELETE /api/lessons/:id` — Xoá bài giảng.
- `POST /api/lessons/:id/complete` — Học sinh đánh dấu hoàn thành bài học để nhận +10 XP.

### 📝 8. Assignments Module (`/api/assignments`)
- `POST /api/assignments` — Giáo viên tạo bài tập / câu đố trắc nghiệm (+XP reward).
- `GET /api/assignments/lesson/:lessonId` — Lấy bài tập theo bài học.
- `POST /api/assignments/:id/submissions` — Học sinh nộp bài làm.
- `GET /api/assignments/:id/submissions` — Giáo viên xem danh sách bài làm của học sinh.
- `PATCH /api/assignments/submissions/:id/grade` — Giáo viên chấm điểm và nhận xét (+XP thưởng).

### 🏆 9. Gamification Module (`/api/gamification`)
- `GET /api/gamification/my-profile` — Lấy thông tin XP, Cấp độ Level, Tiến độ %, Tủ huy hiệu.
- `GET /api/gamification/profile/:studentId` — Lấy thông tin Gamification của học sinh cụ thể.
- `GET /api/gamification/leaderboard?classId=...` — Bảng xếp hạng học sinh trong lớp theo XP.
- `GET /api/gamification/badges` — Danh sách tất cả huy hiệu trong hệ thống.
- `POST /api/gamification/award` — Giáo viên khen thưởng điểm XP & Sao cho học sinh.

### 🎮 10. Games Module (`/api/games`)
- `GET /api/games` — Danh sách các trò chơi học tập (Nối hình, Đố vui, Ghép chữ).
- `GET /api/games/:id` — Lấy cấu hình trò chơi.
- `POST /api/games/:id/scores` — Nộp kết quả điểm số để nhận XP.
- `GET /api/games/:id/leaderboard` — Bảng xếp hạng điểm cao của trò chơi.
