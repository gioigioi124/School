'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface DeleteClassDialogProps {
  classId: string;
  className: string;
  redirectToClasses?: boolean;
  customTrigger?: React.ReactElement;
}

export function DeleteClassDialog({
  classId,
  className,
  redirectToClasses = false,
  customTrigger,
}: DeleteClassDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      // Delete class (Cascade in Postgres will clean up enrollments automatically)
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId);

      if (error) throw error;

      toast.success(`Đã xóa lớp học "${className}" thành công!`);
      setOpen(false);

      if (redirectToClasses) {
        router.push('/classes');
      }
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi xóa lớp học.');
    } finally {
      setIsLoading(false);
    }
  };

  const defaultTrigger = (
    <button
      type="button"
      className="p-2 rounded-xl text-on-surface-variant hover:text-destructive hover:bg-error-container/40 transition-all"
      title="Xóa lớp học"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={customTrigger || defaultTrigger} />
      <DialogContent className="sm:max-w-[420px] bg-surface-container-lowest border-outline-variant/30">
        <DialogHeader>
          <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-2">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <DialogTitle className="font-heading text-xl text-on-surface">
            Xác nhận xóa lớp học?
          </DialogTitle>
          <DialogDescription className="font-sans text-on-surface-variant pt-1">
            Bạn có chắc chắn muốn xóa lớp <strong>"{className}"</strong>? Hành động này sẽ hủy phân công và không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-4 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
            className="rounded-full border-outline-variant text-on-surface-variant hover:bg-surface-container"
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={isLoading}
            className="rounded-full bg-destructive text-white hover:bg-destructive/90 font-bold"
          >
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Xóa lớp ngay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
