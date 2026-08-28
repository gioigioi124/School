'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Star, Flame, Trophy, Volume2, VolumeX, LogOut, Sparkles } from 'lucide-react';
import { sounds } from '@/lib/sounds';
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
  childrenList = [],
  selectedChildId,
  onSelectChild,
  stars = 45,
  totalXp = 260,
  level = 2,
  streakDays = 3,
}: StudentHeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isMuted, setIsMuted] = useState(false);

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
    router.push('/login');
    router.refresh();
  };

  const activeChild = childrenList.find((c) => c.id === selectedChildId) || childrenList[0] || {
    id: 'default',
    displayName: 'Bé yêu',
    avatarUrl: '🐻',
    className: 'Lớp Mầm A1',
  };

  return (
    <header className="sticky top-0 z-40 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/30 px-4 md:px-8 py-3 shadow-2xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand Logo */}
        <Link 
          href="/portal" 
          onClick={() => sounds.playPop()} 
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-2xl bg-secondary-container flex items-center justify-center text-2xl shadow-xs group-hover:scale-110 transition-transform">
            🌟
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-heading text-xl md:text-2xl font-bold text-primary tracking-tight">
                Kinderly Kids
              </h1>
            </div>
            <p className="font-sans text-[11px] font-bold text-on-surface-variant -mt-1 hidden sm:block">
              Không gian học tập của bé
            </p>
          </div>
        </Link>

        {/* Center: Multi-child Switcher if > 1 child */}
        {childrenList.length > 1 && (
          <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-full border border-outline-variant/30 shadow-2xs overflow-x-auto max-w-xs sm:max-w-none">
            {childrenList.map((child) => {
              const isSelected = (selectedChildId ? child.id === selectedChildId : child.id === activeChild.id);
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
                  <span className="text-base">{child.avatarUrl || '🐻'}</span>
                  <span className="truncate max-w-[80px]">{child.displayName}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Right: Gamification Badges & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Level Badge */}
          <Link
            href="/profile"
            onClick={() => sounds.playPop()}
            className="bg-primary-container text-on-primary-container px-3 py-1.5 rounded-full font-heading font-bold text-xs hidden sm:flex items-center gap-1.5 shadow-xs hover:scale-105 transition-transform"
          >
            <Trophy className="w-3.5 h-3.5 text-primary" />
            <span>Cấp {level}</span>
          </Link>

          {/* Stars Counter */}
          <div className="bg-secondary-container text-on-secondary-container px-3 py-1.5 rounded-full font-sans font-bold text-xs flex items-center gap-1.5 shadow-xs">
            <Star className="w-3.5 h-3.5 fill-current text-secondary" />
            <span>{stars} ⭐</span>
          </div>

          {/* Streak Counter */}
          <div className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full font-sans font-bold text-xs hidden sm:flex items-center gap-1.5 shadow-xs">
            <Flame className="w-3.5 h-3.5 fill-current text-amber-600 animate-bounce" />
            <span>{streakDays} ngày</span>
          </div>

          {/* Audio Sound Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            className={`p-2 rounded-full border transition-all cursor-pointer ${
              isMuted
                ? 'bg-surface-container text-on-surface-variant border-outline-variant/30'
                : 'bg-primary-container text-primary border-primary/20 shadow-2xs'
            }`}
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="p-2 rounded-full text-on-surface-variant hover:text-destructive hover:bg-error-container/40 transition-colors cursor-pointer"
            title="Đăng xuất"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
