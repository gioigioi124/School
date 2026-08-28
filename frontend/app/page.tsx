import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--gradient-background)]">
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center animate-fade-in py-12">
        <div className="bg-primary/10 p-5 sm:p-6 rounded-full mb-6 sm:mb-8 shadow-glow">
          <GraduationCap className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-4 sm:mb-6 leading-tight">
          Hệ Thống Học Tập <span className="text-transparent bg-clip-text bg-gradient-primary">Gamification</span>
        </h1>
        <p className="max-w-2xl text-sm sm:text-base lg:text-lg text-muted-foreground mb-8 sm:mb-10 px-2">
          Nền tảng quản lý lớp học hiện đại Cấp Tiểu Học. Kết hợp các yếu tố trò chơi (XP, Huy hiệu, Bảng xếp hạng) để tạo động lực và niềm vui trong học tập!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto max-w-xs sm:max-w-none">
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" variant="gradient" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 rounded-xl">
              Đăng nhập ngay
            </Button>
          </Link>
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 rounded-xl">
              Tạo tài khoản
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
