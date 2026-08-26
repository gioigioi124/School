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
    .eq('classId', classId);

  const students = (enrollments || [])
    .filter(e => e.role === 'student' && e.profiles)
    .map(e => (Array.isArray(e.profiles) ? e.profiles[0] : e.profiles) as any);

  // Find teacher name
  const teacherEnrollment = (enrollments || []).find(e => e.role === 'teacher' && e.profiles);
  const teacherProfile = teacherEnrollment?.profiles;
  const teacherName = Array.isArray(teacherProfile) 
    ? teacherProfile[0]?.displayName 
    : (teacherProfile as any)?.displayName;

  return (
    <ClassDetailView 
      classData={classData} 
      students={students} 
      teacherName={teacherName} 
    />
  );
}
