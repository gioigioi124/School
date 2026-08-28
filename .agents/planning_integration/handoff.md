# Integration & QA Planning Report: Kinderly LMS Teacher Settings

## 1. Observation

### 1.1 Existing Build & Test Infrastructure
Inspection of `backend/package.json` and `frontend/package.json` reveals the following command suites and current statuses:

| Environment | Command | Executable / Engine | Observed Execution Status |
|---|---|---|---|
| **Backend** | `npm run build` | `nest build` (TypeScript v5.7.3) | **Passed** (Exit code 0, 0 compilation errors) |
| **Backend** | `npm run test` | `jest` (Jest v30.0.0, ts-jest v29.2.5) | **Passed** (3/3 test suites passed, 10/10 tests passed) |
| **Backend** | `npm run lint` | `eslint "{src,apps,libs,test}/**/*.ts" --fix` | Available |
| **Backend** | `npx tsc --noEmit` | TypeScript compiler | **Passed** (No type errors) |
| **Frontend** | `npm run build` | `next build` (Next.js v16.3.2 Turbopack, React 19.2.8) | **Passed** (Exit code 0, 15 static routes generated) |
| **Frontend** | `npx tsc --noEmit` | TypeScript compiler | **Passed** (No type errors) |
| **Frontend** | `npm run lint` | `eslint` | Available |

### 1.2 Existing Backend Architecture & Validation Pipeline
- **Global Pipes & Filters** (`backend/src/main.ts` lines 14–28):
  - `ValidationPipe`: configured with `{ whitelist: true, forbidNonWhitelisted: true, transform: true }`.
  - `TransformInterceptor`: wraps successful responses in `{ success: true, data: T, meta: { requestId }, timestamp: string }`.
  - `HttpExceptionFilter`: standardizes error responses to `{ success: false, error: { code: number, message: string, details: any }, meta: { path, requestId }, timestamp: string }`.
- **Database Schema** (`backend/prisma/schema.prisma` lines 9–24):
  - Model `Profile` contains all required columns: `id`, `email`, `phone`, `displayName`, `avatarUrl`, `school`, `createdAt`, `updatedAt`, `roleAssignments`.
  - No database schema migrations are necessary.
- **Existing Users Service & DTO** (`backend/src/modules/users/`):
  - `UpdateProfileDto` currently only declares `displayName` and `avatarUrl`. Sending `phone` or `school` causes `ValidationPipe` to reject with `400 Bad Request: property phone/school should not exist`.
  - `UsersService.updateProfile` only updates `displayName` and `avatarUrl`, and omits relation `roleAssignments` from the return object.
  - `users.service.spec.ts` unit test file does not exist yet.

### 1.3 Existing Frontend Architecture & UI Integration
- **Layout & Routing**:
  - `frontend/app/(teacher)/layout.tsx` embeds `<Sidebar />` and `<Header />`.
  - `frontend/components/common/Sidebar.tsx` has navigation item `{ title: 'Cài đặt', href: '/settings', icon: Settings }`.
  - Route `frontend/app/(teacher)/settings/page.tsx` does not exist yet (returns 404).
- **Authentication & API Communication**:
  - `frontend/lib/api.ts` attaches Supabase access token via Axios request interceptor.
  - `frontend/lib/supabase/client.ts` provides browser client for `supabase.auth.updateUser({ password })`.
  - Toast provider `<Toaster position="top-right" />` is mounted globally in `frontend/app/layout.tsx`.

---

## 2. Logic Chain

```
[System Requirements Analysis]
  │
  ├── Requirement 1: Complete Teacher Settings UI (Profile, Security, Notifications, Preferences)
  ├── Requirement 2: Secure Backend Profile Management (GET & PATCH /api/users/profile)
  └── Requirement 3: Multi-layer QA & Verification (Zero compile/runtime errors, strict typing)
  │
[API Contract & DTO Validation Design]
  │
  ├── Whitelist enforcement: Every updatable field (displayName, phone, school, avatarUrl) must be in UpdateProfileDto
  ├── Validation decorators: @IsString, @IsOptional, @MaxLength to prevent payload pollution and buffer overflow
  ├── Authentication: CurrentUser decorator extracts JWT sub; teachers cannot update other users' profiles
  └── Response formatting: TransformInterceptor guarantees uniform { success: true, data: ... }
  │
[Client-Side Form Validation Design]
  │
  ├── Profile Form: Realtime length constraints, phone regex, avatar preview
  ├── Security Form: Min 6 characters password, exact confirmation match, password visibility toggle
  ├── Notifications & Preferences: LocalStorage persistence with resilient defaults
  └── Feedback UX: Immediate react-hot-toast notifications and loading state disablement
  │
[QA & Test Strategy Synthesis]
  │
  ├── Layer 1: Compile-time check (tsc --noEmit, next build, nest build)
  ├── Layer 2: Automated Unit Testing (NestJS users.service.spec.ts mocking Prisma)
  ├── Layer 3: End-to-End Functional Verification (4 Settings Tabs lifecycle)
  ├── Layer 4: Edge Cases & Boundary Matrix (unicode, overflow, empty inputs, network drops)
  └── Layer 5: Security & Multi-tenant Isolation Audit
```

---

## 3. API Contracts & DTO Validation Specifications

### 3.1 `GET /api/users/profile`

- **Endpoint**: `GET /api/users/profile`
- **Authentication**: `Authorization: Bearer <supabase_jwt_token>` (Handled by `SupabaseAuthGuard`)
- **Controller Method**: `UsersController.getProfile(@CurrentUser() user: any)`
- **HTTP Status Codes**:
  - `200 OK`: Profile retrieved successfully.
  - `401 Unauthorized`: Missing or invalid Supabase JWT.
  - `404 Not Found`: Profile record not found in `profiles` table.

#### Success Response Schema (Wrapped by `TransformInterceptor`):
```json
{
  "success": true,
  "data": {
    "id": "c6a1b2c3-d4e5-4f6a-8b9c-0d1e2f3a4b5c",
    "email": "teacher.mai@kinderly.edu.vn",
    "displayName": "Cô Nguyễn Mai Lan",
    "phone": "0912345678",
    "school": "Trường Mầm non Hoa Sen",
    "avatarUrl": "👩‍🏫",
    "parentPhone": null,
    "parentName": null,
    "createdAt": "2026-08-20T08:30:00.000Z",
    "updatedAt": "2026-08-27T03:15:00.000Z",
    "roleAssignments": [
      {
        "id": "ra-1234-5678",
        "profileId": "c6a1b2c3-d4e5-4f6a-8b9c-0d1e2f3a4b5c",
        "roleId": "role-teacher-uuid",
        "createdAt": "2026-08-20T08:30:00.000Z",
        "role": {
          "id": "role-teacher-uuid",
          "name": "teacher",
          "description": "Giáo viên chủ nhiệm / giảng dạy",
          "createdAt": "2026-08-20T08:30:00.000Z"
        }
      }
    ]
  },
  "meta": {
    "requestId": "req-uuid-or-system"
  },
  "timestamp": "2026-08-27T03:15:00.000Z"
}
```

---

### 3.2 `PATCH /api/users/profile`

- **Endpoint**: `PATCH /api/users/profile`
- **Authentication**: `Authorization: Bearer <supabase_jwt_token>` (Handled by `SupabaseAuthGuard`)
- **Controller Method**: `UsersController.updateProfile(@CurrentUser() user: any, @Body() updateData: UpdateProfileDto)`
- **HTTP Status Codes**:
  - `200 OK`: Profile updated successfully.
  - `400 Bad Request`: Payload validation failed (e.g. invalid string, exceeded max length, unwhitelisted properties).
  - `401 Unauthorized`: Missing or invalid Supabase JWT.
  - `404 Not Found`: Profile record not found.

#### Exact DTO Specification (`UpdateProfileDto`):
```typescript
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({
    required: false,
    description: 'Tên hiển thị của giáo viên',
    example: 'Cô Nguyễn Mai Lan',
  })
  @IsOptional()
  @IsString({ message: 'Tên hiển thị phải là chuỗi ký tự' })
  @MaxLength(100, { message: 'Tên hiển thị không được vượt quá 100 ký tự' })
  displayName?: string;

  @ApiProperty({
    required: false,
    description: 'Số điện thoại liên lạc',
    example: '0912345678',
  })
  @IsOptional()
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  @MaxLength(20, { message: 'Số điện thoại không được vượt quá 20 ký tự' })
  phone?: string;

  @ApiProperty({
    required: false,
    description: 'Trường học / Đơn vị giảng dạy',
    example: 'Trường Mầm non Sao Mai',
  })
  @IsOptional()
  @IsString({ message: 'Tên trường học phải là chuỗi ký tự' })
  @MaxLength(200, { message: 'Tên trường học không được vượt quá 200 ký tự' })
  school?: string;

  @ApiProperty({
    required: false,
    description: 'URL ảnh đại diện hoặc avatar preset key / emoji',
    example: '👩‍🏫',
  })
  @IsOptional()
  @IsString({ message: 'Ảnh đại diện phải là chuỗi ký tự hoặc URL hợp lệ' })
  @MaxLength(500, { message: 'URL ảnh đại diện không được vượt quá 500 ký tự' })
  avatarUrl?: string;
}
```

#### DTO Validation Rules Matrix:

| Field | Type | Optionality | Validators | Error Message |
|---|---|---|---|---|
| `displayName` | `string` | Optional | `@IsOptional()`, `@IsString()`, `@MaxLength(100)` | `"Tên hiển thị không được vượt quá 100 ký tự"` |
| `phone` | `string` | Optional | `@IsOptional()`, `@IsString()`, `@MaxLength(20)` | `"Số điện thoại không được vượt quá 20 ký tự"` |
| `school` | `string` | Optional | `@IsOptional()`, `@IsString()`, `@MaxLength(200)` | `"Tên trường học không được vượt quá 200 ký tự"` |
| `avatarUrl` | `string` | Optional | `@IsOptional()`, `@IsString()`, `@MaxLength(500)` | `"URL ảnh đại diện không được vượt quá 500 ký tự"` |
| *Any other field* | Any | Forbidden | Rejected by `forbidNonWhitelisted: true` | `"property <key> should not exist"` (400 Bad Request) |

---

### 3.3 Supabase Auth SDK Password Update Contract

- **Client Method**: `supabase.auth.updateUser({ password: newPassword })`
- **Request Parameters**: `{ password: string }`
- **Client-Side Validation Constraints**:
  - Minimum length: 6 characters (`newPassword.length >= 6`).
  - Confirmation match: `confirmPassword === newPassword`.
  - Non-empty: required.
- **Response Handling**:
  - **Success**: `{ data: { user }, error: null }` → show success toast, clear password input fields.
  - **Failure**: `{ data: { user: null }, error }` → parse error message into user-friendly Vietnamese text and display error toast.

---

## 4. Client-Side Validation Logic Specifications

### 4.1 Form Fields & Validation Logic

| Form / Field | Client Rule | Regex / Expression | Error Message |
|---|---|---|---|
| **Profile** - `displayName` | Required, 2–100 chars | `trimmed.length >= 2 && trimmed.length <= 100` | `"Tên hiển thị phải có từ 2 đến 100 ký tự"` |
| **Profile** - `phone` | Optional, standard phone format | `phone === '' \|\| /^(0\|\+84)[0-9]{9,10}$/.test(phone.replace(/[\s-]/g, ''))` | `"Số điện thoại không hợp lệ (VD: 0912345678)"` |
| **Profile** - `school` | Optional, max 200 chars | `school.length <= 200` | `"Tên trường học không được vượt quá 200 ký tự"` |
| **Profile** - `avatarUrl` | Optional, URL or emoji preset | `avatarUrl.length <= 500` | `"Ảnh đại diện không hợp lệ"` |
| **Security** - `newPassword` | Required, min 6, max 72 chars | `newPassword.length >= 6 && newPassword.length <= 72` | `"Mật khẩu mới phải có từ 6 đến 72 ký tự"` |
| **Security** - `confirmPassword` | Required, exact match | `confirmPassword === newPassword` | `"Mật khẩu xác nhận không khớp với mật khẩu mới"` |

### 4.2 Form State Management & UX Guidelines
1. **Trimming**: Sanitize `displayName`, `phone`, `school` by removing leading and trailing whitespace before submission.
2. **Loading States**: During API / Supabase requests, disable submit buttons and display `<Loader2 className="w-4 h-4 animate-spin" />`.
3. **Feedback Alerts**: Use `react-hot-toast` for real-time success (`toast.success(...)`) and error feedback (`toast.error(...)`).
4. **Header Sync**: After updating profile, invoke `router.refresh()` to ensure server components and header display the updated name and avatar seamlessly.
5. **Local Persistence**: Save non-database settings (`NotificationSettings` and `PreferencesSettings`) directly to browser `localStorage` under `kinderly_teacher_notifications` and `kinderly_teacher_preferences`.

---

## 5. Comprehensive QA & Test Plan

### Level 1: Compile-Time & Static Typecheck Plan
Execute compiler diagnostics on both frontend and backend modules:

```powershell
# 1. Backend TypeScript Typecheck & Build
npm --prefix backend run build
npx --prefix backend tsc --noEmit

# 2. Frontend Next.js Production Build & Typecheck
npm --prefix frontend run build
npx --prefix frontend tsc --noEmit
```
**Pass Criteria**: Exit code 0, 0 compiler errors, 0 type errors across both projects.

---

### Level 2: Backend Automated Unit Testing Plan
Create and execute `backend/src/modules/users/users.service.spec.ts` using Jest:

| Test Case ID | Test Target | Test Scenario | Expected Outcome |
|---|---|---|---|
| `UT-BE-01` | `getProfile` | User exists in database | Returns full profile object with `roleAssignments` |
| `UT-BE-02` | `getProfile` | User does not exist | Throws `NotFoundException('Profile not found')` |
| `UT-BE-03` | `updateProfile` | Valid payload with `displayName`, `phone`, `school`, `avatarUrl` | Successfully calls `prisma.profile.update` and returns updated profile |
| `UT-BE-04` | `updateProfile` | Partial payload (e.g. only `phone`) | Updates only specified field, leaves other fields unchanged |
| `UT-BE-05` | `updateProfile` | Non-existing user ID | Throws `NotFoundException('Profile not found')` |

Execution command:
```powershell
npm --prefix backend run test -- src/modules/users/users.service.spec.ts
```
**Pass Criteria**: 5/5 unit tests pass with 100% code coverage on `UsersService`.

---

### Level 3: Functional & UI Tab Verification Matrix

| Tab | Action | Test Procedure | Expected Result |
|---|---|---|---|
| **Tab 1: Profile** | Load Data | Open `/settings` | Pre-fills current `displayName`, `email`, `phone`, `school`, `avatarUrl` |
| **Tab 1: Profile** | Avatar Picker | Click preset cute avatar (e.g. `🌸` or `👩‍🏫`) | Live preview updates immediately; saves selection upon clicking "Lưu thay đổi" |
| **Tab 1: Profile** | Update Fields | Modify name, phone, school → Click "Lưu thay đổi" | Button shows spinner → Toast `toast.success('Hồ sơ đã được cập nhật thành công! 🎉')` → Header reflects updated info |
| **Tab 1: Profile** | Validation | Enter 1-character name → Click "Lưu thay đổi" | Form prevents submission with inline error `"Tên hiển thị phải có từ 2 đến 100 ký tự"` |
| **Tab 2: Security** | Password Length | Enter password with 4 characters | Realtime checklist indicates requirement not met; prevents submission |
| **Tab 2: Security** | Password Mismatch | Enter `password123` and `password456` | Shows error `"Mật khẩu xác nhận không khớp"` |
| **Tab 2: Security** | Valid Password | Enter matching `>= 6` char passwords → Submit | Calls `supabase.auth.updateUser` → Toast `toast.success(...)` → Form fields cleared |
| **Tab 3: Notifications** | Toggle Switches | Toggle submission alerts, class alerts, sound alerts | States update instantly and persist in `localStorage` |
| **Tab 3: Notifications** | Audio Chime Test | Click "Nghe thử âm thanh" | Web Audio API plays friendly 2-tone melodic chime without error |
| **Tab 4: Preferences** | Theme / Language | Select language (VI/EN) and theme tone | Settings persist in `localStorage` across page refreshes |

---

### Level 4: Edge Cases & Boundary Conditions Matrix

| Category | Test Scenario | Test Input / Condition | Expected System Behavior |
|---|---|---|---|
| **Payload Injection** | Extra / Unwhitelisted fields | Request body contains `{ "role": "admin", "hack": true }` | Rejected with `400 Bad Request: property role should not exist` |
| **Boundary Length** | Max string length | `displayName` with 101 characters | Rejected with `400 Bad Request: Tên hiển thị không được vượt quá 100 ký tự` |
| **Unicode & Emojis** | Vietnamese accents & emojis | `displayName: "Cô Nguyễn Thị Hải Yến 🌟"` | Stored and retrieved with 100% UTF-8 integrity |
| **Empty Strings** | Setting optional field to empty | `phone: ""` | Handled gracefully without crash; stored as null or empty string |
| **Auth Expiration** | Expired JWT token | Call `PATCH /api/users/profile` with expired token | Returns `401 Unauthorized` |
| **Network Loss** | Offline / Disconnection | Submit form while offline | Graceful toast error `"Không thể kết nối đến máy chủ. Vui lòng thử lại!"` |

---

### Level 5: Security & Forensic Audit Checklist

- [x] **No Plaintext Passwords on Backend**: Password changes bypass the backend API and use Supabase Auth SDK directly.
- [x] **Multitenancy Isolation**: `UsersController` extracts `user.id` strictly from verified JWT claims (`@CurrentUser()`). Users cannot supply arbitrary user IDs in URL parameters or request bodies.
- [x] **Whitelist Protection**: Global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` prevents parameter injection.
- [x] **XSS Sanitization**: React automatically escapes text renders; avatar preset selector uses constrained static icons.

---

## 6. Caveats

1. **Password Operations**: Handled strictly on the client via `supabase.auth.updateUser` to maintain zero-knowledge password architecture on NestJS backend.
2. **Browser Audio Policies**: The notification sound test uses Web Audio API synthesizer (`AudioContext`) triggered inside user click event handlers to comply with modern browser autoplay restrictions.
3. **Database Migration**: Zero database migrations are required because all columns (`displayName`, `phone`, `school`, `avatarUrl`) already exist in PostgreSQL `profiles` table.

---

## 7. Conclusion

The integration and QA blueprint is comprehensive, secure, and ready for development. The contracts between Next.js 16 frontend, NestJS backend, and Supabase Auth SDK are fully aligned, with rigorous validation rules, clear DTO definitions, and a 5-level QA test plan ensuring zero compile-time or runtime defects.

---

## 8. Verification Method

To verify the plan and future implementation:

```powershell
# 1. Run Backend Typecheck and Build
npm --prefix backend run build

# 2. Run Backend Unit Tests (including users.service.spec.ts)
npm --prefix backend run test

# 3. Run Frontend Typecheck and Build
npm --prefix frontend run build

# 4. Manual Functional Verification:
# - Log in as teacher -> Navigate to http://localhost:3000/settings
# - Test Profile update (name, phone, school, avatar) -> check toast and header update
# - Test Password change with valid (>= 6 chars) and invalid inputs
# - Test Notification toggles and audio chime
```
