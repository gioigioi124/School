import { createClient } from '@/lib/supabase/server';
import { Users, Phone, School, Star, Sparkles, UserCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CreateStudentAccountDialog } from '@/components/students/CreateStudentAccountDialog';
import { AwardStudentDialog } from '@/components/classes/AwardStudentDialog';
import Link from 'next/link';

export default async function StudentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Fetch teacher's enrolled classes
  const { data: teacherEnrollments } = await supabase
    .from('class_enrollments')
    .select('class_id, classes(id, name, grade)')
    .eq('profile_id', user.id)
    .eq('role', 'teacher');

  const teacherClassIds = teacherEnrollments?.map((e: any) => e.class_id || e.classId) || [];

  // 2. Fetch students in teacher's classes (or all students if admin/general)
  const { data: enrollments } = await supabase
    .from('class_enrollments')
    .select(`
      id,
      class_id,
      classes ( id, name, grade ),
      profiles:profile_id ( id, display_name, email, avatar_url, parent_phone, parent_name, phone, created_at )
    `)
    .eq('role', 'student')
    .in('class_id', teacherClassIds.length > 0 ? teacherClassIds : ['00000000-0000-0000-0000-000000000000']);

  // Format student records
  const studentList = (enrollments || []).map((e: any) => ({
    id: e.profiles?.id || e.id,
    displayName: e.profiles?.display_name || e.profiles?.displayName || 'Bé chưa đặt tên',
    avatarUrl: e.profiles?.avatar_url || e.profiles?.avatarUrl || '🐻',
    parentPhone: e.profiles?.parent_phone || e.profiles?.parentPhone || e.profiles?.phone || 'Chưa cập nhật',
    parentName: e.profiles?.parent_name || e.profiles?.parentName || 'Phụ huynh',
    className: e.classes?.name || 'Chưa phân lớp',
    classId: e.class_id || e.classId,
    createdAt: e.profiles?.created_at || e.profiles?.createdAt,
  }));

  // Calculate unique parent phone numbers
  const uniqueParents = new Set(
    studentList.map(s => s.parentPhone).filter(p => p && p !== 'Chưa cập nhật')
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-on-surface flex items-center gap-2">
            <span>Danh sách Học sinh</span>
            <span className="text-xs px-3 py-1 rounded-full bg-primary-container text-on-primary-container font-sans font-bold">
              {studentList.length} Bé
            </span>
          </h1>
          <p className="font-sans text-on-surface-variant mt-1 text-sm">
            Quản lý tài khoản đăng nhập theo Số điện thoại bố mẹ và lớp học của bé.
          </p>
        </div>

        <div className="w-full sm:w-auto">
          <CreateStudentAccountDialog />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-container flex items-center justify-center text-primary">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-sans text-on-surface-variant font-bold uppercase tracking-wider">Tổng số học sinh</span>
            <div className="font-heading text-2xl font-bold text-on-surface mt-0.5">{studentList.length} Bé</div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary-container flex items-center justify-center text-secondary">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-sans text-on-surface-variant font-bold uppercase tracking-wider">Phụ huynh (SĐT)</span>
            <div className="font-heading text-2xl font-bold text-on-surface mt-0.5">{uniqueParents.size} Tài khoản</div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-tertiary-container flex items-center justify-center text-tertiary">
            <School className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-sans text-on-surface-variant font-bold uppercase tracking-wider">Lớp học quản lý</span>
            <div className="font-heading text-2xl font-bold text-on-surface mt-0.5">{teacherEnrollments?.length || 0} Lớp</div>
          </div>
        </div>
      </div>

      {/* Student List View */}
      {studentList.length === 0 ? (
        <Card className="border-dashed border-2 border-outline-variant/40 bg-surface-container-lowest shadow-none py-16">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center text-3xl">
              👶
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-on-surface">Chưa có học sinh nào</h3>
              <p className="font-sans text-on-surface-variant max-w-md mx-auto mt-2 text-sm">
                Bạn chưa cấp tài khoản hoặc chưa thêm học sinh nào vào lớp. Nhấp nút bên dưới để cấp tài khoản bằng SĐT bố mẹ nhé!
              </p>
            </div>
            <div className="mt-4">
              <CreateStudentAccountDialog />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-surface-container-lowest rounded-2xl shadow-soft border border-outline-variant/30 overflow-hidden">
          <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center">
            <div>
              <h2 className="font-heading text-xl font-bold text-on-surface">Học sinh trong lớp của bạn</h2>
              <p className="font-sans text-xs text-on-surface-variant mt-0.5">Tài khoản đăng nhập tự động kết nối qua SĐT bố mẹ.</p>
            </div>
          </div>

          <div className="divide-y divide-outline-variant/15">
            {studentList.map((student: any) => (
              <div
                key={student.id}
                className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-surface-container-low/40 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-secondary-container/80 flex items-center justify-center text-2xl shadow-2xs shrink-0">
                    <span>{student.avatarUrl || '🐻'}</span>
                  </div>

                  <div>
                    <h3 className="font-sans font-bold text-base text-on-surface flex items-center gap-2">
                      <span>{student.displayName}</span>
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-on-surface-variant mt-1">
                      <span className="flex items-center gap-1 text-primary font-bold">
                        <Phone className="w-3.5 h-3.5" />
                        <span>SĐT: {student.parentPhone}</span>
                      </span>
                      <span>•</span>
                      <span>PH: {student.parentName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <Link
                    href={`/classes/${student.classId}`}
                    className="px-3 py-1 bg-surface-container-high hover:bg-primary-container text-on-surface-variant hover:text-on-primary-container rounded-full text-xs font-sans font-bold transition-colors"
                  >
                    {student.className}
                  </Link>

                  <AwardStudentDialog
                    studentName={student.displayName}
                    avatar={student.avatarUrl || '🐻'}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
