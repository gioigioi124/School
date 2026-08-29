import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { StudentManagementClient, StudentItem } from '@/components/students/StudentManagementClient';

export default async function StudentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 1. Fetch teacher's enrolled classes
  const { data: teacherEnrollments } = await supabase
    .from('class_enrollments')
    .select('class_id, classes(id, name, grade)')
    .eq('profile_id', user.id)
    .eq('role', 'teacher');

  const teacherClassIds = (teacherEnrollments || [])
    .map((e: any) => e.class_id || e.classId)
    .filter(Boolean);

  // 2. Fetch all student enrollments
  const { data: allStudentEnrollments } = await supabase
    .from('class_enrollments')
    .select(`
      id,
      class_id,
      profile_id,
      classes ( id, name, grade )
    `)
    .eq('role', 'student');

  const enrollmentMap = new Map<string, { classId: string; className: string }>();
  (allStudentEnrollments || []).forEach((e: any) => {
    const cls = Array.isArray(e.classes) ? e.classes[0] : e.classes;
    if (cls) {
      enrollmentMap.set(e.profile_id, {
        classId: cls.id,
        className: cls.name,
      });
    }
  });

  // 3. Fetch all profiles (students)
  const { data: profiles } = await supabase
    .from('profiles')
    .select(`
      id,
      display_name,
      email,
      avatar_url,
      parent_phone,
      parent_name,
      phone,
      created_at
    `)
    .order('created_at', { ascending: false });

  // Filter students:
  // Either has parent_phone/phone/email with kinderly or is enrolled in a class
  const studentProfiles = (profiles || []).filter((p: any) => {
    return Boolean(
      p.parent_phone || 
      p.phone || 
      (p.email && p.email.includes('@kinderly.com')) || 
      enrollmentMap.has(p.id)
    );
  });

  // Build final student list
  const studentList: StudentItem[] = studentProfiles.map((p: any) => {
    const enrollment = enrollmentMap.get(p.id);
    const isUnassigned = !enrollment;

    return {
      id: p.id,
      displayName: p.display_name || p.displayName || 'Bé chưa đặt tên',
      avatarUrl: p.avatar_url || p.avatarUrl || '🐻',
      parentPhone: p.parent_phone || p.parentPhone || p.phone || 'Chưa cập nhật',
      parentName: p.parent_name || p.parentName || 'Phụ huynh',
      className: enrollment ? enrollment.className : 'Chưa phân lớp',
      classId: enrollment ? enrollment.classId : null,
      createdAt: p.created_at || p.createdAt || new Date().toISOString(),
      isUnassigned,
    };
  });

  return (
    <StudentManagementClient
      initialStudents={studentList}
      teacherClassCount={teacherEnrollments?.length || 0}
    />
  );
}
