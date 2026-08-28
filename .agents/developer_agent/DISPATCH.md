## 2026-08-27T03:16:12Z
You are the Developer Agent for the Kinderly LMS Teacher Settings project.
Your working directory is c:\Users\Administrator\Desktop\School\lms-project\.agents\developer_agent.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Context & Inputs:
1. Read the original request at `c:\Users\Administrator\Desktop\School\lms-project\.agents\ORIGINAL_REQUEST.md`.
2. Read the project specification at `c:\Users\Administrator\Desktop\School\lms-project\PROJECT.md`.
3. Read the architecture & planning reports from the planning agents:
   - `c:\Users\Administrator\Desktop\School\lms-project\.agents\planning_backend\handoff.md`
   - `c:\Users\Administrator\Desktop\School\lms-project\.agents\planning_frontend\handoff.md`
   - `c:\Users\Administrator\Desktop\School\lms-project\.agents\planning_integration\handoff.md`

Your Tasks:

1. **Backend Implementation (NestJS + Prisma)**:
   - Update `backend/src/modules/users/dto/update-profile.dto.ts` to include `displayName`, `phone`, `school`, `avatarUrl` with proper class-validator decorators (`@IsString`, `@IsOptional`, `@MaxLength`) and Swagger annotations (`@ApiProperty`).
   - Update `backend/src/modules/users/users.service.ts` to support updating `displayName`, `phone`, `school`, `avatarUrl`, checking user existence, and returning `roleAssignments` with the assigned `role`.
   - Update `backend/src/modules/users/users.controller.ts` with comprehensive Swagger documentation (`@ApiResponse` for 200, 400, 401, 404).
   - Create unit tests in `backend/src/modules/users/users.service.spec.ts` covering `getProfile` (success, not found) and `updateProfile` (success, partial update, not found).

2. **Frontend Implementation (Next.js 16 + Tailwind CSS + shadcn/ui + react-hot-toast)**:
   - Create `frontend/app/(teacher)/settings/page.tsx` with high quality, responsive, child-friendly design.
   - Create modular tab components in `frontend/components/settings/`:
     - `SettingsTabs.tsx`: Tab navigation pill bar with icons, smooth styling, and active badge states.
     - `ProfileSettingsTab.tsx`: Profile form (displayName, phone, school, avatar) with live preview card and form validation.
     - `AvatarPicker.tsx`: Cute educator & animal preset picker (12+ preset emojis/avatars) plus custom URL fallback with live preview.
     - `SecuritySettingsTab.tsx`: Verified email display + password change form via `supabase.auth.updateUser` with real-time requirement checklist (min 6 chars, match check, eye toggle).
     - `NotificationSettingsTab.tsx`: Toggles for submission alerts, class announcements, attendance reminders, sound toggle + Web Audio API synthesizer test chime button.
     - `PreferencesSettingsTab.tsx`: Language selection, theme accent presets, display density with `localStorage` persistence.
   - Verify `frontend/components/common/Sidebar.tsx` navigation link to `/settings` matches active route properly.

3. **Build & Test Verification**:
   - Run backend build: `npm --prefix backend run build`
   - Run backend unit tests: `npm --prefix backend run test`
   - Run frontend build: `npm --prefix frontend run build`
   - Run frontend typecheck: `npx --prefix frontend tsc --noEmit`
   - Ensure all builds and tests pass with 0 errors.

4. **Output Report**:
   - Write your complete handoff report in `c:\Users\Administrator\Desktop\School\lms-project\.agents\developer_agent\handoff.md`
   - Update `c:\Users\Administrator\Desktop\School\lms-project\.agents\developer_agent\progress.md`.
   - Send a message to orchestrator with your completion summary and handoff report path.
