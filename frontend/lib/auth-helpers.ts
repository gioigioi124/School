export type UserRole = 'teacher' | 'student' | 'admin';

export const TEACHER_ROUTES = [
  '/dashboard',
  '/classes',
  '/schedules',
  '/lessons',
  '/students',
  '/announcements',
  '/settings',
];

export const STUDENT_ROUTES = [
  '/portal',
  '/schedule',
  '/learn',
  '/games',
  '/videos',
  '/leaderboard',
  '/diary',
  '/profile',
];

export const AUTH_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
];

/**
 * Robust helper to determine user role based on metadata, email, and profiles.
 * - Students created by teachers use phone@kinderly.com or email ending with @kinderly.com
 * - Or have user_metadata.role === 'student' / 'parent'
 * - Teachers register with personal/school email or have user_metadata.role === 'teacher'
 */
export function determineUserRole(user: any): UserRole {
  if (!user) return 'student';

  // 1. Explicit role in user_metadata or app_metadata
  const metaRole = user.user_metadata?.role || user.app_metadata?.role;
  if (metaRole) {
    const r = String(metaRole).toLowerCase();
    if (r === 'admin') return 'admin';
    if (r === 'teacher') return 'teacher';
    if (r === 'student' || r === 'parent') return 'student';
  }

  // 2. Email domain heuristic
  const email = (user.email || '').toLowerCase();
  if (email.endsWith('@kinderly.com')) {
    return 'student';
  }

  // 3. User metadata has school or teacher indicators
  if (user.user_metadata?.school) {
    return 'teacher';
  }

  // Default for non-kinderly users
  return 'teacher';
}

export function isTeacherRoute(pathname: string): boolean {
  return TEACHER_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function isStudentRoute(pathname: string): boolean {
  return STUDENT_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}
