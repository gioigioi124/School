import React from 'react';
import { StudentNavbar } from '@/components/student/StudentNavbar';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-bright flex flex-col font-sans text-on-surface pb-16 md:pb-6">
      <StudentNavbar />
      <main className="flex-1 w-full">{children}</main>
    </div>
  );
}
