'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  BookMarked, 
  Bell, 
  CheckCircle2, 
  Send, 
  MessageSquarePlus, 
  HeartHandshake,
  Calendar,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { StudentChildInfo } from '@/components/student/StudentHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

interface EventItem {
  id: string;
  day: number;
  month: string;
  title: string;
  time: string;
  location: string;
  tag: string;
  tagVariant?: 'default' | 'secondary' | 'warning' | 'info' | 'purple' | 'success';
}

interface CommunicationItem {
  id: string;
  senderName: string;
  senderRole: string;
  senderAvatar: string;
  category: string;
  categoryVariant: 'success' | 'warning' | 'info' | 'purple';
  content: string;
  timestamp: string;
  isUnread?: boolean;
}

const subjectDefaultColors: Record<string, string> = {
  'toán': '#2563EB',
  'tiếng việt': '#EA580C',
  'tiếng anh': '#DB2777',
  'khoa học': '#059669',
  'tự nhiên': '#059669',
  'lịch sử': '#7C3AED',
  'địa lý': '#7C3AED',
  'tin học': '#0284C7',
  'công nghệ': '#0284C7',
  'đạo đức': '#16A34A',
  'mỹ thuật': '#9333EA',
  'âm nhạc': '#E11D48',
  'thể chất': '#0891B2',
  'chào cờ': '#DC2626',
  'sinh hoạt': '#D97706',
  'trải nghiệm': '#D97706',
};

const getSubjectColor = (subject: string, customColor?: string) => {
  if (customColor && customColor.startsWith('#')) return customColor;
  const lower = subject.toLowerCase();
  for (const key in subjectDefaultColors) {
    if (lower.includes(key)) {
      return subjectDefaultColors[key];
    }
  }
  return '#2563EB';
};

const formatRoom = (room?: string) => {
  if (!room) return 'Phòng học chính';
  const clean = room.trim();
  if (clean.toLowerCase().startsWith('phòng')) return clean;
  return `Phòng ${clean}`;
};

export function StudentPortalView({
  childrenList,
  announcements = [],
  schedules = [],
}: StudentPortalViewProps) {
  const currentChild = childrenList[0] || {
    id: 'default',
    displayName: 'Minh',
    avatarUrl: '🎒',
    parentPhone: '',
    className: 'Lớp 1A1',
    grade: 'Lớp 1',
    teacherName: 'Cô Nguyễn Lan',
  };

  // State for Compose Message Modal
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [messageCategory, setMessageCategory] = useState('Lời nhắn gửi cô giáo');
  const [messageContent, setMessageContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Time state for active period tracking
  const [currentMinutes, setCurrentMinutes] = useState<number>(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentMinutes(now.getHours() * 60 + now.getMinutes());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Today Day of Week (2 = Thứ Hai, ..., 8 = Chủ Nhật)
  const now = new Date();
  const currentDayOfWeek = now.getDay() === 0 ? 8 : now.getDay() + 1;
  const dayNamesVN = ['', '', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
  const currentDayLabel = dayNamesVN[currentDayOfWeek] || 'Hôm nay';
  const currentDateString = `${currentDayLabel}, ngày ${now.getDate()} tháng ${now.getMonth() + 1} năm ${now.getFullYear()}`;

  // Fallback realistic primary school schedules
  const fallbackSchedules = [
    { id: 's-1', day_of_week: currentDayOfWeek, start_time: '08:00', end_time: '08:45', subject: 'Toán học (Số học & Luyện tập)', room: '101', color: '#2563EB', description: 'Chuẩn bị que tính và vở bài tập toán' },
    { id: 's-2', day_of_week: currentDayOfWeek, start_time: '09:00', end_time: '09:45', subject: 'Tiếng Việt (Tập đọc & Chính tả)', room: '101', color: '#EA580C', description: 'Luyện đọc bài mới và viết chữ đẹp' },
    { id: 's-3', day_of_week: currentDayOfWeek, start_time: '10:00', end_time: '10:45', subject: 'Đạo đức & Kỹ năng sống', room: '101', color: '#16A34A', description: 'Bài học ứng xử, lòng biết ơn và an toàn trường học' },
    { id: 's-4', day_of_week: currentDayOfWeek, start_time: '14:30', end_time: '15:15', subject: 'Hoạt động trải nghiệm', room: 'Sân trường', color: '#0891B2', description: 'Sinh hoạt câu lạc bộ và làm việc nhóm sáng tạo' },
  ];

  const activeSchedules = schedules.length > 0
    ? schedules.filter((s: any) => s.day_of_week === currentDayOfWeek || s.dayOfWeek === currentDayOfWeek)
    : fallbackSchedules;

  const todaySchedules = (activeSchedules.length > 0 ? activeSchedules : fallbackSchedules)
    .sort((a: any, b: any) => (a.start_time || a.startTime || '').localeCompare(b.start_time || b.startTime || ''));

  // Upcoming School Events (Mock/Database)
  const upcomingEvents: EventItem[] = [
    {
      id: 'ev-1',
      day: 28,
      month: 'tháng 8',
      title: 'Ngày hội đọc sách & Đổi sách cũ',
      time: '08:00 - 11:30',
      location: 'Sân trường',
      tag: 'Sự kiện trường',
      tagVariant: 'info',
    },
    {
      id: 'ev-2',
      day: 2,
      month: 'tháng 9',
      title: 'Hội thi Vui học Tiếng Anh (English Festival)',
      time: '14:00 - 16:30',
      location: 'Hội trường A',
      tag: 'CLB Tiếng Anh',
      tagVariant: 'purple',
    },
    {
      id: 'ev-3',
      day: 5,
      month: 'tháng 9',
      title: 'Lễ Khai giảng năm học mới & Ngày hội bé',
      time: '07:30 - 10:30',
      location: 'Sân lễ trung tâm',
      tag: 'Khai giảng',
      tagVariant: 'warning',
    },
  ];

  // Communication Book Entries (Sổ tay liên lạc)
  const [communicationList, setCommunicationList] = useState<CommunicationItem[]>([
    {
      id: 'cm-1',
      senderName: currentChild.teacherName || 'Cô Nguyễn Lan',
      senderRole: 'Giáo viên chủ nhiệm ' + (currentChild.className || 'Lớp 1A1'),
      senderAvatar: '👩‍🏫',
      category: 'Nhận xét ngày',
      categoryVariant: 'success',
      content: `Hôm nay bé ${currentChild.displayName} rất ngoan, tự giác hoàn thành tốt bài tập Toán và tích cực giơ tay phát biểu xây dựng bài. Bé được cô khen hoa điểm 10 ⭐!`,
      timestamp: 'Hôm nay lúc 11:30',
      isUnread: true,
    },
    {
      id: 'cm-2',
      senderName: currentChild.teacherName || 'Cô Nguyễn Lan',
      senderRole: 'Giáo viên chủ nhiệm',
      senderAvatar: '👩‍🏫',
      category: 'Dặn dò chuẩn bị',
      categoryVariant: 'warning',
      content: 'Ngày mai lớp có tiết Hoạt động trải nghiệm & Mỹ thuật sáng tạo, phụ huynh nhắc bé mang theo bộ bút màu sáp và giấy vẽ A4 nhé.',
      timestamp: 'Hôm qua lúc 16:45',
      isUnread: false,
    },
    {
      id: 'cm-3',
      senderName: currentChild.parentName || 'Mẹ bé Minh',
      senderRole: 'Phụ huynh học sinh',
      senderAvatar: '👨‍👩‍👦',
      category: 'Lời nhắn gia đình',
      categoryVariant: 'purple',
      content: 'Dạ em cảm ơn cô giáo nhiều ạ. Em đã chuẩn bị sẵn hộp bút màu và dặn dò bé cất cẩn thận vào cặp sách rồi ạ!',
      timestamp: 'Hôm qua lúc 18:20',
      isUnread: false,
    },
  ]);

  // Helper to parse time "HH:mm" to minutes
  const parseTimeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  // Check period status (active, completed, upcoming)
  const getPeriodStatus = (startTimeStr: string, endTimeStr: string, index: number) => {
    const startM = parseTimeToMinutes(startTimeStr);
    const endM = parseTimeToMinutes(endTimeStr);

    if (currentMinutes >= startM && currentMinutes <= endM) {
      const progress = Math.min(100, Math.max(0, Math.round(((currentMinutes - startM) / (endM - startM)) * 100)));
      return { status: 'active' as const, label: 'Đang diễn ra', progress };
    }
    if (currentMinutes > endM) {
      return { status: 'completed' as const, label: 'Đã học', progress: 100 };
    }
    return { status: 'upcoming' as const, label: 'Sắp tới', progress: 0 };
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim()) {
      toast.error('Vui lòng nhập nội dung lời nhắn');
      return;
    }

    setIsSubmitting(true);
    sounds.playPop();

    setTimeout(() => {
      const newEntry: CommunicationItem = {
        id: `cm-${Date.now()}`,
        senderName: currentChild.parentName || 'Phụ huynh bé ' + currentChild.displayName,
        senderRole: 'Phụ huynh học sinh',
        senderAvatar: '👨‍👩‍👦',
        category: messageCategory,
        categoryVariant: 'info',
        content: messageContent.trim(),
        timestamp: 'Vừa xong',
        isUnread: false,
      };

      setCommunicationList((prev) => [newEntry, ...prev]);
      setMessageContent('');
      setIsComposeOpen(false);
      setIsSubmitting(false);
      toast.success('Đã gửi lời nhắn đến cô giáo chủ nhiệm!');
    }, 400);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 w-full animate-fade-in font-sans text-slate-800">
      {/* 1. Header (Chào Minh! 👋) */}
      <header className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Chào {currentChild.displayName}! 👋
            </h1>
            <span className="text-xs font-heading font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
              {currentChild.className || 'Lớp 1A1'}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            {currentDateString}
          </p>

          <p className="text-xs text-slate-600 mt-2 font-medium flex items-center gap-1.5 flex-wrap">
            <span>Hôm nay bạn có</span>
            <strong className="text-blue-600 font-bold">{todaySchedules.length} tiết học</strong>
            <span>và</span>
            <strong className="text-amber-600 font-bold">{upcomingEvents.length} sự kiện sắp tới</strong>.
          </p>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          {/* Notification Button */}
          <Link
            href="/diary"
            onClick={() => sounds.playPop()}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors relative cursor-pointer"
            title="Thông báo"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
          </Link>

          {/* Student Avatar / Profile Link */}
          <Link
            href="/profile"
            onClick={() => sounds.playPop()}
            className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-base shadow-2xs group-hover:scale-105 transition-transform">
              {currentChild.avatarUrl || '🎒'}
            </div>
            <div className="text-left hidden xs:block">
              <p className="text-xs font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
                {currentChild.displayName}
              </p>
              <p className="text-[10px] text-slate-500 font-medium leading-none">
                Hồ sơ học sinh
              </p>
            </div>
          </Link>
        </div>
      </header>

      {/* Bento Grid: Thời khóa biểu (65%) + Sự kiện (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 2. Thời khóa biểu hôm nay — 65% width (lg:col-span-8) */}
        <section className="lg:col-span-8 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <CalendarDays className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-base sm:text-lg font-bold text-slate-900">
                    Thời khóa biểu hôm nay
                  </h2>
                  <Badge variant="info" className="text-[10px] px-2 py-0">
                    {todaySchedules.length} tiết
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {currentDayLabel} • Giờ vào lớp: 07:45
                </p>
              </div>
            </div>

            <Link
              href="/schedule"
              onClick={() => sounds.playPop()}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Xem thời khóa biểu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Schedule Period List */}
          <div className="space-y-2.5 flex-1">
            {todaySchedules.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-500 font-medium">Hôm nay không có tiết học chính khóa.</p>
              </div>
            ) : (
              todaySchedules.map((slot: any, idx: number) => {
                const startTime = slot.start_time || slot.startTime || '08:00';
                const endTime = slot.end_time || slot.endTime || '08:45';
                const slotColor = getSubjectColor(slot.subject, slot.color);
                const roomText = formatRoom(slot.room);
                const note = slot.description || 'Chuẩn bị sách vở và đồ dùng học tập';
                const { status, label, progress } = getPeriodStatus(startTime, endTime, idx);

                const isActive = status === 'active';
                const isCompleted = status === 'completed';

                return (
                  <div
                    key={slot.id || idx}
                    className={`rounded-xl p-3 sm:p-3.5 border transition-all relative overflow-hidden flex flex-col justify-between gap-1.5 ${
                      isActive
                        ? 'bg-emerald-50/25 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                        : isCompleted
                        ? 'bg-slate-50/70 border-slate-200/80 opacity-80'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                    style={{
                      borderLeftWidth: '4px',
                      borderLeftColor: slotColor,
                    }}
                  >
                    {/* Period Header: Time + Period Number + Live Status Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span 
                          className="text-[11px] font-bold font-sans px-2 py-0.5 rounded-md flex items-center gap-1"
                          style={{
                            backgroundColor: `${slotColor}15`,
                            color: slotColor,
                          }}
                        >
                          <Clock className="w-3 h-3 shrink-0" />
                          <span>{startTime} - {endTime}</span>
                        </span>

                        <span className="text-[10px] font-heading font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          Tiết {idx + 1}
                        </span>
                      </div>

                      {/* Status Indicator Badge */}
                      {isActive && (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          <span>Đang diễn ra</span>
                        </span>
                      )}

                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Đã học</span>
                        </span>
                      )}

                      {!isActive && !isCompleted && (
                        <span className="text-[10px] font-medium text-slate-500">
                          Sắp tới
                        </span>
                      )}
                    </div>

                    {/* Subject Title & Room info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mt-0.5">
                      <h3 className="font-heading font-bold text-sm text-slate-900 leading-tight">
                        {slot.subject}
                      </h3>
                      <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1 shrink-0">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{roomText}</span>
                      </span>
                    </div>

                    {/* Description / Lesson Note */}
                    <p className="text-[11px] text-slate-500 italic leading-snug line-clamp-1">
                      📝 {note}
                    </p>

                    {/* Active Period Progress Bar */}
                    {isActive && (
                      <div className="w-full bg-emerald-100/80 rounded-full h-1 mt-1 overflow-hidden">
                        <div 
                          className="bg-emerald-600 h-full rounded-full transition-all duration-1000"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* 3. Sự kiện sắp tới — 35% width (lg:col-span-4) */}
        <section className="lg:col-span-4 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-heading text-base sm:text-lg font-bold text-slate-900">
                  Sự kiện sắp tới
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Hoạt động trường & lớp
                </p>
              </div>
            </div>

            <Link
              href="/announcements"
              onClick={() => sounds.playPop()}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Event List with Date Visual Badge */}
          <div className="space-y-3 flex-1">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="p-3 rounded-xl bg-slate-50/80 hover:bg-slate-50 border border-slate-200/80 transition-all flex items-start gap-3 group"
              >
                {/* Date Visual Format: [ 28 / tháng 8 ] */}
                <div className="w-13 sm:w-14 rounded-xl bg-white border border-slate-200 py-1.5 px-1 flex flex-col items-center justify-center text-center shadow-2xs shrink-0 group-hover:border-blue-400 transition-colors">
                  <span className="font-heading font-extrabold text-base sm:text-lg text-slate-900 leading-none">
                    {event.day}
                  </span>
                  <span className="text-[10px] font-sans font-medium text-slate-500 leading-tight mt-0.5">
                    {event.month}
                  </span>
                </div>

                {/* Event Details */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200/60">
                      {event.tag}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-xs sm:text-sm text-slate-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                    {event.title}
                  </h3>

                  <div className="text-[11px] text-slate-500 font-medium flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{event.time}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{event.location}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 4. Sổ tay liên lạc (Digital Communication Book) — 100% width */}
      <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <BookMarked className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-base sm:text-lg font-bold text-slate-900">
                  Sổ tay liên lạc điện tử
                </h2>
                <Badge variant="purple" className="text-[10px] px-2 py-0">
                  Gia đình & Nhà trường
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Cập nhật nhận xét, dặn dò từ giáo viên và trao đổi hai chiều
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                sounds.playPop();
                setIsComposeOpen(true);
              }}
              className="text-xs font-bold gap-1.5 h-8.5 rounded-xl border-slate-300 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 cursor-pointer"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-purple-600" />
              <span>Viết lời nhắn</span>
            </Button>

            <Link
              href="/diary"
              onClick={() => sounds.playPop()}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Digital Communication Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {communicationList.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-50/60 hover:bg-slate-50 border border-slate-200/80 transition-all flex flex-col justify-between space-y-3 relative group"
            >
              {/* Top: Avatar, Sender, Category Tag */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-sm shadow-2xs shrink-0">
                      {item.senderAvatar}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                        {item.senderName}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium truncate leading-tight mt-0.5">
                        {item.senderRole}
                      </p>
                    </div>
                  </div>

                  {item.isUnread && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 ring-2 ring-blue-100 shrink-0" title="Chưa đọc" />
                  )}
                </div>

                <div className="pt-1">
                  <Badge variant={item.categoryVariant} className="text-[10px] px-2 py-0.2 font-semibold">
                    {item.category}
                  </Badge>
                </div>

                {/* Message Content Preview */}
                <p className="text-xs text-slate-700 font-normal leading-relaxed">
                  "{item.content}"
                </p>
              </div>

              {/* Bottom: Timestamp */}
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{item.timestamp}</span>
                </span>
                <span className="text-blue-600 group-hover:underline cursor-pointer">
                  Chi tiết →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Modal / Dialog: Viết lời nhắn gửi giáo viên */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
          <div 
            className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-up"
            role="dialog"
            aria-modal="true"
            aria-labelledby="compose-dialog-title"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <h3 id="compose-dialog-title" className="font-heading font-bold text-base text-slate-900">
                    Viết lời nhắn trong Sổ liên lạc
                  </h3>
                  <p className="text-xs text-slate-500">
                    Gửi trực tiếp đến {currentChild.teacherName || 'Cô giáo chủ nhiệm'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setIsComposeOpen(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-3.5">
              {/* Category selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Chủ đề trao đổi
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Lời nhắn gửi cô giáo',
                    'Dặn dò sức khỏe / thuốc',
                    'Xin phép vắng / đi muộn',
                    'Hỏi bài tập & sách vở',
                  ].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        sounds.playPop();
                        setMessageCategory(cat);
                      }}
                      className={`text-xs p-2 rounded-xl border text-left font-medium transition-all cursor-pointer ${
                        messageCategory === cat
                          ? 'bg-purple-50 text-purple-700 border-purple-300 font-bold ring-1 ring-purple-300'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Content */}
              <div>
                <label htmlFor="msg-content" className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nội dung lời nhắn
                </label>
                <textarea
                  id="msg-content"
                  rows={4}
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Nhập lời nhắn gửi cô giáo (ví dụ: Dạ cô ơi, hôm nay con có mang bình nước riêng và dặn bé uống đủ nước...)"
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-hidden resize-none transition-all placeholder:text-slate-400"
                  required
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsComposeOpen(false)}
                  className="rounded-xl text-xs cursor-pointer"
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="sm"
                  className="rounded-xl text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Đang gửi...' : 'Gửi lời nhắn'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
