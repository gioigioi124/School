import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { ClassDetailView } from '@/components/classes/ClassDetailView';

interface PageProps {
  params: Promise<{
    classId: string;
  }>;
}

export default async function ClassDetailPage({ params }: PageProps) {
  const { classId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // 1. Fetch class details
  const { data: classData, error: classError } = await supabase
    .from('classes')
    .select('*')
    .eq('id', classId)
    .single();

  if (classError || !classData) {
    notFound();
  }

  // 2. Fetch enrolled students
  const { data: enrollments } = await supabase
    .from('class_enrollments')
    .select('role, profiles(*)')
    .eq('class_id', classId);

  const students = (enrollments || [])
    .filter(e => e.role === 'student' && e.profiles)
    .map(e => {
      const p = Array.isArray(e.profiles) ? e.profiles[0] : e.profiles;
      return {
        id: p?.id,
        email: p?.email,
        displayName: p?.display_name || p?.displayName || 'Bé chưa đặt tên',
        avatarUrl: p?.avatar_url || p?.avatarUrl || '🐻',
        createdAt: p?.created_at || p?.createdAt,
      };
    });

  // Find teacher name
  const teacherEnrollment = (enrollments || []).find(e => e.role === 'teacher' && e.profiles);
  const teacherProfile = teacherEnrollment?.profiles;
  const t = Array.isArray(teacherProfile) ? teacherProfile[0] : teacherProfile;
  const teacherName = (t as any)?.display_name || (t as any)?.displayName || 'Cô giáo';

  // 3. Fetch class schedules / timetable
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
      profiles:teacher_id(id, display_name, email, avatar_url)
    `)
    .eq('class_id', classId)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true });

  const schedules = (schedulesData || []).map((s: any) => ({
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
    teacher: s.profiles
      ? {
          id: s.profiles.id,
          displayName: s.profiles.display_name,
          avatarUrl: s.profiles.avatar_url,
        }
      : null,
  }));

  return (
    <ClassDetailView 
      classData={{
        id: classData.id,
        name: classData.name,
        description: classData.description,
        grade: classData.grade,
        avatarUrl: classData.avatar_url || classData.avatarUrl || '📚',
        school: classData.school,
        createdAt: classData.created_at || classData.createdAt,
      }} 
      students={students} 
      teacherName={teacherName} 
      schedules={schedules}
    />
  );
}
