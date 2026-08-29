import { getServerUser, createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { StudentScheduleClient } from '@/components/schedules/StudentScheduleClient';

export default async function StudentSchedulePage() {
  const user = await getServerUser();

  if (!user) {
    redirect('/login');
  }

  const supabase = await createClient();

  // Extract phone number from email (e.g. 0943663662@kinderly.com -> 0943663662)
  const userEmail = user.email || '';
  const phoneMatch = userEmail.match(/^(\d+)@/);
  const userPhone = phoneMatch ? phoneMatch[1] : '';

  // Fetch all child profiles matching this user
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
  const safeProfileIds = profileIds.length > 0 ? profileIds : [user.id];

  // Fetch classes that the student is enrolled in
  const { data: studentEnrollments } = await supabase
    .from('class_enrollments')
    .select('class_id, classes(id, name, grade, school)')
    .in('profile_id', safeProfileIds)
    .eq('role', 'student');

  let studentClasses: Array<{
    id: string;
    name: string;
    grade?: string | null;
    school?: string | null;
  }> = (studentEnrollments
    ?.map((e: any) => (Array.isArray(e.classes) ? e.classes[0] : e.classes))
    .filter(Boolean) || []) as any[];

  // Deduplicate classes if student has multiple profiles enrolled in the same class
  const classMap = new Map<string, any>();
  studentClasses.forEach((cls) => {
    if (cls?.id && !classMap.has(cls.id)) {
      classMap.set(cls.id, cls);
    }
  });
  studentClasses = Array.from(classMap.values());

  // Fallback: If not enrolled yet, get all classes to provide a default view
  if (studentClasses.length === 0) {
    const { data: allClasses } = await supabase
      .from('classes')
      .select('id, name, grade, school')
      .order('created_at', { ascending: false });

    studentClasses = (allClasses || []) as any[];
  }

  // Fetch initial schedules for the first class if available
  let initialSchedules: any[] = [];
  const defaultClassId = studentClasses[0]?.id;

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
        classes:class_id(id, name, grade, school)
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
    <StudentScheduleClient
      initialClasses={studentClasses}
      initialSchedules={initialSchedules}
      defaultClassId={defaultClassId}
    />
  );
}
