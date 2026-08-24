# 10 Architecture

## Source of Truth
- **Supabase Auth** là Authentication duy nhất.
- **NestJS** là Business/API layer duy nhất.
- **Supabase PostgreSQL** là database duy nhất.
- **Prisma** là ORM/type-safe query layer của NestJS.
- **Supabase SQL migrations** là source of truth cho database changes. `auth.users` là identity source.

## Authentication Flow
```text
Browser → Supabase Auth → Next.js session (cookie)
        → Bearer access token → NestJS AuthGuard
        → Business/Authorization → PostgreSQL
```
Không tạo `password_hash`, custom JWT, hay session tables trùng lặp với Supabase Auth.

## Frontend (Next.js 16)
- Chỉ dùng App Router.
- Server Components mặc định, dùng `'use client'` khi cần.
- Data fetching: Server-side `fetch()` hoặc client-side `useQuery` (TanStack).

## Backend (NestJS)
- Module per feature.
- Chuẩn response format: `{ "success": true, "data": ..., "meta": ..., "timestamp": ... }`
- NestJS DTO định nghĩa contract API.
