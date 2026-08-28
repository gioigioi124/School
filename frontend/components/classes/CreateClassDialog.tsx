'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Plus, PlusCircle, Loader2 } from 'lucide-react';
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

interface CreateClassDialogProps {
  profileId: string;
  variant?: 'primary' | 'secondary' | 'outline';
  customTrigger?: React.ReactElement;
}

export function CreateClassDialog({ profileId, variant = 'primary', customTrigger }: CreateClassDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(CLASS_EMOJIS[0]);
  const router = useRouter();
  const supabase = createClient();

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Insert new class
      const classId = crypto.randomUUID();
      const { data: newClass, error: classError } = await supabase
        .from('classes')
        .insert({
          id: classId,
          name: name.trim(),
          grade: grade.trim() || null,
          description: description.trim() || null,
          avatar_url: selectedEmoji,
        })
        .select()
        .single();

      if (classError) throw classError;

      // 2. Assign current user as teacher of this class
      const { error: enrollError } = await supabase
        .from('class_enrollments')
        .insert({
          id: crypto.randomUUID(),
          class_id: newClass.id,
          profile_id: profileId,
          role: 'teacher',
        });

      if (enrollError) throw enrollError;

      toast.success('Tạo lớp học thành công! 🎉');
      setOpen(false);
      setName('');
      setGrade('');
      setDescription('');
      setSelectedEmoji(CLASS_EMOJIS[0]);
      
      // Refresh the page to show the new class
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi tạo lớp học.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderTrigger = () => {
    if (customTrigger) return customTrigger;

    if (variant === 'secondary') {
      return (
        <button
          type="button"
          className="bg-secondary text-on-secondary py-3 px-6 rounded-DEFAULT font-sans font-bold text-sm btn-3d-secondary transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer hover:brightness-105 active:scale-95"
        >
          <PlusCircle className="w-5 h-5" />
          <span>+ Tạo lớp mới</span>
        </button>
      );
    }

    return (
      <Button className="rounded-full shadow-custom hover:shadow-custom-lg transition-all px-6 py-6 font-bold bg-primary text-on-primary btn-3d">
        <Plus className="w-5 h-5 mr-2" />
        Tạo lớp mới
      </Button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={renderTrigger()} />
      <DialogContent className="sm:max-w-[460px] bg-surface-container-lowest border-outline-variant/30">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl text-on-surface">Tạo lớp học mới</DialogTitle>
          <DialogDescription className="font-sans text-on-surface-variant">
            Điền thông tin cơ bản để bắt đầu quản lý lớp học của bạn.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateClass} className="space-y-4 py-3">
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
            <Label htmlFor="name" className="text-on-surface font-bold">Tên lớp học <span className="text-destructive">*</span></Label>
            <Input
              id="name"
              placeholder="VD: Lớp Mầm A1 (3-4 tuổi)"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-outline-variant focus-visible:ring-primary bg-surface-bright"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="grade" className="text-on-surface font-bold">Độ tuổi / Khối</Label>
            <Input
              id="grade"
              placeholder="VD: 3 - 4 tuổi (hoặc Mẫu giáo lớn)"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="border-outline-variant focus-visible:ring-primary bg-surface-bright"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-on-surface font-bold">Mô tả (Tùy chọn)</Label>
            <Input
              id="description"
              placeholder="VD: Lớp tạo hình, âm nhạc & kỹ năng"
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
              Tạo ngay
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
