import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-surface-container-lowest rounded-3xl p-8 shadow-2xl border border-outline-variant/30 space-y-6">
        <div className="text-7xl animate-bounce">🎈</div>
        <div className="space-y-2">
          <h2 className="font-heading text-3xl font-bold text-on-surface">
            Ồ! Trang không tìm thấy
          </h2>
          <p className="font-sans text-xs sm:text-sm text-on-surface-variant">
            Trang bạn đang tìm kiếm có thể đã được di chuyển hoặc chưa từng tồn tại. Cùng quay trở lại nhé!
          </p>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-2xl bg-primary text-on-primary font-heading font-bold text-xs hover:bg-primary/90 transition-all shadow-md inline-flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Trang chủ</span>
          </Link>
          <Link
            href="/portal"
            className="px-6 py-3 rounded-2xl bg-secondary text-on-secondary font-heading font-bold text-xs hover:bg-secondary/90 transition-all shadow-md inline-flex items-center gap-2"
          >
            <span>Cổng học sinh</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
