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
import { Award, Plus, Sparkles, CheckCircle2, FileQuestion } from 'lucide-react';

interface AssignmentFormDialogProps {
  lessonId: string;
  lessonTitle: string;
  onSuccess?: () => void;
}

export function AssignmentFormDialog({
  lessonId,
  lessonTitle,
  onSuccess,
}: AssignmentFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('quiz');
  const [xpReward, setXpReward] = useState(20);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '']);
  const [correctOptionIndex, setCorrectOptionIndex] = useState(0);

  const router = useRouter();
  const supabase = createClient();

  const handleOptionChange = (index: number, val: string) => {
    setOptions((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Vui lòng nhập tên bài tập');
      return;
    }

    setLoading(true);
    try {
      const contentPayload = {
        question: questionText || title,
        options: options.filter(Boolean),
        correctIndex: correctOptionIndex,
      };

      const { error: insertError } = await supabase.from('assignments').insert({
        lesson_id: lessonId,
        title,
        description,
        type,
        content: contentPayload,
        xp_reward: Number(xpReward) || 20,
      });

      if (insertError) throw insertError;

      toast.success('Đã thêm bài tập/câu đố thành công!');
      setOpen(false);
      setTitle('');
      setDescription('');
      setQuestionText('');
      router.refresh();
      onSuccess?.();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Lỗi khi tạo bài tập');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary-container text-on-secondary-container font-heading font-bold text-xs hover:bg-secondary-container/80 transition-all cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm câu đố (+XP)</span>
          </button>
        }
      />

      <DialogContent className="max-w-md bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-2xl border-none">
        <DialogHeader className="space-y-2 pb-2">
          <div className="w-12 h-12 rounded-2xl bg-secondary-container flex items-center justify-center text-on-secondary-container mb-2">
            <FileQuestion className="w-6 h-6" />
          </div>
          <DialogTitle className="font-heading text-2xl font-bold text-on-surface">
            Thêm bài tập / Câu đố
          </DialogTitle>
          <p className="font-sans text-xs text-on-surface-variant">
            Bài giảng: <strong className="text-on-surface">{lessonTitle}</strong>
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="block font-heading font-bold text-xs text-on-surface mb-1.5">
              Tiêu đề bài tập
            </label>
            <input
              type="text"
              placeholder="VD: Đố vui nhận diện màu sắc"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-outline-variant/40 bg-surface focus:border-secondary focus:ring-0 outline-none font-sans text-sm text-on-surface"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-heading font-bold text-xs text-on-surface mb-1.5">
                Loại bài tập
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 border-outline-variant/40 bg-surface focus:border-secondary focus:ring-0 outline-none font-sans text-xs text-on-surface"
              >
                <option value="quiz">Trắc nghiệm nhanh</option>
                <option value="text">Tự luận / Trả lời ngắn</option>
                <option value="drag_drop">Kéo thả hình ảnh</option>
              </select>
            </div>

            <div>
              <label className="block font-heading font-bold text-xs text-on-surface mb-1.5 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Thưởng XP</span>
              </label>
              <input
                type="number"
                min="5"
                max="100"
                step="5"
                value={xpReward}
                onChange={(e) => setXpReward(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border-2 border-outline-variant/40 bg-surface focus:border-secondary focus:ring-0 outline-none font-sans text-xs text-on-surface"
              />
            </div>
          </div>

          {type === 'quiz' && (
            <div className="space-y-3 p-4 rounded-2xl bg-surface-container border border-outline-variant/30">
              <label className="block font-heading font-bold text-xs text-on-surface">
                Nội dung câu hỏi
              </label>
              <input
                type="text"
                placeholder="VD: Quả táo có màu gì?"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest focus:border-secondary focus:ring-0 outline-none font-sans text-xs text-on-surface"
              />

              <label className="block font-heading font-bold text-xs text-on-surface mt-2">
                Các phương án lựa chọn (Tích chọn đáp án đúng):
              </label>
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={correctOptionIndex === i}
                    onChange={() => setCorrectOptionIndex(i)}
                    className="w-4 h-4 text-secondary focus:ring-secondary cursor-pointer"
                  />
                  <input
                    type="text"
                    placeholder={`Phương án ${i + 1}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-outline-variant/30 bg-surface-container-lowest text-xs font-sans"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-surface-container text-on-surface-variant font-bold text-xs hover:bg-surface-container-high transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-secondary text-on-secondary font-heading font-bold text-xs hover:bg-secondary/90 transition-all shadow-sm flex items-center gap-2"
            >
              {loading ? (
                <span>Đang lưu...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Thêm bài tập</span>
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
