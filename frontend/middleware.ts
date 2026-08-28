import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { 
  determineUserRole, 
  isTeacherRoute, 
  isStudentRoute, 
  isAuthRoute 
} from '@/lib/auth-helpers';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh auth session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 1. Unauthenticated users handling
  if (!user) {
    if (isTeacherRoute(pathname) || isStudentRoute(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // 2. Authenticated users handling
  const role = determineUserRole(user);

  // Redirect from auth routes or landing page to appropriate portal
  if (isAuthRoute(pathname) || pathname === '/') {
    const url = request.nextUrl.clone();
    url.searchParams.delete('redirect');
    url.pathname = role === 'student' ? '/portal' : '/dashboard';
    return NextResponse.redirect(url);
  }

  // Role Protection: Students cannot access teacher routes (e.g. /settings, /dashboard, /classes, /students, etc.)
  if (role === 'student' && isTeacherRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/portal';
    return NextResponse.redirect(url);
  }

  // Role Protection: Teachers navigating to student routes are redirected to teacher dashboard
  if (role === 'teacher' && isStudentRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes (handled separately by endpoints)
     * - static image and media assets
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
