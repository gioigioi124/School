# Frontend Architecture & Implementation Plan: Kinderly Teacher Settings

## 1. Observation

### 1.1 Codebase & Routing Context
- **Teacher Layout**: `frontend/app/(teacher)/layout.tsx` wraps all teacher sub-routes inside `<Sidebar />`, `<Header />`, and `<main className="flex-1 overflow-auto p-8">{children}</main>`.
- **Sidebar Navigation**: `frontend/components/common/Sidebar.tsx` (lines 47–50) already defines the settings route:
  ```tsx
  {
    title: 'Cài đặt',
    href: '/settings',
    icon: Settings
  }
  ```
  The active state is automatically computed via `pathname === item.href || pathname.startsWith(item.href)`.
- **Current Route Status**: The folder `frontend/app/(teacher)/settings/` and `frontend/components/settings/` do not yet exist. Navigating to `/settings` currently results in a 404 page.

### 1.2 Design Tokens & Kinderly LMS UI Patterns
- **Colors & Theme** (`frontend/app/globals.css` lines 7–64):
  - Primary Teal: `--color-primary: #006b5d`, Light: `#93f4e0`, Dark: `#005046`, Container: `#76d7c4`, On-Container: `#005d51`
  - Secondary Yellow: `--color-secondary: #ffd97d`, Text: `#785d09`
  - Tertiary Blue: `--color-tertiary: #24657e`, Container: `#92ceea`
  - Destructive: `--color-destructive: #ba1a1a`
  - Surfaces: `bg-surface-container-lowest` (pure white `#ffffff`), `bg-surface-container-low` (`#f2f4f3`), `bg-surface-container-high` (`#e6e9e8`)
  - Outlines: `border-outline-variant/30`
- **Typography & Utility Classes**:
  - Fonts: Headings use Quicksand (`font-heading`), body uses Lexend (`font-sans`).
  - Interactive & 3D styling: `.btn-3d`, `.btn-3d-secondary`, `.shadow-soft`, `.hover-scale`, `.bento-hover`, `.glass-panel`.
  - Radii: `rounded-2xl` (1.5rem), `rounded-3xl` (2rem), `rounded-full` (9999px).
- **Toast System**: `react-hot-toast` (`<Toaster position="top-right" />`) is already mounted in `frontend/app/layout.tsx` (line 26).

### 1.3 Data Access & Authentication Layer
- **API Client** (`frontend/lib/api.ts`):
  - Axios instance targeting `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'`.
  - Request interceptor automatically retrieves `supabase.auth.getSession()` and adds `Authorization: Bearer <access_token>`.
- **Supabase Auth SDK** (`frontend/lib/supabase/client.ts`):
  - `createBrowserClient` configured with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
  - Password updates can be performed via client SDK: `supabase.auth.updateUser({ password: newPassword })`.
- **Backend Users Endpoint** (`backend/src/modules/users/`):
  - `GET /api/users/profile` returns full Profile record including `id`, `email`, `displayName`, `phone`, `school`, `avatarUrl`, and `roleAssignments`.
  - `PATCH /api/users/profile` receives `UpdateProfileDto` (`{ displayName, phone, school, avatarUrl }`) to persist changes to the database.

---

## 2. Logic Chain

1. **User Requirement Mapping**:
   - The user requested a comprehensive, child-friendly, modern Teacher Settings page (`/settings`) in `app/(teacher)/settings/page.tsx` with 4 functional tabs:
     1. **Profile Settings**: update displayName, phone, school, and avatar (cute preset picker / custom URL).
     2. **Security Settings**: password change via Supabase Auth SDK and email display.
     3. **Notification Settings**: toggles for submission alerts, class notifications, attendance reminders, and sound chime.
     4. **System Preferences**: language selection, theme/accent presets, display density.
     5. **UX Enhancements**: responsive design, toast notifications (`react-hot-toast`), loading spinners, and validation states.

2. **Component Modularity & Clean Architecture**:
   - To keep code organized, maintainable, and strictly typed, the settings feature will be decomposed into dedicated components under `frontend/components/settings/`:
     - `frontend/app/(teacher)/settings/page.tsx`: Page root that loads initial profile data, handles active tab state, and provides common header.
     - `frontend/components/settings/SettingsTabs.tsx`: Tab navigation pill bar with icons, responsive overflow scroll, and count/badge indicators.
     - `frontend/components/settings/ProfileSettingsTab.tsx`: Profile form with input validation and integration with `AvatarPicker`.
     - `frontend/components/settings/AvatarPicker.tsx`: Cute educator & animal preset avatars with custom URL fallback and live preview.
     - `frontend/components/settings/SecuritySettingsTab.tsx`: Account credentials card + change password form with validation and password reveal toggle.
     - `frontend/components/settings/NotificationSettingsTab.tsx`: Toggle switches for real-time notifications and audio test chime.
     - `frontend/components/settings/PreferencesSettingsTab.tsx`: System settings for language, theme tone, and interface density with local storage persistence.

3. **Data Flow & State Management Strategy**:
   - **Profile Read**: On mount, fetch user profile via `api.get('/users/profile')` with fallback to Supabase `supabase.from('profiles').select('*').eq('id', user.id).single()`.
   - **Profile Update**: Submit `api.patch('/users/profile', payload)`. Show loading state on submit button. On success, show `toast.success('Cập nhật hồ sơ thành công! 🎉')`, update local state, and call `router.refresh()` to propagate updated name/school to `Header.tsx`.
   - **Password Change**: Call `await supabase.auth.updateUser({ password: newPassword })`. On success, reset password fields and show `toast.success('Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới.')`.
   - **Notifications & Preferences**: Store preferences in `localStorage` under `kinderly_teacher_notifications` and `kinderly_teacher_preferences` so settings persist across sessions without requiring database migrations.

---

## 3. Detailed Component & UI Specification

### 3.1 File Structure
```text
frontend/
├── app/
│   └── (teacher)/
│       └── settings/
│           └── page.tsx                     <-- [NEW] Main Settings Page (Client Component)
└── components/
    └── settings/                            <-- [NEW] Feature Components Directory
        ├── SettingsTabs.tsx                 <-- Tab switcher bar
        ├── ProfileSettingsTab.tsx           <-- Profile edit form
        ├── AvatarPicker.tsx                 <-- Preset cute avatar picker & preview
        ├── SecuritySettingsTab.tsx          <-- Password update & account info
        ├── NotificationSettingsTab.tsx      <-- Notification toggles & audio chime test
        └── PreferencesSettingsTab.tsx       <-- Language & theme customization
```

### 3.2 Tab Breakdown & Contracts

#### A. Main Page: `frontend/app/(teacher)/settings/page.tsx`
- **State**:
  - `activeTab`: `'profile' | 'security' | 'notifications' | 'preferences'` (supports URL hash / search params or tab state).
  - `profile`: User profile state `{ id, email, displayName, phone, school, avatarUrl, role }`.
  - `loading`: boolean (skeleton loader during initial fetch).
- **Layout**:
  - Page header: Title "Cài đặt tài khoản", subtitle "Quản lý thông tin cá nhân, bảo mật và tùy chỉnh trải nghiệm giảng dạy", with decorative badge.
  - Bento card container containing `<SettingsTabs />` and the active tab component.

#### B. Tab 1: `ProfileSettingsTab.tsx` & `AvatarPicker.tsx`
- **Fields**:
  - `displayName`: string (min 2 characters, required).
  - `phone`: string (format validation, optional).
  - `school`: string (kindergarten/school name, optional).
  - `avatarUrl`: string (selected preset emoji or custom image URL).
- **Avatar Presets List**:
  ```ts
  const TEACHER_AVATARS = [
    { emoji: '👩‍🏫', label: 'Cô giáo' },
    { emoji: '👨‍🏫', label: 'Thầy giáo' },
    { emoji: '🌸', label: 'Hoa đào' },
    { emoji: '🦉', label: 'Cú thông thái' },
    { emoji: '🦁', label: 'Sư tử nhỏ' },
    { emoji: '🐼', label: 'Gấu trúc' },
    { emoji: '🎨', label: 'Họa sĩ nhí' },
    { emoji: '📚', label: 'Sách hay' },
    { emoji: '🌟', label: 'Ngôi sao sáng' },
    { emoji: '🌻', label: 'Hoa hướng dương' },
    { emoji: '🐬', label: 'Cá heo' },
    { emoji: '🚀', label: 'Tàu vũ trụ' },
  ];
  ```
- **Live Preview Card**:
  - Displays large avatar (emoji or image), teacher's display name, role pill (`Giáo viên`), school name, and email.
- **Actions**:
  - Primary button: "Lưu thay đổi" (`btn-3d`, teal primary, `<Loader2 />` on submit).
  - Toast: `toast.success('Hồ sơ đã được cập nhật thành công! 🎉')` or `toast.error(errMessage)`.

#### C. Tab 2: `SecuritySettingsTab.tsx`
- **Account Summary Card**:
  - Displays registered email (read-only) with verified badge (`ShieldCheck` icon, `Đã xác thực`).
  - Auth Provider info (`Supabase Auth Security`).
- **Change Password Card**:
  - Input `newPassword`: with eye icon for show/hide password toggle.
  - Input `confirmPassword`: with eye icon for show/hide password toggle.
  - Real-time password criteria checklist:
    - [ ] Độ dài tối thiểu 6 ký tự
    - [ ] Mật khẩu xác nhận trùng khớp
  - Client-side call: `supabase.auth.updateUser({ password: newPassword })`.
  - Error translation: maps Supabase errors to friendly Vietnamese messages.
  - Action button: "Cập nhật mật khẩu mới" (`btn-3d-secondary` or yellow/teal button).

#### D. Tab 3: `NotificationSettingsTab.tsx`
- **Notification Toggles**:
  1. `newSubmissions`: "Thông báo bài nộp mới" (Nhận thông báo ngay khi học sinh nộp bài tập hoặc hoàn thành bài học).
  2. `classAnnouncements`: "Dặn dò & Thông báo lớp" (Nhắc nhở về bài đăng và phản hồi phụ huynh).
  3. `attendanceReminder`: "Nhắc nhở điểm danh" (Gợi ý điểm danh chuyên cần vào đầu giờ học mỗi ngày).
  4. `soundEnabled`: "Âm thanh thông báo vui nhộn" (Phát tiếng chuông nhẹ nhàng khi có thông báo mới).
- **Sound Test Button**:
  - "Nghe thử âm thanh" (sử dụng Web Audio API synthesizer để phát 2-tone melodic chime `[523.25Hz, 659.25Hz, 783.99Hz]` không cần tải external mp3 file).
- **Persistence**: Saved automatically in `localStorage.setItem('kinderly_teacher_notifications', JSON.stringify(settings))`.

#### E. Tab 4: `PreferencesSettingsTab.tsx`
- **Customization Options**:
  1. `language`: Radio/Select for "Tiếng Việt (Mặc định)" vs "English".
  2. `themeColor`: Color tone choice ("Kinderly Teal (Mặc định)", "Xanh Đại Dương (Ocean Blue)", "Màu Nắng Ấm (Warm Sunshine)").
  3. `compactMode`: Switch toggle for compact table / list density.
  4. `autoSave`: Switch toggle for auto-saving drafts.
- **Persistence**: Synced in `localStorage.setItem('kinderly_teacher_preferences', ...)`.

---

## 4. Caveats

1. **Backend Dependency**:
   - `PATCH /api/users/profile` requires the backend `UpdateProfileDto` to support `phone` and `school` (Milestone M2). The frontend implementation will support both calling `api.patch('/users/profile')` and updating Supabase `profiles` table directly as a resilient fallback.
2. **Audio Chime in Browser**:
   - Autoplay policies in modern browsers require user interaction before playing audio. The sound test button and in-app sound player will instantiate the Web Audio `AudioContext` within user event handlers to comply with browser audio policies.
3. **Multi-Tab Sync**:
   - When the teacher updates their `displayName` or `avatarUrl`, `Header.tsx` listens to updates on page navigation. Calling `router.refresh()` will sync the server components and trigger re-render of the client header.

---

## 5. Conclusion

The planned frontend architecture delivers a rich, child-friendly, fully responsive Teacher Settings experience for Kinderly LMS. It integrates seamlessly into the existing Next.js 16 App Router `(teacher)` layout, leverages Kinderly's design tokens and 3D playful button styles, uses `react-hot-toast` for fluid feedback, and interacts cleanly with both the NestJS backend API and the Supabase Auth SDK.

---

## 6. Verification Method

To verify the frontend planning and future implementation:

1. **Route & Layout Verification**:
   - Navigate to `http://localhost:3000/settings` while logged in as a teacher.
   - Verify that the page loads inside the `(teacher)` layout and that the Sidebar's "Cài đặt" item is highlighted with `bg-primary-container`.

2. **Tab Switching & Responsive Layout**:
   - Click each of the 4 tabs ("Hồ sơ giáo viên", "Bảo mật & Tài khoản", "Tùy chọn thông báo", "Giao diện & Hệ thống").
   - Confirm active tab styling and smooth transitions on mobile, tablet, and desktop viewports.

3. **Profile Update & Validation**:
   - Edit `displayName`, `phone`, `school`, and select an avatar from the cute avatar picker.
   - Click "Lưu thay đổi". Verify that `react-hot-toast` displays the success message and that the header reflects the updated name.

4. **Security & Password Update**:
   - Test password change with mismatched passwords or < 6 characters (confirm validation error message is shown).
   - Enter matching valid passwords (>= 6 chars) and verify successful update via Supabase Auth.

5. **Typecheck & Build**:
   ```bash
   cd frontend
   npm run build
   ```
   Must compile with 0 TypeScript and ESLint errors.
