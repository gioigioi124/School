import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--gradient-background)]">
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center animate-fade-in">
        <div className="bg-primary/10 p-6 rounded-full mb-8 shadow-glow">
          <GraduationCap className="w-16 h-16 text-primary" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground mb-6">
          Hệ Thống Học Tập <span className="text-transparent bg-clip-text bg-gradient-primary">Gamification</span>
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground mb-10">
          Nền tảng quản lý lớp học hiện đại. Kết hợp các yếu tố trò chơi (XP, Huy hiệu, Bảng xếp hạng) để tạo động lực và niềm vui trong học tập!
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/login">
            <Button size="lg" variant="gradient" className="w-full sm:w-auto text-lg px-8">
              Đăng nhập ngay
            </Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8">
              Tạo tài khoản
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
