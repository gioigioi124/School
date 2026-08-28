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
  childrenList: propsChildrenList,
  selectedChildId: propsSelectedChildId,
  onSelectChild,
  stars: propsStars,
  totalXp: propsTotalXp,
  level: propsLevel,
  streakDays: propsStreakDays = 3,
}: StudentHeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isMuted, setIsMuted] = useState(false);
  const [localUser, setLocalUser] = useState<{
    displayName: string;
    avatarUrl: string;
    stars: number;
    totalXp: number;
    level: number;
  }>({
    displayName: 'Học sinh',
    avatarUrl: '🎒',
    stars: propsStars ?? 15,
    totalXp: propsTotalXp ?? 260,
    level: propsLevel ?? 1,
  });

  useEffect(() => {
    setIsMuted(sounds.getIsMuted());

    // If props are not passed, load from client supabase
    if (propsStars === undefined || propsLevel === undefined) {
      async function loadHeaderData() {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('id', user.id)
            .maybeSingle();

          const { data: xpData } = await supabase
            .from('user_xp')
            .select('total_xp, current_level, total_stars')
            .eq('student_id', user.id)
            .maybeSingle();

          const xp = xpData?.total_xp || 150;
          const lvl = xpData?.current_level || (Math.floor(xp / 1000) + 1);
          const st = xpData?.total_stars || 12;

          setLocalUser({
            displayName: profile?.display_name || 'Học sinh',
            avatarUrl: profile?.avatar_url || '🎒',
            stars: st,
            totalXp: xp,
            level: lvl,
          });
        } catch (err) {
          console.error('Error fetching student header stats:', err);
        }
      }

      loadHeaderData();
    }
  }, [propsStars, propsLevel, propsTotalXp, supabase]);

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

  const currentStars = propsStars !== undefined ? propsStars : localUser.stars;
  const currentLevel = propsLevel !== undefined ? propsLevel : localUser.level;
  const childrenList = propsChildrenList || [];
  const activeChild = childrenList.find((c) => c.id === propsSelectedChildId) || childrenList[0];

  return (
    <header className="sticky top-0 z-20 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/30 px-4 md:px-8 py-3 shadow-2xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Mobile Left: Brand Logo (Only shown on mobile when sidebar is hidden) */}
        <div className="flex md:hidden items-center gap-2">
          <Link 
            href="/portal" 
            onClick={() => sounds.playPop()} 
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xl shadow-2xs group-hover:scale-105 transition-transform">
              🌟
            </div>
            <div>
              <h1 className="font-heading text-lg font-bold text-primary tracking-tight leading-none">
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

        {/* Right: Gamification Badges & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* Level Badge */}
          <Link
            href="/profile"
            onClick={() => sounds.playPop()}
            className="bg-primary-container text-on-primary-container px-3 py-1.5 rounded-full font-heading font-bold text-xs flex items-center gap-1.5 shadow-xs hover:scale-105 transition-transform"
          >
            <Trophy className="w-3.5 h-3.5 text-primary" />
            <span>Cấp {currentLevel}</span>
          </Link>

          {/* Stars Counter */}
          <div className="bg-secondary-container text-on-secondary-container px-3 py-1.5 rounded-full font-sans font-bold text-xs flex items-center gap-1.5 shadow-xs">
            <Star className="w-3.5 h-3.5 fill-current text-secondary" />
            <span>{currentStars} ⭐</span>
          </div>

          {/* Streak Counter */}
          <div className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full font-sans font-bold text-xs hidden sm:flex items-center gap-1.5 shadow-xs">
            <Flame className="w-3.5 h-3.5 fill-current text-amber-600 animate-bounce" />
            <span>{propsStreakDays} ngày</span>
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

          {/* Mobile Logout (Desktop has logout in sidebar) */}
          <div className="md:hidden">
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
      </div>
    </header>
  );
}
