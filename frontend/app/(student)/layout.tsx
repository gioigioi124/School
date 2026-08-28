import React from 'react';
import { StudentNavbar } from '@/components/student/StudentNavbar';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { determineUserRole } from '@/lib/auth-helpers';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const role = determineUserRole(user);
  if (role === 'teacher') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-surface-bright flex flex-col font-sans text-on-surface pb-16 md:pb-6">
      <StudentNavbar />
      <main className="flex-1 w-full">{children}</main>
    </div>
  );
}
