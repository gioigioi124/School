import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { classId, studentIds } = body;

    if (!classId || !studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: 'Thiếu classId hoặc danh sách studentIds hợp lệ.' },
        { status: 400 }
      );
    }

    // 1. Check if class exists
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('id, name')
      .eq('id', classId)
      .single();

    if (classError || !classData) {
      return NextResponse.json({ error: 'Lớp học không tồn tại.' }, { status: 404 });
    }

    // 2. Filter out students already enrolled in this class
    const { data: existingEnrollments } = await supabase
      .from('class_enrollments')
      .select('profile_id')
      .eq('class_id', classId)
      .in('profile_id', studentIds);

    const existingStudentIds = new Set((existingEnrollments || []).map((e: any) => e.profile_id));
    const toEnrollIds = studentIds.filter((id: string) => !existingStudentIds.has(id));

    if (toEnrollIds.length === 0) {
      return NextResponse.json({
        message: 'Tất cả học sinh đã có trong lớp học này.',
        enrolledCount: 0,
      });
    }

    // 3. Prepare enrollment records
    const enrollmentRecords = toEnrollIds.map((studentId: string) => ({
      id: crypto.randomUUID(),
      class_id: classId,
      profile_id: studentId,
      role: 'student',
    }));

    const { error: insertError } = await supabase
      .from('class_enrollments')
      .insert(enrollmentRecords);

    if (insertError) {
      console.error('Insert enrollments error:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Đã thêm thành công ${toEnrollIds.length} học sinh vào lớp ${classData.name}! 🎉`,
      enrolledCount: toEnrollIds.length,
    });
  } catch (error: any) {
    console.error('Enroll students error:', error);
    return NextResponse.json({ error: error.message || 'Lỗi thêm học sinh vào lớp.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    const studentId = searchParams.get('studentId');

    if (!classId || !studentId) {
      return NextResponse.json(
        { error: 'Thiếu classId hoặc studentId.' },
        { status: 400 }
      );
    }

    const { error: deleteError } = await supabase
      .from('class_enrollments')
      .delete()
      .eq('class_id', classId)
      .eq('profile_id', studentId)
      .eq('role', 'student');

    if (deleteError) {
      console.error('Delete enrollment error:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Đã xóa học sinh khỏi lớp học.',
    });
  } catch (error: any) {
    console.error('Remove student error:', error);
    return NextResponse.json({ error: error.message || 'Lỗi xóa học sinh khỏi lớp.' }, { status: 500 });
  }
}
