'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Edit3, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const CLASS_EMOJIS = ['📚', '🎨', '🧸', '🚀', '🦁', '🐯', '🐰', '🐼', '🐬', '🌟', '🌈', '⚽'];

interface EditClassDialogProps {
  classItem: {
    id: string;
    name: string;
    grade?: string | null;
    description?: string | null;
    avatarUrl?: string | null;
  };
  customTrigger?: React.ReactElement;
}

export function EditClassDialog({ classItem, customTrigger }: EditClassDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(classItem.name || '');
  const [grade, setGrade] = useState(classItem.grade || '');
  const [description, setDescription] = useState(classItem.description || '');
  const [selectedEmoji, setSelectedEmoji] = useState(classItem.avatarUrl || CLASS_EMOJIS[0]);
  const router = useRouter();
  const supabase = createClient();

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('classes')
        .update({
          name: name.trim(),
          grade: grade.trim() || null,
          description: description.trim() || null,
          avatar_url: selectedEmoji,
          updated_at: new Date().toISOString(),
        })
        .eq('id', classItem.id);

      if (error) throw error;

      toast.success('Đã cập nhật thông tin lớp học! ✨');
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi cập nhật lớp học.');
    } finally {
      setIsLoading(false);
    }
  };

  const defaultTrigger = (
    <button
      type="button"
      className="p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all"
      title="Chỉnh sửa thông tin lớp"
    >
      <Edit3 className="w-4 h-4" />
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={customTrigger || defaultTrigger} />
      <DialogContent className="sm:max-w-[460px] bg-surface-container-lowest border-outline-variant/30">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl text-on-surface flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-secondary" />
            Chỉnh sửa lớp học
          </DialogTitle>
          <DialogDescription className="font-sans text-on-surface-variant">
            Cập nhật tên, độ tuổi hoặc biểu tượng cho lớp <strong>{classItem.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUpdateClass} className="space-y-4 py-3">
          {/* Emoji / Avatar Selector */}
          <div className="space-y-2">
            <Label className="text-on-surface font-bold text-sm">Biểu tượng lớp học</Label>
            <div className="grid grid-cols-6 gap-2 p-2 bg-surface-container-low rounded-2xl">
              {CLASS_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`text-2xl p-2 rounded-xl transition-all hover:scale-110 flex items-center justify-center ${
                    selectedEmoji === emoji
                      ? 'bg-surface-container-lowest shadow-custom ring-2 ring-primary scale-105'
                      : 'hover:bg-surface-container'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-on-surface font-bold">
              Tên lớp học <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-name"
              placeholder="VD: Lớp Mầm A1"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-outline-variant focus-visible:ring-primary bg-surface-bright"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-grade" className="text-on-surface font-bold">Độ tuổi / Khối</Label>
            <Input
              id="edit-grade"
              placeholder="VD: 3 - 4 tuổi (hoặc Mẫu giáo lớn)"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="border-outline-variant focus-visible:ring-primary bg-surface-bright"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description" className="text-on-surface font-bold">Mô tả lớp học</Label>
            <Input
              id="edit-description"
              placeholder="VD: Lớp tạo hình, âm nhạc & kỹ năng sống"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-outline-variant focus-visible:ring-primary bg-surface-bright"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-full border-outline-variant text-on-surface-variant hover:bg-surface-container"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-full bg-primary text-on-primary hover:bg-primary-dark font-bold"
            >
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
