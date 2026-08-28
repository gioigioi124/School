'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookMarked, 
  ArrowLeft, 
  Heart, 
  Utensils, 
  CalendarCheck, 
  Bell, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { sounds } from '@/lib/sounds';

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  note?: string;
}

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  is_important?: boolean;
  created_at: string;
  teacher?: {
    display_name?: string;
    avatar_url?: string;
  };
}

interface StudentDiaryViewProps {
  studentName: string;
  className: string;
  classId?: string;
  attendances: AttendanceRecord[];
  announcements: AnnouncementItem[];
}

export function StudentDiaryView({
  studentName,
  className,
  classId,
  attendances,
  announcements: initialAnnouncements,
}: StudentDiaryViewProps) {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(initialAnnouncements);
  const supabase = createClient();

  useEffect(() => {
    if (!classId) return;

    const channel = supabase
      .channel(`announcements-${classId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'announcements', filter: `class_id=eq.${classId}` },
        (payload) => {
          const newAnn = payload.new as AnnouncementItem;
          sounds.playStar();
          setAnnouncements((prev) => [newAnn, ...prev]);
          toast.success(`📢 Thông báo mới từ lớp: ${newAnn.title}`, { duration: 5000 });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [classId, supabase]);

  const defaultSampleAnnouncements: AnnouncementItem[] = [
    {
      id: 'ann-1',
      title: 'Kế hoạch dã ngoại Vườn Bách Thảo tuần tới',
      content: 'Thứ Sáu tuần sau nhà trường tổ chức cho các bé đi tham quan vườn bách thảo. Quý phụ huynh chuẩn bị bình nước cá nhân và nón cho bé nhé!',
      is_important: true,
      created_at: new Date().toISOString(),
      teacher: { display_name: 'Cô Nguyễn Lan', avatar_url: '👩‍🏫' },
    },
    {
      id: 'ann-2',
      title: 'Nhắc nhở nộp bài vẽ Chú Bướm rực rỡ',
      content: 'Các bé hãy hoàn thành bức tranh tô màu trước 17h00 hôm nay để cô giáo chấm điểm và dán vào góc trưng bày của lớp nhé!',
      is_important: false,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      teacher: { display_name: 'Cô Nguyễn Lan', avatar_url: '👩‍🏫' },
    },
  ];

  const displayAnnouncements = announcements.length > 0 ? announcements : defaultSampleAnnouncements;

  const nutritionMenu = [
    { meal: 'Bữa Sáng (07:45)', dish: 'Phở bò Hà Nội tươi ngon, sữa bắp nếp non 🌽', icon: '🥣' },
    { meal: 'Bữa Trưa (11:15)', dish: 'Cơm cá hồi Na-uy sốt cam, canh rau ngót thịt bằm, thanh long đỏ 🍊', icon: '🍱' },
    { meal: 'Bữa Xế (14:30)', dish: 'Sữa chua dâu tây hoa quả dầm, bánh quy yến mạch 🍨', icon: '🍓' },
  ];

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in pb-12 font-sans">
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
            <span>Sổ Liên Lạc Điện Tử</span>
            <span className="text-3xl">📖</span>
          </h1>
          <p className="font-sans text-xs sm:text-sm text-on-surface-variant mt-1">
            Cập nhật tình hình học tập, dinh dưỡng và thông báo từ {className}.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-heading font-bold shadow-2xs">
          <CalendarCheck className="w-4 h-4 text-emerald-600" />
          <span>Hôm nay: Có mặt chuyên cần</span>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Teacher Praise & Nutrition Menu (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Daily Feedback from Teacher */}
          <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-soft border border-outline-variant/30 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg text-on-surface flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                <span>Lời Khen & Nhận Xét Của Cô Giáo</span>
              </h3>
              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                Hôm nay
              </span>
            </div>

            <div className="p-4 bg-primary-container/20 rounded-2xl border border-primary-container/30 space-y-2">
              <p className="font-sans text-sm text-on-surface leading-relaxed italic">
                "Hôm nay bé <strong>{studentName}</strong> rất ngoan, ăn hết suất cơm trưa ngon lành, chủ động cất dọn đồ chơi gọn gàng và vẽ tranh hoa hướng dương rất rực rỡ!"
              </p>
              <div className="flex items-center justify-between text-xs text-on-surface-variant pt-2 border-t border-primary-container/20">
                <span className="font-bold text-primary">Cô Nguyễn Lan (Chủ nhiệm)</span>
                <span>⭐ Bé nhận được 1 Bông hoa điểm 10</span>
              </div>
            </div>
          </div>

          {/* Nutrition Menu */}
          <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-soft border border-outline-variant/30 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg text-on-surface flex items-center gap-2">
                <Utensils className="w-5 h-5 text-amber-500" />
                <span>Thực Đơn Dinh Dưỡng Hôm Nay</span>
              </h3>
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
                Bếp ăn Kinderly
              </span>
            </div>

            <div className="space-y-3">
              {nutritionMenu.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-surface-bright border border-outline-variant/30 flex items-start gap-3.5"
                >
                  <div className="w-10 h-10 rounded-2xl bg-secondary-container flex items-center justify-center text-xl shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h5 className="font-heading font-bold text-xs text-primary uppercase tracking-wider">
                      {item.meal}
                    </h5>
                    <p className="font-sans text-xs text-on-surface mt-0.5 leading-relaxed font-medium">
                      {item.dish}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Attendance History & Announcements (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Attendance Tracker */}
          <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-soft border border-outline-variant/30 space-y-4">
            <h3 className="font-heading font-bold text-base text-on-surface flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-emerald-600" />
              <span>Chuyên Cần & Điểm Danh Gần Đây</span>
            </h3>

            <div className="space-y-2">
              {attendances.length > 0 ? (
                attendances.slice(0, 5).map((att) => (
                  <div
                    key={att.id}
                    className="p-3 rounded-2xl bg-surface-bright border border-outline-variant/20 flex items-center justify-between text-xs"
                  >
                    <span className="font-sans font-medium text-on-surface">
                      {new Date(att.date).toLocaleDateString('vi-VN', {
                        weekday: 'short',
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-heading font-bold text-[11px] flex items-center gap-1 ${
                        att.status === 'present'
                          ? 'bg-emerald-100 text-emerald-800'
                          : att.status === 'late'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{att.status === 'present' ? 'Có mặt' : att.status === 'late' ? 'Đến muộn' : 'Vắng'}</span>
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-on-surface-variant bg-surface-container-low rounded-2xl">
                  Bé luôn đi học đầy đủ và đúng giờ! 🌟
                </div>
              )}
            </div>
          </div>

          {/* Announcements Feed */}
          <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-soft border border-outline-variant/30 space-y-4">
            <h3 className="font-heading font-bold text-base text-on-surface flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <span>Bảng Tin Lớp Học</span>
            </h3>

            <div className="space-y-3">
              {displayAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  className={`p-4 rounded-2xl border transition-all space-y-2 ${
                    ann.is_important
                      ? 'bg-rose-50/40 border-rose-200 shadow-2xs'
                      : 'bg-surface-bright border-outline-variant/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="font-heading font-bold text-xs text-on-surface">
                      {ann.title}
                    </h5>
                    {ann.is_important && (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full text-[10px] font-bold shrink-0">
                        Quan trọng
                      </span>
                    )}
                  </div>
                  <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                    {ann.content}
                  </p>
                  <div className="text-[10px] text-outline font-medium flex items-center gap-1 pt-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(ann.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
