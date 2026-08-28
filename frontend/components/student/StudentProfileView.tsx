'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  UserCircle, 
  ArrowLeft, 
  Trophy, 
  Star, 
  Award, 
  History, 
  Sparkles, 
  CheckCircle2, 
  Flame,
  School,
  Phone,
  Edit3
} from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { CelebrationConfetti } from '@/components/student/CelebrationConfetti';
import { sounds } from '@/lib/sounds';

const MASCOT_AVATARS = [
  { emoji: '🐻', name: 'Gấu Pooh' },
  { emoji: '🦁', name: 'Sư Tử Dũng Cảm' },
  { emoji: '🐰', name: 'Thỏ Trắng' },
  { emoji: '🐼', name: 'Gấu Trúc' },
  { emoji: '🦊', name: 'Cáo Thông Thái' },
  { emoji: '🦄', name: 'Kỳ Lân Phép Thuật' },
  { emoji: '🚀', name: 'Phi Hành Gia' },
  { emoji: '🦖', name: 'Khủng Long Xanh' },
  { emoji: '🐱', name: 'Mèo Tinh Nghịch' },
  { emoji: '🐶', name: 'Cún Con Vui Vẻ' },
];

interface StudentProfileViewProps {
  student: any;
  className: string;
  grade: string;
  totalXp: number;
  currentLevel: number;
  totalStars: number;
  allBadges: any[];
  unlockedBadgesMap: Record<string, string>;
  xpHistory: any[];
}

export function StudentProfileView({
  student,
  className,
  grade,
  totalXp: initialXp,
  currentLevel,
  totalStars,
  allBadges,
  unlockedBadgesMap,
  xpHistory,
}: StudentProfileViewProps) {
  const [currentAvatar, setCurrentAvatar] = useState(student.avatar_url || '🐻');
  const [showConfetti, setShowConfetti] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const supabase = createClient();

  const level = Math.floor(initialXp / 1000) + 1;
  const currentLevelBaseXp = (level - 1) * 1000;
  const levelProgressXp = initialXp - currentLevelBaseXp;
  const progressPercent = Math.min(100, Math.round((levelProgressXp / 1000) * 100));

  const handleSelectAvatar = async (avatarEmoji: string) => {
    if (avatarEmoji === currentAvatar) return;

    sounds.playPop();
    sounds.playStar();
    setCurrentAvatar(avatarEmoji);
    setIsUpdating(true);

    try {
      await supabase
        .from('profiles')
        .update({ avatar_url: avatarEmoji })
        .eq('id', student.id);

      toast.success(`Đã đổi linh vật đại diện thành ${avatarEmoji}! ✨`);
    } catch (err) {
      console.error('Error updating avatar:', err);
      toast.error('Có lỗi xảy ra khi đổi linh vật');
    } finally {
      setIsUpdating(false);
    }
  };

  const defaultBadges = [
    { id: '1', name: 'Bé Chăm Chỉ', description: 'Đăng nhập & học 3 ngày liên tiếp', icon: '🔥', xp_bonus: 50, code: 'streak_3' },
    { id: '2', name: 'Họa Sĩ Nhí', description: 'Hoàn thành 5 bài vẽ và tô màu', icon: '🎨', xp_bonus: 50, code: 'artist_5' },
    { id: '3', name: 'Ngôi Sao Toán', description: 'Đếm số và trả lời đúng 10 câu', icon: '⭐', xp_bonus: 50, code: 'math_star' },
    { id: '4', name: 'Nhà Thám Hiểm', description: 'Xem hết 5 video bài giảng', icon: '🚀', xp_bonus: 50, code: 'explorer' },
    { id: '5', name: 'Kiện Tướng Đố Vui', description: 'Đạt điểm tối đa trong minigame', icon: '👑', xp_bonus: 100, code: 'quiz_master' },
    { id: '6', name: 'Bé Ngoan Xuất Sắc', description: 'Đạt cấp độ 5 trong học tập', icon: '🌟', xp_bonus: 100, code: 'level_5' },
  ];

  const badgesList = allBadges.length > 0 ? allBadges : defaultBadges;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in pb-12 font-sans">
      <CelebrationConfetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Top Breadcrumb & Title */}
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
          <span>Hồ Sơ Của Bé & Kho Huy Hiệu</span>
          <span className="text-3xl">🌟</span>
        </h1>
        <p className="font-sans text-xs sm:text-sm text-on-surface-variant mt-1">
          Xem thành tích học tập, tùy chỉnh linh vật đại diện và theo dõi dòng sự kiện nhận thưởng.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-gradient-to-r from-primary-container via-secondary-container/40 to-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-soft border border-outline-variant/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-surface-container-lowest shadow-md flex items-center justify-center text-5xl sm:text-6xl border-2 border-primary/20">
              {currentAvatar}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-primary text-on-primary rounded-full p-1.5 shadow-xs">
              <Edit3 className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full bg-surface-container-lowest text-primary font-heading font-bold text-xs shadow-2xs inline-block">
              {grade} • {className}
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-on-surface">
              {student.display_name || 'Bé yêu'}
            </h2>
            <p className="font-sans text-xs text-on-surface-variant flex items-center gap-1.5">
              <School className="w-3.5 h-3.5 text-outline" />
              <span>{student.school || 'Trường Mầm non & Tiểu học Kinderly'}</span>
            </p>
          </div>
        </div>

        {/* Stats Badges */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-2xs text-center min-w-[100px]">
            <Trophy className="w-5 h-5 text-primary mx-auto mb-1" />
            <span className="font-heading font-bold text-lg text-primary block">Cấp {level}</span>
            <span className="text-[10px] text-on-surface-variant font-medium">Họa sĩ nhí</span>
          </div>

          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-2xs text-center min-w-[100px]">
            <Star className="w-5 h-5 text-secondary fill-secondary mx-auto mb-1" />
            <span className="font-heading font-bold text-lg text-secondary block">{totalStars}</span>
            <span className="text-[10px] text-on-surface-variant font-medium">Sao bé ngoan</span>
          </div>

          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-2xs text-center min-w-[100px]">
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500 mx-auto mb-1 animate-bounce" />
            <span className="font-heading font-bold text-lg text-amber-600 block">3 ngày</span>
            <span className="text-[10px] text-on-surface-variant font-medium">Chuỗi liên tục</span>
          </div>
        </div>
      </div>

      {/* Mascot Avatar Picker */}
      <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-soft border border-outline-variant/30 space-y-4">
        <h3 className="font-heading font-bold text-lg text-on-surface flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-secondary" />
          <span>Chọn Linh Vật Đại Diện Của Bé</span>
        </h3>
        <p className="font-sans text-xs text-on-surface-variant">
          Chạm vào một người bạn linh vật để đổi hình đại diện hiển thị trên lớp học nhé!
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 pt-2">
          {MASCOT_AVATARS.map((mascot) => {
            const isSelected = currentAvatar === mascot.emoji;
            return (
              <button
                key={mascot.emoji}
                onClick={() => handleSelectAvatar(mascot.emoji)}
                className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-primary-container/40 border-primary ring-4 ring-primary/20 scale-105 shadow-sm'
                    : 'bg-surface-bright border-outline-variant/30 hover:bg-surface-container-low hover:scale-102'
                }`}
              >
                <span className="text-4xl mb-1.5">{mascot.emoji}</span>
                <span className="font-sans font-bold text-xs text-on-surface">{mascot.name}</span>
                {isSelected && (
                  <span className="text-[10px] font-bold text-primary mt-0.5">Đang chọn</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Badges Collection */}
      <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-soft border border-outline-variant/30 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-lg text-on-surface flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              <span>Kho Huy Hiệu Thành Tích</span>
            </h3>
            <p className="font-sans text-xs text-on-surface-variant mt-0.5">
              Hoàn thành các mốc thử thách học tập để mở khóa trọn bộ huy hiệu danh dự
            </p>
          </div>

          <span className="px-3 py-1.5 bg-primary-container text-on-primary-container rounded-full text-xs font-heading font-bold">
            Đã đạt 3 / {badgesList.length} Huy hiệu
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badgesList.map((badge, idx) => {
            const isUnlocked = !!unlockedBadgesMap[badge.id] || idx < 3;
            return (
              <div
                key={badge.id || idx}
                className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                  isUnlocked
                    ? 'bg-surface-bright border-secondary/40 shadow-2xs'
                    : 'bg-surface-container-low/40 border-outline-variant/20 opacity-50 grayscale'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-secondary-container/50 flex items-center justify-center text-3xl shrink-0 shadow-xs">
                  {badge.icon || '🌟'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h5 className="font-heading font-bold text-sm text-on-surface truncate">
                      {badge.name}
                    </h5>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                      +{badge.xp_bonus || 50} XP
                    </span>
                  </div>

                  <p className="font-sans text-xs text-on-surface-variant mt-1 leading-relaxed line-clamp-2">
                    {badge.description}
                  </p>

                  <div className="mt-2 text-[10px] font-bold">
                    {isUnlocked ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Đã mở khóa</span>
                      </span>
                    ) : (
                      <span className="text-outline">Chưa mở khóa</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* XP History Timeline */}
      <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-soft border border-outline-variant/30 space-y-4">
        <h3 className="font-heading font-bold text-lg text-on-surface flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          <span>Lịch Sử Nhận Thưởng XP Gần Đây</span>
        </h3>

        <div className="space-y-3">
          {xpHistory.length > 0 ? (
            xpHistory.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-surface-bright border border-outline-variant/20 flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary-container flex items-center justify-center text-base shrink-0">
                    {item.source_type === 'game' ? '🎮' : item.source_type === 'video' ? '🎬' : '📚'}
                  </div>
                  <div>
                    <h5 className="font-sans font-bold text-on-surface">{item.action}</h5>
                    <span className="text-[10px] text-on-surface-variant font-medium">
                      {new Date(item.created_at).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>

                <span className="font-heading font-bold text-xs text-primary px-2.5 py-1 bg-primary-container/30 rounded-full shrink-0">
                  +{item.xp_amount} XP
                </span>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-xs text-on-surface-variant bg-surface-container-low rounded-2xl">
              Chưa có lịch sử nhận thưởng nào gần đây. Hãy hoàn thành các bài học và trò chơi để nhận XP nhé!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
