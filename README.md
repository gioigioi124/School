# Kinderly LMS - Hệ Thống Quản Lý Học Tập Cấp Tiểu Học

> **Định hướng cốt lõi**: Dự án tập trung 100% vào **Học sinh Tiểu học (Lớp 1 - Lớp 5, từ 6 đến 11 tuổi)** và **Giáo viên Tiểu học**. Toàn bộ tính năng, giao diện người dùng, danh mục môn học, bài giảng, thời khóa biểu và gamification đều phục vụ chương trình Giáo dục Tiểu học.

---

## 🎯 Phạm Vi & Khối Lớp Mục Tiêu
- **Đối tượng người dùng**: Học sinh Tiểu học (Lớp 1, 2, 3, 4, 5), Giáo viên chủ nhiệm & Giáo viên bộ môn Tiểu học, Phụ huynh học sinh.
- **Danh mục môn học chuẩn Tiểu học (GDPT)**:
  - 🔢 **Toán học** (Số học, Hình học, Toán tư duy)
  - 📖 **Tiếng Việt** (Tập đọc, Chính tả, Luyện từ và câu, Tập làm văn)
  - 🗣️ **Tiếng Anh Tiểu học** (Phonics, Từ vựng, Ngữ pháp cơ bản)
  - 🔬 **Tự nhiên & Xã hội / Khoa học**
  - 🗺️ **Lịch sử & Địa lý** (Lớp 4 - 5)
  - 💻 **Tin học & Công nghệ**
  - 🌟 **Đạo đức & Kỹ năng sống**
  - 🎨 **Mỹ thuật**
  - 🎵 **Âm nhạc**
  - 🏃 **Giáo dục thể chất**
  - 🎪 **Hoạt động trải nghiệm**

---

## 🏗️ Kiến Trúc Công Nghệ
- **Frontend**: Next.js 16 (App Router), Tailwind CSS, shadcn/ui, Lucide Icons, React Query, Zustand.
- **Backend**: NestJS (Module architecture, Class Validator, Guards, Interceptors, Swagger).
- **Database / ORM**: PostgreSQL via Supabase, Prisma ORM, Row Level Security (RLS).
- **Gamification**: Hệ thống XP, Level, Huy hiệu (Badges), Chuỗi chuyên cần (Streaks), Bảng vinh danh lớp học.

---

## 🚀 Các Phân Hệ Chính
1. **Teacher Portal**:
   - Quản lý Lớp học & Danh sách học sinh theo khối lớp.
   - **Tạo & Quản lý Thời khóa biểu tuần** (Lưới tuần, Timeline ngày, Nạp mẫu thời khóa biểu Tiểu học 1-chạm, In ấn).
   - Soạn bài học & Quản lý bài tập (Trắc nghiệm, Tự luận, Kéo thả).
   - Điểm danh & Theo dõi chuyên cần học sinh.
   - Bảng tin & Thông báo lớp học.
   - Cài đặt tài khoản & Bảo mật.
2. **Student Portal**:
   - Tham gia bài học tương tác, nộp bài tập.
   - Hệ thống bài tập tương tác & Mini-games củng cố kiến thức.
   - Theo dõi tiến độ học tập, huy hiệu và bảng xếp hạng lớp.
