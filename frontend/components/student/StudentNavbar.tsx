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

const NAV_ITEMS = [
  { href: '/portal', label: 'Trang chủ', icon: Home, emoji: '🏠', color: 'text-primary' },
  { href: '/learn', label: 'Bài học', icon: BookOpen, emoji: '📚', color: 'text-blue-600' },
  { href: '/games', label: 'Góc chơi', icon: Gamepad2, emoji: '🎮', color: 'text-amber-500' },
  { href: '/videos', label: 'Rạp phim', icon: Film, emoji: '🎬', color: 'text-rose-500' },
  { href: '/leaderboard', label: 'Bảng vàng', icon: Trophy, emoji: '🏆', color: 'text-secondary' },
  { href: '/diary', label: 'Sổ liên lạc', icon: BookMarked, emoji: '📖', color: 'text-emerald-600' },
  { href: '/profile', label: 'Hồ sơ bé', icon: UserCircle, emoji: '🌟', color: 'text-purple-600' },
];

export function StudentNavbar() {
  const pathname = usePathname();

  const handleNavClick = () => {
    sounds.playPop();
  };

  return (
    <>
      {/* Desktop/Tablet Top Horizontal Navigation Bar */}
      <nav className="hidden md:flex items-center justify-center gap-2 py-2 px-4 bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/30 sticky top-[65px] z-30 shadow-2xs">
        <div className="flex items-center gap-1.5 max-w-7xl w-full justify-center overflow-x-auto scrollbar-none py-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/portal' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className={`px-4 py-2 rounded-2xl font-heading font-bold text-xs flex items-center gap-2 transition-all duration-200 cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-sm scale-102 ring-2 ring-primary/20'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                }`}
              >
                <span className="text-base">{item.emoji}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile/Small Tablet Bottom Fixed Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-lg border-t border-outline-variant/30 px-2 py-1.5 shadow-lg flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/portal' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
                isActive
                  ? 'text-primary font-bold scale-105'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="text-xl mb-0.5">{item.emoji}</span>
              <span className="text-[10px] font-sans font-bold leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
