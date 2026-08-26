'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-surface-container-lowest rounded-3xl p-8 shadow-2xl border border-outline-variant/30 space-y-6">
        <div className="text-7xl">🩹</div>
        <div className="space-y-2">
          <h2 className="font-heading text-2xl font-bold text-on-surface">
            Có chút trục trặc nhỏ rồi!
          </h2>
          <p className="font-sans text-xs text-on-surface-variant">
            Hệ thống vừa gặp sự cố gián đoạn. Bạn hãy nhấn thử lại hoặc quay về trang chủ nhé.
          </p>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="px-6 py-3 rounded-2xl bg-primary text-on-primary font-heading font-bold text-xs hover:bg-primary/90 transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Thử lại</span>
          </button>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-2xl bg-surface-container text-on-surface-variant font-heading font-bold text-xs hover:bg-surface-container-high transition-colors inline-flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Về trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
