'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { 
  School, 
  Loader2, 
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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

interface ClassOption {
  id: string;
  name: string;
  grade: string | null;
}

interface AssignClassDialogProps {
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  parentPhone?: string;
  customTrigger?: React.ReactElement;
  onAssigned?: () => void;
}

export function AssignClassDialog({
  studentId,
  studentName,
  studentAvatar = '🐻',
  parentPhone,
  customTrigger,
  onAssigned,
}: AssignClassDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (open) {
      const fetchClasses = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: teacherEnrollments } = await supabase
          .from('class_enrollments')
          .select('class_id, classes(id, name, grade)')
          .eq('profile_id', user.id)
          .eq('role', 'teacher');

        const { data: allClasses } = await supabase
          .from('classes')
          .select('id, name, grade')
          .order('name');

        const list = (teacherEnrollments?.map(e => Array.isArray(e.classes) ? e.classes[0] : e.classes).filter(Boolean) || allClasses || []) as ClassOption[];
        setClasses(list);

        if (list.length > 0) {
          setSelectedClassId(list[0].id);
        }
      };

      fetchClasses();
    }
  }, [open]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) {
      toast.error('Vui lòng chọn một lớp học.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/students/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedClassId,
          studentIds: [studentId],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi xếp lớp cho bé.');
      }

      const targetClass = classes.find(c => c.id === selectedClassId);
      toast.success(`Đã xếp bé ${studentName} vào lớp ${targetClass?.name || ''}! 🎉`);
      setOpen(false);
      if (onAssigned) onAssigned();
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Lỗi xếp lớp.');
    } finally {
      setIsLoading(false);
    }
  };

  const defaultTrigger = (
    <button
      type="button"
      className="px-3 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-on-primary rounded-lg font-sans font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
    >
      <School className="w-3.5 h-3.5" />
      <span>Xếp lớp</span>
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={customTrigger || defaultTrigger} />
      <DialogContent className="sm:max-w-[420px] bg-surface-container-lowest border-outline-variant/30 rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-1.5 text-primary mb-1">
            <Sparkles className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Phân lớp học sinh</span>
          </div>
          <DialogTitle className="font-heading text-xl text-on-surface">
            Xếp lớp cho học sinh
          </DialogTitle>
          <DialogDescription className="font-sans text-on-surface-variant text-xs">
            Chọn lớp học phụ trách để đưa bé vào danh sách lớp ngay.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAssign} className="space-y-4 py-2">
          {/* Student preview card */}
          <div className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/30 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-secondary-container flex items-center justify-center text-2xl shadow-2xs shrink-0">
              <span>{studentAvatar}</span>
            </div>
            <div className="min-w-0">
              <h4 className="font-sans font-bold text-sm text-on-surface truncate">
                {studentName}
              </h4>
              {parentPhone && (
                <p className="text-xs text-on-surface-variant font-sans">
                  SĐT Phụ huynh: <span className="text-primary font-bold">{parentPhone}</span>
                </p>
              )}
            </div>
          </div>

          {/* Class selector */}
          <div className="space-y-2">
            <Label htmlFor="targetClass" className="text-on-surface font-bold text-xs">
              Chọn lớp học tiếp nhận <span className="text-destructive">*</span>
            </Label>
            {classes.length === 0 ? (
              <div className="p-3 text-center text-xs text-on-surface-variant bg-surface-container rounded-lg">
                Đang tải danh sách lớp học...
              </div>
            ) : (
              <select
                id="targetClass"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/60 bg-surface-bright text-on-surface text-xs focus:border-primary outline-none font-sans font-medium"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.grade ? `(${c.grade})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          <DialogFooter className="pt-3 border-t border-outline-variant/20 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-xl border-outline-variant text-on-surface-variant hover:bg-surface-container text-xs font-bold"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading || classes.length === 0}
              className="rounded-xl bg-primary text-on-primary hover:bg-primary-dark font-bold text-xs shadow-xs"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5 mr-1.5" />}
              Xác nhận xếp lớp
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
