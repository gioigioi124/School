'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit3, Trash2, ArrowRight } from 'lucide-react';
import { EditClassDialog } from '@/components/classes/EditClassDialog';
import { DeleteClassDialog } from '@/components/classes/DeleteClassDialog';

interface ClassCardProps {
  classItem: {
    id: string;
    name: string;
    description: string | null;
    grade: string | null;
    avatarUrl?: string | null;
    avatar_url?: string | null;
    createdAt?: string;
    created_at?: string;
  };
  studentCount?: number;
}

export function ClassCard({ classItem, studentCount = 0 }: ClassCardProps) {
  const router = useRouter();

  // Consistent color theme based on class name/grade
  const isSenior = classItem.grade?.toLowerCase().includes('lớn') || classItem.grade?.includes('5') || classItem.grade?.includes('6');
  const bgBlobColor = isSenior ? 'bg-primary-container' : 'bg-secondary-container';
  const avatarBgColor = isSenior ? 'bg-primary-container text-on-primary-container' : 'bg-secondary-container text-on-secondary-container';
  const avatarIcon = classItem.avatar_url || classItem.avatarUrl || '📚';

  return (
    <div 
      onClick={() => router.push(`/classes/${classItem.id}`)}
      className="bg-surface-container-lowest rounded-2xl p-6 shadow-soft hover-scale border border-outline-variant/30 cursor-pointer group relative overflow-hidden flex flex-col justify-between transition-all duration-200"
    >
      {/* Decorative ambient corner blob */}
      <div className={`absolute top-0 right-0 w-32 h-32 ${bgBlobColor} opacity-15 rounded-bl-full -mr-8 -mt-8 transition-transform duration-300 group-hover:scale-125 pointer-events-none`}></div>

      <div>
        {/* Header Row: Icon on left, Student Count & Quick Actions on right */}
        <div className="flex items-start justify-between gap-3 mb-5 relative z-10">
          <div className={`w-14 h-14 rounded-2xl ${avatarBgColor} flex items-center justify-center text-2xl shadow-xs group-hover:rotate-12 transition-transform duration-200 shrink-0`}>
            <span>{avatarIcon}</span>
          </div>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {/* Student Count Badge */}
            <span className="bg-surface-container-high text-on-surface-variant px-3 py-1.5 rounded-full font-sans font-bold text-xs flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span>{studentCount} Học sinh</span>
            </span>

            {/* Quick Actions Menu */}
            <div className="flex items-center gap-0.5 bg-surface-container-high/80 rounded-full p-0.5 shadow-xs">
              <EditClassDialog
                classItem={classItem}
                customTrigger={
                  <button
                    type="button"
                    className="p-1.5 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-lowest transition-colors cursor-pointer"
                    title="Chỉnh sửa thông tin"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                }
              />
              <DeleteClassDialog
                classId={classItem.id}
                className={classItem.name}
                customTrigger={
                  <button
                    type="button"
                    className="p-1.5 rounded-full text-on-surface-variant hover:text-destructive hover:bg-surface-container-lowest transition-colors cursor-pointer"
                    title="Xóa lớp học"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                }
              />
            </div>
          </div>
        </div>

        {/* Middle Content */}
        <div className="relative z-10">
          <h3 className="font-heading text-xl font-bold text-on-surface group-hover:text-primary transition-colors truncate">
            {classItem.name}
          </h3>
          <p className="font-sans text-sm text-on-surface-variant mt-1 line-clamp-2 min-h-[40px] font-normal leading-relaxed">
            {classItem.description || 'Lớp học thân thiện, tràn ngập niềm vui dành cho các bé.'}
          </p>
        </div>
      </div>

      {/* Footer Row: Grade badge & Arrow link */}
      <div className="mt-5 pt-4 border-t border-outline-variant/20 flex items-center justify-between text-xs font-bold relative z-10">
        <span className="px-2.5 py-1 rounded-lg bg-surface-container-low text-on-surface-variant font-medium">
          {classItem.grade || 'Mầm non'}
        </span>

        <span className="text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          <span>Vào lớp học</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
}
