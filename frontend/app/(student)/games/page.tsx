'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Gamepad2, Award, Star, Flame, Sparkles } from 'lucide-react';
import { MatchingGame } from '@/components/games/MatchingGame';
import { QuizGame } from '@/components/games/QuizGame';
import { WordPuzzleGame } from '@/components/games/WordPuzzleGame';
import { MathCountingGame } from '@/components/games/MathCountingGame';
import { sounds } from '@/lib/sounds';

export default function GamesPage() {
  const [activeTab, setActiveTab] = useState<'matching' | 'quiz' | 'puzzle' | 'math'>('matching');

  const handleTabChange = (tab: 'matching' | 'quiz' | 'puzzle' | 'math') => {
    sounds.playPop();
    setActiveTab(tab);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 font-sans space-y-8 animate-fade-in pb-12">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link
            href="/portal"
            onClick={() => sounds.playPop()}
            className="inline-flex items-center text-xs font-bold text-on-surface-variant hover:text-primary transition-colors gap-2 group mb-2"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Quay lại Cổng học sinh</span>
          </Link>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-on-surface flex items-center gap-2.5">
            <span>Góc Trò Chơi Học Tập</span>
            <span className="text-3xl">🎮</span>
          </h1>
          <p className="font-sans text-xs sm:text-sm text-on-surface-variant mt-1">
            Vừa chơi vui nhộn vừa rèn luyện trí nhớ, tư duy và tích luỹ điểm thưởng XP mỗi ngày!
          </p>
        </div>

        {/* Quick Bonus Pill */}
        <div className="flex items-center gap-2 px-4 py-2 bg-secondary-container text-on-secondary-container rounded-full text-xs font-heading font-bold shadow-xs">
          <Sparkles className="w-4 h-4 text-secondary" />
          <span>Mỗi game +20 XP</span>
        </div>
      </div>

      {/* Game Tabs */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 no-scrollbar">
        <button
          type="button"
          onClick={() => handleTabChange('matching')}
          className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-heading font-bold text-xs sm:text-sm transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
            activeTab === 'matching'
              ? 'bg-primary text-on-primary shadow-md scale-102 ring-2 ring-primary/20'
              : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface border border-outline-variant/30'
          }`}
        >
          <span>🦁 Nối Hình Con Vật</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('math')}
          className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-heading font-bold text-xs sm:text-sm transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
            activeTab === 'math'
              ? 'bg-emerald-600 text-white shadow-md scale-102 ring-2 ring-emerald-400/30'
              : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface border border-outline-variant/30'
          }`}
        >
          <span>🔢 Bé Tập Đếm Số</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('quiz')}
          className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-heading font-bold text-xs sm:text-sm transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
            activeTab === 'quiz'
              ? 'bg-secondary text-on-secondary shadow-md scale-102 ring-2 ring-secondary/20'
              : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface border border-outline-variant/30'
          }`}
        >
          <span>🎯 Đố Vui Thông Thái</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('puzzle')}
          className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-heading font-bold text-xs sm:text-sm transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
            activeTab === 'puzzle'
              ? 'bg-purple-600 text-white shadow-md scale-102 ring-2 ring-purple-400/30'
              : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface border border-outline-variant/30'
          }`}
        >
          <span>🧩 Ghép Chữ Thành Từ</span>
        </button>
      </div>

      {/* Active Game View */}
      <div className="transition-all">
        {activeTab === 'matching' && <MatchingGame />}
        {activeTab === 'math' && <MathCountingGame />}
        {activeTab === 'quiz' && <QuizGame />}
        {activeTab === 'puzzle' && <WordPuzzleGame />}
      </div>
    </div>
  );
}
