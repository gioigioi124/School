import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { determineUserRole } from '@/lib/auth-helpers';

export default async function TeacherLayout({
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
  if (role === 'student') {
    redirect('/portal');
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
