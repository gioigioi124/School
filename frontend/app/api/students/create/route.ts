import { NextResponse } from 'next/server';
import { createClient as createServerSupabase } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      studentName, 
      parentPhone, 
      parentName, 
      defaultPassword = '123456', 
      classId, 
      avatarUrl = '🐻' 
    } = body;

    if (!studentName || !parentPhone) {
      return NextResponse.json({ error: 'Tên học sinh và Số điện thoại bố mẹ là bắt buộc.' }, { status: 400 });
    }

    // Clean phone number (remove non-digit characters)
    const cleanPhone = parentPhone.replace(/\D/g, '');
    if (cleanPhone.length < 9 || cleanPhone.length > 11) {
      return NextResponse.json({ error: 'Số điện thoại không hợp lệ (từ 9 - 11 chữ số).' }, { status: 400 });
    }

    // Virtual email for Supabase Auth
    const parentAuthEmail = `${cleanPhone}@kinderly.com`;

    // 1. Create a standalone Supabase client to register the Auth user
    const anonSupabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );

    // Try to register parent auth user
    const { data: authData, error: authError } = await anonSupabase.auth.signUp({
      email: parentAuthEmail,
      password: defaultPassword,
    });

    // Check if parent already has children in the system
    const { data: existingProfiles } = await supabase
      .from('profiles')
      .select('id, displayName, parentPhone, email')
      .or(`parentPhone.eq.${cleanPhone},phone.eq.${cleanPhone},email.eq.${parentAuthEmail}`);

    const isExistingParent = Boolean(existingProfiles && existingProfiles.length > 0);

    let studentProfileId: string;
    let studentEmail: string;

    if (!isExistingParent && authData?.user?.id) {
      // First child uses the Auth User's ID
      studentProfileId = authData.user.id;
      studentEmail = parentAuthEmail;
    } else {
      // Sibling or existing parent: generate a unique student profile ID
      studentProfileId = crypto.randomUUID();
      studentEmail = `${cleanPhone}_${studentProfileId.slice(0, 6)}@kinderly.com`;
    }

    // 2. Insert or update the student profile
    const { data: newStudent, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: studentProfileId,
        email: studentEmail,
        displayName: studentName.trim(),
        avatarUrl: avatarUrl,
        parentPhone: cleanPhone,
        parentName: parentName?.trim() || null,
        phone: cleanPhone,
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      throw profileError;
    }

    // 3. Enroll in class if provided
    if (classId) {
      const { error: enrollError } = await supabase
        .from('class_enrollments')
        .insert({
          id: crypto.randomUUID(),
          classId: classId,
          profileId: studentProfileId,
          role: 'student',
        });

      if (enrollError) {
        console.error('Enrollment error:', enrollError);
      }
    }

    return NextResponse.json({
      success: true,
      isExistingParent,
      existingChildrenCount: existingProfiles?.length || 0,
      student: newStudent,
      credentials: {
        phone: cleanPhone,
        defaultPassword: defaultPassword,
      }
    });

  } catch (error: any) {
    console.error('Create student error:', error);
    return NextResponse.json({ error: error.message || 'Lỗi tạo tài khoản học sinh.' }, { status: 500 });
  }
}
