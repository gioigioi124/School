'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle, Trash2 } from 'lucide-react';

interface DeleteScheduleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  slotSubject?: string;
  slotTime?: string;
  loading?: boolean;
}

export function DeleteScheduleDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  slotSubject = 'tiết học này',
  slotTime = '',
  loading = false,
}: DeleteScheduleDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-surface-container-lowest rounded-2xl p-6 sm:p-7 shadow-2xl border border-outline-variant/30">
        <DialogHeader className="space-y-2 pb-1">
          <div className="w-11 h-11 rounded-xl bg-red-100 text-red-700 flex items-center justify-center mb-1 shadow-2xs">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <DialogTitle className="font-heading text-xl font-bold text-on-surface">
            Xác nhận xóa tiết học?
          </DialogTitle>
          <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
            Bạn có chắc chắn muốn xóa tiết học{' '}
            <strong className="text-on-surface font-semibold">
              &ldquo;{slotSubject}&rdquo;
            </strong>{' '}
            {slotTime && <span>(khung giờ {slotTime})</span>} khỏi thời khóa biểu của lớp không? Thao tác này không thể hoàn tác.
          </p>
        </DialogHeader>

        <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/30">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-xl bg-surface-container text-on-surface-variant font-bold text-xs hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            Giữ lại
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-heading font-bold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Đang xóa...</span>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Xóa vĩnh viễn</span>
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
