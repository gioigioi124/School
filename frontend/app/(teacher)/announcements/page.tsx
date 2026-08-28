import { createClient } from '@/lib/supabase/server';
import { AnnouncementFormDialog } from '@/components/announcements/AnnouncementFormDialog';
import { AnnouncementList } from '@/components/announcements/AnnouncementList';
import { MessageSquare, Sparkles } from 'lucide-react';

export default async function AnnouncementsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Fetch teacher classes
  const { data: teacherEnrollments } = await supabase
    .from('class_enrollments')
    .select('class_id, classes(id, name, grade)')
    .eq('profile_id', user.id)
    .eq('role', 'teacher');

  const { data: allClasses } = await supabase
    .from('classes')
    .select('id, name, grade')
    .order('created_at', { ascending: false });

  let teacherClasses: Array<{ id: string; name: string; grade?: string }> = 
    (teacherEnrollments?.map((e: any) => Array.isArray(e.classes) ? e.classes[0] : e.classes).filter(Boolean) || []);

  if (teacherClasses.length === 0) {
    teacherClasses = (allClasses || []) as any[];
  }

  // 2. Fetch announcements
  const classIds = teacherClasses.map((c) => c.id);
  const { data: announcements } = await supabase
    .from('announcements')
    .select(`
      id,
      title,
      content,
      is_important,
      created_at,
      class_id,
      classes(name, grade),
      profiles:teacher_id(display_name, avatar_url)
    `)
    .in('class_id', classIds.length > 0 ? classIds : ['00000000-0000-0000-0000-000000000000'])
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-3xl font-bold text-on-surface">
              Bảng tin & Thông báo
            </h1>
            <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold font-heading">
              Realtime
            </span>
          </div>
          <p className="font-sans text-on-surface-variant text-sm mt-1">
            Gửi dặn dò, thông báo lịch học và hoạt động tới phụ huynh & học sinh.
          </p>
        </div>

        {teacherClasses.length > 0 && (
          <AnnouncementFormDialog classes={teacherClasses} />
        )}
      </div>

      {/* Announcements List */}
      <AnnouncementList
        initialAnnouncements={(announcements as any[]) || []}
        classes={teacherClasses}
      />
    </div>
  );
}
