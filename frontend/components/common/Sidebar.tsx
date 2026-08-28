'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  School, 
  Users, 
  MessageSquare, 
  BookOpen,
  CalendarDays,
  Settings, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

import { CreateStudentAccountDialog } from '@/components/students/CreateStudentAccountDialog';

const sidebarItems = [
  {
    title: 'Trang chủ',
    href: '/dashboard',
    icon: Home
  },
  {
    title: 'Lớp học',
    href: '/classes',
    icon: School
  },
  {
    title: 'Thời khóa biểu',
    href: '/schedules',
    icon: CalendarDays
  },
  {
    title: 'Bài học',
    href: '/lessons',
    icon: BookOpen
  },
  {
    title: 'Học sinh',
    href: '/students',
    icon: Users
  },
  {
    title: 'Thông báo',
    href: '/announcements',
    icon: MessageSquare
  },
  {
    title: 'Cài đặt',
    href: '/settings',
    icon: Settings
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="w-72 bg-surface-container-low border-r border-outline-variant/30 flex flex-col h-screen sticky top-0 p-6 z-30 shrink-0">
      <div className="mb-8 pl-4">
        <h1 className="font-heading text-3xl font-bold text-primary flex items-center gap-2">
          <span>Kinderly</span>
          <Sparkles className="w-5 h-5 text-secondary fill-secondary" />
        </h1>
        <p className="font-sans text-sm text-on-surface-variant font-medium">
          Teacher Portal
        </p>
      </div>

      <nav className="flex-1 space-y-2">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.title}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-sans font-bold text-sm transition-all duration-200 ${
                isActive 
                  ? 'bg-primary-container text-on-primary-container shadow-xs scale-[1.02]' 
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface hover:scale-[1.01] active:scale-95'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-on-primary-container' : 'text-on-surface-variant'}`} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Quick Action Button for Student Account Creation */}
      <div className="pt-4 space-y-3 border-t border-outline-variant/30">
        <CreateStudentAccountDialog />

        <button
          onClick={handleLogout}
          className="w-full bg-surface-container-high text-on-surface-variant hover:text-destructive hover:bg-error-container/40 py-2.5 rounded-xl font-sans font-bold text-xs transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
