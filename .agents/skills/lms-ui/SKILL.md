---
name: lms-ui
description: Guidelines for Tailwind CSS, shadcn/ui components, responsive design, and Primary School UX.
---

# Kỹ năng LMS UI & UX (Dành cho Cấp Tiểu Học)

> [!IMPORTANT]
> **ĐỊNH HƯỚNG TRỌNG TÂM: CẤP TIỂU HỌC (LỚP 1 - LỚP 5, 6 - 11 TUỔI)**
> - Dự án tập trung hoàn toàn vào **HỌC SINH TIỂU HỌC** và **GIÁO VIÊN TIỂU HỌC**, **KHÔNG PHẢI MẦM NON**.
> - Không sử dụng thuật ngữ hoặc phong cách của nhà trẻ/mầm non (như đón trẻ mầm non, giờ ăn dặm, nặn đất sét nhà trẻ...).
> - Toàn bộ môn học, bài tập, giao diện, thời khóa biểu và hình ảnh phải phản ánh đúng môi trường Tiểu học (Toán học, Tiếng Việt, Tiếng Anh, Tự nhiên & Xã hội, Khoa học, Lịch sử & Địa lý, Tin học, Đạo đức, Mỹ thuật, Âm nhạc, Giáo dục thể chất).

1. **Tech Stack**: Sử dụng **Tailwind CSS** và **shadcn/ui** (@base-ui/react).
2. **Primary School UX/UI (Học sinh Tiểu học)**:
   - Nút bấm (buttons) to, rõ ràng, bo góc vừa vặn và hiện đại (`rounded-xl`, `rounded-2xl`).
   - Phông chữ dễ đọc cho học sinh tiểu học luyện chữ và làm bài tập (Lexend, sans-serif).
   - Màu sắc tươi sáng, tương phản cao, tràn đầy năng lượng học tập nhưng giữ sự trang nhã học đường.
   - Thêm micro-animations (hover effects, click ripples, progress bars) tạo hứng thú học tập và làm bài tập.
3. **Responsive**: Đảm bảo giao diện hoạt động mượt mà trên Tablet, Laptop và Mobile (Tailwind breakpoints `sm`, `md`, `lg`) vì giáo viên và học sinh thường sử dụng máy tính bảng hoặc laptop phòng tin học.
4. **Accessibility**: Thêm `aria-labels`, outline rõ ràng khi focus bằng bàn phím.
5. **No Placeholders**: Luôn render dữ liệu mẫu thực tế, bám sát các môn học và hoạt động học đường của cấp Tiểu học.
