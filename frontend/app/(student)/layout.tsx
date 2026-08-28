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
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 md:p-6 pb-24 md:pb-8">
          {children}
        </main>
        {/* Mobile Navigation */}
        <StudentMobileNav />
      </div>
    </div>
  );
}
