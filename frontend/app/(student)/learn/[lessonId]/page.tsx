import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { StudentLessonDetailView } from '@/components/lessons/StudentLessonDetailView';

interface PageProps {
  params: Promise<{
    lessonId: string;
  }>;
}

export default async function StudentLearnDetailPage({ params }: PageProps) {
  const { lessonId } = await params;
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

  const studentProfile = childProfiles?.[0] || {
    id: user.id,
    display_name: 'Bé yêu',
    avatar_url: '🐻',
  };

  // Fetch lesson data
  const { data: lesson } = await supabase
    .from('lessons')
    .select('id, class_id, title, description, content, video_url, thumbnail_url, duration, classes(name, grade)')
    .eq('id', lessonId)
    .single();

  // Fetch assignments for this lesson
  const { data: assignments } = await supabase
    .from('assignments')
    .select('id, lesson_id, title, description, type, content, xp_reward, due_date')
    .eq('lesson_id', lessonId);

  // Fetch student progress for this lesson
  const { data: progress } = await supabase
    .from('student_progress')
    .select('is_completed, completed_at, xp_earned')
    .eq('student_id', studentProfile.id)
    .eq('lesson_id', lessonId)
    .maybeSingle();

  // Fetch submissions if any
  const assignmentIds = (assignments || []).map((a) => a.id);
  const { data: submissions } = await supabase
    .from('submissions')
    .select('id, assignment_id, content, grade, feedback, status, xp_earned')
    .eq('student_id', studentProfile.id)
    .in('assignment_id', assignmentIds.length > 0 ? assignmentIds : ['00000000-0000-0000-0000-000000000000']);

  const submissionMap: Record<string, any> = {};
  (submissions || []).forEach((s: any) => {
    submissionMap[s.assignment_id] = s;
  });

  return (
    <StudentLessonDetailView
      lessonId={lessonId}
      lesson={lesson}
      assignments={assignments || []}
      isInitiallyCompleted={!!progress?.is_completed}
      submissionMap={submissionMap}
      studentId={studentProfile.id}
      studentName={studentProfile.display_name || 'Bé yêu'}
    />
  );
}
