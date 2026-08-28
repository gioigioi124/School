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
import { BookOpen, Plus, Sparkles, Video, Clock } from 'lucide-react';

interface ClassItem {
  id: string;
  name: string;
}

interface LessonFormDialogProps {
  classes: ClassItem[];
  defaultClassId?: string;
  onSuccess?: () => void;
}

export function LessonFormDialog({
  classes,
  defaultClassId,
  onSuccess,
}: LessonFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [classId, setClassId] = useState(defaultClassId || (classes[0]?.id || ''));
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState(15);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId) {
      toast.error('Vui lòng chọn lớp học');
      return;
    }
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài học');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Vui lòng đăng nhập lại');

      const { error: insertError } = await supabase
        .from('lessons')
        .insert({
          class_id: classId,
          teacher_id: user.id,
          title,
          description,
          content,
          video_url: videoUrl.trim() || null,
          duration: Number(duration) || 0,
        });

      if (insertError) throw insertError;

      toast.success('Đã tạo bài học mới thành công!');
      setOpen(false);
      setTitle('');
      setDescription('');
      setContent('');
      setVideoUrl('');
      setDuration(15);
      router.refresh();
      onSuccess?.();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Lỗi khi tạo bài học');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary font-heading font-bold text-xs shadow-xs hover:bg-primary/90 transition-all cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>Thêm bài giảng mới</span>
          </button>
        }
      />

      <DialogContent className="max-w-lg bg-surface-container-lowest rounded-xl p-5 sm:p-6 shadow-2xl border border-outline-variant/30">
        <DialogHeader className="space-y-1.5 pb-2 border-b border-outline-variant/20">
          <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container mb-1 shadow-2xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <DialogTitle className="font-heading text-xl font-bold text-on-surface">
            Tạo bài giảng mới
          </DialogTitle>
          <p className="font-sans text-xs text-on-surface-variant">
            Soạn bài học mới kèm video bài giảng, hình ảnh và hướng dẫn chi tiết.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-3">
          <div>
            <label className="block font-heading font-bold text-xs text-on-surface mb-1">
              Lớp học áp dụng
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
              Tiêu đề bài học
            </label>
            <input
              type="text"
              placeholder="VD: Bé nhận biết hình tròn, hình vuông"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-outline-variant/50 bg-surface focus:border-primary focus:ring-0 outline-none font-sans text-xs text-on-surface"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-heading font-bold text-xs text-on-surface mb-1 flex items-center gap-1">
                <Video className="w-3.5 h-3.5 text-primary" />
                <span>Link Video (YouTube / MP4)</span>
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-outline-variant/50 bg-surface focus:border-primary focus:ring-0 outline-none font-sans text-xs text-on-surface"
              />
            </div>

            <div>
              <label className="block font-heading font-bold text-xs text-on-surface mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>Thời lượng (phút)</span>
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-md border border-outline-variant/50 bg-surface focus:border-primary focus:ring-0 outline-none font-sans text-xs text-on-surface"
              />
            </div>
          </div>

          <div>
            <label className="block font-heading font-bold text-xs text-on-surface mb-1">
              Tóm tắt nội dung
            </label>
            <input
              type="text"
              placeholder="Mô tả ngắn gọn mục tiêu của bài học..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-outline-variant/50 bg-surface focus:border-primary focus:ring-0 outline-none font-sans text-xs text-on-surface"
            />
          </div>

          <div>
            <label className="block font-heading font-bold text-xs text-on-surface mb-1">
              Nội dung & Hướng dẫn học tập
            </label>
            <textarea
              rows={3}
              placeholder="Các bước hướng dẫn học sinh hoặc phụ huynh cùng học..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-outline-variant/50 bg-surface focus:border-primary focus:ring-0 outline-none font-sans text-xs text-on-surface resize-none leading-relaxed"
            />
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
              className="px-4 py-1.5 rounded-lg bg-primary text-on-primary font-heading font-bold text-xs hover:bg-primary/90 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Đang lưu...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Tạo bài học</span>
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
