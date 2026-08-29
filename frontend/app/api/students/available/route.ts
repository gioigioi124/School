import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetClassId = searchParams.get('classId');
    const search = searchParams.get('search')?.toLowerCase().trim();
    const unassignedOnly = searchParams.get('unassignedOnly') === 'true';

    // 1. Fetch all profiles that have parent_phone or email with kinderly.com (students)
    let query = supabase
      .from('profiles')
      .select(`
        id,
        display_name,
        email,
        avatar_url,
        parent_phone,
        parent_name,
        phone,
        created_at
      `)
      .order('display_name', { ascending: true });

    const { data: profiles, error: profileError } = await query;

    if (profileError) {
      console.error('Error fetching profiles:', profileError);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // 2. Fetch all student class_enrollments to map current classes
    const { data: enrollments, error: enrollError } = await supabase
      .from('class_enrollments')
      .select(`
        profile_id,
        class_id,
        role,
        classes ( id, name, grade )
      `)
      .eq('role', 'student');

    if (enrollError) {
      console.error('Error fetching enrollments:', enrollError);
    }

    // 3. Map enrollments by student profile ID
    const studentClassesMap = new Map<string, { id: string; name: string; grade: string | null }[]>();
    (enrollments || []).forEach((e: any) => {
      const cls = Array.isArray(e.classes) ? e.classes[0] : e.classes;
      if (!cls) return;
      
      const current = studentClassesMap.get(e.profile_id) || [];
      current.push({
        id: cls.id,
        name: cls.name,
        grade: cls.grade,
      });
      studentClassesMap.set(e.profile_id, current);
    });

    // 4. Transform and filter student list
    let students = (profiles || [])
      // Filter only student profiles (has parent_phone or phone or email @kinderly.com or has student enrollment)
      .filter((p: any) => {
        const isStudent = Boolean(p.parent_phone || p.phone || (p.email && p.email.includes('@kinderly.com')) || studentClassesMap.has(p.id));
        return isStudent;
      })
      .map((p: any) => {
        const enrolledClasses = studentClassesMap.get(p.id) || [];
        const isInTargetClass = targetClassId 
          ? enrolledClasses.some(c => c.id === targetClassId)
          : false;

        return {
          id: p.id,
          displayName: p.display_name || p.displayName || 'Bé chưa đặt tên',
          avatarUrl: p.avatar_url || p.avatarUrl || '🐻',
          parentPhone: p.parent_phone || p.parentPhone || p.phone || 'Chưa cập nhật',
          parentName: p.parent_name || p.parentName || 'Phụ huynh',
          email: p.email,
          enrolledClasses,
          isUnassigned: enrolledClasses.length === 0,
          isInTargetClass,
        };
      });

    // Apply search filter if provided
    if (search) {
      students = students.filter(s => 
        s.displayName.toLowerCase().includes(search) ||
        s.parentPhone.toLowerCase().includes(search) ||
        s.parentName.toLowerCase().includes(search)
      );
    }

    // Apply unassigned filter if requested
    if (unassignedOnly) {
      students = students.filter(s => s.isUnassigned);
    }

    return NextResponse.json({
      students,
      total: students.length,
    });
  } catch (error: any) {
    console.error('Available students error:', error);
    return NextResponse.json({ error: error.message || 'Lỗi lấy danh sách học sinh' }, { status: 500 });
  }
}
