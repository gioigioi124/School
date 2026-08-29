'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  CalendarDays,
  BookOpen, 
  Gamepad2, 
  Film, 
  Trophy, 
  BookMarked, 
  UserCircle,
  LogOut,
  Sparkles,
  Volume2,
  VolumeX,
  Star
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { sounds } from '@/lib/sounds';

const studentNavItems = [
  {
    title: 'Trang chủ',
    href: '/portal',
    icon: Home,
    emoji: '🏠',
  },
  {
    title: 'Thời khóa biểu',
    href: '/schedule',
    icon: CalendarDays,
    emoji: '📅',
  },
  {
    title: 'Bài học',
    href: '/learn',
    icon: BookOpen,
    emoji: '📚',
  },
  // Tạm thời ẩn các mục: Góc trò chơi, Rạp phim, Bảng vàng
  /*
  {
    title: 'Góc trò chơi',
    href: '/games',
    icon: Gamepad2,
    emoji: '🎮',
  },
  {
    title: 'Rạp phim',
    href: '/videos',
    icon: Film,
    emoji: '🎬',
  },
  {
    title: 'Bảng vàng',
    href: '/leaderboard',
    icon: Trophy,
    emoji: '🏆',
  },
  */
  {
    title: 'Sổ liên lạc',
    href: '/diary',
    icon: BookMarked,
    emoji: '📖',
  },
  {
    title: 'Hồ sơ của bé',
    href: '/profile',
    icon: UserCircle,
    emoji: '🌟',
  }
];

export function StudentSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isMuted, setIsMuted] = useState(false);
  const [studentInfo, setStudentInfo] = useState<{ displayName: string; avatarUrl: string; className?: string } | null>(null);

  useEffect(() => {
    setIsMuted(sounds.getIsMuted());

    async function loadStudentBrief() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('id', user.id)
          .maybeSingle();

        if (profile) {
          setStudentInfo({
            displayName: profile.display_name || 'Học sinh',
            avatarUrl: profile.avatar_url || '🎒',
          });
        }
      } catch (err) {
        console.error('Error fetching student brief:', err);
      }
    }

    loadStudentBrief();
  }, []);

  const handleNavClick = () => {
    sounds.playPop();
  };

  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      sounds.playPop();
    }
  };

  const handleLogout = async () => {
    sounds.playPop();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <aside className="w-72 bg-surface-container-low border-r border-outline-variant/30 flex flex-col h-screen sticky top-0 p-6 z-30 shrink-0 hidden md:flex">
      {/* Brand Header */}
      <div className="mb-8 pl-4">
        <Link 
          href="/portal" 
          onClick={handleNavClick}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <h1 className="font-heading text-3xl font-bold text-primary flex items-center gap-2">
            <span>Kinderly</span>
            <Sparkles className="w-5 h-5 text-secondary fill-secondary" />
          </h1>
        </Link>
        <p className="font-sans text-sm text-on-surface-variant font-medium mt-0.5">
          Student Portal
        </p>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-2 overflow-y-auto pr-1 scrollbar-none">
        {studentNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/portal' && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-sans font-bold text-sm transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'bg-primary-container text-on-primary-container shadow-xs scale-[1.02]' 
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface hover:scale-[1.01] active:scale-95'
              }`}
            >
              <span className="text-lg leading-none">{item.emoji}</span>
              <span className="truncate">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile & Actions */}
      <div className="pt-4 space-y-3 border-t border-outline-variant/30 shrink-0">
        {/* Student Quick Info Card */}
        {studentInfo && (
          <Link
            href="/profile"
            onClick={handleNavClick}
            className="flex items-center gap-3 p-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors group cursor-pointer border border-outline-variant/20"
          >
            <div className="w-9 h-9 rounded-lg bg-secondary-container/40 flex items-center justify-center text-lg shadow-2xs group-hover:scale-105 transition-transform shrink-0">
              {studentInfo.avatarUrl}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-heading font-bold text-xs text-on-surface truncate">
                {studentInfo.displayName}
              </p>
              <p className="font-sans text-[11px] text-primary font-semibold flex items-center gap-1">
                <Star className="w-3 h-3 fill-primary" />
                <span>Xem hồ sơ</span>
              </p>
            </div>
          </Link>
        )}

        {/* Action Buttons: Sound & Logout */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleToggleSound}
            className={`py-2.5 px-3 rounded-xl font-sans font-bold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer border ${
              isMuted
                ? 'bg-surface-container text-on-surface-variant border-outline-variant/30'
                : 'bg-primary-container text-primary border-primary/20 shadow-2xs'
            }`}
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="truncate">{isMuted ? 'Tắt tiếng' : 'Âm thanh'}</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="bg-surface-container-high text-on-surface-variant hover:text-destructive hover:bg-error-container/40 py-2.5 px-3 rounded-xl font-sans font-bold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
