'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { UserMinus, AlertTriangle, Loader2, Info } from 'lucide-react';
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

interface RemoveStudentFromClassDialogProps {
  classId: string;
  className: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  customTrigger?: React.ReactElement;
  onRemoved?: () => void;
}

export function RemoveStudentFromClassDialog({
  classId,
  className,
  studentId,
  studentName,
  studentAvatar = '🐻',
  customTrigger,
  onRemoved,
}: RemoveStudentFromClassDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');
  const router = useRouter();

  const isConfirmed = confirmInput.trim().toLowerCase() === 'xác nhận xóa';

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setConfirmInput('');
    }
  };

  const handleRemove = async () => {
    if (!isConfirmed) return;

    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/students/enroll?classId=${encodeURIComponent(classId)}&studentId=${encodeURIComponent(studentId)}`,
        {
          method: 'DELETE',
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi xóa học sinh khỏi lớp.');
      }

      toast.success(`Đã xóa bé "${studentName}" khỏi lớp "${className}"!`);
      setOpen(false);
      setConfirmInput('');
      if (onRemoved) onRemoved();
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Lỗi khi xóa học sinh khỏi lớp.');
    } finally {
      setIsLoading(false);
    }
  };

  const defaultTrigger = (
    <button
      type="button"
      className="p-1.5 rounded-lg text-on-surface-variant hover:text-destructive hover:bg-error-container/30 transition-all cursor-pointer"
      title={`Xóa bé ${studentName} khỏi lớp`}
    >
      <UserMinus className="w-4 h-4" />
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={customTrigger || defaultTrigger} />
      <DialogContent className="sm:max-w-[440px] bg-surface-container-lowest border-outline-variant/30 rounded-2xl p-6 shadow-xl">
        <DialogHeader>
          <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-2">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <DialogTitle className="font-heading text-xl text-on-surface">
            Xác nhận xóa học sinh khỏi lớp
          </DialogTitle>
          <DialogDescription className="font-sans text-on-surface-variant text-xs pt-1 leading-relaxed">
            Bạn đang yêu cầu rút bé <strong>"{studentName}"</strong> ra khỏi lớp <strong>"{className}"</strong>.
          </DialogDescription>
        </DialogHeader>

        {/* Student Mini Preview */}
        <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 flex items-center gap-3 my-1">
          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-xl shadow-2xs shrink-0">
            <span>{studentAvatar}</span>
          </div>
          <div className="min-w-0">
            <h4 className="font-sans font-bold text-xs text-on-surface truncate">
              {studentName}
            </h4>
            <p className="text-[11px] text-on-surface-variant font-sans">
              Lớp hiện tại: <span className="text-primary font-bold">{className}</span>
            </p>
          </div>
        </div>

        {/* Note */}
        <div className="p-3 bg-secondary-container/30 border border-secondary-container/50 rounded-xl flex items-start gap-2 text-xs text-on-surface-variant font-sans">
          <Info className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
          <p>
            Tài khoản và điểm số của bé <strong>vẫn được bảo toàn</strong>. Bé sẽ được chuyển về <em>Danh sách chờ (Chưa phân lớp)</em> để cô có thể xếp vào lớp khác sau này.
          </p>
        </div>

        {/* Confirmation Input */}
        <div className="space-y-1.5 pt-2">
          <Label htmlFor="confirmDeleteStudent" className="text-xs font-bold text-on-surface">
            Để tránh xóa nhầm, hãy nhập chữ <span className="text-destructive font-mono font-bold">xác nhận xóa</span> vào bên dưới:
          </Label>
          <Input
            id="confirmDeleteStudent"
            placeholder="Nhập: xác nhận xóa"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            className="border-outline-variant focus-visible:ring-destructive bg-surface-bright rounded-xl text-xs font-sans"
            autoComplete="off"
          />
        </div>

        <DialogFooter className="pt-3 gap-2 border-t border-outline-variant/20">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
            className="rounded-xl border-outline-variant text-on-surface-variant hover:bg-surface-container text-xs font-bold"
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            onClick={handleRemove}
            disabled={isLoading || !isConfirmed}
            className="rounded-xl bg-destructive text-white hover:bg-destructive/90 font-bold text-xs shadow-xs disabled:opacity-40"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : null}
            Xóa khỏi lớp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
