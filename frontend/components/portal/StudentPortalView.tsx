'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { 
  Sparkles, 
  Star, 
  Flame, 
  Trophy, 
  BookOpen, 
  CheckCircle2, 
  Play, 
  Users, 
  School, 
  Utensils, 
  MessageSquare, 
  ChevronRight,
  Award,
  Heart,
  Gamepad2,
  Film,
  ArrowRight,
  CalendarDays,
  Clock,
  MapPin
} from 'lucide-react';
import Link from 'next/link';
import { StudentHeader, StudentChildInfo } from '@/components/student/StudentHeader';
import { CelebrationConfetti } from '@/components/student/CelebrationConfetti';
import { sounds } from '@/lib/sounds';

interface StudentProfileExtended extends StudentChildInfo {
  parentPhone: string;
  parentName?: string;
  teacherName?: string;
  totalXp: number;
  currentLevel: number;
  totalStars: number;
  unlockedBadgeIds: string[];
}

interface StudentPortalViewProps {
  childrenList: StudentProfileExtended[];
  initialLessons?: any[];
  completedLessonIds?: string[];
  allBadges?: any[];
  announcements?: any[];
  schedules?: any[];
}

export function StudentPortalView({
  childrenList,
  initialLessons = [],
  completedLessonIds = [],
  allBadges = [],
  announcements = [],
  schedules = [],
}: StudentPortalViewProps) {
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const currentChild = childrenList[selectedChildIndex] || childrenList[0] || {
    id: 'default',
    displayName: 'Bé yêu',
    avatarUrl: '🎒',
    parentPhone: '',
    className: 'Lớp 1A1',
    grade: 'Lớp 1',
    teacherName: 'Cô Nguyễn Lan',
    totalXp: 150,
    currentLevel: 1,
    totalStars: 12,
    unlockedBadgeIds: [],
  };

  // Local state for interactive instant gamification updates
  const [xp, setXp] = useState(currentChild.totalXp);
  const [stars, setStars] = useState(currentChild.totalStars);
  const [completedQuests, setCompletedQuests] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    completedLessonIds.forEach((key) => {
      const parts = key.split('_');
      if (parts[0] === currentChild.id) {
        map[parts[1]] = true;
      }
    });
    return map;
  });

  const level = Math.floor(xp / 1000) + 1;
  const currentLevelBaseXp = (level - 1) * 1000;
  const levelProgressXp = xp - currentLevelBaseXp;
  const progressPercent = Math.min(100, Math.round((levelProgressXp / 1000) * 100));

  // Fallback default quests if class has no lessons yet
  const defaultQuests = [
    {
      id: 'quest-1',
      title: 'Bé tập tô màu Chú Bướm rực rỡ',
      subject: 'Tạo hình & Nghệ thuật',
      duration: '15 phút',
      xpReward: 20,
      starReward: 1,
      icon: '🎨',
      color: 'bg-pink-100 text-pink-700',
    },
    {
      id: 'quest-2',
      title: 'Đếm số vui nhộn từ 1 đến 10 cùng thỏ bông',
      subject: 'Làm quen Toán học',
      duration: '10 phút',
      xpReward: 15,
      starReward: 1,
      icon: '🔢',
      color: 'bg-amber-100 text-amber-700',
    },
    {
      id: 'quest-3',
      title: 'Nghe kể chuyện: Chú Voi con tốt bụng',
      subject: 'Văn học & Kể chuyện',
      duration: '20 phút',
      xpReward: 25,
      starReward: 2,
      icon: '🦁',
      color: 'bg-emerald-100 text-emerald-700',
    },
  ];

  const activeQuests = initialLessons.length > 0
    ? initialLessons.map((l, index) => ({
        id: l.id,
        title: l.title,
        subject: 'Bài học lớp ' + (currentChild.className || ''),
        duration: l.duration ? `${l.duration} phút` : '15 phút',
        xpReward: 20,
        starReward: 1,
        icon: l.thumbnail_url || (index % 3 === 0 ? '🎨' : index % 3 === 1 ? '🔢' : '🦁'),
        color: index % 3 === 0 ? 'bg-pink-100 text-pink-700' : index % 3 === 1 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700',
      }))
    : defaultQuests;

  const handleSelectChild = (childId: string) => {
    const idx = childrenList.findIndex((c) => c.id === childId);
    if (idx !== -1) {
      setSelectedChildIndex(idx);
      const child = childrenList[idx];
      setXp(child.totalXp);
      setStars(child.totalStars);
    }
  };

  const handleCompleteQuest = async (quest: typeof activeQuests[0]) => {
    if (completedQuests[quest.id]) return;

    sounds.playCorrect();
    sounds.playStar();
    setShowConfetti(true);

    const newXp = xp + quest.xpReward;
    const newStars = stars + quest.starReward;
    const newLevel = Math.floor(newXp / 1000) + 1;

    if (newLevel > level) {
      setTimeout(() => sounds.playLevelUp(), 400);
    }

    setCompletedQuests((prev) => ({ ...prev, [quest.id]: true }));
    setXp(newXp);
    setStars(newStars);

    toast.success(
      `Bé ${currentChild.displayName} giỏi quá! Nhận được +${quest.xpReward} XP và +${quest.starReward} ⭐! 🎉`,
      { duration: 4000 }
    );

    // Save to Backend / Supabase
    try {
      // 1. Record progress if it's a real lesson
      if (initialLessons.some((l) => l.id === quest.id)) {
        await supabase.from('student_progress').upsert({
          student_id: currentChild.id,
          lesson_id: quest.id,
          is_completed: true,
          completed_at: new Date().toISOString(),
          xp_earned: quest.xpReward,
        }, { onConflict: 'student_id,lesson_id' });
      }

      // 2. Insert xp_history
      await supabase.from('xp_history').insert({
        student_id: currentChild.id,
        action: `Hoàn thành: ${quest.title}`,
        xp_amount: quest.xpReward,
        source_type: 'lesson',
        source_id: initialLessons.some((l) => l.id === quest.id) ? quest.id : null,
      });

      // 3. Upsert user_xp
      await supabase.from('user_xp').upsert({
        student_id: currentChild.id,
        total_xp: newXp,
        total_stars: newStars,
        current_level: newLevel,
      });
    } catch (err) {
      console.error('Error syncing quest completion:', err);
    }
  };

  // Fallback badges if DB badges empty
  const defaultBadges = [
    { id: '1', name: 'Bé Chăm Chỉ', description: 'Học 3 ngày liên tục', icon: '🔥', code: 'streak_3' },
    { id: '2', name: 'Họa Sĩ Nhí', description: 'Hoàn thành 5 bài vẽ', icon: '🎨', code: 'artist_5' },
    { id: '3', name: 'Ngôi Sao Toán', description: 'Đếm số thành thạo', icon: '⭐', code: 'math_star' },
    { id: '4', name: 'Nhà Thám Hiểm', description: 'Khám phá thế giới', icon: '🚀', code: 'explorer' },
  ];

  const displayBadges = allBadges.length > 0 ? allBadges.slice(0, 4) : defaultBadges;

  // Determine current day in VN format (2 = Thứ 2, ..., 8 = Chủ Nhật)
  const now = new Date();
  const currentDayOfWeek = now.getDay() === 0 ? 8 : now.getDay() + 1;
  const dayNames = ['', '', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
  const currentDayLabel = dayNames[currentDayOfWeek] || 'Hôm nay';

  const todaySchedules = (schedules || []).filter(
    (s: any) => s.day_of_week === currentDayOfWeek || s.dayOfWeek === currentDayOfWeek
  );

  const defaultSubjectIcons: Record<string, string> = {
    'Toán': '🔢',
    'Tiếng Việt': '📖',
    'Tiếng Anh': '🗣️',
    'Khoa học': '🔬',
    'Tự nhiên': '🔬',
    'Lịch sử': '🗺️',
    'Tin học': '💻',
    'Đạo đức': '🌟',
    'Mỹ thuật': '🎨',
    'Âm nhạc': '🎵',
    'Thể chất': '🏃',
    'Chào cờ': '🔔',
    'Sinh hoạt': '🎪',
    'Trải nghiệm': '🎪',
  };

  const getSubjectIcon = (subject: string) => {
    for (const key in defaultSubjectIcons) {
      if (subject.toLowerCase().includes(key.toLowerCase())) {
        return defaultSubjectIcons[key];
      }
    }
    return '📚';
  };

  const displayTodaySchedules = todaySchedules.length > 0 ? todaySchedules : [
    {
      id: 'st-1',
      day_of_week: currentDayOfWeek,
      start_time: '08:00',
      end_time: '08:45',
      subject: 'Toán học (Khám phá & Luyện tập)',
      room: 'Phòng 101',
      color: '#3B82F6',
      description: 'Mang theo vở bài tập toán và bút chì',
    },
    {
      id: 'st-2',
      day_of_week: currentDayOfWeek,
      start_time: '09:00',
      end_time: '09:45',
      subject: 'Tiếng Việt (Tập đọc & Chính tả)',
      room: 'Phòng 101',
      color: '#F97316',
      description: 'Luyện đọc bài mới và viết chữ đẹp',
    },
    {
      id: 'st-3',
      day_of_week: currentDayOfWeek,
      start_time: '10:00',
      end_time: '10:45',
      subject: 'Tiếng Anh Tiểu học (Phonics & Kể chuyện)',
      room: 'Phòng Ngoại ngữ',
      color: '#EC4899',
      description: 'Học từ vựng theo chủ đề và thực hành nhóm',
    },
    {
      id: 'st-4',
      day_of_week: currentDayOfWeek,
      start_time: '14:30',
      end_time: '15:15',
      subject: 'Tự nhiên & Xã hội / Khoa học',
      room: 'Phòng 101',
      color: '#06B6D4',
      description: 'Khám phá thế giới động thực vật xung quanh',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans text-on-surface">
      <CelebrationConfetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Top Header */}
      <StudentHeader
        childrenList={childrenList}
        selectedChildId={currentChild.id}
        onSelectChild={handleSelectChild}
        stars={stars}
        totalXp={xp}
        level={level}
        streakDays={3}
      />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 w-full animate-fade-in">
        {/* Hero Greeting Banner */}
        <section className="bg-gradient-to-r from-primary-container via-secondary-container/40 to-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-soft border border-outline-variant/30 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-lowest/80 backdrop-blur-sm rounded-full text-xs font-bold text-primary shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-secondary" />
              <span>Chào mừng bé đến với lớp học vui nhộn!</span>
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-on-surface flex items-center gap-3">
              <span>Xin chào bé {currentChild.displayName}!</span>
              <span className="text-4xl animate-bounce">{currentChild.avatarUrl || '🎒'}</span>
            </h2>
            <p className="font-sans text-sm text-on-surface-variant max-w-lg">
              Hôm nay là <strong>{currentDayLabel}</strong>. Cùng xem thời khóa biểu và hoàn thành <strong>{activeQuests.filter((q) => !completedQuests[q.id]).length} bài tập thú vị</strong> để nhận thật nhiều sao ⭐ nhé!
            </p>

            {/* Level XP Progress Bar */}
            <div className="pt-2 max-w-md">
              <div className="flex justify-between items-center text-xs font-bold text-on-surface mb-1.5">
                <span className="text-primary flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" />
                  Cấp độ {level} ({level === 1 ? 'Khởi đầu hứng khởi' : level === 2 ? 'Ngôi sao chăm học' : 'Nhà thông thái nhí'})
                </span>
                <span className="text-on-surface-variant font-medium">
                  {levelProgressXp} / 1000 XP ({progressPercent}%)
                </span>
              </div>
              <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden p-0.5 shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Action Cards Grid */}
          <div className="relative z-10 grid grid-cols-2 gap-3 w-full md:w-80 shrink-0">
            <Link
              href="/learn"
              onClick={() => sounds.playPop()}
              className="p-4 bg-surface-container-lowest/95 backdrop-blur-sm rounded-2xl shadow-soft border border-primary/20 hover:border-primary transition-all flex flex-col items-center justify-center text-center group cursor-pointer hover:scale-103"
            >
              <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">📚</span>
              <span className="font-heading font-bold text-xs text-on-surface">Bài học hôm nay</span>
              <span className="text-[10px] text-primary font-bold mt-0.5">Vào học ngay →</span>
            </Link>

            <Link
              href="/games"
              onClick={() => sounds.playPop()}
              className="p-4 bg-surface-container-lowest/95 backdrop-blur-sm rounded-2xl shadow-soft border border-secondary/20 hover:border-secondary transition-all flex flex-col items-center justify-center text-center group cursor-pointer hover:scale-103"
            >
              <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">🎮</span>
              <span className="font-heading font-bold text-xs text-on-surface">Góc trò chơi</span>
              <span className="text-[10px] text-secondary font-bold mt-0.5">Chơi & Nhận XP →</span>
            </Link>

            <Link
              href="/leaderboard"
              onClick={() => sounds.playPop()}
              className="p-4 bg-surface-container-lowest/95 backdrop-blur-sm rounded-2xl shadow-soft border border-amber-200 hover:border-amber-400 transition-all flex flex-col items-center justify-center text-center group cursor-pointer hover:scale-103"
            >
              <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">🏆</span>
              <span className="font-heading font-bold text-xs text-on-surface">Bảng vàng thi đua</span>
              <span className="text-[10px] text-amber-600 font-bold mt-0.5">Xem thứ hạng →</span>
            </Link>

            <Link
              href="/videos"
              onClick={() => sounds.playPop()}
              className="p-4 bg-surface-container-lowest/95 backdrop-blur-sm rounded-2xl shadow-soft border border-rose-200 hover:border-rose-400 transition-all flex flex-col items-center justify-center text-center group cursor-pointer hover:scale-103"
            >
              <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">🎬</span>
              <span className="font-heading font-bold text-xs text-on-surface">Rạp chiếu phim</span>
              <span className="text-[10px] text-rose-600 font-bold mt-0.5">Xem video vui →</span>
            </Link>
          </div>
        </section>

        {/* Student Schedule Section with Sáng / Chiều distinction */}
        <section className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-outline-variant/30 shadow-soft space-y-3.5">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-lg shadow-2xs">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading text-lg sm:text-xl font-bold text-on-surface flex items-center gap-2">
                  <span>Thời khóa biểu {currentDayLabel} của bé</span>
                  <span className="px-2 py-0.2 rounded-full text-xs bg-amber-100 text-amber-800 font-bold font-sans">
                    {displayTodaySchedules.length} tiết
                  </span>
                </h3>
                <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                  Lịch học theo ca Sáng & Chiều giúp bé và phụ huynh chuẩn bị sách vở chu đáo.
                </p>
              </div>
            </div>
          </div>

          {(() => {
            const morningSlots = displayTodaySchedules.filter((s: any) => {
              const time = s.start_time || s.startTime || '08:00';
              const hour = parseInt(time.split(':')[0], 10);
              return hour < 12 || (hour === 12 && parseInt(time.split(':')[1] || '0', 10) < 30);
            });
            const afternoonSlots = displayTodaySchedules.filter((s: any) => {
              const time = s.start_time || s.startTime || '14:00';
              const hour = parseInt(time.split(':')[0], 10);
              return !(hour < 12 || (hour === 12 && parseInt(time.split(':')[1] || '0', 10) < 30));
            });

            return (
              <div className="space-y-4 pt-1">
                {/* Sáng */}
                {morningSlots.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-50/90 px-2.5 py-0.5 rounded-md border border-amber-200/60 w-fit">
                      <span>☀️ Buổi Sáng ({morningSlots.length} tiết)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {morningSlots.map((slot: any, idx: number) => {
                        const icon = getSubjectIcon(slot.subject);
                        const slotColor = slot.color || '#3B82F6';
                        const startTime = slot.start_time || slot.startTime;
                        const endTime = slot.end_time || slot.endTime;
                        const note = slot.description || (slot.room ? `Phòng ${slot.room}` : 'Mang theo đồ dùng học tập');

                        return (
                          <div
                            key={slot.id || idx}
                            className="h-[68px] bg-surface rounded-lg px-3 py-1.5 border border-outline-variant/30 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between overflow-hidden group hover:border-primary/40"
                            style={{
                              borderLeftWidth: '3.5px',
                              borderLeftColor: slotColor,
                            }}
                          >
                            <div className="flex items-center justify-between gap-1 leading-none">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary">
                                <Clock className="w-2.5 h-2.5" />
                                <span>{startTime} - {endTime}</span>
                              </span>
                              <span className="text-[10px] font-heading px-1.5 py-0.2 rounded-full bg-primary/10 text-primary font-semibold">
                                Tiết {idx + 1}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-xs shrink-0">{icon}</span>
                              <h4 className="font-heading font-bold text-xs text-on-surface truncate leading-tight group-hover:text-primary transition-colors">
                                {slot.subject}
                              </h4>
                            </div>

                            <p className="text-[10px] text-on-surface-variant/80 truncate italic leading-none">
                              {note}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Chiều */}
                {afternoonSlots.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 bg-indigo-50/90 px-2.5 py-0.5 rounded-md border border-indigo-200/60 w-fit">
                      <span>🌤️ Buổi Chiều ({afternoonSlots.length} tiết)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {afternoonSlots.map((slot: any, idx: number) => {
                        const icon = getSubjectIcon(slot.subject);
                        const slotColor = slot.color || '#8B5CF6';
                        const startTime = slot.start_time || slot.startTime;
                        const endTime = slot.end_time || slot.endTime;
                        const note = slot.description || (slot.room ? `Phòng ${slot.room}` : 'Mang theo đồ dùng học tập');

                        return (
                          <div
                            key={slot.id || idx}
                            className="h-[68px] bg-surface rounded-lg px-3 py-1.5 border border-outline-variant/30 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between overflow-hidden group hover:border-indigo-400"
                            style={{
                              borderLeftWidth: '3.5px',
                              borderLeftColor: slotColor,
                            }}
                          >
                            <div className="flex items-center justify-between gap-1 leading-none">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700">
                                <Clock className="w-2.5 h-2.5" />
                                <span>{startTime} - {endTime}</span>
                              </span>
                              <span className="text-[10px] font-heading px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 font-semibold">
                                Tiết {idx + 1}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-xs shrink-0">{icon}</span>
                              <h4 className="font-heading font-bold text-xs text-on-surface truncate leading-tight group-hover:text-primary transition-colors">
                                {slot.subject}
                              </h4>
                            </div>

                            <p className="text-[10px] text-on-surface-variant/80 truncate italic leading-none">
                              {note}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </section>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Daily Quests / Missions (8 cols) */}
          <section className="lg:col-span-8 space-y-6">
            <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-soft border border-outline-variant/30 space-y-5">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-heading text-2xl font-bold text-on-surface flex items-center gap-2">
                    <span>Nhiệm vụ học tập vui vẻ</span>
                    <span className="text-2xl">🎯</span>
                  </h3>
                  <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                    Hoàn thành thử thách để nhận điểm thưởng XP và Sao bé ngoan
                  </p>
                </div>

                <Link
                  href="/learn"
                  onClick={() => sounds.playPop()}
                  className="inline-flex items-center text-xs font-bold text-primary hover:text-primary-dark transition-colors gap-1"
                >
                  <span>Xem tất cả bài học</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Quest List */}
              <div className="space-y-3.5">
                {activeQuests.map((quest) => {
                  const isDone = completedQuests[quest.id];
                  return (
                    <div
                      key={quest.id}
                      onClick={() => handleCompleteQuest(quest)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 group ${
                        isDone
                          ? 'bg-surface-container-low/60 border-outline-variant/30 opacity-75'
                          : 'bg-surface-bright border-outline-variant/40 hover:border-primary-container shadow-2xs hover:scale-101'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs group-hover:scale-110 transition-transform ${quest.color}`}>
                          <span>{quest.icon}</span>
                        </div>
                        <div>
                          <span className="text-[11px] font-sans font-bold text-on-surface-variant uppercase tracking-wider">
                            {quest.subject} • {quest.duration}
                          </span>
                          <h4 className={`font-sans font-bold text-sm ${isDone ? 'line-through text-on-surface-variant' : 'text-on-surface group-hover:text-primary'} transition-colors`}>
                            {quest.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-primary">+{quest.xpReward} XP</span>
                            <span className="text-xs font-bold text-secondary flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-current" />
                              +{quest.starReward} Sao
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isDone ? (
                          <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-sans font-bold text-xs flex items-center gap-1.5 shadow-2xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Đã hoàn thành</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="px-4 py-2 rounded-full bg-primary text-on-primary font-sans font-bold text-xs btn-3d hover:bg-primary-dark transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Làm bài</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Badges Collection Showcase */}
            <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-soft border border-outline-variant/30 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-heading text-xl font-bold text-on-surface flex items-center gap-2">
                  <Award className="w-5 h-5 text-secondary" />
                  <span>Bộ sưu tập Huy hiệu bé ngoan</span>
                </h3>
                <Link
                  href="/profile"
                  onClick={() => sounds.playPop()}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <span>Kho huy hiệu</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {displayBadges.map((badge) => {
                  const isEarned = currentChild.unlockedBadgeIds?.includes(badge.id) || xp >= 100;
                  return (
                    <div
                      key={badge.id}
                      className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center transition-all ${
                        isEarned
                          ? 'bg-surface-bright border-secondary/40 shadow-2xs'
                          : 'bg-surface-container-low/40 border-outline-variant/20 opacity-50 grayscale'
                      }`}
                    >
                      <span className="text-3xl mb-1.5">{badge.icon || '🌟'}</span>
                      <h5 className="font-sans font-bold text-xs text-on-surface">{badge.name}</h5>
                      <span className="text-[10px] text-on-surface-variant mt-0.5 line-clamp-1">{badge.description}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Right Column: Classroom & Parent Noticeboard (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Classroom Info Card */}
            <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-soft border border-outline-variant/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-primary-container text-on-primary-container text-xs font-bold font-heading">
                  {currentChild.grade || 'Mẫu giáo'}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[#f0fdf4] text-[#166534] text-xs font-bold flex items-center gap-1 border border-emerald-100">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Có mặt hôm nay
                </span>
              </div>

              <div>
                <h3 className="font-heading text-2xl font-bold text-on-surface">
                  {currentChild.className}
                </h3>
                <p className="font-sans text-xs text-on-surface-variant mt-1 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-outline" />
                  <span>Trường Mầm non & Tiểu học Kinderly</span>
                </p>
              </div>

              <div className="p-3.5 bg-surface-container-low rounded-2xl flex items-center gap-3 border border-outline-variant/20">
                <div className="w-10 h-10 rounded-2xl bg-secondary-container flex items-center justify-center font-heading font-bold text-base text-secondary shrink-0">
                  {currentChild.teacherName?.charAt(0) || 'L'}
                </div>
                <div>
                  <h5 className="font-sans font-bold text-xs text-on-surface">{currentChild.teacherName || 'Cô Nguyễn Lan'}</h5>
                  <span className="text-[11px] text-primary font-bold">Giáo viên chủ nhiệm</span>
                </div>
              </div>
            </div>

            {/* Parent Notice & Electronic Contact Book */}
            <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-soft border border-outline-variant/30 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-heading text-lg font-bold text-on-surface flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <span>Sổ liên lạc hôm nay</span>
                </h4>
                <Link
                  href="/diary"
                  onClick={() => sounds.playPop()}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Xem chi tiết →
                </Link>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-primary-container/20 rounded-2xl border border-primary-container/40 space-y-1">
                  <span className="text-[10px] font-sans font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-current" />
                    Lời khen từ Cô giáo
                  </span>
                  <p className="font-sans text-xs text-on-surface leading-relaxed">
                    "Hôm nay bé {currentChild.displayName} ăn hết suất cơm, tích cực giơ tay phát biểu và tô tranh rất đẹp!"
                  </p>
                </div>

                <div className="p-3.5 bg-secondary-container/20 rounded-2xl border border-secondary-container/40 space-y-1">
                  <span className="text-[10px] font-sans font-bold text-secondary uppercase tracking-wider flex items-center gap-1">
                    <Utensils className="w-3 h-3" />
                    Thực đơn dinh dưỡng
                  </span>
                  <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                    Trưa: Cơm cá hồi sốt cam, canh rau ngót thịt bằm. Xế: Sữa chua trái cây 🍨.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
