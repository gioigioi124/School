# Implementation Plan: Teacher Settings (Cài đặt Giáo viên)

## Overview
Develop a comprehensive Teacher Settings feature for Kinderly LMS covering Profile Settings, Security Settings (Supabase Auth password change), Notification Settings, and System Preferences, backed by a NestJS backend and Prisma ORM.

## Phased Approach

### Phase 1: Planning & Surveying
- **Agent**: Planning Agent (`teamwork_preview_explorer` / `teamwork_preview_spec_miner`)
- **Objectives**:
  - Examine `backend/src/modules/users` (controller, service, DTOs, interfaces).
  - Inspect `prisma/schema.prisma` to verify `profiles` table columns (`displayName`, `phone`, `school`, `avatarUrl`, etc.).
  - Inspect `frontend/app/(teacher)` layout, sidebar navigation (`TeacherSidebar`), auth context, and existing UI components (`components/ui/*`).
  - Formulate API contract, frontend component hierarchy, state management, and schema updates if necessary.
  - Output detailed architecture and implementation plan.

### Phase 2: Implementation (Backend & Frontend)
- **Agent**: Developer Agent (`teamwork_preview_worker`)
- **Objectives**:
  - **Backend**:
    - Update `UpdateProfileDto` with validation decorators (`displayName`, `phone`, `school`, `avatarUrl`).
    - Update `users.service.ts` to properly persist updated profile fields to the Prisma database.
    - Ensure `GET /api/users/profile` and `PATCH /api/users/profile` conform strictly to security guards (`SupabaseAuthGuard`) and error handling.
  - **Frontend**:
    - Ensure navigation link to `/settings` is present in Teacher sidebar.
    - Build `frontend/app/(teacher)/settings/page.tsx` with tabs: Profile, Security, Notifications, Preferences.
    - Implement avatar selector (cute avatars / custom URL) and profile form.
    - Implement password change form using Supabase Auth Client SDK (`supabase.auth.updateUser`).
    - Implement notification toggles and theme/language preferences.
    - Integrate toast notifications (`react-hot-toast`), loading states, and form validation.

### Phase 3: QA, Comprehensive Testing & Verification
- **Agent**: QA & Reviewer Agents (`teamwork_preview_reviewer`, `teamwork_preview_critic`, `teamwork_preview_auditor`)
- **Objectives**:
  - Run typecheck and build in both frontend and backend (`npm run build` / `npx tsc --noEmit`).
  - Verify acceptance criteria and edge cases.
  - Forensic integrity audit to ensure genuine implementation with 0 cheating or mock shortcuts.

### Phase 4: Final Sign-off & Reporting
- Synthesize all findings and report completed milestone back to the Sentinel.
