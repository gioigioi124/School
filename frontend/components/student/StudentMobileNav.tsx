'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
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
  { href: '/learn', label: 'Bài học', emoji: '📚', icon: BookOpen },
  { href: '/games', label: 'Góc chơi', emoji: '🎮', icon: Gamepad2 },
  { href: '/videos', label: 'Rạp phim', emoji: '🎬', icon: Film },
  { href: '/leaderboard', label: 'Bảng vàng', emoji: '🏆', icon: Trophy },
  { href: '/diary', label: 'Sổ liên lạc', emoji: '📖', icon: BookMarked },
  { href: '/profile', label: 'Hồ sơ', emoji: '🌟', icon: UserCircle },
];

export function StudentMobileNav() {
  const pathname = usePathname();

  const handleNavClick = () => {
    sounds.playPop();
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-xl border-t border-outline-variant/30 px-1 py-1.5 shadow-2xl flex items-center justify-around">
      {mobileNavItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/portal' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={handleNavClick}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all duration-200 cursor-pointer min-w-[48px] ${
              isActive
                ? 'text-primary font-bold scale-105 bg-primary/10'
                : 'text-on-surface-variant hover:text-on-surface active:scale-95'
            }`}
          >
            <span className="text-xl mb-0.5 leading-none">{item.emoji}</span>
            <span className={`text-[10px] font-sans font-bold leading-tight ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
