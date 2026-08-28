'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Star, 
  Crown, 
  Medal, 
  ArrowLeft, 
  Sparkles, 
  Flame, 
  TrendingUp,
  Award
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { sounds } from '@/lib/sounds';

interface LeaderboardStudent {
  id: string;
  displayName: string;
  avatarUrl: string;
  totalXp: number;
  currentLevel: number;
  totalStars: number;
}

interface StudentLeaderboardViewProps {
  initialLeaderboard: LeaderboardStudent[];
  currentStudentId: string;
  className: string;
  classId?: string;
}

export function StudentLeaderboardView({
  initialLeaderboard,
  currentStudentId,
  className,
  classId,
}: StudentLeaderboardViewProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardStudent[]>(initialLeaderboard);
  const supabase = createClient();

  useEffect(() => {
    if (!classId) return;

    // Listen to realtime changes in user_xp
    const channel = supabase
      .channel(`leaderboard-${classId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_xp' },
        (payload: any) => {
          const updated = payload.new;
          if (updated && updated.student_id) {
            setLeaderboard((prev) => {
              const next = prev.map((s) => {
                if (s.id === updated.student_id) {
                  return {
                    ...s,
                    totalXp: updated.total_xp,
                    currentLevel: updated.current_level,
                    totalStars: updated.total_stars,
                  };
                }
                return s;
              });
              next.sort((a, b) => b.totalXp - a.totalXp);
              return next;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [classId, supabase]);

  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];
  const restStudents = leaderboard.slice(3);

  const myRankIndex = leaderboard.findIndex((s) => s.id === currentStudentId);
  const myStudent = leaderboard[myRankIndex] || leaderboard[0];
  const aheadStudent = myRankIndex > 0 ? leaderboard[myRankIndex - 1] : null;
  const xpNeeded = aheadStudent ? aheadStudent.totalXp - myStudent.totalXp + 5 : 0;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in pb-12 font-sans">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link
            href="/portal"
            onClick={() => sounds.playPop()}
            className="inline-flex items-center text-xs font-bold text-on-surface-variant hover:text-primary transition-colors gap-2 group mb-2"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Quay lại Cổng học sinh</span>
          </Link>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-on-surface flex items-center gap-2.5">
            <span>Bảng Vàng Danh Dự</span>
            <span className="text-3xl">🏆</span>
          </h1>
          <p className="font-sans text-xs sm:text-sm text-on-surface-variant mt-1">
            Gương mặt xuất sắc và tinh thần rèn luyện tích cực của các bạn nhỏ {className}!
          </p>
        </div>

        <div className="px-4 py-2 bg-amber-100 text-amber-900 rounded-2xl text-xs font-heading font-bold flex items-center gap-2 shadow-2xs">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Hạng của bé: #{myRankIndex + 1}</span>
        </div>
      </div>

      {/* Encouragement Banner */}
      {aheadStudent && xpNeeded > 0 && (
        <div className="p-4 bg-gradient-to-r from-primary-container to-secondary-container/50 rounded-2xl border border-primary-container flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-xs">
              🚀
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-on-surface">
                Cố lên bé {myStudent.displayName}!
              </h4>
              <p className="font-sans text-xs text-on-surface-variant">
                Bé chỉ cần thêm <strong>+{xpNeeded} XP</strong> nữa để vươn lên hạng #{myRankIndex}!
              </p>
            </div>
          </div>

          <Link
            href="/games"
            onClick={() => sounds.playPop()}
            className="px-4 py-2 bg-primary text-on-primary rounded-full font-heading font-bold text-xs btn-3d hover:bg-primary-dark shrink-0 shadow-xs"
          >
            Chơi game nhận XP ngay
          </Link>
        </div>
      )}

      {/* Podium for Top 3 */}
      <div className="bg-surface-container-lowest rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-soft border border-outline-variant/30">
        <h3 className="font-heading font-bold text-base sm:text-lg text-on-surface text-center mb-6 sm:mb-8 flex items-center justify-center gap-2">
          <Crown className="w-5 h-5 text-amber-500" />
          <span>Top 3 Ngôi Sao Sáng Nhất Lớp</span>
        </h3>

        <div className="grid grid-cols-3 gap-1.5 sm:gap-6 items-end justify-center max-w-lg mx-auto pt-6 pb-2">
          {/* Rank 2 (Silver) */}
          {top2 && (
            <div className="flex flex-col items-center text-center space-y-1.5 sm:space-y-2">
              <div className="relative">
                <span className="text-3xl sm:text-5xl block animate-bounce" style={{ animationDelay: '0.2s' }}>
                  {top2.avatarUrl || '🐰'}
                </span>
                <div className="absolute -top-2.5 -right-1.5 sm:-top-3 sm:-right-2 bg-slate-300 text-slate-800 rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-[10px] sm:text-xs font-bold font-heading shadow-xs">
                  🥈
                </div>
              </div>
              <h4 className="font-heading font-bold text-[11px] sm:text-sm text-on-surface truncate max-w-[70px] sm:max-w-[100px]">
                {top2.displayName}
              </h4>
              <span className="text-[9.5px] sm:text-[11px] font-bold text-slate-600 bg-slate-100 px-1.5 sm:px-2.5 py-0.5 rounded-full">
                {top2.totalXp} XP
              </span>
              <div className="w-full h-18 sm:h-24 bg-gradient-to-t from-slate-300 to-slate-200 rounded-t-xl sm:rounded-t-2xl flex items-center justify-center font-heading font-bold text-slate-700 text-base sm:text-xl shadow-inner">
                #2
              </div>
            </div>
          )}

          {/* Rank 1 (Gold) */}
          {top1 && (
            <div className="flex flex-col items-center text-center space-y-1.5 sm:space-y-2 -mt-3 sm:-mt-4">
              <div className="relative">
                <Crown className="w-5 h-5 sm:w-7 sm:h-7 text-amber-500 absolute -top-5 sm:-top-7 left-1/2 -translate-x-1/2 animate-bounce" />
                <span className="text-4xl sm:text-6xl block hover:scale-110 transition-transform">
                  {top1.avatarUrl || '🦁'}
                </span>
                <div className="absolute -top-2 -right-1.5 sm:-top-2 sm:-right-2 bg-amber-400 text-amber-900 rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-xs sm:text-sm font-bold font-heading shadow-sm ring-2 ring-white">
                  👑
                </div>
              </div>
              <h4 className="font-heading font-bold text-xs sm:text-base text-primary truncate max-w-[85px] sm:max-w-[120px]">
                {top1.displayName}
              </h4>
              <span className="text-[10px] sm:text-xs font-bold text-amber-800 bg-amber-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-2xs">
                {top1.totalXp} XP
              </span>
              <div className="w-full h-26 sm:h-36 bg-gradient-to-t from-amber-400 to-amber-300 rounded-t-xl sm:rounded-t-2xl flex items-center justify-center font-heading font-bold text-amber-950 text-2xl sm:text-3xl shadow-inner">
                #1
              </div>
            </div>
          )}

          {/* Rank 3 (Bronze) */}
          {top3 && (
            <div className="flex flex-col items-center text-center space-y-1.5 sm:space-y-2">
              <div className="relative">
                <span className="text-3xl sm:text-5xl block animate-bounce" style={{ animationDelay: '0.4s' }}>
                  {top3.avatarUrl || '🦄'}
                </span>
                <div className="absolute -top-2.5 -right-1.5 sm:-top-3 sm:-right-2 bg-amber-700 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-[10px] sm:text-xs font-bold font-heading shadow-xs">
                  🥉
                </div>
              </div>
              <h4 className="font-heading font-bold text-[11px] sm:text-sm text-on-surface truncate max-w-[70px] sm:max-w-[100px]">
                {top3.displayName}
              </h4>
              <span className="text-[9.5px] sm:text-[11px] font-bold text-amber-900 bg-amber-100/80 px-1.5 sm:px-2.5 py-0.5 rounded-full">
                {top3.totalXp} XP
              </span>
              <div className="w-full h-14 sm:h-18 bg-gradient-to-t from-amber-600/50 to-amber-500/40 rounded-t-xl sm:rounded-t-2xl flex items-center justify-center font-heading font-bold text-amber-900 text-sm sm:text-lg shadow-inner">
                #3
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full Leaderboard List */}
      <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-soft border border-outline-variant/30 space-y-4">
        <h3 className="font-heading font-bold text-lg text-on-surface flex items-center gap-2">
          <Medal className="w-5 h-5 text-primary" />
          <span>Danh Sách Thứ Hạng Cả Lớp</span>
        </h3>

        <div className="space-y-3">
          {leaderboard.map((student, index) => {
            const isMe = student.id === currentStudentId;
            const rank = index + 1;

            return (
              <div
                key={student.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  isMe
                    ? 'bg-primary-container/30 border-primary shadow-sm scale-101 ring-2 ring-primary/20'
                    : 'bg-surface-bright border-outline-variant/30 hover:border-outline-variant'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center font-heading font-bold text-sm shrink-0 ${
                      rank === 1
                        ? 'bg-amber-400 text-amber-950 shadow-xs'
                        : rank === 2
                        ? 'bg-slate-300 text-slate-800'
                        : rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    #{rank}
                  </div>

                  <span className="text-3xl shrink-0">{student.avatarUrl || '🐻'}</span>

                  <div>
                    <h4 className="font-heading font-bold text-sm text-on-surface flex items-center gap-2">
                      <span>{student.displayName}</span>
                      {isMe && (
                        <span className="px-2 py-0.5 bg-primary text-on-primary rounded-full text-[10px] font-bold">
                          Là bé nè
                        </span>
                      )}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-on-surface-variant font-medium">
                        Cấp độ {student.currentLevel}
                      </span>
                      <span className="text-xs text-amber-600 font-bold flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-current" />
                        {student.totalStars}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-heading font-bold text-base text-primary">
                    {student.totalXp} XP
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
