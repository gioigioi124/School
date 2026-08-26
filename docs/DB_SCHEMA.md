# 📊 Database Schema (LMS System)

Dự án sử dụng **Supabase PostgreSQL** làm cơ sở dữ liệu duy nhất và **Prisma Client** làm ORM tại Backend (NestJS). Toàn bộ các file migrations nằm trong thư mục `supabase/migrations/`.

---

## 1. Nguyên Tắc Thiết Kế
- **Naming Conventions**:
  - Tên bảng: `snake_case` số nhiều (`profiles`, `classes`, `lessons`, `badges`...).
  - Tên cột: `snake_case` (`created_at`, `updated_at`, `student_id`).
  - Khóa ngoại: `{table_singular}_id` (`class_id`, `lesson_id`, `badge_id`).
- **Row Level Security (RLS)**: Bật trên tất cả các bảng với policy phân quyền xác thực Supabase Auth.
- **Data Integrity**: Foreign keys với `ON DELETE CASCADE` đảm bảo tính toàn vẹn dữ liệu.

---

## 2. Danh Sách Các Bảng Dữ Liệu

### 👤 Core & Auth (Migration: `20260824000000_core_auth.sql`)
1. **`profiles`**: Lưu thông tin người dùng liên kết với `auth.users.id`.
   - `id (UUID, PK)`: Khớp với Supabase Auth user ID.
   - `email (VARCHAR)`: Email duy nhất.
   - `display_name (VARCHAR)`, `avatar_url (TEXT)`, `phone (VARCHAR)`.
   - `parent_name (VARCHAR)`, `parent_phone (VARCHAR)`, `school (VARCHAR)`.
   - `created_at`, `updated_at`.
2. **`roles`**: Danh mục vai trò (`admin`, `teacher`, `student`, `parent`).
3. **`role_assignments`**: Bảng trung gian gán vai trò cho người dùng (`profile_id`, `role_id`).

### 🏫 Classes & Multi-tenancy
4. **`classes`**: Quản lý lớp học.
   - `id (UUID, PK)`, `name (VARCHAR)`, `grade (VARCHAR)`, `school (VARCHAR)`, `avatar_url (TEXT)`, `description (TEXT)`, `created_at`, `updated_at`.
5. **`class_enrollments`**: Danh sách thành viên tham gia lớp.
   - `id (UUID, PK)`, `profile_id (UUID, FK)`, `class_id (UUID, FK)`, `role (VARCHAR: teacher/student)`, `joined_at`.
   - Ràng buộc: `UNIQUE(profile_id, class_id)`.

### 📅 Điểm danh & Chuyên cần (Migration: `20260826000000_create_attendance.sql`)
6. **`attendance`**:
   - `id (UUID, PK)`, `student_id (UUID, FK)`, `class_id (UUID, FK)`, `date (DATE)`, `status (VARCHAR: present/absent/late/leave)`, `notes (TEXT)`.
   - Ràng buộc: `UNIQUE(student_id, class_id, date)`.

### 📢 Thông Báo & Realtime (Migration: `20260826000001_create_announcements_notifications.sql`)
7. **`announcements`**:
   - `id (UUID, PK)`, `class_id (UUID, FK)`, `author_id (UUID, FK)`, `title (VARCHAR)`, `content (TEXT)`, `is_important (BOOLEAN)`, `created_at`, `updated_at`.
8. **`notifications`**:
   - `id (UUID, PK)`, `user_id (UUID, FK)`, `title (VARCHAR)`, `content (TEXT)`, `link (TEXT)`, `is_read (BOOLEAN)`, `created_at`.

### 📚 Bài Giảng & Bài Tập (Migration: `20260826000002_create_lessons_and_assignments.sql`)
9. **`lessons`**:
   - `id (UUID, PK)`, `class_id (UUID, FK)`, `teacher_id (UUID, FK)`, `title (VARCHAR)`, `description (TEXT)`, `content (TEXT)`, `video_url (TEXT)`, `duration (INT)`, `order (INT)`, `created_at`, `updated_at`.
10. **`assignments`**:
    - `id (UUID, PK)`, `lesson_id (UUID, FK)`, `title (VARCHAR)`, `description (TEXT)`, `type (VARCHAR: quiz/text/drag_drop)`, `content (JSONB)`, `xp_reward (INT)`, `due_date (TIMESTAMPTZ)`, `created_at`, `updated_at`.
11. **`submissions`**:
    - `id (UUID, PK)`, `assignment_id (UUID, FK)`, `student_id (UUID, FK)`, `content (JSONB)`, `grade (DECIMAL)`, `feedback (TEXT)`, `xp_earned (INT)`, `status (VARCHAR)`, `submitted_at`, `graded_at`.
    - Ràng buộc: `UNIQUE(student_id, assignment_id)`.
12. **`student_progress`**:
    - `id (UUID, PK)`, `student_id (UUID, FK)`, `lesson_id (UUID, FK)`, `is_completed (BOOLEAN)`, `completed_at`, `xp_earned (INT)`.
    - Ràng buộc: `UNIQUE(student_id, lesson_id)`.

### 🏆 Gamification (Migration: `20260826000003_create_gamification_tables.sql`)
13. **`badges`**: Danh mục huy hiệu mẫu.
    - `id (UUID, PK)`, `code (VARCHAR, UNIQUE)`, `name (VARCHAR)`, `description (TEXT)`, `icon (VARCHAR)`, `category (VARCHAR)`, `xp_bonus (INT)`.
14. **`user_xp`**: Tổng hợp điểm kinh nghiệm và level.
    - `id (UUID, PK)`, `student_id (UUID, FK, UNIQUE)`, `total_xp (INT)`, `current_level (INT)`, `total_stars (INT)`, `updated_at`.
15. **`user_badges`**: Huy hiệu học sinh đã đạt.
    - `id (UUID, PK)`, `student_id (UUID, FK)`, `badge_id (UUID, FK)`, `unlocked_at`.
    - Ràng buộc: `UNIQUE(student_id, badge_id)`.
16. **`xp_history`**: Nhật ký tích luỹ XP.
    - `id (UUID, PK)`, `student_id (UUID, FK)`, `action (VARCHAR)`, `xp_amount (INT)`, `source_type (VARCHAR)`, `source_id (UUID)`, `created_at`.

### 🎮 Trò Chơi Học Tập (Migration: `20260826000004_create_games_tables.sql`)
17. **`games`**:
    - `id (UUID, PK)`, `code (VARCHAR, UNIQUE)`, `title (VARCHAR)`, `description (TEXT)`, `category (VARCHAR)`, `thumbnail_url (TEXT)`, `xp_reward (INT)`, `config (JSONB)`, `created_at`.
18. **`game_scores`**:
    - `id (UUID, PK)`, `game_id (UUID, FK)`, `student_id (UUID, FK)`, `score (INT)`, `max_score (INT)`, `xp_earned (INT)`, `played_at`.
