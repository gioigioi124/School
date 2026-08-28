'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  CalendarDays,
  Clock,
  Sparkles,
  Wand2,
  Plus,
  Printer,
  LayoutGrid,
  ListFilter,
  School,
  RefreshCw,
  Search,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ScheduleItem, ScheduleSlotDialog } from './ScheduleSlotDialog';
import { QuickTemplateDialog } from './QuickTemplateDialog';
import { DeleteScheduleDialog } from './DeleteScheduleDialog';
import { WeeklyScheduleGrid } from './WeeklyScheduleGrid';
import { DailyScheduleTimeline } from './DailyScheduleTimeline';

interface ClassItem {
  id: string;
  name: string;
  grade?: string | null;
  school?: string | null;
}

interface TeacherSchedulesClientProps {
  initialClasses: ClassItem[];
  initialSchedules?: ScheduleItem[];
  defaultClassId?: string;
}

export function TeacherSchedulesClient({
  initialClasses,
  initialSchedules = [],
  defaultClassId,
}: TeacherSchedulesClientProps) {
  const [classes] = useState<ClassItem[]>(initialClasses);
  const [selectedClassId, setSelectedClassId] = useState<string>(
    defaultClassId || initialClasses[0]?.id || '',
  );
  const [schedules, setSchedules] = useState<ScheduleItem[]>(initialSchedules);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ScheduleItem | null>(null);
  const [defaultDayForAdd, setDefaultDayForAdd] = useState(2);
  const [defaultStartTimeForAdd, setDefaultStartTimeForAdd] = useState('08:00');
  const [defaultEndTimeForAdd, setDefaultEndTimeForAdd] = useState('08:45');

  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingSlot, setDeletingSlot] = useState<ScheduleItem | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

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
          classes:class_id(id, name, grade)
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
      console.error('Error fetching schedules:', err);
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

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  // Handlers
  const handleOpenAdd = (
    dayOfWeek = 2,
    defaultTime?: { start: string; end: string },
  ) => {
    setEditingSlot(null);
    setDefaultDayForAdd(dayOfWeek);
    if (defaultTime) {
      setDefaultStartTimeForAdd(defaultTime.start);
      setDefaultEndTimeForAdd(defaultTime.end);
    } else {
      setDefaultStartTimeForAdd('08:00');
      setDefaultEndTimeForAdd('08:45');
    }
    setSlotDialogOpen(true);
  };

  const handleOpenEdit = (slot: ScheduleItem) => {
    setEditingSlot(slot);
    setSlotDialogOpen(true);
  };

  const handleOpenDelete = (slot: ScheduleItem) => {
    setDeletingSlot(slot);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSlot) return;
    setDeletingLoading(true);
    try {
      const supabase = createClient();
      const { error: sbError } = await supabase
        .from('schedules')
        .delete()
        .eq('id', deletingSlot.id);
      if (sbError) throw sbError;

      toast.success('Đã xóa tiết học thành công');
      setDeleteDialogOpen(false);
      setDeletingSlot(null);
      loadSchedules(selectedClassId);
    } catch (err: any) {
      console.error('Error deleting slot:', err);
      toast.error('Lỗi khi xóa tiết học');
    } finally {
      setDeletingLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
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
      <div className="max-w-4xl mx-auto py-16 text-center bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant/40 p-8">
        <div className="w-14 h-14 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center mx-auto mb-4">
          <School className="w-7 h-7" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-on-surface mb-2">
          Chưa có lớp học nào
        </h2>
        <p className="font-sans text-sm text-on-surface-variant max-w-md mx-auto mb-6">
          Bạn cần tạo hoặc được phân công vào ít nhất một lớp học để bắt đầu lập thời khóa biểu.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 pb-16 animate-fade-in print:p-0 print:m-0">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface-container-lowest p-5 sm:p-6 rounded-xl border border-outline-variant/30 shadow-xs print:hidden">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-on-surface">
              Thời khóa biểu lớp học
            </h1>
            <span className="px-2.5 py-0.5 bg-primary-container text-on-primary-container rounded-md text-xs font-bold font-heading flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tiêu chuẩn</span>
            </span>
          </div>
          <p className="font-sans text-on-surface-variant text-sm mt-1">
            Thiết lập lịch học theo tuần, phân bổ môn học và quản lý các hoạt động giáo dục Cấp Tiểu Học.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setTemplateDialogOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/60 font-heading font-bold text-xs shadow-2xs transition-all cursor-pointer"
          >
            <Wand2 className="w-4 h-4 text-amber-600" />
            <span>Nạp mẫu 1-Chạm</span>
          </button>

          <button
            onClick={() => handleOpenAdd(2)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary font-heading font-bold text-xs shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm tiết học</span>
          </button>

          <button
            onClick={handlePrint}
            title="In thời khóa biểu"
            className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Control Bar: Class Selector, Search, View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest p-3.5 rounded-lg border border-outline-variant/30 shadow-xs print:hidden">
        {/* Class Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-heading text-on-surface-variant shrink-0">
              Lớp học:
            </span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-1.5 rounded-md border border-outline-variant/50 bg-surface focus:border-primary focus:ring-0 outline-none font-heading font-bold text-sm text-on-surface shadow-2xs cursor-pointer"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} {cls.grade ? `(${cls.grade})` : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => loadSchedules(selectedClassId)}
            disabled={loading}
            title="Làm mới dữ liệu"
            className="p-1.5 rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Search & View Mode Switcher */}
        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Tìm môn học, phòng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-md border border-outline-variant/40 bg-surface text-xs text-on-surface outline-none focus:border-primary w-40 sm:w-48 transition-all"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-md bg-surface-container-low border border-outline-variant/30">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-heading font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-surface text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lưới tuần</span>
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-heading font-bold transition-all cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-surface text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Timeline ngày</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Heading (Only shows on window.print) */}
      <div className="hidden print:block text-center mb-6">
        <h1 className="text-2xl font-bold font-heading">
          THỜI KHÓA BIỂU {selectedClass?.name?.toUpperCase()}
        </h1>
        <p className="text-sm text-gray-600">
          Trường: {selectedClass?.school || 'Kinderly Academy'} • Năm học 2026 - 2027
        </p>
      </div>

      {/* Main Schedule Content */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center bg-surface-container-lowest rounded-xl border border-outline-variant/30">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mb-3" />
          <p className="font-heading font-bold text-sm text-on-surface">
            Đang tải dữ liệu thời khóa biểu...
          </p>
        </div>
      ) : filteredSchedules.length === 0 && !searchQuery ? (
        <div className="p-12 text-center bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant/40 space-y-4">
          <div className="w-14 h-14 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <CalendarDays className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-on-surface">
              Lớp {selectedClass?.name} chưa có thời khóa biểu
            </h3>
            <p className="font-sans text-xs text-on-surface-variant max-w-md mx-auto mt-1">
              Bạn có thể nạp ngay mẫu thời khóa biểu Tiểu học chuẩn 20 tiết hoặc tự tạo từng tiết học riêng.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setTemplateDialogOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-heading font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <Wand2 className="w-4 h-4" />
              <span>Nạp thời khóa biểu mẫu (1-Click)</span>
            </button>
            <button
              onClick={() => handleOpenAdd(2)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-heading font-bold text-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tự thêm từng tiết</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <WeeklyScheduleGrid
          schedules={filteredSchedules}
          classId={selectedClassId}
          onEditSlot={handleOpenEdit}
          onDeleteSlot={handleOpenDelete}
          onAddSlotForDay={handleOpenAdd}
        />
      ) : (
        <DailyScheduleTimeline
          schedules={filteredSchedules}
          classId={selectedClassId}
          onEditSlot={handleOpenEdit}
          onDeleteSlot={handleOpenDelete}
          onAddSlotForDay={handleOpenAdd}
        />
      )}

      {/* Dialogs */}
      <ScheduleSlotDialog
        classId={selectedClassId}
        classes={classes}
        initialData={editingSlot}
        defaultDayOfWeek={defaultDayForAdd}
        defaultStartTime={defaultStartTimeForAdd}
        defaultEndTime={defaultEndTimeForAdd}
        isOpen={slotDialogOpen}
        onOpenChange={setSlotDialogOpen}
        onSuccess={() => loadSchedules(selectedClassId)}
      />

      <QuickTemplateDialog
        classId={selectedClassId}
        className={selectedClass?.name}
        isOpen={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
        onSuccess={() => loadSchedules(selectedClassId)}
      />

      <DeleteScheduleDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        slotSubject={deletingSlot?.subject}
        slotTime={
          deletingSlot
            ? `${deletingSlot.startTime} - ${deletingSlot.endTime}`
            : ''
        }
        loading={deletingLoading}
      />
    </div>
  );
}
