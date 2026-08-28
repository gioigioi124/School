import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { StudentDiaryView } from '@/components/student/StudentDiaryView';

export default async function DiaryPage() {
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

  // Fetch student's class enrollment
  const { data: enrollments } = await supabase
    .from('class_enrollments')
    .select('class_id, classes(id, name, grade)')
    .eq('profile_id', studentProfile.id)
    .eq('role', 'student')
    .limit(1);

  const classId = enrollments?.[0]?.class_id;
  const className = (enrollments?.[0]?.classes as any)?.name || 'Lớp Mầm A1';

  // Fetch attendance records for this student
  const { data: attendances } = await supabase
    .from('attendance')
    .select('id, date, status, note')
    .eq('student_id', studentProfile.id)
    .order('date', { ascending: false })
    .limit(14);

  // Fetch announcements for this class
  let announcements: any[] = [];
  if (classId) {
    const { data: annList } = await supabase
      .from('announcements')
      .select('id, title, content, is_important, created_at, teacher_id, teacher:profiles!teacher_id(display_name, avatar_url)')
      .eq('class_id', classId)
      .order('created_at', { ascending: false });
    announcements = annList || [];
  }

  return (
    <StudentDiaryView
      studentName={studentProfile.display_name || 'Bé yêu'}
      className={className}
      classId={classId}
      attendances={attendances || []}
      announcements={announcements}
    />
  );
}
