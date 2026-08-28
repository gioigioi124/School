'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { MessageSquare, Plus, Sparkles, AlertCircle } from 'lucide-react';

interface ClassItem {
  id: string;
  name: string;
}

interface AnnouncementFormDialogProps {
  classes: ClassItem[];
  defaultClassId?: string;
  onSuccess?: () => void;
}

export function AnnouncementFormDialog({
  classes,
  defaultClassId,
  onSuccess,
}: AnnouncementFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [classId, setClassId] = useState(defaultClassId || (classes[0]?.id || ''));
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId) {
      toast.error('Vui lòng chọn lớp học');
      return;
    }
    if (!title.trim() || !content.trim()) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Vui lòng đăng nhập lại');

      // 1. Insert announcement
      const { data: announcement, error: insertError } = await supabase
        .from('announcements')
        .insert({
          teacher_id: user.id,
          class_id: classId,
          title,
          content,
          is_important: isImportant,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast.success('Đã gửi thông báo thành công!');
      setOpen(false);
      setTitle('');
      setContent('');
      setIsImportant(false);
      router.refresh();
      onSuccess?.();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Lỗi khi gửi thông báo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-on-secondary font-heading font-bold text-xs shadow-xs hover:bg-secondary/90 transition-all cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>Tạo thông báo mới</span>
          </button>
        }
      />

      <DialogContent className="max-w-md bg-surface-container-lowest rounded-xl p-5 sm:p-6 shadow-2xl border border-outline-variant/30">
        <DialogHeader className="space-y-1.5 pb-2 border-b border-outline-variant/20">
          <div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container mb-1 shadow-2xs">
            <MessageSquare className="w-5 h-5" />
          </div>
          <DialogTitle className="font-heading text-xl font-bold text-on-surface">
            Gửi thông báo lớp học
          </DialogTitle>
          <p className="font-sans text-xs text-on-surface-variant">
            Thông báo sẽ được gửi tới toàn bộ học sinh và phụ huynh trong lớp học.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-3">
          <div>
            <label className="block font-heading font-bold text-xs text-on-surface mb-1">
              Lớp nhận thông báo
            </label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-outline-variant/50 bg-surface focus:border-primary focus:ring-0 outline-none font-sans text-xs text-on-surface font-semibold"
              required
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-heading font-bold text-xs text-on-surface mb-1">
              Tiêu đề thông báo
            </label>
            <input
              type="text"
              placeholder="VD: Lịch học bù thứ 7 tuần này"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-outline-variant/50 bg-surface focus:border-primary focus:ring-0 outline-none font-sans text-xs text-on-surface"
              required
            />
          </div>

          <div>
            <label className="block font-heading font-bold text-xs text-on-surface mb-1">
              Nội dung chi tiết
            </label>
            <textarea
              rows={4}
              placeholder="Nhập nội dung thông báo gửi đến quý phụ huynh và các con..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-outline-variant/50 bg-surface focus:border-primary focus:ring-0 outline-none font-sans text-xs text-on-surface resize-none leading-relaxed"
              required
            />
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/30">
            <input
              type="checkbox"
              id="isImportant"
              checked={isImportant}
              onChange={(e) => setIsImportant(e.target.checked)}
              className="w-4 h-4 rounded text-secondary focus:ring-secondary cursor-pointer accent-secondary"
            />
            <label
              htmlFor="isImportant"
              className="text-xs font-bold text-on-surface cursor-pointer flex items-center gap-1.5"
            >
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>Đánh dấu là thông báo QUAN TRỌNG (Gửi thông báo đẩy)</span>
            </label>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3.5 py-1.5 rounded-lg bg-surface-container text-on-surface-variant font-bold text-xs hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded-lg bg-secondary text-on-secondary font-heading font-bold text-xs hover:bg-secondary/90 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Đang gửi...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Đăng thông báo</span>
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
