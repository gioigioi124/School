'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  CalendarDays,
  BookOpen, 
  Gamepad2, 
  Film, 
  Trophy, 
  BookMarked, 
  UserCircle 
} from 'lucide-react';
import { sounds } from '@/lib/sounds';

const mobileNavItems = [
  { href: '/portal', label: 'Trang chủ', emoji: '🏠', icon: Home },
  { href: '/schedule', label: 'TKB', emoji: '📅', icon: CalendarDays },
  { href: '/learn', label: 'Bài học', emoji: '📚', icon: BookOpen },
  // Tạm thời ẩn các mục: Góc chơi, Rạp phim, Bảng vàng
  /*
  { href: '/games', label: 'Góc chơi', emoji: '🎮', icon: Gamepad2 },
  { href: '/videos', label: 'Rạp phim', emoji: '🎬', icon: Film },
  { href: '/leaderboard', label: 'Bảng vàng', emoji: '🏆', icon: Trophy },
  */
  { href: '/diary', label: 'Sổ liên lạc', emoji: '📖', icon: BookMarked },
  { href: '/profile', label: 'Hồ sơ', emoji: '🌟', icon: UserCircle },
];

export function StudentMobileNav() {
  const pathname = usePathname();

  const handleNavClick = () => {
    sounds.playPop();
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-xl border-t border-outline-variant/30 px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-2xl">
      <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-1 max-w-lg mx-auto">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/portal' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={`flex flex-col items-center justify-center py-1 px-1.5 sm:px-2 rounded-xl transition-all duration-200 cursor-pointer shrink-0 min-w-[46px] ${
                isActive
                  ? 'text-primary font-bold scale-105 bg-primary/10'
                  : 'text-on-surface-variant hover:text-on-surface active:scale-95'
              }`}
            >
              <span className="text-lg sm:text-xl mb-0.5 leading-none">{item.emoji}</span>
              <span className={`text-[9.5px] sm:text-[10px] font-sans font-bold leading-tight whitespace-nowrap ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
