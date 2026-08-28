# 📦 Backup: Các Thành Phần Giao Diện Trang Chủ Học Sinh (Student Portal Components)

> **Tài liệu lưu trữ**: File này chứa toàn bộ mã nguồn, cấu trúc JSX, state handlers và hướng dẫn phục hồi cho các component tạm thời được ẩn khỏi Trang chủ (`/portal`) của Học sinh để tập trung phát triển tính năng **Thời khóa biểu (Schedules)**.

---

## 📑 Danh Sách Các Thành Phần Đã Lưu Trữ

1. [Hero Greeting Banner & Level Progress Bar](#1-hero-greeting-banner--level-progress-bar)
2. [Quick Action Cards Grid (Phím tắt tính năng)](#2-quick-action-cards-grid)
3. [Daily Quests / Missions (Nhiệm vụ học tập vui vẻ)](#3-daily-quests--missions)
4. [Badges Collection Showcase (Bộ sưu tập Huy hiệu)](#4-badges-collection-showcase)
5. [Classroom Info Card (Thông tin lớp học & GVCN)](#5-classroom-info-card)
6. [Parent Notice & Contact Book (Sổ liên lạc & Thực đơn)](#6-parent-notice--electronic-contact-book)

---

## 1. Hero Greeting Banner & Level Progress Bar

### 🔹 Mô tả
Banner lời chào năng động cho học sinh, hiển thị tên bé, avatar, thứ trong tuần, và thanh tiến độ cấp độ (XP Progress Bar).

### 🔹 Mã JSX
```tsx
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
</section>
```

---

## 2. Quick Action Cards Grid

### 🔹 Mô tả
4 thẻ chuyển hướng nhanh đến các trang con: Bài học (`/learn`), Trò chơi (`/games`), Bảng vàng (`/leaderboard`), Rạp phim (`/videos`).

### 🔹 Mã JSX
```tsx
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
```

---

## 3. Daily Quests / Missions

### 🔹 Mô tả
Danh sách nhiệm vụ học tập hàng ngày kèm theo cơ chế Gamification cộng điểm XP và thưởng sao ngay lập tức.

### 🔹 Logic & Handler
```tsx
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

  try {
    if (initialLessons.some((l) => l.id === quest.id)) {
      await supabase.from('student_progress').upsert({
        student_id: currentChild.id,
        lesson_id: quest.id,
        is_completed: true,
        completed_at: new Date().toISOString(),
        xp_earned: quest.xpReward,
      }, { onConflict: 'student_id,lesson_id' });
    }

    await supabase.from('xp_history').insert({
      student_id: currentChild.id,
      action: `Hoàn thành: ${quest.title}`,
      xp_amount: quest.xpReward,
      source_type: 'lesson',
      source_id: initialLessons.some((l) => l.id === quest.id) ? quest.id : null,
    });

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
```

### 🔹 Mã JSX
```tsx
{/* Daily Quests / Missions */}
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
```

---

## 4. Badges Collection Showcase

### 🔹 Mô tả
Khối hiển thị 4 huy hiệu tiêu biểu của bé và dẫn tới kho huy hiệu tại `/profile`.

### 🔹 Mã JSX
```tsx
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
```

---

## 5. Classroom Info Card

### 🔹 Mô tả
Thông tin khối lớp, tên lớp học, trường học và Giáo viên chủ nhiệm.

### 🔹 Mã JSX
```tsx
{/* Classroom Info Card */}
<div className="bg-surface-container-lowest rounded-3xl p-6 shadow-soft border border-outline-variant/30 space-y-4">
  <div className="flex items-center justify-between">
    <span className="px-3 py-1 rounded-full bg-primary-container text-on-primary-container text-xs font-bold font-heading">
      {currentChild.grade || 'Tiểu học'}
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
      <span>Trường Tiểu học Kinderly</span>
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
```

---

## 6. Parent Notice & Electronic Contact Book

### 🔹 Mô tả
Khu vực nhận xét hàng ngày từ giáo viên và thực đơn ăn trưa / xế của học sinh bán trú.

### 🔹 Mã JSX
```tsx
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
        <Heart className="w-3.5 h-3.5 fill-current" />
        Lời khen từ Cô giáo
      </span>
      <p className="font-sans text-xs text-on-surface leading-relaxed">
        "Hôm nay bé {currentChild.displayName} ăn hết suất cơm, tích cực giơ tay phát biểu và hoàn thành bài tập rất tốt!"
      </p>
    </div>

    <div className="p-3.5 bg-secondary-container/20 rounded-2xl border border-secondary-container/40 space-y-1">
      <span className="text-[10px] font-sans font-bold text-secondary uppercase tracking-wider flex items-center gap-1">
        <Utensils className="w-3.5 h-3.5" />
        Thực đơn dinh dưỡng
      </span>
      <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
        Trưa: Cơm cá hồi sốt cam, canh rau ngót thịt bằm. Xế: Sữa chua trái cây 🍨.
      </p>
    </div>
  </div>
</div>
```
