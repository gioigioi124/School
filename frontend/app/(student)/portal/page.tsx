import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { StudentPortalView } from '@/components/portal/StudentPortalView';

export default async function PortalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Extract phone number from email (e.g. 0943663662@kinderly.com -> 0943663662)
  const userEmail = user.email || '';
  const phoneMatch = userEmail.match(/^(\d+)@/);
  const userPhone = phoneMatch ? phoneMatch[1] : '';

  // Fetch all child profiles matching this user (by ID, parentPhone, phone, or email)
  let filterQuery = `id.eq.${user.id}`;
  if (userPhone) {
    filterQuery += `,parentPhone.eq.${userPhone},phone.eq.${userPhone}`;
  }
  if (userEmail) {
    filterQuery += `,email.eq.${userEmail}`;
  }

  const { data: childProfiles } = await supabase
    .from('profiles')
    .select('id, displayName, avatarUrl, parentPhone, parentName, email')
    .or(filterQuery);

  const profileIds = (childProfiles || []).map(p => p.id);

  // Fetch class enrollments for these children
  const { data: enrollments } = await supabase
    .from('class_enrollments')
    .select('profileId, classId, classes(id, name, grade)')
    .in('profileId', profileIds.length > 0 ? profileIds : ['00000000-0000-0000-0000-000000000000'])
    .eq('role', 'student');

  const enrollmentMap: Record<string, { className: string; grade?: string; classId?: string }> = {};
  (enrollments || []).forEach(e => {
    const cls = Array.isArray(e.classes) ? e.classes[0] : e.classes;
    if (cls) {
      enrollmentMap[e.profileId] = {
        className: cls.name,
        grade: cls.grade || undefined,
        classId: cls.id,
      };
    }
  });

  const formattedChildren = (childProfiles || []).map(child => ({
    id: child.id,
    displayName: child.displayName || 'Bé yêu',
    avatarUrl: child.avatarUrl || '🐻',
    parentPhone: child.parentPhone || userPhone,
    parentName: child.parentName || 'Phụ huynh',
    className: enrollmentMap[child.id]?.className || 'Lớp Mầm A1',
    grade: enrollmentMap[child.id]?.grade || 'Mẫu giáo',
    classId: enrollmentMap[child.id]?.classId,
    teacherName: 'Cô Nguyễn Lan',
  }));

  // Fallback if no child profile is found yet
  if (formattedChildren.length === 0) {
    formattedChildren.push({
      id: user.id,
      displayName: 'Bé yêu',
      avatarUrl: '🐻',
      parentPhone: userPhone,
      parentName: 'Phụ huynh',
      className: 'Lớp Mầm A1',
      grade: 'Mẫu giáo',
      classId: undefined,
      teacherName: 'Cô Nguyễn Lan',
    });
  }

  return <StudentPortalView childrenList={formattedChildren} />;
}
