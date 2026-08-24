---
name: lms-testing
description: Strategies for Unit, Integration, API, E2E, and Regression testing in the LMS.
---

# Kỹ năng LMS Testing

1. **Unit Testing (Backend)**:
   - Sử dụng Jest. Đặt file test kề bên file source (vd: `users.service.spec.ts`).
   - Mock Prisma service và external APIs để đảm bảo unit test chạy nhanh và cô lập.
2. **Integration / API Testing (Backend)**:
   - Sử dụng Supertest + Jest (thư mục `test/` gốc của NestJS). Bắn request HTTP tới endpoints.
3. **Frontend Testing**:
   - Sử dụng Jest + React Testing Library cho các component chứa logic phức tạp.
   - Đảm bảo các hooks xử lý gamification/XP được test kỹ.
4. **E2E Testing**:
   - Dùng Playwright cho các luồng quan trọng (Login, Enroll Class, Làm bài tập).
5. **Quy tắc**: Code mới thêm vào phải có test bao phủ logic chính. Fix bug phải kèm theo regression test để chống tái diễn.
