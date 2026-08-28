import { createClient } from '@/lib/supabase/server';
import { TeacherSchedulesClient } from '@/components/schedules/TeacherSchedulesClient';

export default async function SchedulesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Fetch classes that the teacher is enrolled in
  const { data: teacherEnrollments } = await supabase
    .from('class_enrollments')
    .select('class_id, classes(id, name, grade, school)')
    .eq('profile_id', user.id)
    .eq('role', 'teacher');

  const { data: allClasses } = await supabase
    .from('classes')
    .select('id, name, grade, school')
    .order('created_at', { ascending: false });

  let teacherClasses: Array<{
    id: string;
    name: string;
    grade?: string | null;
    school?: string | null;
  }> = (teacherEnrollments
    ?.map((e: any) => (Array.isArray(e.classes) ? e.classes[0] : e.classes))
    .filter(Boolean) || []) as any[];

  if (teacherClasses.length === 0) {
    teacherClasses = (allClasses || []) as any[];
  }

  // 2. Fetch initial schedules for the first class if available
  let initialSchedules: any[] = [];
  const defaultClassId = teacherClasses[0]?.id;

  if (defaultClassId) {
    const { data: schedulesData } = await supabase
      .from('schedules')
      .select(`
        id,
        class_id,
        teacher_id,
        day_of_week,
        start_time,
        end_time,
        subject,
        room,
        color,
        description,
        created_at,
        updated_at,
        profiles:teacher_id(id, display_name, email, avatar_url),
        classes:class_id(id, name, grade)
      `)
      .eq('class_id', defaultClassId)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (schedulesData) {
      initialSchedules = schedulesData.map((s: any) => ({
        id: s.id,
        classId: s.class_id,
        teacherId: s.teacher_id,
        dayOfWeek: s.day_of_week,
        startTime: s.start_time,
        endTime: s.end_time,
        subject: s.subject,
        room: s.room,
        color: s.color,
        description: s.description,
        createdAt: s.created_at,
        updatedAt: s.updated_at,
        teacher: s.profiles
          ? {
              id: s.profiles.id,
              displayName: s.profiles.display_name,
              email: s.profiles.email,
              avatarUrl: s.profiles.avatar_url,
            }
          : null,
        class: s.classes
          ? {
              id: s.classes.id,
              name: s.classes.name,
              grade: s.classes.grade,
            }
          : null,
      }));
    }
  }

  return (
    <TeacherSchedulesClient
      initialClasses={teacherClasses}
      initialSchedules={initialSchedules}
      defaultClassId={defaultClassId}
    />
  );
}
