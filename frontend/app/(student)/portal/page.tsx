import { getServerUser, createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { StudentPortalView } from '@/components/portal/StudentPortalView';

export default async function PortalPage() {
  const user = await getServerUser();

  if (!user) {
    redirect('/login');
  }

  const supabase = await createClient();

  // Extract phone number from email (e.g. 0943663662@kinderly.com -> 0943663662)
  const userEmail = user.email || '';
  const phoneMatch = userEmail.match(/^(\d+)@/);
  const userPhone = phoneMatch ? phoneMatch[1] : '';

  // Fetch all child profiles matching this user (by ID, parentPhone, phone, or email)
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
  const safeProfileIds = profileIds.length > 0 ? profileIds : ['00000000-0000-0000-0000-000000000000'];

  // Fetch enrollments, user_xp and progresses in parallel
  const [enrollmentsRes, xpDataRes, progressesRes] = await Promise.all([
    supabase
      .from('class_enrollments')
      .select('profile_id, class_id, classes(id, name, grade)')
      .in('profile_id', safeProfileIds)
      .eq('role', 'student'),
    supabase
      .from('user_xp')
      .select('student_id, total_xp, current_level, total_stars')
      .in('student_id', safeProfileIds),
    supabase
      .from('student_progress')
      .select('student_id, lesson_id, is_completed')
      .in('student_id', safeProfileIds),
  ]);

  const enrollments = enrollmentsRes.data;
  const xpData = xpDataRes.data;
  const progresses = progressesRes.data;

  const enrollmentMap: Record<string, { className: string; grade?: string; classId?: string }> = {};
  const classIds: string[] = [];
  (enrollments || []).forEach((e: any) => {
    const pid = e.profile_id || e.profileId;
    const cls = Array.isArray(e.classes) ? e.classes[0] : e.classes;
    if (cls) {
      enrollmentMap[pid] = {
        className: cls.name,
        grade: cls.grade || undefined,
        classId: cls.id,
      };
      if (!classIds.includes(cls.id)) {
        classIds.push(cls.id);
      }
    }
  });

  const xpMap: Record<string, { totalXp: number; currentLevel: number; totalStars: number }> = {};
  (xpData || []).forEach((x: any) => {
    xpMap[x.student_id] = {
      totalXp: x.total_xp || 0,
      currentLevel: x.current_level || 1,
      totalStars: x.total_stars || 0,
    };
  });

  // Fetch real lessons from enrolled classes
  const { data: realLessons } = await supabase
    .from('lessons')
    .select('id, class_id, title, description, duration, thumbnail_url, order_index')
    .in('class_id', classIds.length > 0 ? classIds : ['00000000-0000-0000-0000-000000000000'])
    .order('order_index', { ascending: true })
    .limit(8);

  const progressSet = new Set(
    (progresses || []).filter((p: any) => p.is_completed).map((p: any) => `${p.student_id}_${p.lesson_id}`)
  );

  // Fetch badges
  const { data: allBadges } = await supabase.from('badges').select('*');
  const { data: userBadges } = await supabase
    .from('user_badges')
    .select('student_id, badge_id, unlocked_at')
    .in('student_id', profileIds.length > 0 ? profileIds : ['00000000-0000-0000-0000-000000000000']);

  const userBadgeMap: Record<string, string[]> = {};
  (userBadges || []).forEach((ub: any) => {
    if (!userBadgeMap[ub.student_id]) userBadgeMap[ub.student_id] = [];
    userBadgeMap[ub.student_id].push(ub.badge_id);
  });

  // Fetch class schedules for enrolled classes
  const { data: rawSchedules } = await supabase
    .from('schedules')
    .select('id, class_id, day_of_week, start_time, end_time, subject, room, color, description, classes(name, grade), profiles:teacher_id(display_name)')
    .in('class_id', classIds.length > 0 ? classIds : ['00000000-0000-0000-0000-000000000000'])
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true });

  // Fetch recent announcements
  const { data: announcements } = await supabase
    .from('announcements')
    .select('id, title, content, is_important, created_at, class_id')
    .in('class_id', classIds.length > 0 ? classIds : ['00000000-0000-0000-0000-000000000000'])
    .order('created_at', { ascending: false })
    .limit(3);

  const formattedChildren = (childProfiles || []).map((child) => ({
    id: child.id,
    displayName: (child as any).display_name || (child as any).displayName || 'Bé yêu',
    avatarUrl: (child as any).avatar_url || (child as any).avatarUrl || '🎒',
    parentPhone: (child as any).parent_phone || (child as any).parentPhone || userPhone,
    parentName: (child as any).parent_name || (child as any).parentName || 'Phụ huynh',
    className: enrollmentMap[child.id]?.className || 'Lớp 1A1',
    grade: enrollmentMap[child.id]?.grade || 'Lớp 1',
    classId: enrollmentMap[child.id]?.classId,
    teacherName: 'Cô Nguyễn Lan',
    totalXp: xpMap[child.id]?.totalXp ?? 150,
    currentLevel: xpMap[child.id]?.currentLevel ?? 1,
    totalStars: xpMap[child.id]?.totalStars ?? 12,
    unlockedBadgeIds: userBadgeMap[child.id] || [],
  }));

  if (formattedChildren.length === 0) {
    formattedChildren.push({
      id: user.id,
      displayName: 'Học sinh Tiểu học',
      avatarUrl: '🎒',
      parentPhone: userPhone,
      parentName: 'Phụ huynh',
      className: 'Lớp 1A1',
      grade: 'Lớp 1',
      classId: undefined,
      teacherName: 'Cô Nguyễn Lan',
      totalXp: 150,
      currentLevel: 1,
      totalStars: 12,
      unlockedBadgeIds: [],
    });
  }

  return (
    <StudentPortalView 
      childrenList={formattedChildren} 
      initialLessons={realLessons || []}
      completedLessonIds={Array.from(progressSet)}
      allBadges={allBadges || []}
      announcements={announcements || []}
      schedules={rawSchedules || []}
    />
  );
}
