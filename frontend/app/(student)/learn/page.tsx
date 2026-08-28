import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { StudentLessonsListView } from '@/components/lessons/StudentLessonsListView';

export default async function StudentLearnPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Extract phone number from email
  const userEmail = user.email || '';
  const phoneMatch = userEmail.match(/^(\d+)@/);
  const userPhone = phoneMatch ? phoneMatch[1] : '';

  // Fetch child profiles
  let filterQuery = `id.eq.${user.id}`;
  if (userPhone) {
    filterQuery += `,parent_phone.eq.${userPhone},phone.eq.${userPhone}`;
  }
  if (userEmail) {
    filterQuery += `,email.eq.${userEmail}`;
  }

  const { data: childProfiles } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, parent_phone, parent_name, email')
    .or(filterQuery);

  const profileIds = (childProfiles || []).map((p) => p.id);

  // Fetch enrolled class
  const { data: enrollments } = await supabase
    .from('class_enrollments')
    .select('profile_id, class_id, classes(id, name, grade)')
    .in('profile_id', profileIds.length > 0 ? profileIds : ['00000000-0000-0000-0000-000000000000'])
    .eq('role', 'student');

  const classIds = Array.from(new Set((enrollments || []).map((e: any) => e.class_id)));

  // Fetch lessons with class info
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, class_id, title, description, content, video_url, thumbnail_url, duration, order_index, created_at, classes(name, grade)')
    .in('class_id', classIds.length > 0 ? classIds : ['00000000-0000-0000-0000-000000000000'])
    .order('order_index', { ascending: true });

  // Fetch student progress
  const { data: progresses } = await supabase
    .from('student_progress')
    .select('lesson_id, is_completed, xp_earned')
    .in('student_id', profileIds.length > 0 ? profileIds : ['00000000-0000-0000-0000-000000000000'])
    .eq('is_completed', true);

  const completedLessonMap: Record<string, boolean> = {};
  (progresses || []).forEach((p: any) => {
    completedLessonMap[p.lesson_id] = true;
  });

  return (
    <StudentLessonsListView
      lessons={lessons || []}
      completedLessonMap={completedLessonMap}
      className={(enrollments?.[0]?.classes as any)?.name || 'Lớp Mầm A1'}
    />
  );
}
