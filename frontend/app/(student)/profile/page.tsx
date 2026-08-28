import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { StudentProfileView } from '@/components/student/StudentProfileView';

export default async function StudentProfilePage() {
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
    .select('id, display_name, avatar_url, parent_phone, parent_name, email, school')
    .or(filterQuery);

  const studentProfile = childProfiles?.[0] || {
    id: user.id,
    display_name: 'Bé yêu',
    avatar_url: '🐻',
    parent_phone: userPhone,
    parent_name: 'Phụ huynh',
    email: userEmail,
    school: 'Trường Mầm non Kinderly',
  };

  // Fetch class enrollment
  const { data: enrollments } = await supabase
    .from('class_enrollments')
    .select('class_id, classes(id, name, grade)')
    .eq('profile_id', studentProfile.id)
    .eq('role', 'student')
    .limit(1);

  const className = (enrollments?.[0]?.classes as any)?.name || 'Lớp Mầm A1';
  const grade = (enrollments?.[0]?.classes as any)?.grade || 'Mẫu giáo';

  // Fetch user_xp
  const { data: xpData } = await supabase
    .from('user_xp')
    .select('total_xp, current_level, total_stars')
    .eq('student_id', studentProfile.id)
    .maybeSingle();

  // Fetch all badges & unlocked badges
  const { data: allBadges } = await supabase.from('badges').select('*').order('xp_bonus', { ascending: true });
  const { data: userBadges } = await supabase
    .from('user_badges')
    .select('badge_id, unlocked_at')
    .eq('student_id', studentProfile.id);

  const unlockedMap: Record<string, string> = {};
  (userBadges || []).forEach((ub) => {
    unlockedMap[ub.badge_id] = ub.unlocked_at;
  });

  // Fetch XP history
  const { data: xpHistory } = await supabase
    .from('xp_history')
    .select('id, action, xp_amount, source_type, created_at')
    .eq('student_id', studentProfile.id)
    .order('created_at', { ascending: false })
    .limit(15);

  return (
    <StudentProfileView
      student={studentProfile}
      className={className}
      grade={grade}
      totalXp={xpData?.total_xp || 260}
      currentLevel={xpData?.current_level || 2}
      totalStars={xpData?.total_stars || 15}
      allBadges={allBadges || []}
      unlockedBadgesMap={unlockedMap}
      xpHistory={xpHistory || []}
    />
  );
}
