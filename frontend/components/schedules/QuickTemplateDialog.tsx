'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Wand2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  CalendarDays,
  Flame,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface QuickTemplateDialogProps {
  classId: string;
  className?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  triggerButton?: React.ReactElement;
}

const TEMPLATE_HIGHLIGHTS = [
  { day: 'Thứ 2', items: ['Chào cờ', 'Toán học', 'Tiếng Việt', 'Tiếng Anh'] },
  { day: 'Thứ 3', items: ['Toán học', 'Tiếng Việt', 'Tự nhiên & Xã hội', 'Giáo dục thể chất'] },
  { day: 'Thứ 4', items: ['Tiếng Việt', 'Toán học', 'Tin học & CN', 'Âm nhạc'] },
  { day: 'Thứ 5', items: ['Tiếng Anh', 'Tiếng Việt', 'Lịch sử & Địa lý', 'Mỹ thuật'] },
  { day: 'Thứ 6', items: ['Toán học', 'Đạo đức', 'HĐ Trải nghiệm', 'Sinh hoạt lớp'] },
];

const PRIMARY_TEMPLATE_SLOTS = [
  // Thứ 2 (Day 2)
  { day_of_week: 2, start_time: '08:00', end_time: '08:45', subject: 'Chào cờ & Sinh hoạt dưới cờ', color: '#F59E0B', room: 'Sân trường', description: 'Nghi lễ chào cờ đầu tuần và sinh hoạt chủ điểm' },
  { day_of_week: 2, start_time: '09:00', end_time: '09:45', subject: 'Toán học', color: '#3B82F6', room: 'Phòng học chính', description: 'Học bài mới và thực hành giải bài tập toán' },
  { day_of_week: 2, start_time: '10:00', end_time: '10:45', subject: 'Tiếng Việt (Tập đọc)', color: '#F97316', room: 'Phòng học chính', description: 'Đọc văn bản, tìm hiểu nội dung và trả lời câu hỏi' },
  { day_of_week: 2, start_time: '14:30', end_time: '15:15', subject: 'Tiếng Anh Tiểu học', color: '#EC4899', room: 'Phòng Ngoại ngữ', description: 'Phát âm Phonics, từ vựng và đàm thoại nhóm' },

  // Thứ 3 (Day 3)
  { day_of_week: 3, start_time: '08:00', end_time: '08:45', subject: 'Toán học (Luyện tập)', color: '#3B82F6', room: 'Phòng học chính', description: 'Luyện tập giải toán có lời văn và tính nhẩm' },
  { day_of_week: 3, start_time: '09:00', end_time: '09:45', subject: 'Tiếng Việt (Chính tả)', color: '#F97316', room: 'Phòng học chính', description: 'Nghe viết chính tả và luyện viết chữ đẹp' },
  { day_of_week: 3, start_time: '10:00', end_time: '10:45', subject: 'Tự nhiên & Xã hội', color: '#06B6D4', room: 'Phòng học chính', description: 'Tìm hiểu thế giới tự nhiên và hiện tượng khoa học' },
  { day_of_week: 3, start_time: '14:30', end_time: '15:15', subject: 'Giáo dục thể chất', color: '#EF4444', room: 'Sân thể dục', description: 'Tập đội hình đội ngũ và các trò chơi vận động' },

  // Thứ 4 (Day 4)
  { day_of_week: 4, start_time: '08:00', end_time: '08:45', subject: 'Tiếng Việt (Luyện từ & câu)', color: '#F97316', room: 'Phòng học chính', description: 'Mở rộng vốn từ và thực hành ngữ pháp' },
  { day_of_week: 4, start_time: '09:00', end_time: '09:45', subject: 'Toán học', color: '#3B82F6', room: 'Phòng học chính', description: 'Hình học và giải toán ứng dụng thực tế' },
  { day_of_week: 4, start_time: '10:00', end_time: '10:45', subject: 'Tin học & Công nghệ', color: '#3B82F6', room: 'Phòng Tin học', description: 'Làm quen máy tính, gõ phím và tư duy thuật toán' },
  { day_of_week: 4, start_time: '14:30', end_time: '15:15', subject: 'Âm nhạc', color: '#D946EF', room: 'Phòng Âm nhạc', description: 'Học hát bài hát mới và luyện thanh phách' },

  // Thứ 5 (Day 5)
  { day_of_week: 5, start_time: '08:00', end_time: '08:45', subject: 'Tiếng Anh Tiểu học', color: '#EC4899', room: 'Phòng Ngoại ngữ', description: 'Luyện kỹ năng nghe và tương tác trò chơi tiếng Anh' },
  { day_of_week: 5, start_time: '09:00', end_time: '09:45', subject: 'Tiếng Việt (Tập làm văn)', color: '#F97316', room: 'Phòng học chính', description: 'Quan sát, lập dàn ý và viết đoạn văn' },
  { day_of_week: 5, start_time: '10:00', end_time: '10:45', subject: 'Lịch sử & Địa lý', color: '#8B5CF6', room: 'Phòng học chính', description: 'Tìm hiểu danh nhân lịch sử và địa lý quê hương' },
  { day_of_week: 5, start_time: '14:30', end_time: '15:15', subject: 'Mỹ thuật & Sáng tạo', color: '#6366F1', room: 'Phòng Mỹ thuật', description: 'Vẽ tranh theo đề tài và sáng tạo thủ công' },

  // Thứ 6 (Day 6)
  { day_of_week: 6, start_time: '08:00', end_time: '08:45', subject: 'Toán học (Ôn tập tuần)', color: '#3B82F6', room: 'Phòng học chính', description: 'Tổng kết kiến thức và làm bài kiểm tra tuần' },
  { day_of_week: 6, start_time: '09:00', end_time: '09:45', subject: 'Đạo đức & Kỹ năng sống', color: '#10B981', room: 'Phòng học chính', description: 'Bài học ứng xử, lòng biết ơn và an toàn trường học' },
  { day_of_week: 6, start_time: '10:00', end_time: '10:45', subject: 'Hoạt động trải nghiệm', color: '#14B8A6', room: 'Sân trường', description: 'Sinh hoạt câu lạc bộ và dự án học tập nhóm' },
  { day_of_week: 6, start_time: '14:30', end_time: '15:15', subject: 'Sinh hoạt lớp & Tổng kết tuần', color: '#F59E0B', room: 'Phòng học chính', description: 'Sơ kết tuần học, tuyên dương học sinh tiêu biểu' },
];

export function QuickTemplateDialog({
  classId,
  className = 'lớp học',
  isOpen,
  onOpenChange,
  onSuccess,
  triggerButton,
}: QuickTemplateDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const [loading, setLoading] = useState(false);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const router = useRouter();

  const handleApply = async () => {
    if (!classId) {
      toast.error('Vui lòng chọn lớp học trước');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (replaceExisting) {
        const { error: delError } = await supabase
          .from('schedules')
          .delete()
          .eq('class_id', classId);
        if (delError) throw delError;
      }

      const rowsToInsert = PRIMARY_TEMPLATE_SLOTS.map((slot) => ({
        ...slot,
        class_id: classId,
        teacher_id: user?.id || null,
      }));

      const { error: insertError } = await supabase
        .from('schedules')
        .insert(rowsToInsert);

      if (insertError) throw insertError;

      toast.success(
        `Đã nạp thành công ${rowsToInsert.length} tiết học mẫu vào thời khóa biểu!`,
      );
      setOpen(false);
      router.refresh();
      onSuccess?.();
    } catch (err: any) {
      console.error('Error applying template:', err);
      toast.error(err.message || 'Lỗi khi nạp thời khóa biểu mẫu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {triggerButton && <DialogTrigger render={triggerButton} />}

      <DialogContent className="sm:max-w-xl bg-surface-container-lowest rounded-2xl p-6 sm:p-7 shadow-2xl border border-outline-variant/30">
        <DialogHeader className="space-y-2 pb-1">
          <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-1 shadow-2xs">
            <Wand2 className="w-5 h-5" />
          </div>
          <DialogTitle className="font-heading text-xl sm:text-2xl font-bold text-on-surface flex items-center gap-2">
            <span>Nạp thời khóa biểu mẫu chuẩn</span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-amber-200/60 text-amber-800 font-bold font-sans">
              1-Click
            </span>
          </DialogTitle>
          <p className="font-sans text-xs text-on-surface-variant">
            Khởi tạo nhanh khung chương trình 20 tiết chuẩn GDPT Cấp Tiểu Học cho {className}.
          </p>
        </DialogHeader>

        {/* Template Overview */}
        <div className="space-y-3.5 my-2">
          <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-on-surface font-heading">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-primary" />
                <span>Khung phân bổ 20 tiết học (Thứ 2 → Thứ 6)</span>
              </span>
              <span className="text-primary font-bold">4 tiết / ngày</span>
            </div>

            <div className="grid grid-cols-1 gap-1.5 text-xs">
              {TEMPLATE_HIGHLIGHTS.map((t) => (
                <div
                  key={t.day}
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-surface border border-outline-variant/20 overflow-hidden"
                >
                  <span className="font-bold text-primary shrink-0 w-12 text-[11px]">
                    {t.day}:
                  </span>
                  <div className="flex flex-wrap items-center gap-1 text-[11px] text-on-surface-variant min-w-0">
                    {t.items.map((it, idx) => (
                      <span
                        key={it}
                        className="bg-surface-container/60 px-1.5 py-0.5 rounded text-[10px] font-medium text-on-surface shrink-0"
                      >
                        {it}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Replace option toggle */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container/70 border border-outline-variant/30">
            <input
              type="checkbox"
              id="replaceExisting"
              checked={replaceExisting}
              onChange={(e) => setReplaceExisting(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer shrink-0"
            />
            <label
              htmlFor="replaceExisting"
              className="text-xs text-on-surface cursor-pointer leading-relaxed"
            >
              <span className="font-bold text-amber-800 block">
                Xóa các tiết học hiện có trước khi nạp
              </span>
              <span className="text-on-surface-variant text-[11px]">
                Nếu không chọn, các tiết mẫu sẽ được bổ sung tiếp vào thời khóa biểu hiện tại.
              </span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/30">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-4 py-2 rounded-xl bg-surface-container text-on-surface-variant font-bold text-xs hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-heading font-bold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Đang áp dụng...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Áp dụng mẫu ngay</span>
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
