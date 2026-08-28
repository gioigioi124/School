import React from 'react';
import { StudentSidebar } from '@/components/student/StudentSidebar';
import { StudentMobileNav } from '@/components/student/StudentMobileNav';
import { getServerUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { determineUserRole } from '@/lib/auth-helpers';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerUser();

  if (!user) {
    redirect('/login');
  }

  const role = determineUserRole(user);
  if (role === 'teacher') {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Student Sidebar */}
      <StudentSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-auto p-4 sm:p-6 pb-20 md:pb-6">
          {children}
        </main>
        {/* Mobile Navigation */}
        <StudentMobileNav />
      </div>
    </div>
  );
}
