---
name: supabase-prisma
description: Handles Supabase PostgreSQL schema, SQL migrations, RLS, Prisma integration, indexes, constraints, and database changes.
---

# Kỹ năng Supabase + Prisma

1. **Source of Truth**: Supabase SQL Migration là nguồn gốc của cấu trúc DB. Khi có thay đổi:
   - Tạo file migration `.sql` ở `supabase/migrations/`
   - Chạy lệnh DB pull hoặc update file `prisma/schema.prisma` để map schema từ Postgres sang Prisma models.
   - Chạy `npx prisma generate` để cập nhật Prisma Client type.
2. **Naming Convention**:
   - Database: table là `snake_case` số nhiều, column là `snake_case`. FK là `{table_singular}_id`.
   - Prisma: model là `PascalCase` số ít, field là `camelCase`. Dùng `@@map("table_name")` và `@map("col_name")` để nối DB với Prisma.
3. **RLS (Row Level Security)**: Luôn bật `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`. Viết chính sách rõ ràng, ví dụ `CREATE POLICY ... ON ... USING (...)`.
