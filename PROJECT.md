# Project: Kinderly LMS (Hệ Thống LMS Tiểu Học)

> [!IMPORTANT]
> **ĐỊNH HƯỚNG TRỌNG TÂM DỰ ÁN (TARGET DOMAIN)**:
> - Dự án **Kinderly LMS** được xây dựng và thiết kế chuyên biệt cho **HỌC SINH TIỂU HỌC (Primary School - Lớp 1 đến Lớp 5, lứa tuổi 6 - 11 tuổi)** và **GIÁO VIÊN TIỂU HỌC**.
> - **KHÔNG PHẢI MẦM NON**: Mọi thiết kế UI/UX, nghiệp vụ sư phạm, danh mục môn học (Toán, Tiếng Việt, Tiếng Anh, Tự nhiên & Xã hội / Khoa học, Lịch sử & Địa lý, Tin học & Công nghệ, Đạo đức, Âm nhạc, Mỹ thuật, Giáo dục thể chất, Hoạt động trải nghiệm), hệ thống bài tập, chấm điểm, thời khóa biểu và tính năng phải bám sát chương trình và tâm lý học sinh Cấp Tiểu học (GDPT 2018).

## Architecture
- **Frontend**: Next.js 16 App Router (React, Tailwind CSS, shadcn/ui, Lucide Icons, react-hot-toast).
- **Backend**: NestJS Module architecture (`users` module), Supabase Auth Guard, class-validator DTOs.
- **Database / ORM**: PostgreSQL via Supabase, Prisma ORM (`profiles` model).
- **Auth**: Supabase Client Auth for authentication and password management.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Profile Settings Tab | Update display name, phone, school, avatar (selector / URL) | M2, M3 | ORIGINAL_REQUEST R1, R2 |
| 2 | Security Settings Tab | Password change via Supabase Auth, view account email | M3 | ORIGINAL_REQUEST R1 |
| 3 | Notification Settings Tab | Toggle new submission alerts, class alerts, sound | M3 | ORIGINAL_REQUEST R1 |
| 4 | Preferences Settings Tab | UI language / theme / display preferences | M3 | ORIGINAL_REQUEST R1 |
| 5 | Teacher Navigation Link | Sidebar link to `/settings` in `(teacher)` layout | M3 | ORIGINAL_REQUEST R1 |
| 6 | Backend DTO & Service | `UpdateProfileDto` validation & `users.service.ts` updates | M2 | ORIGINAL_REQUEST R2 |
| 7 | End-to-End Verification & QA | Build checks, typechecks, schema sync, runtime checks | M4 | ORIGINAL_REQUEST R3 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Survey & Architecture Planning | Codebase inspection, Prisma schema check, API contract definition | none | DONE |
| M2 | Backend Implementation | Update NestJS users module (DTO, service, controller), unit tests | M1 | DONE |
| M3 | Frontend Implementation | Create `/settings` page with 4 tabs, avatar selector, toast notifications | M1, M2 | DONE |
| M4 | QA, Verification & Forensic Audit | Typecheck, build, functional tests, code quality audit | M2, M3 | DONE |

## Interface Contracts
### `GET /api/users/profile`
- **Headers**: `Authorization: Bearer <supabase_jwt>`
- **Response**:
  ```json
  {
    "id": "string",
    "email": "string",
    "role": "TEACHER | STUDENT | ADMIN",
    "displayName": "string",
    "phone": "string | null",
    "school": "string | null",
    "avatarUrl": "string | null",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### `PATCH /api/users/profile`
- **Headers**: `Authorization: Bearer <supabase_jwt>`
- **Body**:
  ```json
  {
    "displayName": "string (optional, min 2)",
    "phone": "string (optional)",
    "school": "string (optional)",
    "avatarUrl": "string (optional, url or preset key)"
  }
  ```
- **Response**: Updated user profile object

### `Supabase Auth updateUser`
- **Method**: `supabase.auth.updateUser({ password: newPassword })`
- **Validation**: Minimum 6 characters, confirmation match.

## Code Layout
- Backend:
  - `backend/src/modules/users/dto/update-profile.dto.ts`
  - `backend/src/modules/users/users.service.ts`
  - `backend/src/modules/users/users.controller.ts`
  - `backend/prisma/schema.prisma`
- Frontend:
  - `frontend/app/(teacher)/settings/page.tsx`
  - `frontend/app/(teacher)/layout.tsx` or sidebar component
  - `frontend/components/...` (tabs, forms, avatar selector)
