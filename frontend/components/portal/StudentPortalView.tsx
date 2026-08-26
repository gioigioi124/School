'use client';

import { useState } from 'react';
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
  Circle, 
  Play, 
  Users, 
  School, 
  Utensils, 
  MessageSquare, 
  LogOut, 
  ChevronDown,
  Award,
  Heart,
  Smile,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

interface StudentProfile {
  id: string;
  displayName: string;
  avatarUrl: string;
  parentPhone: string;
  parentName?: string;
  className: string;
  grade?: string;
  classId?: string;
  teacherName?: string;
}

interface StudentPortalViewProps {
  childrenList: StudentProfile[];
}

export function StudentPortalView({ childrenList }: StudentPortalViewProps) {
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [completedQuests, setCompletedQuests] = useState<Record<string, boolean>>({});
  const [stars, setStars] = useState(45);
  const [xp, setXp] = useState(260);
  const router = useRouter();
  const supabase = createClient();

  const currentChild = childrenList[selectedChildIndex] || {
    id: 'default',
    displayName: 'Bé yêu',
    avatarUrl: '🐻',
    parentPhone: '',
    className: 'Lớp Mầm A1',
    grade: 'Mẫu giáo',
    teacherName: 'Cô Lan',
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const quests = [
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

  const handleCompleteQuest = (quest: typeof quests[0]) => {
    if (completedQuests[quest.id]) return;

    setCompletedQuests(prev => ({ ...prev, [quest.id]: true }));
    setStars(prev => prev + quest.starReward);
    setXp(prev => prev + quest.xpReward);

    toast.success(
      `Bé ${currentChild.displayName} giỏi quá! Nhận được +${quest.xpReward} XP và +${quest.starReward} ⭐! 🎉`,
      { duration: 4000 }
    );
  };

  const badges = [
    { id: '1', title: 'Bé Chăm Chỉ', desc: 'Học 3 ngày liên tục', icon: '🔥', earned: true },
    { id: '2', title: 'Họa Sĩ Nhí', desc: 'Hoàn thành 5 bài vẽ', icon: '🎨', earned: true },
    { id: '3', title: 'Ngôi Sao Toán', desc: 'Đếm số thành thạo', icon: '⭐', earned: true },
    { id: '4', title: 'Nhà Thám Hiểm', desc: 'Khám phá thế giới', icon: '🚀', earned: false },
  ];

  return (
    <div className="min-h-screen bg-surface-bright flex flex-col font-sans text-on-surface">
      {/* Kid & Parent Top Navbar */}
      <header className="sticky top-0 z-40 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/30 px-4 md:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-secondary-container flex items-center justify-center text-2xl shadow-xs">
              🌟
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-primary tracking-tight">Kinderly Kids</h1>
              <p className="font-sans text-[11px] font-bold text-on-surface-variant -mt-0.5">Không gian học tập của bé</p>
            </div>
          </div>

          {/* Center: Switch Child Profile (if multiple children) */}
          {childrenList.length > 1 && (
            <div className="flex items-center gap-2 bg-surface-container-low p-1 rounded-full border border-outline-variant/30 shadow-2xs">
              {childrenList.map((child, index) => (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => setSelectedChildIndex(index)}
                  className={`px-3.5 py-1.5 rounded-full font-sans font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                    selectedChildIndex === index
                      ? 'bg-surface-container-lowest text-primary shadow-xs ring-2 ring-primary/20 scale-102'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="text-base">{child.avatarUrl || '🐻'}</span>
                  <span>{child.displayName}</span>
                </button>
              ))}
            </div>
          )}

          {/* Right: Gamification Stats & Logout */}
          <div className="flex items-center gap-3">
            {/* Stars counter */}
            <div className="bg-secondary-container text-on-secondary-container px-3.5 py-1.5 rounded-full font-sans font-bold text-xs flex items-center gap-1.5 shadow-xs">
              <Star className="w-4 h-4 fill-current text-secondary" />
              <span>{stars} Sao</span>
            </div>

            {/* Streak */}
            <div className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full font-sans font-bold text-xs hidden sm:flex items-center gap-1.5 shadow-xs">
              <Flame className="w-4 h-4 fill-current text-amber-600 animate-bounce" />
              <span>3 ngày</span>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-full text-on-surface-variant hover:text-destructive hover:bg-error-container/40 transition-colors cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto p-4 md:p-8 space-y-8 w-full animate-fade-in">
        {/* Hero Greeting Banner */}
        <section className="bg-gradient-to-r from-primary-container via-secondary-container/40 to-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-soft border border-outline-variant/30 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-lowest/80 backdrop-blur-sm rounded-full text-xs font-bold text-primary shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-secondary" />
              <span>Chào mừng bé đến với lớp học vui nhộn!</span>
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-on-surface flex items-center gap-3">
              <span>Xin chào bé {currentChild.displayName}!</span>
              <span className="text-4xl animate-bounce">{currentChild.avatarUrl || '🐻'}</span>
            </h2>
            <p className="font-sans text-sm text-on-surface-variant max-w-lg">
              Hôm nay bé có <strong>{quests.filter(q => !completedQuests[q.id]).length} thử thách thú vị</strong> đang chờ. Cùng khám phá và nhận thật nhiều sao ⭐ nhé!
            </p>

            {/* Level XP Progress Bar */}
            <div className="pt-2 max-w-md">
              <div className="flex justify-between items-center text-xs font-bold text-on-surface mb-1.5">
                <span className="text-primary flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" />
                  Cấp độ 2 (Họa sĩ nhí)
                </span>
                <span className="text-on-surface-variant">{xp} / 500 XP</span>
              </div>
              <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-500" 
                  style={{ width: `${(xp / 500) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Play Illustration Card */}
          <div className="relative z-10 flex flex-col items-center justify-center p-6 bg-surface-container-lowest/90 backdrop-blur-sm rounded-2xl shadow-soft border border-white/60 text-center w-full md:w-64 shrink-0">
            <span className="text-5xl mb-2">🚀</span>
            <h4 className="font-heading font-bold text-base text-on-surface">Khám phá hôm nay</h4>
            <span className="text-xs text-on-surface-variant mt-0.5 mb-3">{currentChild.className}</span>
            <button
              onClick={() => handleCompleteQuest(quests[0])}
              className="w-full py-2.5 bg-primary text-on-primary rounded-full font-sans font-bold text-xs btn-3d hover:bg-primary-dark transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Chơi ngay</span>
            </button>
          </div>
        </section>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Daily Quests / Missions (8 cols) */}
          <section className="lg:col-span-8 space-y-6">
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-soft border border-outline-variant/30 space-y-5">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-heading text-2xl font-bold text-on-surface flex items-center gap-2">
                    <span>Nhiệm vụ học tập vui vẻ</span>
                    <span className="text-xl">🎯</span>
                  </h3>
                  <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                    Hoàn thành bài học để nhận thêm điểm XP và Sao bé ngoan
                  </p>
                </div>
              </div>

              {/* Quest List */}
              <div className="space-y-3.5">
                {quests.map((quest) => {
                  const isDone = completedQuests[quest.id];
                  return (
                    <div
                      key={quest.id}
                      onClick={() => handleCompleteQuest(quest)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 group ${
                        isDone
                          ? 'bg-surface-container-low/60 border-outline-variant/30 opacity-75'
                          : 'bg-surface-bright border-outline-variant/40 hover:border-primary-container shadow-2xs hover-scale'
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
                          <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-sans font-bold text-xs flex items-center gap-1.5 shadow-2xs">
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

            {/* Badges Collection */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-soft border border-outline-variant/30 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-heading text-xl font-bold text-on-surface flex items-center gap-2">
                  <Award className="w-5 h-5 text-secondary" />
                  <span>Bộ sưu tập Huy hiệu bé ngoan</span>
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center transition-all ${
                      badge.earned
                        ? 'bg-surface-bright border-secondary/30 shadow-2xs'
                        : 'bg-surface-container-low/40 border-outline-variant/20 opacity-50 grayscale'
                    }`}
                  >
                    <span className="text-3xl mb-1.5">{badge.icon}</span>
                    <h5 className="font-sans font-bold text-xs text-on-surface">{badge.title}</h5>
                    <span className="text-[10px] text-on-surface-variant mt-0.5">{badge.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Right Column: Classroom & Parent Noticeboard (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Classroom Info Card */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-soft border border-outline-variant/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-primary-container text-on-primary-container text-xs font-bold">
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
                  <span>Phòng 102 • Năm học 2025 - 2026</span>
                </p>
              </div>

              <div className="p-3.5 bg-surface-container-low rounded-xl flex items-center gap-3 border border-outline-variant/20">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center font-heading font-bold text-base text-secondary shrink-0">
                  {currentChild.teacherName?.charAt(0) || 'L'}
                </div>
                <div>
                  <h5 className="font-sans font-bold text-xs text-on-surface">{currentChild.teacherName || 'Cô Nguyễn Lan'}</h5>
                  <span className="text-[11px] text-primary font-bold">Giáo viên chủ nhiệm</span>
                </div>
              </div>
            </div>

            {/* Parent Notice & Electronic Contact Book */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-soft border border-outline-variant/30 space-y-4">
              <h4 className="font-heading text-lg font-bold text-on-surface flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <span>Sổ liên lạc hôm nay</span>
              </h4>

              <div className="space-y-3">
                <div className="p-3.5 bg-primary-container/20 rounded-xl border border-primary-container/40 space-y-1">
                  <span className="text-[10px] font-sans font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-current" />
                    Lời khen từ Cô giáo
                  </span>
                  <p className="font-sans text-xs text-on-surface leading-relaxed">
                    "Hôm nay bé {currentChild.displayName} ăn hết suất cơm, tích cực giơ tay phát biểu và tô tranh rất đẹp!"
                  </p>
                </div>

                <div className="p-3.5 bg-secondary-container/20 rounded-xl border border-secondary-container/40 space-y-1">
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
      </main>
    </div>
  );
}
