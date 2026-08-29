'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  CalendarDays,
  Sparkles,
  Printer,
  LayoutGrid,
  ListFilter,
  School,
  RefreshCw,
  Search,
  BookOpen,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ScheduleItem } from './ScheduleSlotDialog';
import { WeeklyScheduleGrid } from './WeeklyScheduleGrid';
import { DailyScheduleTimeline } from './DailyScheduleTimeline';
import { sounds } from '@/lib/sounds';

interface ClassItem {
  id: string;
  name: string;
  grade?: string | null;
  school?: string | null;
}

interface StudentScheduleClientProps {
  initialClasses: ClassItem[];
  initialSchedules?: ScheduleItem[];
  defaultClassId?: string;
}

export function StudentScheduleClient({
  initialClasses,
  initialSchedules = [],
  defaultClassId,
}: StudentScheduleClientProps) {
  const [classes] = useState<ClassItem[]>(initialClasses);
  const [selectedClassId, setSelectedClassId] = useState<string>(
    defaultClassId || initialClasses[0]?.id || '',
  );
  const [schedules, setSchedules] = useState<ScheduleItem[]>(initialSchedules);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Load schedules for selected class
  const loadSchedules = useCallback(async (classId: string) => {
    if (!classId) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: schedulesData, error } = await supabase
        .from('schedules')
        .select(`
          id,
          class_id,
          teacher_id,
          day_of_week,
          start_time,
          end_time,
          subject,
          room,
          color,
          description,
          created_at,
          updated_at,
          profiles:teacher_id(id, display_name, email, avatar_url),
          classes:class_id(id, name, grade, school)
        `)
        .eq('class_id', classId)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      if (schedulesData) {
        setSchedules(
          schedulesData.map((s: any) => ({
            id: s.id,
            classId: s.class_id,
            teacherId: s.teacher_id,
            dayOfWeek: s.day_of_week,
            startTime: s.start_time,
            endTime: s.end_time,
            subject: s.subject,
            room: s.room,
            color: s.color,
            description: s.description,
            createdAt: s.created_at,
            updatedAt: s.updated_at,
            teacher: s.profiles
              ? {
                  id: s.profiles.id,
                  displayName: s.profiles.display_name,
                  email: s.profiles.email,
                  avatarUrl: s.profiles.avatar_url,
                }
              : null,
            class: s.classes
              ? {
                  id: s.classes.id,
                  name: s.classes.name,
                  grade: s.classes.grade,
                }
              : null,
          })),
        );
      }
    } catch (err: any) {
      console.error('Error fetching schedules for student:', err);
      toast.error('Không thể tải dữ liệu thời khóa biểu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      loadSchedules(selectedClassId);
    }
  }, [selectedClassId, loadSchedules]);

  const selectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  const handlePrint = () => {
    sounds.playPop();
    window.print();
  };

  const handleViewModeChange = (mode: 'grid' | 'timeline') => {
    sounds.playPop();
    setViewMode(mode);
  };

  // Filtered schedules if search
  const filteredSchedules = schedules.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.subject.toLowerCase().includes(q) ||
      (s.room && s.room.toLowerCase().includes(q)) ||
      (s.description && s.description.toLowerCase().includes(q)) ||
      (s.teacher?.displayName && s.teacher.displayName.toLowerCase().includes(q))
    );
  });

  if (classes.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant/40 p-8 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4 text-2xl shadow-2xs">
          🎒
        </div>
        <h2 className="font-heading text-2xl font-bold text-on-surface mb-2">
          Bé chưa được xếp vào lớp học
        </h2>
        <p className="font-sans text-sm text-on-surface-variant max-w-md mx-auto">
          Vui lòng liên hệ với thầy cô giáo chủ nhiệm hoặc nhà trường để được bổ sung vào danh sách lớp nhé!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 pb-16 animate-fade-in print:p-0 print:m-0">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface-container-lowest p-5 sm:p-6 rounded-2xl border border-outline-variant/30 shadow-xs print:hidden">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-on-surface flex items-center gap-2">
              <span>Thời khóa biểu của lớp</span>
              <span className="text-2xl">📅</span>
            </h1>
            {selectedClass?.name && (
              <span className="px-3 py-1 bg-primary-container text-on-primary-container rounded-full text-xs font-bold font-heading flex items-center gap-1 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>{selectedClass.name}</span>
              </span>
            )}
          </div>
          <p className="font-sans text-on-surface-variant text-sm mt-1">
            Lịch học theo tuần giúp bé và phụ huynh chuẩn bị sách vở và đồ dùng chu đáo mỗi ngày.
          </p>
        </div>

        {/* Action Buttons: Print & Refresh */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-heading font-bold text-xs sm:text-sm shadow-xs hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>In thời khóa biểu</span>
          </button>

          <button
            type="button"
            onClick={() => loadSchedules(selectedClassId)}
            disabled={loading}
            title="Làm mới dữ liệu"
            className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer border border-outline-variant/20"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Control Bar: Class Selector, Search, View Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface-container-lowest p-3.5 sm:p-4 rounded-xl border border-outline-variant/30 shadow-xs print:hidden">
        {/* Class Info / Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          {classes.length > 1 ? (
            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
              <span className="text-xs font-bold font-heading text-on-surface-variant shrink-0">
                Lớp học:
              </span>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg border border-outline-variant/50 bg-surface focus:border-primary focus:ring-0 outline-none font-heading font-bold text-xs sm:text-sm text-on-surface shadow-2xs cursor-pointer"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} {cls.grade ? `(${cls.grade})` : ''}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/20 text-xs font-heading font-bold text-on-surface">
              <School className="w-3.5 h-3.5 text-primary" />
              <span>{selectedClass?.name || 'Lớp học của bé'}</span>
              {selectedClass?.grade && (
                <span className="text-on-surface-variant text-[11px] font-normal">
                  • {selectedClass.grade}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Search & View Mode Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
          {/* Quick Search */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Tìm môn học, phòng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-outline-variant/40 bg-surface text-xs text-on-surface outline-none focus:border-primary sm:w-48 transition-all"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-center p-1 rounded-lg bg-surface-container-low border border-outline-variant/30">
            <button
              type="button"
              onClick={() => handleViewModeChange('grid')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-heading font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-surface text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Lưới tuần</span>
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange('timeline')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-heading font-bold transition-all cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-surface text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Timeline ngày</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Heading (Only shows when printing) */}
      <div className="hidden print:block text-center mb-6 pt-4">
        <h1 className="text-2xl font-bold font-heading text-black">
          THỜI KHÓA BIỂU {selectedClass?.name?.toUpperCase()}
        </h1>
        <p className="text-sm text-gray-700 mt-1">
          Trường: {selectedClass?.school || 'Trường Tiểu học Kinderly'} • Năm học 2026 - 2027
        </p>
      </div>

      {/* Main Schedule Content */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center bg-surface-container-lowest rounded-2xl border border-outline-variant/30">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mb-3" />
          <p className="font-heading font-bold text-sm text-on-surface">
            Đang tải dữ liệu thời khóa biểu...
          </p>
        </div>
      ) : filteredSchedules.length === 0 && !searchQuery ? (
        <div className="p-12 text-center bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant/40 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-xl">
            <CalendarDays className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-on-surface">
              Lớp {selectedClass?.name} chưa có thời khóa biểu
            </h3>
            <p className="font-sans text-xs text-on-surface-variant max-w-md mx-auto mt-1">
              Thầy cô giáo chủ nhiệm hiện đang cập nhật lịch học mới. Bé và phụ huynh vui lòng quay lại sau nhé!
            </p>
          </div>
        </div>
      ) : filteredSchedules.length === 0 && searchQuery ? (
        <div className="p-10 text-center bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant/40 space-y-2">
          <BookOpen className="w-8 h-8 text-on-surface-variant/60 mx-auto" />
          <h3 className="font-heading text-sm font-bold text-on-surface">
            Không tìm thấy tiết học nào phù hợp với &quot;{searchQuery}&quot;
          </h3>
          <p className="text-xs text-on-surface-variant">
            Thử tìm kiếm với tên môn học khác xem nhé!
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <WeeklyScheduleGrid
          schedules={filteredSchedules}
          classId={selectedClassId}
          readOnly={true}
        />
      ) : (
        <DailyScheduleTimeline
          schedules={filteredSchedules}
          classId={selectedClassId}
          readOnly={true}
        />
      )}
    </div>
  );
}
