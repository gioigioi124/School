# 🎓 Kế hoạch phát triển Web Quản lý Học sinh

**Tên dự án**: Learning Management System (LMS) cho Tiểu học
**Tech Stack**: Next.js 16 App Router + NestJS + Supabase
**IDE**: Antigravity
**Thời gian dự kiến**: 12-16 tuần
**Mục tiêu**: Platform học tập gamified dành cho học sinh tiểu học

---

## 🧭 ARCHITECTURE DECISIONS — Quyết định kiến trúc bắt buộc

> Agent không được tự ý thay đổi các quyết định dưới đây nếu chưa cập nhật kế hoạch và nêu rõ lý do.

### 0. Source of truth
- **Supabase Auth** là Authentication duy nhất.
- **NestJS** là Business/API layer duy nhất.
- **Supabase PostgreSQL** là database duy nhất.
- **Prisma** là ORM/type-safe query layer của NestJS.
- **Supabase SQL migrations** là source of truth cho database changes.
- `auth.users` là identity source; app có `profiles` liên kết `profiles.id = auth.users.id`.

### 1. Authentication flow

```text
Browser → Supabase Auth → Next.js session (cookie)
        → Bearer access token → NestJS AuthGuard
        → Business/Authorization → PostgreSQL
```

- Next.js dùng `@supabase/ssr` cho cookie-based session.
- NestJS validate Supabase access token, không tự phát hành JWT riêng.
- Không tạo `password_hash`, `user_sessions`, custom refresh tokens hoặc JWT signing secrets trùng chức năng Supabase Auth.

### 2. RLS + Prisma
- RLS là defense-in-depth và bắt buộc trên public tables có dữ liệu cần bảo vệ.
- Không giả định Prisma backend connection sẽ tự mang `auth.uid()` của user vào PostgreSQL.
- Authorization chính của API nằm ở NestJS/service layer.
- Use case nào cần RLS theo user JWT phải dùng cơ chế Supabase phù hợp; không ép Prisma privileged connection làm thay.

### 3. API contract
NestJS DTO → Swagger/OpenAPI → frontend typed client/types.
- Không định nghĩa response contract trùng lặp không cần thiết.
- Pagination và error format phải thống nhất.

### 4. Agent rules
1. Đọc workspace rules trước khi thay đổi kiến trúc.
2. Tự chọn relevant skill; người dùng không cần nhắc skill ở chat mới.
3. Kiểm tra existing code/schema trước khi tạo file.
4. Không thay đổi API/database contract ngầm.
5. Sau thay đổi chạy typecheck/lint/tests/build phù hợp.

## 📋 GLOBAL RULES — Quy tắc chung cho stack

### Next.js 16 (Frontend)

#### ✅ Bắt buộc tuân thủ
- **Chỉ dùng App Router** (không Pages Router)
- **Server Components** là default, thêm `'use client'` chỉ khi cần interactivity
- **Route groups** để tổ chức logic: `(auth)`, `(teacher)`, `(student)`, `(admin)`, `(public)`
- **Proxy** tại `proxy.ts` (root level) cho request boundary, session refresh và redirect; không dùng Proxy như authorization layer duy nhất
- **Environment variables**: `NEXT_PUBLIC_*` để expose client-side, các biến khác ở `.env.local`
- **API calls**: Ưu tiên server-side `fetch()` hoặc typed API client; Axios chỉ dùng khi có lợi ích rõ ràng. Không tự tạo JWT/refresh-token system
- **Supabase SSR**: dùng `@supabase/ssr` với browser/server clients và cookie-based session
- **Data fetching**:
  - Server Component: `fetch()` hoặc REST API
  - Client Component: TanStack Query (`useQuery`, `useMutation`) khi cần cache/refetch client-side
  - Không fetch cùng một dữ liệu ở cả Server Component và Client Component nếu không có lý do rõ ràng
- **Styling**: Tailwind CSS + shadcn/ui components
- **State management**: Zustand chỉ cho UI/client state thực sự global; TanStack Query cho server state; auth session là source từ Supabase Auth, không copy toàn bộ session vào Zustand
- **TypeScript**: Strict mode, types phải khai báo rõ ràng

#### Cấu trúc file/folder
```
frontend/
├── app/
│   ├── (public)/
│   │   ├── page.tsx          ← trang chủ "/"
│   │   └── features/page.tsx ← /features
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (teacher)/
│   │   ├── layout.tsx        ← layout riêng teacher
│   │   ├── dashboard/page.tsx
│   │   ├── classes/page.tsx
│   │   ├── classes/[classId]/page.tsx
│   │   ├── announcements/page.tsx
│   │   └── reports/page.tsx
│   ├── (student)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── classes/page.tsx
│   │   ├── lessons/page.tsx
│   │   ├── games/page.tsx
│   │   ├── videos/page.tsx
│   │   └── profile/page.tsx
│   ├── (admin)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── teachers/page.tsx
│   │   ├── schools/page.tsx
│   │   └── content-management/page.tsx
│   ├── api/
│   │   └── webhooks/
│   │       └── attendance/route.ts
│   ├── layout.tsx            ← root layout
│   ├── globals.css
│   └── error.tsx, not-found.tsx
├── components/
│   ├── common/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   └── LoadingSpinner.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── teacher/
│   │   ├── ClassCard.tsx
│   │   ├── AnnouncementForm.tsx
│   │   └── AttendanceTable.tsx
│   ├── student/
│   │   ├── LessonCard.tsx
│   │   ├── GameWidget.tsx
│   │   └── StreakDisplay.tsx
│   └── admin/
│       └── StatsCard.tsx
├── lib/
│   ├── api.ts                ← typed API client / fetch wrapper
│   ├── auth.ts               ← app auth utilities
│   ├── supabase/
│   │   ├── client.ts         ← browser client
│   │   ├── server.ts         ← server client
│   │   └── proxy.ts          ← session refresh helper
│   ├── constants.ts
│   └── utils.ts
├── store/
│   ├── ui.store.ts
│   └── gamification.store.ts
├── types/
│   ├── index.ts
│   ├── api.ts
│   └── models.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useClasses.ts
│   ├── useLessons.ts
│   └── useGamification.ts
├── proxy.ts
├── package.json
└── next.config.js
```

### NestJS (Backend)

#### ✅ Bắt buộc tuân thủ
- **Module per feature**: Mỗi feature là 1 NestJS module
- **Module files**: `*.module.ts`, `*.controller.ts`, `*.service.ts` bắt buộc
- **DTOs**: Dùng `class-validator` cho validation, mỗi DTO là 1 file
- **Auth Guard**: `SupabaseAuthGuard` xác thực Supabase access token; roles/permissions qua `RolesGuard`/authorization policy

- **Interceptors**: Dùng cho response metadata khi cần; error handling chính dùng global `ExceptionFilter`
- **Pipes**: `ValidationPipe` global với `whitelist: true, forbidNonWhitelisted: true, transform: true`
- **Decorators**: Custom decorators tại `common/decorators/`
- **Error handling**: Throw `HttpException` với status code đúng
- **Response format**:
  ```json
  {
    "success": true,
    "data": { ... },
    "meta": { "requestId": "..." },
    "timestamp": "2026-08-24T10:30:00Z"
  }
  ```
- **Pagination**: Query params `page`, `pageSize`, return `{ data: [...], meta: { total, page, pageSize, totalPages } }`

#### Cấu trúc file/folder
```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── guards/
│   │   │   │   └── supabase-auth.guard.ts
│   │   │   └── dto/
│   │   │       └── update-profile.dto.ts
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── dto/
│   │   │   │   └── update-user.dto.ts
│   │   │   └── entities/
│   │   │       └── user.entity.ts
│   │   ├── classes/
│   │   │   ├── classes.module.ts
│   │   │   ├── classes.controller.ts
│   │   │   ├── classes.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-class.dto.ts
│   │   │   │   └── update-class.dto.ts
│   │   │   └── entities/
│   │   │       └── class.entity.ts
│   │   ├── class-enrollments/
│   │   │   ├── class-enrollments.module.ts
│   │   │   ├── class-enrollments.controller.ts
│   │   │   ├── class-enrollments.service.ts
│   │   │   └── dto/
│   │   │       └── enroll-student.dto.ts
│   │   ├── lessons/
│   │   ├── assignments/
│   │   ├── attendance/
│   │   ├── announcements/
│   │   ├── gamification/ (XP, badges, levels)
│   │   └── notifications/
│   ├── common/
│   │   ├── guards/
│   │   │   ├── supabase-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── decorators/
│   │   │   ├── roles.decorator.ts
│   │   │   └── current-user.decorator.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   ├── transform.interceptor.ts
│   │   │   └── error.interceptor.ts
│   │   └── pipes/
│   │       └── validation.pipe.ts
│   ├── config/
│   │   ├── configuration.ts
│   │   └──
│   ├── prisma/
│   │   ├── prisma.service.ts
│   │   ├── prisma.module.ts
│   │   └── migrations/
│   ├── utils/
│   │   ├── │   │   └── │   ├── app.module.ts
│   └── main.ts
├── prisma/
│   ├── schema.prisma
│   └── prisma.config.ts
├── .env
├── package.json
└── tsconfig.json
```

### Supabase (Database)

#### ✅ Bắt buộc tuân thủ
- **Auth**: Dùng Supabase Auth duy nhất. Không tự hash password hoặc tạo refresh-token/session table trùng chức năng Supabase Auth.
- **Row Level Security (RLS)**: Enable RLS trên public tables có dữ liệu cần bảo vệ; mỗi policy phải có mục đích và test.
- **Migrations**: Dùng `supabase/migrations/*.sql` + Supabase CLI làm source of truth cho database changes. Prisma dùng để introspect/sync schema và query từ NestJS.
- **Connection pooling**: Production ưu tiên Supavisor/connection pooling phù hợp deployment.
- **Realtime**: Enable realtime cho tables cần (announcements, notifications)
- **Storage**: Dùng Supabase Storage cho videos, files (không lưu trực tiếp file trong DB)
- **Naming conventions**:
  - Table: snake_case số nhiều (`users`, `class_enrollments`)
  - Column: snake_case (`created_at`, `updated_at`, `is_active`)
  - Foreign keys: `{table_singular}_id` (e.g., `user_id`, `class_id`)
- **Timestamps**: `created_at`, `updated_at` trên mỗi table
- **Soft deletes**: Column `deleted_at` cho dữ liệu nhạy cảm (không xoá hard)

#### Environment Variables Backend
```bash
# Prisma runtime / pooled connection
DATABASE_URL="postgresql://..."

# Prisma CLI / direct connection for schema tooling
DIRECT_URL="postgresql://..."

SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
SUPABASE_SECRET_KEY="sb_secret_..."   # NEVER expose to browser

FRONTEND_URL="http://localhost:3000"
NODE_ENV="development"
```

> Không tạo `JWT_SECRET`, `JWT_REFRESH_SECRET`, `password_hash` hoặc custom refresh-token system khi Supabase Auth là auth provider. Production secrets phải nằm trong secret manager.

#### Environment Variables Frontend
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

> Chỉ publishable/anon key được phép ở frontend. Không đưa secret/service-role key vào `NEXT_PUBLIC_*`.

---

## 🎯 PROJECT RULES — Quy tắc riêng cho dự án LMS

### 1. Multi-Tenant (Nhiều giáo viên, nhiều lớp)

**Nguyên tắc**:
- Mỗi giáo viên có thể tạo và quản lý nhiều lớp
- Mỗi học sinh có thể tham gia nhiều lớp
- Mỗi phụ huynh liên kết với 1+ học sinh
- **Data isolation**: Học sinh chỉ nhìn thấy lớp mình tham gia, giáo viên chỉ quản lý lớp mình dạy

**Implementation**:
- Table `class_enrollments` để track học sinh → lớp
- RLS policy phải kiểm tra membership/role qua relationship tables/helper functions; không giả định một policy `auth.uid() = user_id` đủ cho mọi bảng
- Table `parent_student_links` để track phụ huynh → học sinh
- NestJS API luôn lấy `currentUser` từ verified Supabase token rồi enforce ownership/membership ở service layer
- Không tin `teacher_id`, `student_id` hoặc `role` do client gửi lên làm nguồn quyền

### 2. Gamification System

**Entities**:
- **XP (Experience Points)**: Mỗi bài học/bài tập hoàn thành = +10-50 XP
- **Levels**: Level = floor(total_xp / 1000), max level = 50 cho tiểu học
- **Badges**: Huy hiệu theo milestone (hoàn thành bài đầu tiên, 7 ngày liên tiếp, v.v.)
- **Streaks**: Chuỗi ngày điểm danh, hiệu ứng lửa khi 3+ ngày liên tiếp
- **Rewards**: Xu ảo có thể đổi lấy avatar items, themes
- **Leaderboard**: Theo lớp (không toàn trường), xếp hạng theo XP/streak

**Calculation Rules**:
```
XP gain:
- Hoàn thành bài giảng: +10 XP
- Hoàn thành bài tập (50%+): +20 XP
- Hoàn thành bài tập (100%): +30 XP
- Mini-game: +5-15 XP tuỳ độ khó
- Streak bonus: +5 XP/ngày (max +35 XP/tuần)

Coins:
- 1 level lên = +50 coins
- Hoàn thành quest hàng ngày = +10 coins
- Tổng coins có thể: spend vào shop

Level formula:
level = floor(total_xp / 1000) + 1
next_level_xp = (level * 1000)
```

### 3. Attendance & Streak System

**Tracking**:
- Điểm danh bằng mã QR, mã số học sinh, hoặc phụ huynh xác nhận
- `attendance` table: `{ student_id, class_id, date, status: 'present'|'absent'|'late' }`
- Tính streak: số ngày liên tiếp đi học (chỉ tính `present`)
- `present` làm tăng streak; `absent` làm đứt streak. `late` cần rule riêng; mặc định không làm mất streak nếu nghiệp vụ trường chưa quy định khác.

**Business Logic**:
```typescript
// Pseudo code
function calculateStreak(studentId, classId) {
  const today = new Date()
  let streak = 0
  let checkDate = today

  while (checkDate > pastDate) {
    const attendance = db.attendance.findOne({
      student_id: studentId,
      class_id: classId,
      date: checkDate,
      status: 'present'
    })
    if (!attendance) break
    streak++
    checkDate.setDate(checkDate.getDate() - 1)
  }
  return streak
}
```

### 4. Class Enrollment Flow

**Steps**:
1. **Giáo viên tạo lớp**: `POST /classes` → generate `class_code` + `class_qr_url`
2. **Học sinh nhập mã**: `POST /class-enrollments/join` với `class_code` → status = `pending`
3. **Giáo viên duyệt**: `PATCH /class-enrollments/:id/approve` → status = `approved`
4. **Học sinh thấy lớp**: Load từ `class_enrollments WHERE student_id = current_user AND status = 'approved'`
5. **Phụ huynh tự động nhận**: Khi liên kết với học sinh, auto-subscribe thông báo lớp

**Tuỳ chọn**:
- Auto-approve (giáo viên bật mode mở)
- Phải upload ảnh đi kèm (xác minh danh tính)

### 5. Announcements & Notifications

**Rules**:
- Giáo viên đăng thông báo → chỉ học sinh trong lớp thấy
- Phụ huynh auto-nhận thông báo của lớp con học (qua `parent_student_links`)
- Thông báo "important" → push notification + email phụ huynh
- Lưu lịch sử thông báo (không xoá, soft delete)

**Real-time**:
- Enable Supabase Realtime trên table `announcements`
- Frontend subscribe realtime: mới có thông báo → toast + bell icon
- Fallback: polling mỗi 30s nếu WebSocket fail

### 6. Video & Lesson Structure

**Hierarchy**:
```
Course (môn học) 1—many Lessons 1—many Tasks/Videos
```

**Types**:
- `lesson`: Video + nội dung bài giảng (text, hình ảnh)
- `assignment`: Bài tập (trắc nghiệm, tự luận, kéo-thả)
- `mini_game`: Game ôn tập
- `video`: Video độc lập (không ràng buộc lesson)

**Storage**:
- Videos lưu Supabase Storage hoặc external video provider khi scale yêu cầu; private content dùng signed URLs/access policy
- Metadata: `{ video_url, duration, thumbnail_url, transcript }`

### 7. Admin & Content Management

**Admin có quyền**:
- Duyệt tài khoản giáo viên mới
- Quản lý nội dung chung (lessons, videos library)
- Xem thống kê toàn hệ thống (số trường, số học sinh, activity)
- Quản lý cấu hình/feature flags (feature flags)

**Content Library**:
- Admin tạo bài giảng/video, giáo viên có thể tái sử dụng (copy vào lớp riêng)
- Không bắt buộc dùng — giáo viên tạo nội dung riêng cũng được

---

## 🛠️ SKILLS — Kỹ năng Agent cần

Antigravity tự discover skills khi conversation bắt đầu và đọc `SKILL.md` khi task phù hợp. Workspace skills đặt tại `.agents/skills/`; workspace rules đặt tại `.agents/rules/`. Vì vậy không cần nhắc Agent dùng skill ở mỗi cuộc trò chuyện mới.

### Workspace Rules — Always On / Model Decision

```text
.agents/
├── rules/
│   ├── 00-project-always-on.md
│   ├── 10-architecture.md
│   ├── 20-security.md
│   └── 30-workflow.md
└── skills/
```

Rules dùng cho nguyên tắc dài hạn: architecture, security, naming, workflow, Definition of Done. Skills dùng cho knowledge/workflow chuyên biệt và được load khi task phù hợp.

### Skills

| # | Skill | Khi tự kích hoạt |
|---|---|---|
| 1 | `lms-architecture` | feature mới, thay đổi boundary/folder/dependency |
| 2 | `nextjs-16` | App Router, Server/Client Components, Proxy, fetching, rendering |
| 3 | `nestjs` | module, controller, service, DTO, guard, pipe, exception, Swagger |
| 4 | `supabase-prisma` | schema, migration, RLS, index, Storage, Prisma query |
| 5 | `lms-auth-multitenant` | auth, session, roles, permissions, class isolation |
| 6 | `lms-gamification` | XP, level, badge, streak, reward, leaderboard |
| 7 | `lms-ui` | Tailwind, shadcn/ui, responsive, accessibility, child-friendly UX |
| 8 | `lms-realtime` | announcement, notification, Supabase Realtime |
| 9 | `lms-testing` | unit, integration, API, E2E, regression |
| 10 | `lms-deployment` | Vercel, backend hosting, Supabase production, CI/CD, monitoring |

### SKILL.md format bắt buộc

```yaml
---
name: supabase-prisma
description: Handles Supabase PostgreSQL schema, SQL migrations, RLS, Prisma integration, indexes, constraints, and database changes for the LMS project.
---
```

Description phải đủ cụ thể để semantic matching nhận đúng skill. Không tạo một skill khổng lồ chứa toàn bộ dự án; giữ skill focused để progressive disclosure hoạt động tốt.

### Definition of Done
- [ ] Architecture không bị phá vỡ
- [ ] DB migration/RLS được xử lý nếu schema thay đổi
- [ ] DTO + validation + authorization đầy đủ
- [ ] Loading/error/empty state có ở frontend
- [ ] Typecheck/lint pass
- [ ] Relevant tests pass
- [ ] Build pass khi phù hợp
- [ ] API/DB docs cập nhật khi contract thay đổi

## 📁 Cấu trúc Folder Project

```text
lms-project/
├── .agents/
│   ├── rules/
│   │   ├── 00-project-always-on.md
│   │   ├── 10-architecture.md
│   │   ├── 20-security.md
│   │   └── 30-workflow.md
│   └── skills/
│       ├── lms-architecture/
│       ├── nextjs-16/
│       ├── nestjs/
│       ├── supabase-prisma/
│       ├── lms-auth-multitenant/
│       ├── lms-gamification/
│       ├── lms-ui/
│       ├── lms-realtime/
│       ├── lms-testing/
│       └── lms-deployment/
├── frontend/                    ← Next.js 16
├── backend/                     ← NestJS
├── supabase/
│   ├── config.toml
│   ├── migrations/              ← source of truth cho DB changes
│   ├── seed.sql
│   └── functions/               ← chỉ khi thực sự cần Edge Functions
├── docs/
│   ├── DEVELOPMENT_PLAN.md
│   ├── API_SPEC.md
│   ├── DB_SCHEMA.md
│   ├── AUTH.md
│   └── DEPLOYMENT_GUIDE.md
├── .env.example
├── docker-compose.yml
├── package.json
└── README.md
```

### Quy tắc

- NestJS là API chính. Next.js Route Handlers chỉ dùng cho webhook/BFF/integration cases đã xác định; không tạo API nghiệp vụ song song.
- Next.js 16 dùng `proxy.ts`, không dùng `middleware.ts` cho code mới.
- `supabase/migrations/` là nguồn duy nhất cho database migrations.
- Không tạo thêm `database/migrations/` hoặc `backend/prisma/migrations/` cho cùng schema.
- `docs/DB_SCHEMA.md` chỉ là tài liệu; database migration mới là source of truth.

## 📊 Kế hoạch phát triển theo giai đoạn

### 🔵 **PHASE 1 (4 tuần): MVP Core — Auth + Basic Features**

#### Tuần 1-2: Setup & Infrastructure
**Frontend**:
- [x] Create Next.js 16 project (npx create-next-app@16)
- [x] Setup Tailwind CSS + shadcn/ui
- [x] Create route groups structure: (public), (auth), (teacher), (student), (admin)
- [x] Setup Zustand stores for UI/client state: ui.store, gamification.store (auth session remains Supabase Auth)
- [x] Create lib/api.ts (typed fetch/Axios wrapper; attach current Supabase access token when calling NestJS)
- [x] Create `proxy.ts` for session refresh and route redirects
- [x] Install dependencies: next, react, axios, zustand, @tanstack/react-query, tailwindcss, shadcn/ui

**Backend**:
- [x] Create NestJS project (nest new lms-backend)
- [x] Setup Prisma ORM + `prisma.config.ts`
- [x] Create Supabase project + local Supabase CLI config
- [x] Create initial schema: profiles, roles, role_assignments
- [x] Setup Supabase Auth integration in Next.js (`@supabase/ssr`)
- [x] Setup NestJS `SupabaseAuthGuard`
- [x] Create auth module for app-specific profile/authorization operations
- [x] Setup NestJS global validation, exception handling, logging, and response transform
- [x] Create Swagger documentation

**Database**:
- [x] Create Supabase project
- [x] Setup .env files
- [x] Create base tables: profiles, roles, role_assignments
- [x] Enable RLS + create base policies
- [x] First Supabase SQL migration
- [x] Run Prisma introspection/generate against the current schema

**DevOps**:
- [x] Setup GitHub repo structure
- [x] Create .gitignore
- [x] Setup .env.example files
- [x] Create docker-compose.yml (optional)

#### Tuần 3-4: Auth + User Management
**Backend**:
- [x] Implement application-level auth/profile operations; Supabase Auth handles sign-up/sign-in/sign-out/session refresh
- [x] Implement `SupabaseAuthGuard` + roles/authorization decorator
- [x] Create users.module + users.controller + users.service
- [x] Create user profile endpoints (GET, UPDATE)
- [x] Seed default application roles (admin, teacher, student, parent)
- [x] Create API docs (Swagger)

**Frontend**:
- [x] Create login page `(auth)/login/page.tsx`
- [x] Create register page `(auth)/register/page.tsx`
- [x] Create LoginForm, RegisterForm components
- [x] Implement auth utilities/hooks backed by Supabase Auth; do not duplicate the Supabase session in Zustand
- [x] Configure `proxy.ts` for session refresh and protected-route redirects
- [x] Create protected pages redirect
- [x] Test auth flow end-to-end

**Database**:
- [x] Add profile columns: email/display_name/avatar_url/created_at/updated_at; identity/password remain managed by Supabase Auth
- [x] Create profiles table linked to `auth.users.id`
- [x] Create roles + role_assignments
- [x] Create RLS policies for profile/role data

**Testing**:
- [x] Test login/register API
- [x] Test protected-route redirects and Supabase session handling
- [x] Test Supabase session refresh + protected NestJS API access

---

### 🟡 **PHASE 2 (4 tuần): Class Management + Enrollment**

#### Tuần 5-6: Class CRUD + Enrollment Flow
**Backend**:
- [x] Create classes.module + controller + service
- [x] Endpoints:
  - `POST /classes` — teacher creates class (generate class_code, class_qr_url)
  - `GET /classes` — list teacher's classes
  - `GET /classes/:id` — get class details
  - `PATCH /classes/:id` — update class
  - `DELETE /classes/:id` — soft delete
- [x] Create class_enrollments.module
- [x] Endpoints:
  - `POST /class-enrollments/join` / `POST /class-enrollments` — enroll student to class
  - `GET /class-enrollments` — list class members
  - `DELETE /class-enrollments` — remove student from class
- [x] Create Attendance tracking
- [x] Implement Streak calculation logic
- [x] RLS policies: teacher can only see own classes, students see approved classes

**Frontend**:
- [x] Create (teacher)/dashboard page
- [x] Create ClassCard component
- [x] Create (teacher)/classes/page — list + create class form
- [x] Create (teacher)/classes/[classId]/page — class detail
- [x] QR code display component
- [x] Create (student)/classes/page — list + join class form
- [x] Student input class code form + submit
- [x] Create class selection UI on first login
- [x] Implement class switching in sidebar
- [x] Add streak display component

**Database**:
- [x] Create tables: classes, class_enrollments
- [x] Add columns: class_code (unique), class_qr_url, teacher_id, description, grade_level
- [x] Create attendance table: { student_id, class_id, date, status }
- [x] Create student_streaks calculation logic

#### Tuần 7-8: Announcements + Notifications
**Backend**:
- [x] Create announcements.module
- [x] Endpoints:
  - `POST /announcements` — teacher post announcement
  - `GET /announcements` — student sees class announcements
  - `PATCH /announcements/:id` — edit (teacher only)
  - `DELETE /announcements/:id` — delete (teacher only)
- [x] Add is_important flag + auto-generate user notifications
- [x] Implement Supabase Realtime subscription
- [x] Create notifications table + service
- [ ] Implement email service (SendGrid or similar)

**Frontend**:
- [x] Create (teacher)/announcements/page
- [x] Create AnnouncementForm component
- [x] Implement announcement feed in (student)/dashboard
- [x] Realtime updates: subscribe to announcements table
- [x] Toast notification when new announcement
- [x] Display bell icon with unread count

**Database**:
- [x] Create announcements table: { teacher_id, class_id, title, content, is_important, created_at }
- [x] Create notifications table: { user_id, announcement_id, read_at }
- [x] Enable Realtime on announcements table

**Testing**:
- [x] Test class creation + enrollment flow
- [x] Test announcement posting + realtime
- [x] Test student streak calculation

---

### 🟠 **PHASE 3 (4 tuần): Lessons + Gamification**

#### Tuần 9-10: Lessons & Assignments
**Backend**:
- [x] Create lessons.module
- [x] Endpoints:
  - `POST /lessons` — teacher create lesson
  - `GET /lessons/class/:classId` — list class lessons with progress
  - `GET /lessons/:id` — lesson details + video
  - `PATCH /lessons/:id` — edit
  - `DELETE /lessons/:id` — delete
  - `POST /lessons/:id/complete` — mark lesson completed (+10 XP)
- [x] Create assignments.module
- [x] Endpoints:
  - `POST /assignments` — create task / quiz
  - `GET /assignments/lesson/:lessonId` — get assignments for lesson
  - `POST /assignments/:id/submissions` — student submit
  - `GET /assignments/:id/submissions` — teacher view student submissions
  - `PATCH /assignments/submissions/:id/grade` — teacher grade (+20-30 XP)
- [x] Calculate XP on assignment completion
- [x] Implement progress tracking (% completed via student_progress)

**Frontend**:
- [x] Create (teacher)/lessons/page
- [x] Create LessonForm component
- [x] Create AssignmentFormDialog component
- [x] Create LessonList component
- [x] Integrate lessons and quests into student portal
- [x] Assignment completion tracker and XP award feedback

**Database**:
- [x] Create lessons table: { class_id, teacher_id, title, description, video_url, duration, created_at }
- [x] Create assignments table: { lesson_id, type, content, xp_reward, due_date }
- [x] Create submissions table: { student_id, assignment_id, content, grade, xp_earned, submitted_at }
- [x] Create student_progress table: { student_id, lesson_id, is_completed, completed_at, xp_earned }

#### Tuần 11-12: Gamification (XP, Levels, Badges, Streaks)
**Backend**:
- [x] Create gamification.module
- [x] Create xp_rewards logic:
  - Award XP on lesson completion (+10 XP)
  - Award XP on assignment (50%: +20, 100%: +30)
  - Award XP on streak / praise (+5-50 XP)
- [x] Create badges logic:
  - Badge definitions: first_lesson, streak_3, streak_7, quiz_master, level_5, helper
  - Badge unlock logic
- [x] Create leaderboard logic:
  - Get class leaderboard (top students ranked by total XP)
- [x] Endpoints:
  - `GET /gamification/profile/{studentId}` — XP, level, badges, streak
  - `GET /gamification/my-profile` — current user gamification summary
  - `GET /gamification/leaderboard?classId=x` — class leaderboard
  - `GET /gamification/badges` — list all badges
  - `POST /gamification/award` — teacher award XP & stars

**Frontend**:
- [x] Create XP & Level display components
- [x] Create Badge showcase component
- [x] Create Streak display with fire emoji
- [x] Create Leaderboard & award view in class detail and student portal
- [x] Add XP popup animation on quest / lesson complete
- [x] Update (student)/portal với gamification stats

**Database**:
- [x] Create user_xp table: { student_id, total_xp, current_level, total_stars }
- [x] Create user_badges table: { student_id, badge_id, unlocked_at }
- [x] Create badges table (master): { id, code, name, icon, category, xp_bonus }
- [x] Create xp_history table: { student_id, action, xp_amount, source_type, created_at }

**Testing**:
- [x] Test XP calculation
- [x] Test badge unlock logic
- [x] Test level up
- [x] Test streak calculation

---

### 🔴 **PHASE 4 (4 tuần): Games + Polish + Deploy**

#### Tuần 13-14: Mini-Games + Video
**Backend**:
- [x] Create games.module
- [x] Create game-scores table + endpoints
  - `POST /games/:gameId/scores` — submit score
  - `GET /games` — list games
  - `GET /games/:id/leaderboard` — leaderboard
  - Award XP based on score
- [x] Seed educational games data

**Frontend**:
- [x] Create (student)/games/page
- [x] Implement mini-games:
  - **Matching game**: nối từ ⟷ nghĩa (using React components + state)
  - **Quiz game**: trắc nghiệm nhanh (multiple choice)
  - **Word puzzle**: ghép chữ cái thành từ
- [x] Create (student)/videos/page
- [x] Video player with progress tracking
- [x] Watchlist + recommendation list

**Database**:
- [x] Create games table
- [x] Create game_scores table

#### Tuần 15-16: Polish + Testing + Deployment
**Frontend Polish**:
- [x] Create loading states & responsive components
- [x] Add error boundaries (`error.tsx`, `not-found.tsx`)
- [x] Mobile responsive design (Tailwind breakpoints)
- [x] Accessibility: ARIA labels, keyboard navigation
- [x] Performance: Turbopack optimization, code splitting

**Backend Polish**:
- [x] Global ValidationPipe + DTO validation
- [x] Global ExceptionFilter & TransformInterceptor
- [x] Security: CORS, input sanitization

**Documentation**:
- [x] API documentation (Swagger `/api/docs` + `docs/API_SPEC.md`)
- [x] Complete Database Schema documentation (`docs/DB_SCHEMA.md`)
- [x] Architecture & Development Guide (`docs/DEVELOPMENT_PLAN.md`)

---

## ✅ Checklist tạo Feature Mới

Mỗi khi tạo feature mới, tuân thủ checklist này:

### Backend
- [ ] Tạo module: `{feature}.module.ts`
- [ ] Tạo controller: `{feature}.controller.ts` với các endpoints thực sự cần thiết
- [ ] Tạo service: `{feature}.service.ts` với business logic
- [ ] Tạo DTOs: `dto/create-{feature}.dto.ts`, `dto/update-{feature}.dto.ts`
- [ ] Không tạo entity class chỉ để bắt chước ORM patterns; dùng Prisma schema/types làm persistence model khi không có yêu cầu khác
- [ ] Dùng class-validator cho all DTOs
- [ ] Implement `SupabaseAuthGuard` + `RolesGuard`/authorization policy phù hợp
- [ ] Import module vào `app.module.ts`
- [ ] Test API bằng Swagger
- [ ] Add logging

### Frontend
- [ ] Tạo server component page trong đúng route group
- [ ] Thêm `'use client'` chỉ khi cần interactivity
- [ ] Tạo components trong `components/{feature}/`
- [ ] Tạo Zustand store nếu cần global state
- [ ] Tạo custom hook nếu cần logic tái sử dụng
- [ ] Fetch data từ NestJS API base URL; không nhầm với Next.js Route Handlers `/api/*` nếu feature không thuộc BFF/webhook layer
- [ ] Handle loading, error states
- [ ] Styling với Tailwind + shadcn/ui
- [ ] Mobile responsive
- [ ] Test component

### Database
- [ ] Cập nhật SQL migration trong `supabase/migrations/`
- [ ] Apply migration bằng Supabase CLI
- [ ] Đồng bộ Prisma schema/client khi cần (`db pull` / `generate`)
- [ ] Setup/test RLS policies
- [ ] Enable Realtime nếu cần

### Documentation
- [ ] Add API endpoint description (params, response)
- [ ] Add entity diagram nếu có relation phức tạp

---

## 🚀 Hướng dẫn Deploy nhanh

### Frontend (Vercel)
```bash
# Kết nối GitHub repo
# Vercel auto-detect Next.js
# Setup env variables: NEXT_PUBLIC_API_URL=...
# Deploy
```

### Backend (Railway hoặc Render)
```bash
# Railway / Render: kết nối GitHub
# Setup production secrets: DATABASE_URL, DIRECT_URL, SUPABASE_URL, SUPABASE_SECRET_KEY, etc.
# Auto-deploy on git push
```

### Database (Supabase)
```bash
# Backup production database
# Run migrations via Supabase CLI
# Verify schema
```

---

## 📞 Liên hệ & Support

- **Skills**: xem `.agents/skills/`; **Workspace Rules**: xem `.agents/rules/`
- **Database spec**: Xem `docs/DB_SCHEMA.md`
- **API spec**: Xem `docs/API_SPEC.md`

---

**Last Updated**: 2026-08-24
**Version**: 2.0
