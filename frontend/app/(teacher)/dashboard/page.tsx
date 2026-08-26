import { 
  Sparkles, 
  History, 
  Palette, 
  CheckCircle2, 
  MessageSquare, 
  Utensils, 
  Users, 
  Baby, 
  Gamepad2, 
  ArrowRight,
  School
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CreateClassDialog } from '@/components/classes/CreateClassDialog';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 1. Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('displayName, school')
    .eq('id', user.id)
    .single();

  const displayName = profile?.displayName || 'Cô Mai';

  // 2. Fetch classes that the teacher is enrolled in
  const { data: teacherEnrollments } = await supabase
    .from('class_enrollments')
    .select('classId, classes(*)')
    .eq('profileId', user.id)
    .eq('role', 'teacher');

  // Fallback for admin or general viewing
  const { data: allClasses } = await supabase
    .from('classes')
    .select('*')
    .order('createdAt', { ascending: false });

  let myClasses = (teacherEnrollments?.map(e => Array.isArray(e.classes) ? e.classes[0] : e.classes).filter(Boolean) || []) as any[];
  if (myClasses.length === 0) {
    myClasses = (allClasses || []) as any[];
  }

  // 3. Fetch all student enrollments across these classes
  const classIds = myClasses.map(c => c.id);
  const { data: allEnrollments } = await supabase
    .from('class_enrollments')
    .select('id, classId, profileId, createdAt, role, profiles(*)')
    .in('classId', classIds.length > 0 ? classIds : ['00000000-0000-0000-0000-000000000000'])
    .order('createdAt', { ascending: false });

  const studentEnrollments = (allEnrollments || []).filter(e => e.role === 'student');

  // Calculate student count per class
  const studentCountMap: Record<string, number> = {};
  studentEnrollments.forEach(e => {
    studentCountMap[e.classId] = (studentCountMap[e.classId] || 0) + 1;
  });

  // Recent timeline activities based on real enrolled students
  const colorThemes = [
    { bg: 'bg-primary-container', text: 'text-on-primary-container', node: 'bg-primary', icon: Palette, iconColor: 'text-tertiary', tagBg1: 'bg-tertiary-container text-on-tertiary-container', tagBg2: 'bg-secondary-container text-on-secondary-container', defaultEmoji: '🎨' },
    { bg: 'bg-secondary-container', text: 'text-on-secondary-container', node: 'bg-secondary', icon: CheckCircle2, iconColor: 'text-primary', tagBg1: 'bg-primary-container text-on-primary-container', tagBg2: 'bg-tertiary-container text-on-tertiary-container', defaultEmoji: '🧸' },
    { bg: 'bg-tertiary-container', text: 'text-on-tertiary-container', node: 'bg-tertiary', icon: MessageSquare, iconColor: 'text-secondary', tagBg1: 'bg-error-container text-on-error-container', tagBg2: 'bg-secondary-container text-on-secondary-container', defaultEmoji: '🚀' },
  ];

  const recentActivities = studentEnrollments.slice(0, 4).map((e, idx) => {
    const p = Array.isArray(e.profiles) ? e.profiles[0] : e.profiles;
    const targetClass = myClasses.find(c => c.id === e.classId);
    const theme = colorThemes[idx % colorThemes.length];
    
    return {
      id: e.id,
      studentName: p?.displayName || 'Học sinh',
      actionText: idx === 0 ? 'đã hoàn thành bài tập vẽ.' : idx === 1 ? 'vừa được điểm danh chuyên cần.' : idx === 2 ? 'đạt huy hiệu chăm chỉ tuần này.' : 'vừa gia nhập lớp học.',
      className: targetClass?.name || 'Lớp học',
      time: idx === 0 ? '10 phút trước' : idx === 1 ? '45 phút trước' : idx === 2 ? '2 giờ trước' : 'Hôm nay',
      theme,
    };
  });

  // Fallback sample activities if none exist
  const displayActivities = recentActivities.length > 0 ? recentActivities : [
    {
      id: 'demo-1',
      studentName: 'Minh An',
      actionText: 'đã hoàn thành bài tập vẽ.',
      className: myClasses[0]?.name || 'Lớp Mầm A1',
      time: '10 phút trước',
      theme: colorThemes[0]
    },
    {
      id: 'demo-2',
      studentName: 'Lan Anh',
      actionText: 'vừa điểm danh có mặt.',
      className: myClasses[1]?.name || 'Lớp Lá C3',
      time: '45 phút trước',
      theme: colorThemes[1]
    },
    {
      id: 'demo-3',
      studentName: 'Đức Huy',
      actionText: 'đạt thành tích 5 sao chăm ngoan.',
      className: myClasses[0]?.name || 'Lớp Chồi B2',
      time: '2 giờ trước',
      theme: colorThemes[2]
    },
    {
      id: 'demo-4',
      studentName: 'Hệ thống',
      actionText: 'đã cập nhật thực đơn dinh dưỡng tuần tới.',
      className: 'Toàn trường',
      time: 'Hôm qua',
      theme: { bg: 'bg-surface-container-high', text: 'text-on-surface-variant', node: 'bg-outline-variant', icon: Utensils, iconColor: 'text-outline', tagBg1: '', tagBg2: '', defaultEmoji: '🍱' }
    }
  ];

  return (
    <div className="max-w-7xl mx-auto w-full space-y-8 animate-fade-in pb-12">
      {/* Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h2 className="font-heading text-4xl font-bold text-on-surface mb-2">
            Chào buổi sáng, <span className="text-primary">{displayName}!</span> 👋
          </h2>
          <p className="font-sans text-base text-on-surface-variant">
            Hôm nay là một ngày tuyệt vời để khám phá và học hỏi.
          </p>
        </div>
        
        <CreateClassDialog profileId={user.id} variant="secondary" />
      </div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Classes (Spans 8 cols on lg) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-2xl font-bold text-on-surface flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-primary-container/60 flex items-center justify-center text-primary">
                <Sparkles className="w-5 h-5" />
              </span>
              <span>Lớp học của tôi</span>
            </h3>
            <Link 
              href="/classes" 
              className="text-primary font-sans font-bold text-sm hover:underline flex items-center gap-1 group"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {myClasses.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-2xl p-12 shadow-soft border-2 border-dashed border-outline-variant/40 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center text-3xl">
                🎒
              </div>
              <div>
                <h4 className="font-heading text-xl font-bold text-on-surface">Chưa có lớp học nào</h4>
                <p className="font-sans text-sm text-on-surface-variant max-w-md mx-auto mt-1">
                  Bấm nút <strong>"+ Tạo lớp mới"</strong> ở góc trên để bắt đầu tạo lớp học đầu tiên của bạn!
                </p>
              </div>
              <div className="pt-2">
                <CreateClassDialog profileId={user.id} variant="secondary" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myClasses.map((cls: any, index: number) => {
                const count = studentCountMap[cls.id] || 0;
                const theme = colorThemes[index % colorThemes.length];
                const isWide = index === 2 && myClasses.length === 3;

                return (
                  <Link 
                    key={cls.id} 
                    href={`/classes/${cls.id}`}
                    className={`${isWide ? 'md:col-span-2' : ''}`}
                  >
                    <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-soft hover-scale border border-outline-variant/30 cursor-pointer group relative overflow-hidden h-full flex flex-col justify-between">
                      {/* Top-Right Decorative Blob */}
                      <div className={`absolute top-0 right-0 ${isWide ? 'w-48 h-48' : 'w-32 h-32'} ${theme.bg} opacity-15 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110`}></div>

                      <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className={`w-14 h-14 rounded-full ${theme.bg} flex items-center justify-center ${theme.text} group-hover:rotate-12 transition-transform text-2xl shadow-xs`}>
                          <span>{cls.avatarUrl || theme.defaultEmoji}</span>
                        </div>
                        <span className="bg-surface-container-high text-on-surface-variant px-3 py-1.5 rounded-full font-sans font-bold text-xs flex items-center gap-1.5 shadow-xs">
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                          <span>{count} Học sinh</span>
                        </span>
                      </div>

                      <div className="relative z-10">
                        <h4 className="font-heading text-xl font-bold text-on-surface mb-1 group-hover:text-primary transition-colors">
                          {cls.name}
                        </h4>
                        <p className="font-sans text-sm text-on-surface-variant font-medium">
                          {cls.grade || 'Mẫu giáo'} {cls.description ? `• ${cls.description}` : ''}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Recent Activities (Spans 4 cols on lg) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-2xl font-bold text-on-surface flex items-center gap-2">
              <History className="w-6 h-6 text-secondary" />
              <span>Hoạt động gần đây</span>
            </h3>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-soft border border-outline-variant/30 flex-1 flex flex-col">
            <ul className="space-y-6 relative before:absolute before:inset-0 before:left-[1.15rem] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-outline-variant/40 before:to-transparent">
              {displayActivities.map((act) => {
                const Icon = act.theme.icon;
                return (
                  <li key={act.id} className="relative flex items-start gap-4">
                    <div className="absolute left-0 w-[2.35rem] h-full flex justify-center items-start">
                      <div className={`w-3 h-3 rounded-full ${act.theme.node} ring-4 ring-surface-container-lowest z-10 mt-1.5`}></div>
                    </div>
                    <div className="pl-10 flex-1">
                      <div className="bg-surface-container-low p-4 rounded-2xl rounded-tl-none relative shadow-xs">
                        {/* Speech bubble tail */}
                        <div className="absolute top-0 -left-2 w-0 h-0 border-t-[12px] border-t-surface-container-low border-l-[12px] border-l-transparent"></div>
                        <p className="font-sans text-sm text-on-surface">
                          <span className="font-bold">{act.studentName}</span> {act.actionText}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Icon className={`w-4 h-4 ${act.theme.iconColor}`} />
                          <span className="font-sans text-xs text-on-surface-variant font-medium">
                            {act.time} • {act.className}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <Link
              href="/classes"
              className="mt-auto pt-6 w-full text-center font-sans font-bold text-sm text-primary hover:text-primary-dark hover:underline transition-colors block"
            >
              Xem tất cả hoạt động
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
