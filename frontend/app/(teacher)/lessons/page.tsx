import { createClient } from '@/lib/supabase/server';
import { LessonFormDialog } from '@/components/lessons/LessonFormDialog';
import { LessonList } from '@/components/lessons/LessonList';
import { BookOpen } from 'lucide-react';

export default async function LessonsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Fetch teacher classes
  const { data: teacherEnrollments } = await supabase
    .from('class_enrollments')
    .select('classId, classes(id, name, grade)')
    .eq('profileId', user.id)
    .eq('role', 'teacher');

  const { data: allClasses } = await supabase
    .from('classes')
    .select('id, name, grade')
    .order('createdAt', { ascending: false });

  let teacherClasses: Array<{ id: string; name: string; grade?: string }> = 
    (teacherEnrollments?.map((e: any) => Array.isArray(e.classes) ? e.classes[0] : e.classes).filter(Boolean) || []);

  if (teacherClasses.length === 0) {
    teacherClasses = (allClasses || []) as any[];
  }

  // 2. Fetch lessons with assignments
  const classIds = teacherClasses.map((c) => c.id);
  const { data: lessons } = await supabase
    .from('lessons')
    .select(`
      id,
      title,
      description,
      content,
      videoUrl,
      video_url,
      duration,
      classId,
      class_id,
      classes(name, grade),
      assignments(id, title, type, xpReward, xp_reward)
    `)
    .in('classId', classIds.length > 0 ? classIds : ['00000000-0000-0000-0000-000000000000'])
    .order('createdAt', { ascending: false });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-3xl font-bold text-on-surface">
              Kho Bài giảng & Nhiệm vụ
            </h1>
            <span className="px-3 py-1 bg-primary-container text-on-primary-container rounded-full text-xs font-bold font-heading">
              Gamified
            </span>
          </div>
          <p className="font-sans text-on-surface-variant text-sm mt-1">
            Quản lý bài giảng video, bài tập và câu đố tích lũy điểm thưởng XP cho học sinh.
          </p>
        </div>

        {teacherClasses.length > 0 && (
          <LessonFormDialog classes={teacherClasses} />
        )}
      </div>

      {/* Lesson List */}
      <LessonList
        initialLessons={(lessons as any[]) || []}
        classes={teacherClasses}
      />
    </div>
  );
}
