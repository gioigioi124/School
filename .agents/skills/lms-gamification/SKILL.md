---
name: lms-gamification
description: Implementation logic for XP, levels, badges, streaks, rewards, and leaderboards.
---

# Kỹ năng LMS Gamification

1. **Điểm XP**: Tính toán cộng điểm tại Backend (vd: hoàn thành bài giảng +10, bài tập đúng +20/+30). Ghi nhận vào bảng `xp_history` và update tổng xp.
2. **Công thức Level**: `level = floor(total_xp / 1000) + 1`. Tính toán tự động ở backend mỗi khi nhận XP.
3. **Streaks**: Tính chuỗi ngày học liên tục (dựa trên bảng `attendance`). Điểm danh liên tục = +Streak. Nghỉ không phép = Reset Streak về 0.
4. **Badges**: Huy hiệu được cấp qua engine kiểm tra điều kiện (vd: đạt level 10, đăng nhập 7 ngày liên tiếp).
5. **Leaderboard**: Tính toán xếp hạng học sinh *trong một lớp* chứ không phải toàn trường, tối ưu query.
6. **Frontend UI**: Sử dụng hiệu ứng pháo hoa, toast notification, thanh tiến trình (progress bar) sinh động khi học sinh nhận được XP/Badge.
