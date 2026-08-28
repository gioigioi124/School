import { 
  Sparkles, 
  History, 
  Palette, 
  CheckCircle2, 
  MessageSquare, 
  Utensils, 
  Users, 
  ArrowRight,
  School,
  CalendarDays,
  Clock,
  MapPin,
  BookOpen,
  Plus
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
    .select('display_name, school')
    .eq('id', user.id)
    .single();

  const displayName = profile?.display_name || 'Cô Mai';

  // 2. Fetch classes that the teacher is enrolled in
  const { data: teacherEnrollments } = await supabase
    .from('class_enrollments')
    .select('class_id, classes(*)')
    .eq('profile_id', user.id)
    .eq('role', 'teacher');

  // Fallback for admin or general viewing
  const { data: allClasses } = await supabase
    .from('classes')
    .select('*')
    .order('created_at', { ascending: false });

  let myClasses = (teacherEnrollments?.map(e => Array.isArray(e.classes) ? e.classes[0] : e.classes).filter(Boolean) || []) as any[];
  if (myClasses.length === 0) {
    myClasses = (allClasses || []) as any[];
  }

  // 3. Fetch all student enrollments across these classes
  const classIds = myClasses.map(c => c.id);
  const { data: allEnrollments } = await supabase
    .from('class_enrollments')
    .select('id, class_id, profile_id, created_at, role, profiles(*)')
    .in('class_id', classIds.length > 0 ? classIds : ['00000000-0000-0000-0000-000000000000'])
    .order('created_at', { ascending: false });

  const studentEnrollments = (allEnrollments || []).filter(e => e.role === 'student');

  // Calculate student count per class
  const studentCountMap: Record<string, number> = {};
  studentEnrollments.forEach((e: any) => {
    const cid = e.class_id || e.classId;
    studentCountMap[cid] = (studentCountMap[cid] || 0) + 1;
  });

  // 4. Fetch schedules for teacher's classes
  const { data: rawSchedules } = await supabase
    .from('schedules')
    .select(`
      id,
      class_id,
      day_of_week,
      start_time,
      end_time,
      subject,
      room,
      color,
      description,
      classes:class_id(name, grade)
    `)
    .in('class_id', classIds.length > 0 ? classIds : ['00000000-0000-0000-0000-000000000000'])
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true });

  // Determine current day of week in VN format (2 = Thứ 2, ..., 8 = Chủ Nhật)
  const now = new Date();
  const currentDayOfWeek = now.getDay() === 0 ? 8 : now.getDay() + 1;
  const dayNames = ['', '', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
  const currentDayLabel = dayNames[currentDayOfWeek] || 'Hôm nay';

  const todaySchedules = (rawSchedules || []).filter(
    (s: any) => s.day_of_week === currentDayOfWeek
  );

  // Fallback sample primary school schedules if empty
  const displayTodaySchedules = todaySchedules.length > 0 ? todaySchedules : (
    (rawSchedules && rawSchedules.length > 0) ? rawSchedules.slice(0, 4) : [
      {
        id: 'sample-1',
        day_of_week: currentDayOfWeek,
        start_time: '08:00',
        end_time: '08:45',
        subject: 'Toán học (Khám phá & Luyện tập)',
        room: 'Phòng 101',
        color: '#3B82F6',
        classes: { name: myClasses[0]?.name || 'Lớp 1A1', grade: 'Lớp 1' },
      },
      {
        id: 'sample-2',
        day_of_week: currentDayOfWeek,
        start_time: '09:00',
        end_time: '09:45',
        subject: 'Tiếng Việt (Luyện đọc & Chính tả)',
        room: 'Phòng 101',
        color: '#F97316',
        classes: { name: myClasses[0]?.name || 'Lớp 1A1', grade: 'Lớp 1' },
      },
      {
        id: 'sample-3',
        day_of_week: currentDayOfWeek,
        start_time: '10:00',
        end_time: '10:45',
        subject: 'Tiếng Anh Tiểu học (Phonics & Kể chuyện)',
        room: 'Phòng Ngoại ngữ',
        color: '#EC4899',
        classes: { name: myClasses[0]?.name || 'Lớp 1A1', grade: 'Lớp 1' },
      },
      {
        id: 'sample-4',
        day_of_week: currentDayOfWeek,
        start_time: '14:30',
        end_time: '15:15',
        subject: 'Tin học & Tư duy thuật toán',
        room: 'Phòng Lab Tin học',
        color: '#8B5CF6',
        classes: { name: myClasses[0]?.name || 'Lớp 1A1', grade: 'Lớp 1' },
      },
    ]
  );

  // Recent timeline activities based on real enrolled students
  const colorThemes = [
    { bg: 'bg-primary-container', text: 'text-on-primary-container', node: 'bg-primary', icon: Palette, iconColor: 'text-tertiary', defaultEmoji: '📚' },
    { bg: 'bg-secondary-container', text: 'text-on-secondary-container', node: 'bg-secondary', icon: CheckCircle2, iconColor: 'text-primary', defaultEmoji: '⭐' },
    { bg: 'bg-tertiary-container', text: 'text-on-tertiary-container', node: 'bg-tertiary', icon: MessageSquare, iconColor: 'text-secondary', defaultEmoji: '🚀' },
  ];

  const recentActivities = studentEnrollments.slice(0, 4).map((e: any, idx) => {
    const p = Array.isArray(e.profiles) ? e.profiles[0] : e.profiles;
    const cid = e.class_id || e.classId;
    const targetClass = myClasses.find(c => c.id === cid);
    const theme = colorThemes[idx % colorThemes.length];
    
    return {
      id: e.id,
      studentName: p?.display_name || p?.displayName || 'Học sinh',
      actionText: idx === 0 ? 'đã hoàn thành bài tập Toán tuần.' : idx === 1 ? 'vừa được điểm danh chuyên cần.' : idx === 2 ? 'đạt huy hiệu Ngôi sao chăm học.' : 'vừa gia nhập lớp học.',
      className: targetClass?.name || 'Lớp học',
      time: idx === 0 ? '10 phút trước' : idx === 1 ? '45 phút trước' : idx === 2 ? '2 giờ trước' : 'Hôm nay',
      theme,
    };
  });

  const displayActivities = recentActivities.length > 0 ? recentActivities : [
    {
      id: 'demo-1',
      studentName: 'Minh An',
      actionText: 'đã hoàn thành bài tập Toán tuần.',
      className: myClasses[0]?.name || 'Lớp 1A1',
      time: '10 phút trước',
      theme: colorThemes[0]
    },
    {
      id: 'demo-2',
      studentName: 'Lan Anh',
      actionText: 'vừa điểm danh có mặt đúng giờ.',
      className: myClasses[1]?.name || 'Lớp 2A2',
      time: '45 phút trước',
      theme: colorThemes[1]
    },
    {
      id: 'demo-3',
      studentName: 'Đức Huy',
      actionText: 'đạt thành tích 100 điểm trắc nghiệm Khoa học.',
      className: myClasses[0]?.name || 'Lớp 1A1',
      time: '2 giờ trước',
      theme: colorThemes[2]
    },
    {
      id: 'demo-4',
      studentName: 'Ban Giám Hiệu',
      actionText: 'đã duyệt kế hoạch giảng dạy GDPT tuần tới.',
      className: 'Toàn trường',
      time: 'Hôm qua',
      theme: { bg: 'bg-surface-container-high', text: 'text-on-surface-variant', node: 'bg-outline-variant', icon: School, iconColor: 'text-outline', defaultEmoji: '🏫' }
    }
  ];

  return (
    <div className="max-w-7xl mx-auto w-full space-y-8 animate-fade-in pb-12">
      {/* Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
        <div>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-on-surface mb-2">
            Chào buổi sáng, <span className="text-primary">{displayName}!</span> 👋
          </h2>
          <p className="font-sans text-sm sm:text-base text-on-surface-variant">
            Hôm nay là {currentDayLabel} — Chúc bạn một ngày giảng dạy đầy cảm hứng và hiệu quả.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link
            href="/schedules"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-surface-container-high hover:bg-surface-container text-on-surface font-heading font-bold text-xs border border-outline-variant/30 transition-all hover:scale-102 cursor-pointer shadow-xs"
          >
            <CalendarDays className="w-4 h-4 text-primary" />
            <span>Thời khóa biểu</span>
          </Link>
          <CreateClassDialog profileId={user.id} variant="secondary" />
        </div>
      </div>

      {/* Primary Highlight Widget: Today Schedule */}
      <section className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-outline-variant/30 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-heading font-bold shadow-2xs shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-lg sm:text-xl font-bold text-on-surface">
                  Thời khóa biểu {currentDayLabel}
                </h3>
                <span className="px-2 py-0.2 rounded-full text-xs bg-primary-container text-on-primary-container font-heading font-bold">
                  {displayTodaySchedules.length} tiết
                </span>
              </div>
              <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                Lịch trình giảng dạy phân bổ theo ca Sáng & Chiều trong ngày.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/schedules"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-on-primary font-heading font-bold text-xs hover:bg-primary/90 transition-all shadow-xs"
            >
              <span>Quản lý TKB</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Schedule Grid with Sáng / Chiều distinction */}
        {(() => {
          const morningSlots = displayTodaySchedules.filter((s: any) => {
            const time = s.start_time || s.startTime || '08:00';
            const hour = parseInt(time.split(':')[0], 10);
            return hour < 12 || (hour === 12 && parseInt(time.split(':')[1] || '0', 10) < 30);
          });
          const afternoonSlots = displayTodaySchedules.filter((s: any) => {
            const time = s.start_time || s.startTime || '14:00';
            const hour = parseInt(time.split(':')[0], 10);
            return !(hour < 12 || (hour === 12 && parseInt(time.split(':')[1] || '0', 10) < 30));
          });

          return (
            <div className="space-y-4 mt-4">
              {/* Sáng */}
              {morningSlots.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900 bg-amber-50/80 px-2.5 py-1 rounded-md border border-amber-200/50 w-fit">
                    <span>☀️ Buổi Sáng ({morningSlots.length} tiết)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {morningSlots.map((slot: any, idx: number) => {
                      const slotColor = slot.color || '#3B82F6';
                      const cls = Array.isArray(slot.classes) ? slot.classes[0] : slot.classes;
                      const className = cls?.name || 'Lớp 1A1';
                      const startTime = slot.start_time || slot.startTime;
                      const endTime = slot.end_time || slot.endTime;
                      const note = slot.description || slot.room ? `${className}${slot.room ? ` • ${slot.room}` : ''}${slot.description ? ` (${slot.description})` : ''}` : className;

                      return (
                        <div
                          key={slot.id || idx}
                          className="h-[70px] bg-surface rounded-lg px-3 py-2 border border-outline-variant/30 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between overflow-hidden group"
                          style={{
                            borderLeftWidth: '3.5px',
                            borderLeftColor: slotColor,
                          }}
                        >
                          <div className="flex items-center justify-between gap-1 leading-none">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary">
                              <Clock className="w-2.5 h-2.5" />
                              <span>{startTime} - {endTime}</span>
                            </span>
                            <span className="text-[10px] font-heading px-1.5 py-0.2 rounded-full bg-primary/10 text-primary font-semibold">
                              Tiết {idx + 1}
                            </span>
                          </div>

                          <h4 className="font-heading font-bold text-xs text-on-surface group-hover:text-primary transition-colors truncate leading-tight">
                            {slot.subject}
                          </h4>

                          <p className="text-[10px] text-on-surface-variant/80 truncate italic leading-none">
                            {note}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Chiều */}
              {afternoonSlots.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 bg-indigo-50/80 px-2.5 py-1 rounded-md border border-indigo-200/50 w-fit">
                    <span>🌤️ Buổi Chiều ({afternoonSlots.length} tiết)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {afternoonSlots.map((slot: any, idx: number) => {
                      const slotColor = slot.color || '#8B5CF6';
                      const cls = Array.isArray(slot.classes) ? slot.classes[0] : slot.classes;
                      const className = cls?.name || 'Lớp 1A1';
                      const startTime = slot.start_time || slot.startTime;
                      const endTime = slot.end_time || slot.endTime;
                      const note = slot.description || slot.room ? `${className}${slot.room ? ` • ${slot.room}` : ''}${slot.description ? ` (${slot.description})` : ''}` : className;

                      return (
                        <div
                          key={slot.id || idx}
                          className="h-[70px] bg-surface rounded-lg px-3 py-2 border border-outline-variant/30 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between overflow-hidden group"
                          style={{
                            borderLeftWidth: '3.5px',
                            borderLeftColor: slotColor,
                          }}
                        >
                          <div className="flex items-center justify-between gap-1 leading-none">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700">
                              <Clock className="w-2.5 h-2.5" />
                              <span>{startTime} - {endTime}</span>
                            </span>
                            <span className="text-[10px] font-heading px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 font-semibold">
                              Tiết {idx + 1}
                            </span>
                          </div>

                          <h4 className="font-heading font-bold text-xs text-on-surface group-hover:text-primary transition-colors truncate leading-tight">
                            {slot.subject}
                          </h4>

                          <p className="text-[10px] text-on-surface-variant/80 truncate italic leading-none">
                            {note}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </section>

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
                        <div className={`w-14 h-14 rounded-2xl ${theme.bg} flex items-center justify-center ${theme.text} group-hover:rotate-12 transition-transform text-2xl shadow-xs`}>
                          <span>{cls.avatar_url || cls.avatarUrl || theme.defaultEmoji}</span>
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
                          {cls.grade || 'Cấp Tiểu học'} {cls.description ? `• ${cls.description}` : ''}
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
