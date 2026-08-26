import { Card, CardContent } from '@/components/ui/card';
import { School } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { CreateClassDialog } from '@/components/classes/CreateClassDialog';
import { ClassCard } from '@/components/classes/ClassCard';

export default async function ClassesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Fetch classes that the teacher is enrolled in
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

  let displayClasses = (teacherEnrollments?.map(e => Array.isArray(e.classes) ? e.classes[0] : e.classes).filter(Boolean) || []) as any[];
  if (displayClasses.length === 0) {
    displayClasses = (allClasses || []) as any[];
  }

  // 2. Fetch student counts for these classes
  const classIds = displayClasses.map(c => c.id);
  const { data: studentEnrollments } = await supabase
    .from('class_enrollments')
    .select('classId')
    .in('classId', classIds.length > 0 ? classIds : ['00000000-0000-0000-0000-000000000000'])
    .eq('role', 'student');

  const studentCountMap: Record<string, number> = {};
  (studentEnrollments || []).forEach(e => {
    studentCountMap[e.classId] = (studentCountMap[e.classId] || 0) + 1;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-on-surface">Lớp học của tôi</h1>
          <p className="font-sans text-on-surface-variant mt-1">Quản lý danh sách lớp học, cập nhật thông tin và học sinh.</p>
        </div>
        <CreateClassDialog profileId={user.id} variant="secondary" />
      </div>

      {displayClasses.length === 0 ? (
        <Card className="border-dashed border-2 border-outline-variant/40 bg-surface-container-lowest shadow-none py-16">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center">
              <School className="w-8 h-8 text-on-primary-container" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-on-surface">Chưa có lớp học nào</h3>
              <p className="font-sans text-on-surface-variant max-w-md mx-auto mt-2">
                Bạn chưa được phân công hoặc chưa tạo lớp học nào. Hãy bắt đầu bằng cách tạo một lớp học mới.
              </p>
            </div>
            <div className="mt-4">
              <CreateClassDialog profileId={user.id} variant="secondary" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayClasses.map((cls: any) => (
            <ClassCard 
              key={cls.id} 
              classItem={cls} 
              studentCount={studentCountMap[cls.id] || 0} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
