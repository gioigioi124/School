'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  CalendarDays,
  Clock,
  MapPin,
  Palette,
  FileText,
  Sparkles,
  Plus,
  BookOpen,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export interface ScheduleItem {
  id: string;
  classId: string;
  teacherId?: string | null;
  dayOfWeek: number; // 2..8
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  subject: string;
  room?: string | null;
  color?: string | null;
  description?: string | null;
  teacher?: {
    id: string;
    displayName: string | null;
    email: string;
    avatarUrl: string | null;
  } | null;
}

interface ScheduleSlotDialogProps {
  classId: string;
  classes?: Array<{ id: string; name: string }>;
  initialData?: ScheduleItem | null;
  defaultDayOfWeek?: number;
  defaultStartTime?: string;
  defaultEndTime?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  triggerButton?: React.ReactElement;
}

const SUBJECT_PRESETS = [
  { name: 'Toán học', color: '#3B82F6', icon: '🔢' },
  { name: 'Tiếng Việt', color: '#F97316', icon: '📖' },
  { name: 'Tiếng Anh', color: '#EC4899', icon: '🗣️' },
  { name: 'Khoa học & Tự nhiên', color: '#06B6D4', icon: '🔬' },
  { name: 'Lịch sử & Địa lý', color: '#8B5CF6', icon: '🗺️' },
  { name: 'Tin học & Công nghệ', color: '#3B82F6', icon: '💻' },
  { name: 'Đạo đức & Kỹ năng sống', color: '#10B981', icon: '🌟' },
  { name: 'Mỹ thuật & Sáng tạo', color: '#6366F1', icon: '🎨' },
  { name: 'Âm nhạc', color: '#D946EF', icon: '🎵' },
  { name: 'Giáo dục thể chất', color: '#EF4444', icon: '🏃' },
  { name: 'Hoạt động trải nghiệm', color: '#14B8A6', icon: '🎪' },
  { name: 'Sinh hoạt lớp / Chào cờ', color: '#F59E0B', icon: '🔔' },
];

const COLOR_PALETTE = [
  { name: 'Xanh lá', value: '#10B981' },
  { name: 'Xanh dương', value: '#3B82F6' },
  { name: 'Tím mộng mơ', value: '#8B5CF6' },
  { name: 'Hồng phấn', value: '#EC4899' },
  { name: 'Vàng cam', value: '#F59E0B' },
  { name: 'Đỏ tươi', value: '#EF4444' },
  { name: 'Xanh ngọc', value: '#06B6D4' },
  { name: 'Xanh Indigo', value: '#6366F1' },
  { name: 'Cam đất', value: '#F97316' },
];

const DAY_OPTIONS = [
  { label: 'Thứ Hai', value: 2 },
  { label: 'Thứ Ba', value: 3 },
  { label: 'Thứ Tư', value: 4 },
  { label: 'Thứ Năm', value: 5 },
  { label: 'Thứ Sáu', value: 6 },
  { label: 'Thứ Bảy', value: 7 },
  { label: 'Chủ Nhật', value: 8 },
];

const TIME_PRESETS_MORNING = [
  { start: '08:00', end: '08:45', label: 'Tiết 1 (08:00 - 08:45)' },
  { start: '09:00', end: '09:45', label: 'Tiết 2 (09:00 - 09:45)' },
  { start: '10:00', end: '10:45', label: 'Tiết 3 (10:00 - 10:45)' },
  { start: '10:55', end: '11:40', label: 'Tiết 4 (10:55 - 11:40)' },
];

const TIME_PRESETS_AFTERNOON = [
  { start: '14:00', end: '14:45', label: 'Tiết 1 (14:00 - 14:45)' },
  { start: '14:55', end: '15:40', label: 'Tiết 2 (14:55 - 15:40)' },
  { start: '15:50', end: '16:35', label: 'Tiết 3 (15:50 - 16:35)' },
];

export function ScheduleSlotDialog({
  classId,
  initialData,
  defaultDayOfWeek = 2,
  defaultStartTime = '08:00',
  defaultEndTime = '08:45',
  isOpen,
  onOpenChange,
  onSuccess,
  triggerButton,
}: ScheduleSlotDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState(initialData?.subject || '');
  const [dayOfWeek, setDayOfWeek] = useState<number>(
    initialData?.dayOfWeek || defaultDayOfWeek,
  );
  const [startTime, setStartTime] = useState(
    initialData?.startTime || defaultStartTime,
  );
  const [endTime, setEndTime] = useState(
    initialData?.endTime || defaultEndTime,
  );
  const [room, setRoom] = useState(initialData?.room || '');
  const [color, setColor] = useState(initialData?.color || '#3B82F6');
  const [description, setDescription] = useState(
    initialData?.description || '',
  );

  const router = useRouter();

  useEffect(() => {
    if (initialData) {
      setSubject(initialData.subject);
      setDayOfWeek(initialData.dayOfWeek);
      setStartTime(initialData.startTime);
      setEndTime(initialData.endTime);
      setRoom(initialData.room || '');
      setColor(initialData.color || '#3B82F6');
      setDescription(initialData.description || '');
    } else {
      setSubject('');
      setDayOfWeek(defaultDayOfWeek);
      setStartTime(defaultStartTime);
      setEndTime(defaultEndTime);
      setRoom('');
      setColor('#3B82F6');
      setDescription('');
    }
  }, [initialData, defaultDayOfWeek, defaultStartTime, defaultEndTime, open]);

  const handleSelectPreset = (preset: { name: string; color: string }) => {
    setSubject(preset.name);
    setColor(preset.color);
  };

  const handleSelectTimePreset = (t: { start: string; end: string }) => {
    setStartTime(t.start);
    setEndTime(t.end);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      toast.error('Vui lòng nhập tên môn học hoặc hoạt động');
      return;
    }
    if (!startTime || !endTime) {
      toast.error('Vui lòng chọn khung giờ học');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      if (initialData?.id) {
        const { error: sbError } = await supabase
          .from('schedules')
          .update({
            day_of_week: dayOfWeek,
            start_time: startTime,
            end_time: endTime,
            subject: subject.trim(),
            room: room.trim() || null,
            color: color || '#3B82F6',
            description: description.trim() || null,
          })
          .eq('id', initialData.id);

        if (sbError) throw sbError;
        toast.success('Đã cập nhật tiết học thành công!');
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        const { error: sbError } = await supabase
          .from('schedules')
          .insert({
            class_id: classId,
            teacher_id: user?.id || null,
            day_of_week: dayOfWeek,
            start_time: startTime,
            end_time: endTime,
            subject: subject.trim(),
            room: room.trim() || null,
            color: color || '#3B82F6',
            description: description.trim() || null,
          });

        if (sbError) throw sbError;
        toast.success('Đã thêm tiết học vào thời khóa biểu!');
      }

      setOpen(false);
      router.refresh();
      onSuccess?.();
    } catch (err: any) {
      console.error('Error saving schedule slot:', err);
      toast.error(err.message || 'Lỗi khi lưu thời khóa biểu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {triggerButton && <DialogTrigger render={triggerButton} />}

      <DialogContent className="sm:max-w-xl bg-surface-container-lowest rounded-xl p-5 sm:p-6 shadow-2xl border border-outline-variant/30 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1.5 pb-2 border-b border-outline-variant/20">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: color }}
            >
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="font-heading text-lg sm:text-xl font-bold text-on-surface">
                {initialData?.id ? 'Chỉnh sửa tiết học' : 'Thêm tiết học mới'}
              </DialogTitle>
              <p className="font-sans text-[11px] text-on-surface-variant">
                Thiết lập 3 thông tin chính: Thời gian, Tiết học và Ghi chú.
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-3">
          {/* SECTION 1: THỜI GIAN (SÁNG / CHIỀU) */}
          <div className="p-3 rounded-lg bg-surface-container-low/60 border border-outline-variant/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-heading font-bold text-xs text-on-surface flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>1. Thời gian học *</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant mb-1">
                  Thứ trong tuần
                </label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-md border border-outline-variant/40 bg-surface focus:border-primary focus:ring-0 outline-none font-sans text-xs text-on-surface font-semibold"
                  required
                >
                  {DAY_OPTIONS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant mb-1">
                  Bắt đầu (HH:mm)
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-md border border-outline-variant/40 bg-surface focus:border-primary focus:ring-0 outline-none font-sans text-xs text-on-surface font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant mb-1">
                  Kết thúc (HH:mm)
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-md border border-outline-variant/40 bg-surface focus:border-primary focus:ring-0 outline-none font-sans text-xs text-on-surface font-medium"
                  required
                />
              </div>
            </div>

            {/* Quick Time Presets: Sáng / Chiều */}
            <div className="space-y-1.5 pt-1 border-t border-outline-variant/20 text-[11px]">
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[10px] font-bold text-amber-900 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-300/40">
                  ☀️ Sáng:
                </span>
                {TIME_PRESETS_MORNING.map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => handleSelectTimePreset(t)}
                    className={`text-[10px] px-1.5 py-0.5 rounded-md border transition-all cursor-pointer ${
                      startTime === t.start && endTime === t.end
                        ? 'bg-amber-500 text-white border-amber-600 font-bold'
                        : 'bg-surface hover:bg-surface-container border-outline-variant/40 text-on-surface-variant'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[10px] font-bold text-indigo-900 bg-indigo-500/10 px-1.5 py-0.5 rounded-md border border-indigo-300/40">
                  🌤️ Chiều:
                </span>
                {TIME_PRESETS_AFTERNOON.map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => handleSelectTimePreset(t)}
                    className={`text-[10px] px-1.5 py-0.5 rounded-md border transition-all cursor-pointer ${
                      startTime === t.start && endTime === t.end
                        ? 'bg-indigo-600 text-white border-indigo-700 font-bold'
                        : 'bg-surface hover:bg-surface-container border-outline-variant/40 text-on-surface-variant'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 2: TIẾT HỌC / MÔN HỌC */}
          <div className="p-3 rounded-lg bg-surface-container-low/60 border border-outline-variant/30 space-y-2.5">
            <span className="font-heading font-bold text-xs text-on-surface flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              <span>2. Tiết học / Môn học *</span>
            </span>

            {/* Quick presets */}
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1 rounded-md bg-surface border border-outline-variant/30">
              {SUBJECT_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`text-[11px] px-2 py-1 rounded-md font-sans flex items-center gap-1 transition-all cursor-pointer ${
                    subject === preset.name
                      ? 'bg-primary text-on-primary shadow-xs font-bold'
                      : 'bg-surface-container/60 hover:bg-surface-container text-on-surface-variant'
                  }`}
                >
                  <span>{preset.icon}</span>
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <div className="sm:col-span-3">
                <input
                  type="text"
                  placeholder="VD: Toán học (Số học & Hình học)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border border-outline-variant/40 bg-surface focus:border-primary focus:ring-0 outline-none font-sans text-xs text-on-surface font-semibold"
                  required
                />
              </div>

              <div>
                <div className="flex items-center gap-1 pt-1">
                  {COLOR_PALETTE.slice(0, 6).map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                        color === c.value
                          ? 'scale-125 ring-2 ring-primary ring-offset-1'
                          : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: GHI CHÚ */}
          <div className="p-3 rounded-lg bg-surface-container-low/60 border border-outline-variant/30 space-y-2">
            <span className="font-heading font-bold text-xs text-on-surface flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-secondary" />
              <span>3. Ghi chú (Phòng học / Lời dặn)</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <input
                  type="text"
                  placeholder="Phòng học (VD: Phòng 101, Lab Tin)"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border border-outline-variant/40 bg-surface focus:border-primary focus:ring-0 outline-none font-sans text-xs text-on-surface"
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Ghi chú (VD: Mang theo vở bài tập, thước kẻ)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border border-outline-variant/40 bg-surface focus:border-primary focus:ring-0 outline-none font-sans text-xs text-on-surface"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2 flex items-center justify-end gap-2 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-heading font-bold text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded-lg text-xs font-heading font-bold text-on-primary bg-primary hover:bg-primary/90 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {loading
                ? 'Đang lưu...'
                : initialData?.id
                ? 'Lưu thay đổi'
                : 'Thêm vào thời khóa biểu'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
