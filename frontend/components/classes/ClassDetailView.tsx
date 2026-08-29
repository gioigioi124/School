'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ArrowRight,
  Users, 
  Cake, 
  DoorClosed, 
  Calendar, 
  Edit3, 
  UserPlus, 
  Trash2, 
  Check, 
  Star, 
  Search, 
  Utensils, 
  Clock, 
  Sparkles,
  BookOpen,
  HelpCircle,
  Award,
  Save,
  Loader2,
  MapPin,
  User
} from 'lucide-react';
import { AddStudentDialog } from '@/components/classes/AddStudentDialog';
import { AwardStudentDialog } from '@/components/classes/AwardStudentDialog';
import { RemoveStudentFromClassDialog } from '@/components/classes/RemoveStudentFromClassDialog';
import { EditClassDialog } from '@/components/classes/EditClassDialog';
import { DeleteClassDialog } from '@/components/classes/DeleteClassDialog';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { createClient } from '@/lib/supabase/client';

export interface ScheduleItem {
  id: string;
  classId: string;
  teacherId?: string | null;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subject: string;
  room?: string | null;
  color?: string | null;
  description?: string | null;
  teacher?: {
    id: string;
    displayName: string | null;
    avatarUrl?: string | null;
  } | null;
}

interface Student {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

interface ClassData {
  id: string;
  name: string;
  description: string | null;
  grade: string | null;
  avatarUrl: string | null;
  school: string | null;
  createdAt: string;
}

interface ClassDetailViewProps {
  classData: ClassData;
  students: Student[];
  teacherName?: string;
  schedules?: ScheduleItem[];
}

const DAYS_INFO = [
  { dayOfWeek: 2, label: 'Thứ Hai', shortLabel: 'T2' },
  { dayOfWeek: 3, label: 'Thứ Ba', shortLabel: 'T3' },
  { dayOfWeek: 4, label: 'Thứ Tư', shortLabel: 'T4' },
  { dayOfWeek: 5, label: 'Thứ Năm', shortLabel: 'T5' },
  { dayOfWeek: 6, label: 'Thứ Sáu', shortLabel: 'T6' },
  { dayOfWeek: 7, label: 'Thứ Bảy', shortLabel: 'T7' },
  { dayOfWeek: 8, label: 'Chủ Nhật', shortLabel: 'CN' },
];

const getTodayDayOfWeek = () => {
  if (typeof window === 'undefined') return 2;
  const day = new Date().getDay();
  return day === 0 ? 8 : day + 1;
};

export function ClassDetailView({ 
  classData, 
  students, 
  teacherName,
  schedules = [] 
}: ClassDetailViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'leave'>>({});
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);
  const supabase = createClient();

  const todayDayOfWeek = getTodayDayOfWeek();
  const [selectedDay, setSelectedDay] = useState(todayDayOfWeek);
  const [currentTime, setCurrentTime] = useState('');

  // Update current time to track ongoing slot
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hh}:${mm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  // Load existing attendance for today
  useEffect(() => {
    const fetchTodayAttendance = async () => {
      try {
        const { data, error } = await supabase
          .from('attendance')
          .select('student_id, status')
          .eq('class_id', classData.id)
          .eq('date', todayStr);

        if (data && data.length > 0) {
          const map: Record<string, 'present' | 'absent' | 'leave'> = {};
          data.forEach((r: any) => {
            map[r.student_id] = r.status as 'present' | 'absent' | 'leave';
          });
          setAttendance(map);
        }
      } catch (err) {
        console.error('Error fetching today attendance:', err);
      }
    };

    fetchTodayAttendance();
  }, [classData.id, todayStr]);

  const filteredStudents = students.filter(s => 
    (s.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleAttendance = (studentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAttendance(prev => {
      const current = prev[studentId] || 'present';
      const next = current === 'present' ? 'absent' : current === 'absent' ? 'leave' : 'present';
      return { ...prev, [studentId]: next };
    });
  };

  const handleSaveAttendance = async () => {
    if (students.length === 0) return;
    setIsSavingAttendance(true);

    const records = students.map((s) => ({
      studentId: s.id,
      status: attendance[s.id] || 'present',
      note: null,
    }));

    try {
      // 1. Try Backend NestJS API
      try {
        await api.post('/attendance/batch', {
          classId: classData.id,
          date: todayStr,
          records,
        });
      } catch (apiErr) {
        // 2. Direct Supabase Upsert Fallback
        const upsertData = records.map((r) => ({
          class_id: classData.id,
          student_id: r.studentId,
          date: todayStr,
          status: r.status,
        }));
        const { error } = await supabase
          .from('attendance')
          .upsert(upsertData, { onConflict: 'class_id,student_id,date' });
        if (error) throw error;
      }

      toast.success('Đã lưu điểm danh hôm nay thành công! 📋', {
        icon: '✅',
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Save attendance error:', error);
      toast.error('Lỗi khi lưu điểm danh.');
    } finally {
      setIsSavingAttendance(false);
    }
  };

  // Count attendance stats
  const presentCount = students.filter(s => (attendance[s.id] || 'present') === 'present').length;
  const absentCount = students.filter(s => attendance[s.id] === 'absent' || attendance[s.id] === 'leave').length;
  const attendanceRate = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 100;

  const currentYear = new Date().getFullYear();

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12 w-full">
      {/* Top Breadcrumb Link */}
      <div>
        <Link 
          href="/classes" 
          className="inline-flex items-center text-sm font-bold text-on-surface-variant hover:text-primary transition-colors gap-2 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Quay lại danh sách lớp học</span>
        </Link>
      </div>

      {/* Header & Action Bar */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          {/* Badges row */}
          {/* Breadcrumb back */}
          <div className="flex items-center gap-2 text-on-surface-variant font-sans text-xs font-bold mb-3">
            <Link 
              href="/classes" 
              className="hover:text-primary transition-colors flex items-center gap-1 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              <span>Lớp học</span>
            </Link>
            <span>/</span>
            <span className="text-primary truncate max-w-[200px]">
              {classData.name}
            </span>
          </div>

          {/* Class Title */}
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-2 flex items-center gap-2.5 sm:gap-3">
            <span className="truncate">{classData.name}</span>
            <span className="text-2xl sm:text-3xl p-1 bg-surface-container-low rounded-xl sm:rounded-2xl shadow-xs border border-outline-variant/30 shrink-0">
              {classData.avatarUrl || '📚'}
            </span>
          </h1>

          {/* Meta specs row */}
          <div className="flex flex-wrap gap-3 sm:gap-6 text-on-surface-variant font-sans text-xs sm:text-sm font-medium">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-outline" />
              <span>{students.length} Học sinh</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Cake className="w-4 h-4 text-outline" />
              <span>{classData.grade || 'Cấp Tiểu học'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <DoorClosed className="w-4 h-4 text-outline" />
              <span>{classData.school ? `Trường ${classData.school}` : 'Phòng 102'}</span>
            </span>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <EditClassDialog
            classItem={classData}
            customTrigger={
              <button
                type="button"
                className="px-4 sm:px-5 py-2 sm:py-2.5 bg-surface-container-lowest border-2 border-surface-container-high text-on-surface-variant rounded-full font-sans font-bold text-xs sm:text-sm hover:bg-surface-container-low hover:text-on-surface transition-all flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Chỉnh sửa</span>
              </button>
            }
          />

          <AddStudentDialog
            classId={classData.id}
            className={classData.name}
          />

          <DeleteClassDialog
            classId={classData.id}
            className={classData.name}
            redirectToClasses={true}
            customTrigger={
              <button
                type="button"
                className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-surface-container-lowest border-2 border-destructive/20 text-destructive rounded-full font-sans font-bold text-xs sm:text-sm hover:bg-error-container/40 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Xóa lớp học"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Xóa</span>
              </button>
            }
          />
        </div>
      </section>

      {/* Main Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Student List & Quick Stats (8 Cols) */}
        <section className="lg:col-span-8 space-y-6 flex flex-col">
          <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-6 shadow-soft border border-outline-variant/30 bento-hover transition-all duration-300 flex-1 flex flex-col justify-between">
            <div>
              {/* Card Header & Search */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-on-surface">
                    Danh sách học sinh
                  </h2>
                  <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                    Nhấp vào học sinh để đổi trạng thái điểm danh hoặc tặng sao ⭐
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-56">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input
                      type="text"
                      placeholder="Tìm tên bé..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 rounded-full border border-outline-variant/40 bg-surface-container-low focus:border-primary outline-none font-sans text-xs text-on-surface transition-colors"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveAttendance}
                    disabled={isSavingAttendance || students.length === 0}
                    className="px-4 py-2 bg-primary text-on-primary rounded-full font-sans font-bold text-xs hover:bg-primary-dark transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {isSavingAttendance ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>Lưu điểm danh</span>
                  </button>
                </div>
              </div>

              {/* Students Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
                {filteredStudents.map((student) => {
                  const status = attendance[student.id] || 'present';
                  const statusColor = status === 'present' 
                    ? 'bg-[#4ade80]' 
                    : status === 'absent' 
                    ? 'bg-[#f87171]' 
                    : 'bg-outline-variant';
                  const statusText = status === 'present' ? 'Có mặt' : status === 'absent' ? 'Vắng phép' : 'Vắng KP';
                  const statusTextColor = status === 'present' ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50 font-bold';

                  return (
                    <div
                      key={student.id}
                      onClick={(e) => toggleAttendance(student.id, e)}
                      className="p-3 sm:p-3.5 rounded-2xl border border-surface-container-high bg-surface-bright flex items-center justify-between gap-2.5 hover:border-primary-container transition-all cursor-pointer group shadow-2xs hover-scale"
                    >
                      {/* Left: Avatar & Info */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {/* Avatar & Status Dot */}
                        <div className="relative shrink-0">
                          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-lg shadow-xs border-2 border-white group-hover:border-primary-container transition-colors">
                            <span>{student.avatarUrl || '🐻'}</span>
                          </div>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 ${statusColor} border-2 border-white rounded-full`}></div>
                        </div>

                        {/* Student Name & Status */}
                        <div className="min-w-0 flex-1">
                          <h3 
                            className="font-sans font-bold text-xs sm:text-[13px] text-on-surface truncate leading-snug tracking-tight"
                            title={student.displayName || 'Bé chưa đặt tên'}
                          >
                            {student.displayName || 'Bé chưa đặt tên'}
                          </h3>
                          <div className="mt-0.5">
                            <span className={`text-[10px] font-sans font-medium px-1.5 py-0.2 rounded-md ${statusTextColor}`}>
                              {statusText}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Quick Actions (Award & Remove) */}
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <AwardStudentDialog
                          studentId={student.id}
                          studentName={student.displayName || 'Học sinh'}
                          avatar={student.avatarUrl || '🐻'}
                          classId={classData.id}
                          customTrigger={
                            <button
                              type="button"
                              className="p-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 transition-all cursor-pointer shadow-2xs hover:scale-105"
                              title="Tặng sao / Khen thưởng"
                            >
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                            </button>
                          }
                        />
                        <RemoveStudentFromClassDialog
                          classId={classData.id}
                          className={classData.name}
                          studentId={student.id}
                          studentName={student.displayName || 'Học sinh'}
                          studentAvatar={student.avatarUrl || '🐻'}
                          customTrigger={
                            <button
                              type="button"
                              className="p-1.5 rounded-xl text-outline-variant hover:text-destructive hover:bg-error-container/30 transition-all cursor-pointer hover:scale-105"
                              title="Xóa bé khỏi lớp"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          }
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Add Student Dotted Card */}
                <AddStudentDialog
                  classId={classData.id}
                  className={classData.name}
                  customTrigger={
                    <button
                      type="button"
                      className="p-3 sm:p-3.5 rounded-2xl border-2 border-dashed border-outline-variant/60 bg-transparent flex items-center justify-center gap-2 hover:border-primary hover:bg-primary-container/10 transition-all cursor-pointer group min-h-[64px] w-full"
                    >
                      <UserPlus className="w-4 h-4 text-outline group-hover:text-primary transition-colors" />
                      <span className="font-sans font-bold text-xs text-outline group-hover:text-primary transition-colors">
                        + Thêm học sinh
                      </span>
                    </button>
                  }
                />
              </div>
            </div>

            {/* Quick Stats Bar under student list */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-outline-variant/20">
              <div className="bg-[#f0fdf4] p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs border border-emerald-100">
                <span className="font-heading text-3xl font-bold text-[#166534] block">{presentCount}</span>
                <span className="text-[11px] font-sans font-bold text-[#166534] opacity-80 uppercase tracking-wider mt-0.5">Có mặt</span>
              </div>

              <div className="bg-[#fef2f2] p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs border border-red-100">
                <span className="font-heading text-3xl font-bold text-[#991b1b] block">{absentCount}</span>
                <span className="text-[11px] font-sans font-bold text-[#991b1b] opacity-80 uppercase tracking-wider mt-0.5">Vắng</span>
              </div>

              <div className="bg-surface-container p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs border border-outline-variant/20">
                <span className="font-heading text-3xl font-bold text-on-surface block">{attendanceRate}%</span>
                <span className="text-[11px] font-sans font-bold text-on-surface-variant opacity-80 uppercase tracking-wider mt-0.5">Tỷ lệ chuyên cần</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Daily Schedule Timeline (4 Cols) */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-soft border border-outline-variant/30 bento-hover transition-all duration-300 h-full flex flex-col justify-between">
            <div>
              {/* Header & Quick Link */}
              <div className="flex flex-col gap-3 mb-5">
                <div className="flex justify-between items-center">
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-on-surface flex items-center gap-2">
                    <Clock className="w-5 h-5 text-secondary shrink-0" />
                    <span className="truncate">
                      {selectedDay === todayDayOfWeek ? 'Lịch trình hôm nay' : `Lịch ${DAYS_INFO.find(d => d.dayOfWeek === selectedDay)?.label}`}
                    </span>
                  </h2>

                  <Link
                    href="/schedules"
                    className="text-xs font-sans font-bold text-primary hover:text-primary-dark transition-colors flex items-center gap-1 shrink-0"
                    title="Mở toàn bộ Thời khóa biểu"
                  >
                    <span>Quản lý TKB</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Day selector pills */}
                <div className="flex items-center gap-1 p-1 bg-surface-container-low rounded-xl border border-outline-variant/30 overflow-x-auto">
                  {DAYS_INFO.map((d) => {
                    const isToday = d.dayOfWeek === todayDayOfWeek;
                    const isSelected = d.dayOfWeek === selectedDay;
                    const count = (schedules || []).filter((s) => s.dayOfWeek === d.dayOfWeek).length;

                    return (
                      <button
                        key={d.dayOfWeek}
                        type="button"
                        onClick={() => setSelectedDay(d.dayOfWeek)}
                        className={`flex-1 min-w-[32px] py-1 px-1 rounded-lg text-xs font-bold transition-all text-center cursor-pointer relative ${
                          isSelected
                            ? 'bg-primary text-on-primary shadow-2xs'
                            : isToday
                            ? 'text-primary bg-primary/10 hover:bg-primary/20'
                            : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                        }`}
                        title={`${d.label}${isToday ? ' (Hôm nay)' : ''} - ${count} tiết`}
                      >
                        <span>{d.shortLabel}</span>
                        {isToday && !isSelected && (
                          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-primary rounded-full"></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Timeline Items */}
              {(() => {
                const daySlots = (schedules || [])
                  .filter((s) => s.dayOfWeek === selectedDay)
                  .sort((a, b) => a.startTime.localeCompare(b.startTime));

                const isViewingToday = selectedDay === todayDayOfWeek;
                const currentDayData = DAYS_INFO.find((d) => d.dayOfWeek === selectedDay) || DAYS_INFO[0];

                if (daySlots.length === 0) {
                  return (
                    <div className="py-10 px-4 text-center rounded-2xl bg-surface-container-low/40 border border-dashed border-outline-variant/40 flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant mb-2.5">
                        <Calendar className="w-5 h-5 opacity-60 text-secondary" />
                      </div>
                      <h4 className="font-heading font-bold text-sm text-on-surface mb-1">
                        Chưa có lịch cho {currentDayData.label}
                      </h4>
                      <p className="font-sans text-xs text-on-surface-variant max-w-xs mb-3.5">
                        {isViewingToday
                          ? 'Hôm nay lớp học không có tiết học nào trong thời khóa biểu.'
                          : `Ngày ${currentDayData.label} chưa được thiết lập tiết học.`}
                      </p>
                      <Link
                        href="/schedules"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-on-primary font-sans font-bold text-xs shadow-xs hover:bg-primary-dark transition-all"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Thêm tiết học vào TKB</span>
                      </Link>
                    </div>
                  );
                }

                return (
                  <div className="relative pl-6 border-l-2 border-surface-container-high space-y-5 pb-2">
                    {daySlots.map((slot) => {
                      const isPast = isViewingToday && Boolean(currentTime && currentTime > slot.endTime);
                      const isActive = isViewingToday && Boolean(currentTime && currentTime >= slot.startTime && currentTime <= slot.endTime);

                      return (
                        <div key={slot.id} className="relative group">
                          {/* Timeline Dot Indicator */}
                          {isPast ? (
                            <div className="absolute -left-[31px] bg-emerald-100 text-emerald-700 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shadow-2xs">
                              <Check className="w-2.5 h-2.5 font-bold" />
                            </div>
                          ) : isActive ? (
                            <div className="absolute -left-[31px] bg-primary w-4 h-4 rounded-full border-2 border-white shadow-[0_0_0_3px_rgba(118,215,196,0.4)] animate-pulse"></div>
                          ) : (
                            <div className="absolute -left-[31px] bg-surface-container-high w-4 h-4 rounded-full border-2 border-white"></div>
                          )}

                          {/* Slot Item */}
                          <div className={`transition-all ${isPast ? 'opacity-75 hover:opacity-100' : ''}`}>
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className={`text-xs font-sans font-bold ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
                                {slot.startTime} - {slot.endTime}
                              </span>
                              {isActive && (
                                <span className="px-2 py-0.2 rounded-full text-[10px] font-sans font-bold bg-primary text-on-primary animate-pulse shadow-2xs">
                                  Đang học
                                </span>
                              )}
                            </div>

                            <div className={`p-3 rounded-xl border transition-all ${
                              isActive
                                ? 'bg-primary-container/25 border-primary/40 shadow-xs'
                                : 'bg-surface-container-low border-outline-variant/30 hover:border-outline-variant/60'
                            }`}>
                              <h4 className="font-sans font-bold text-xs sm:text-sm text-on-surface">
                                {slot.subject}
                              </h4>

                              {(slot.room || slot.teacher?.displayName || slot.description) && (
                                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-on-surface-variant font-sans">
                                  {slot.room && (
                                    <span className="flex items-center gap-1 bg-surface-container px-1.5 py-0.5 rounded-md font-medium">
                                      <MapPin className="w-3 h-3 text-primary" />
                                      <span>Phòng {slot.room}</span>
                                    </span>
                                  )}
                                  {slot.teacher?.displayName && (
                                    <span className="flex items-center gap-1">
                                      <User className="w-3 h-3 text-secondary" />
                                      <span>{slot.teacher.displayName}</span>
                                    </span>
                                  )}
                                  {slot.description && !slot.room && !slot.teacher?.displayName && (
                                    <span className="line-clamp-1 italic text-[11px] opacity-80">{slot.description}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </aside>

        {/* Bottom Section: Teacher Info (12 Cols) */}
        <section className="lg:col-span-12">
          <div className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden bg-surface-container-lowest border border-outline-variant/30 shadow-soft">
            {/* Ambient decorative blobs */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-secondary-container rounded-full opacity-20 blur-2xl pointer-events-none"></div>
            <div className="absolute -left-10 -top-10 w-32 h-32 bg-primary-container rounded-full opacity-20 blur-2xl pointer-events-none"></div>

            <div className="relative z-10">
              <h3 className="font-heading text-2xl font-bold text-on-surface mb-1">
                Thông tin giáo viên
              </h3>
              <p className="font-sans text-xs text-on-surface-variant">
                Đội ngũ giáo viên phụ trách <strong>{classData.name}</strong>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto relative z-10">
              {/* Main Head Teacher */}
              <div className="flex items-center gap-3.5 p-3 bg-white/80 rounded-2xl border border-white hover:bg-white transition-colors flex-1 md:w-64 shadow-2xs">
                <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-heading font-bold text-lg border-2 border-primary-container shrink-0">
                  {teacherName ? teacherName.charAt(0).toUpperCase() : 'M'}
                </div>
                <div>
                  <p className="font-sans font-bold text-sm text-on-surface">
                    {teacherName || 'Cô Nguyễn Lan'}
                  </p>
                  <p className="text-xs text-primary font-bold">
                    Giáo viên chủ nhiệm
                  </p>
                </div>
              </div>

              {/* Assistant Teacher */}
              <div className="flex items-center gap-3.5 p-3 bg-white/80 rounded-2xl border border-white hover:bg-white transition-colors flex-1 md:w-64 shadow-2xs">
                <div className="w-12 h-12 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary-container font-heading font-bold text-lg border-2 border-tertiary-container shrink-0">
                  LM
                </div>
                <div>
                  <p className="font-sans font-bold text-sm text-on-surface">
                    Cô Lê Mai
                  </p>
                  <p className="text-xs text-tertiary font-bold">
                    Giáo viên phụ giảng
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
