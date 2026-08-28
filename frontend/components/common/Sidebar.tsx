'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  School, 
  Users, 
  MessageSquare, 
  BookOpen, 
  CalendarDays, 
  Settings, 
  LogOut, 
  Sparkles,
  X
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useUiStore } from '@/store/ui.store';
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
  const { teacherMobileOpen, setTeacherMobileOpen } = useUiStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const navContent = (
    <div className="flex flex-col h-full">
      <div className="mb-6 pl-2 flex items-center justify-between">
        <div>
          <Link 
            href="/dashboard" 
            onClick={() => setTeacherMobileOpen(false)}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2">
              <span>Kinderly</span>
              <Sparkles className="w-5 h-5 text-secondary fill-secondary" />
            </h1>
          </Link>
          <p className="font-sans text-xs sm:text-sm text-on-surface-variant font-medium mt-0.5">
            Teacher Portal
          </p>
        </div>

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={() => setTeacherMobileOpen(false)}
          className="md:hidden p-2 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
          aria-label="Đóng menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1 no-scrollbar">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.title}
              href={item.href}
              onClick={() => setTeacherMobileOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-sans font-bold text-sm transition-all duration-200 ${
                isActive 
                  ? 'bg-primary-container text-on-primary-container shadow-xs scale-[1.02]' 
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface hover:scale-[1.01] active:scale-95'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-on-primary-container' : 'text-on-surface-variant'}`} />
              <span className="truncate">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Quick Action Button for Student Account Creation */}
      <div className="pt-4 space-y-2.5 border-t border-outline-variant/30 shrink-0">
        <CreateStudentAccountDialog />

        <button
          type="button"
          onClick={handleLogout}
          className="w-full bg-surface-container-high text-on-surface-variant hover:text-destructive hover:bg-error-container/40 py-2.5 rounded-xl font-sans font-bold text-xs transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="w-64 lg:w-72 bg-surface-container-low border-r border-outline-variant/30 flex-col h-screen sticky top-0 p-5 lg:p-6 z-30 shrink-0 hidden md:flex">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay & Sheet */}
      {teacherMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setTeacherMobileOpen(false)}
          />
          {/* Drawer Panel */}
          <div className="relative w-4/5 max-w-xs bg-surface-container-low h-full p-5 shadow-2xl z-10 flex flex-col border-r border-outline-variant/30 animate-scale-in">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
