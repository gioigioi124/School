'use client';

import { UserPlus } from 'lucide-react';
import { CreateStudentAccountDialog } from '@/components/students/CreateStudentAccountDialog';

interface AddStudentDialogProps {
  classId: string;
  className: string;
  customTrigger?: React.ReactElement;
}

export function AddStudentDialog({ classId, className, customTrigger }: AddStudentDialogProps) {
  const defaultTrigger = (
    <button
      type="button"
      className="px-5 py-2.5 bg-secondary-container text-on-secondary-container rounded-full font-sans font-bold text-sm hover:brightness-95 transition-all flex items-center gap-2 shadow-xs cursor-pointer"
    >
      <UserPlus className="w-4 h-4" />
      <span>Thêm học sinh</span>
    </button>
  );

  return (
    <CreateStudentAccountDialog
      defaultClassId={classId}
      customTrigger={customTrigger || defaultTrigger}
    />
  );
}
