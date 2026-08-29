'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  CalendarDays,
  BookOpen, 
  BookMarked, 
  UserCircle 
} from 'lucide-react';
import { sounds } from '@/lib/sounds';
import { useAutoHideOnScroll } from '@/hooks/useAutoHideOnScroll';

const mobileNavItems = [
  { href: '/portal', label: 'Trang chủ', icon: Home },
  { href: '/schedule', label: 'Thời khóa biểu', icon: CalendarDays },
  { href: '/learn', label: 'Bài học', icon: BookOpen },
  { href: '/diary', label: 'Sổ liên lạc', icon: BookMarked },
  { href: '/profile', label: 'Hồ sơ cá nhân', icon: UserCircle },
];

export function StudentMobileNav() {
  const pathname = usePathname();
  const isVisible = useAutoHideOnScroll();

  const handleNavClick = () => {
    sounds.playPop();
  };

  return (
    <nav 
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-xl border-t border-outline-variant/30 px-3 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-2xl transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : 'translate-y-[150%]'
      }`}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/portal' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              title={item.label}
              aria-label={item.label}
              className={`relative flex items-center justify-center p-2.5 sm:p-3 rounded-2xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-primary text-on-primary shadow-xs scale-105'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60 active:scale-95'
              }`}
            >
              <Icon className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
