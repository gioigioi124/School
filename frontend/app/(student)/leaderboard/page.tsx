import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { StudentLeaderboardView } from '@/components/student/StudentLeaderboardView';

export default async function LeaderboardPage() {
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

  // Fetch all students in this class
  let leaderboard: any[] = [];

  if (classId) {
    const { data: classStudents } = await supabase
      .from('class_enrollments')
      .select('profile_id, profiles(id, display_name, avatar_url, email)')
      .eq('class_id', classId)
      .eq('role', 'student');

    const pIds = (classStudents || []).map((cs: any) => cs.profile_id);

    // Fetch user_xp
    const { data: xpList } = await supabase
      .from('user_xp')
      .select('student_id, total_xp, current_level, total_stars')
      .in('student_id', pIds.length > 0 ? pIds : ['00000000-0000-0000-0000-000000000000']);

    const xpMap: Record<string, any> = {};
    (xpList || []).forEach((x) => {
      xpMap[x.student_id] = x;
    });

    leaderboard = (classStudents || []).map((cs: any) => {
      const prof = Array.isArray(cs.profiles) ? cs.profiles[0] : cs.profiles;
      const x = xpMap[cs.profile_id];
      return {
        id: cs.profile_id,
        displayName: prof?.display_name || 'Học sinh',
        avatarUrl: prof?.avatar_url || '🐻',
        totalXp: x?.total_xp || 0,
        currentLevel: x?.current_level || 1,
        totalStars: x?.total_stars || 0,
      };
    });

    // Sort descending by XP
    leaderboard.sort((a, b) => b.totalXp - a.totalXp);
  }

  // Fallback interesting sample classmates if class has few students
  if (leaderboard.length < 3) {
    leaderboard = [
      { id: 'kid-1', displayName: 'Bé Minh Khang', avatarUrl: '🦁', totalXp: 480, currentLevel: 2, totalStars: 18 },
      { id: studentProfile.id, displayName: studentProfile.display_name || 'Bé yêu', avatarUrl: studentProfile.avatar_url || '🐻', totalXp: 350, currentLevel: 2, totalStars: 15 },
      { id: 'kid-2', displayName: 'Bé Bảo An', avatarUrl: '🐰', totalXp: 310, currentLevel: 2, totalStars: 14 },
      { id: 'kid-3', displayName: 'Bé Tuệ Nhi', avatarUrl: '🦄', totalXp: 280, currentLevel: 1, totalStars: 12 },
      { id: 'kid-4', displayName: 'Bé Gia Huy', avatarUrl: '🐼', totalXp: 220, currentLevel: 1, totalStars: 10 },
    ];
    leaderboard.sort((a, b) => b.totalXp - a.totalXp);
  }

  return (
    <StudentLeaderboardView
      initialLeaderboard={leaderboard}
      currentStudentId={studentProfile.id}
      className={className}
      classId={classId}
    />
  );
}
