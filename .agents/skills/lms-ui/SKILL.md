---
name: lms-ui
description: Guidelines for Tailwind CSS, shadcn/ui components, responsive design, and child-friendly UX.
---

# Kỹ năng LMS UI & UX

1. **Tech Stack**: Sử dụng **Tailwind CSS** và **shadcn/ui**.
2. **Child-friendly UX**:
   - Nút bấm (buttons) to, rõ ràng, bo góc lớn (rounded-xl, rounded-2xl).
   - Sử dụng màu sắc tươi sáng, độ tương phản tốt.
   - Thêm micro-animations (hover effects, click ripples) sử dụng Framer Motion hoặc Tailwind `animate-` utilities.
3. **Responsive**: Đảm bảo giao diện hoạt động tốt trên thiết bị di động và tablet (Tailwind breakpoints `sm`, `md`, `lg`). Giáo viên và học sinh thường dùng tablet trên lớp.
4. **Accessibility**: Thêm `aria-labels`, outline rõ ràng khi focus bằng bàn phím.
5. **No Placeholders**: Tránh hiển thị nội dung mẫu nhạt nhẽo; luôn render preview có ý nghĩa và sinh động.
