'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Volume2, VolumeX, LogOut, Sparkles } from 'lucide-react';
import { sounds } from '@/lib/sounds';
import { useAutoHideOnScroll } from '@/hooks/useAutoHideOnScroll';
import Link from 'next/link';

export interface StudentChildInfo {
  id: string;
  displayName: string;
  avatarUrl: string;
  className: string;
  grade?: string;
  classId?: string;
}

interface StudentHeaderProps {
  childrenList?: StudentChildInfo[];
  selectedChildId?: string;
  onSelectChild?: (childId: string) => void;
  stars?: number;
  totalXp?: number;
  level?: number;
  streakDays?: number;
}

export function StudentHeader({
  childrenList: propsChildrenList,
  selectedChildId: propsSelectedChildId,
  onSelectChild,
}: StudentHeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isMuted, setIsMuted] = useState(false);
  const isVisible = useAutoHideOnScroll();

  useEffect(() => {
    setIsMuted(sounds.getIsMuted());
  }, []);

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

  const childrenList = propsChildrenList || [];
  const activeChild = childrenList.find((c) => c.id === propsSelectedChildId) || childrenList[0];

  return (
    <header 
      className={`sticky top-0 z-20 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/30 px-4 md:px-8 py-2.5 sm:py-3 shadow-2xs transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full md:translate-y-0'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Mobile Left: Brand Logo (Only shown on mobile when sidebar is hidden) */}
        <div className="flex md:hidden items-center gap-2">
          <Link 
            href="/portal" 
            onClick={() => sounds.playPop()} 
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-lg shadow-2xs group-hover:scale-105 transition-transform">
              🌟
            </div>
            <div>
              <h1 className="font-heading text-base font-bold text-primary tracking-tight leading-none">
                Kinderly
              </h1>
              <p className="font-sans text-[10px] font-bold text-on-surface-variant leading-none mt-0.5">
                Cổng Học Sinh
              </p>
            </div>
          </Link>
        </div>

        {/* Desktop Left: Student Badge / Multi-child selector */}
        <div className="hidden md:flex items-center gap-3">
          {childrenList.length > 1 ? (
            <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-full border border-outline-variant/30 shadow-2xs overflow-x-auto max-w-md">
              {childrenList.map((child) => {
                const isSelected = (propsSelectedChildId ? child.id === propsSelectedChildId : child.id === activeChild?.id);
                return (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => {
                      sounds.playPop();
                      onSelectChild?.(child.id);
                    }}
                    className={`px-3 py-1 rounded-full font-sans font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-surface-container-lowest text-primary shadow-xs ring-2 ring-primary/30 scale-102'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span className="text-base">{child.avatarUrl || '🎒'}</span>
                    <span className="truncate max-w-[100px]">{child.displayName}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-on-surface-variant text-xs font-semibold">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Không gian học tập Tiểu học</span>
              </span>
            </div>
          )}
        </div>

        {/* Right: Sound Toggle & Mobile Logout */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* Audio Sound Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            className={`p-1.5 sm:p-2 rounded-full border transition-all cursor-pointer shrink-0 ${
              isMuted
                ? 'bg-surface-container text-on-surface-variant border-outline-variant/30'
                : 'bg-primary-container text-primary border-primary/20 shadow-2xs'
            }`}
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> : <Volume2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />}
          </button>

          {/* Mobile Logout (Desktop has logout in sidebar) */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={handleLogout}
              className="px-2.5 py-1.5 rounded-xl bg-error-container/60 text-destructive hover:bg-destructive hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs font-sans font-bold text-xs shrink-0"
              title="Đăng xuất"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
