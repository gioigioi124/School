'use client';

import React, { useState } from 'react';
import { RotateCcw, CheckCircle2, Star, Trophy, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { CelebrationConfetti } from '@/components/student/CelebrationConfetti';
import { sounds } from '@/lib/sounds';

interface MathQuestion {
  id: number;
  items: string[];
  emoji: string;
  count: number;
  question: string;
  options: number[];
  answer: number;
}

const QUESTIONS: MathQuestion[] = [
  {
    id: 1,
    items: ['🍎', '🍎', '🍎'],
    emoji: '🍎',
    count: 3,
    question: 'Bé hãy đếm xem có bao nhiêu quả táo đỏ nhé?',
    options: [2, 3, 4, 5],
    answer: 3,
  },
  {
    id: 2,
    items: ['⭐️', '⭐️', '⭐️', '⭐️', '⭐️'],
    emoji: '⭐️',
    count: 5,
    question: 'Có bao nhiêu ngôi sao vàng đang lấp lánh?',
    options: [4, 5, 6, 7],
    answer: 5,
  },
  {
    id: 3,
    items: ['🐱', '🐱'],
    emoji: '🐱',
    count: 2,
    question: 'Có bao nhiêu chú mèo con đang vẫy đuôi?',
    options: [1, 2, 3, 4],
    answer: 2,
  },
  {
    id: 4,
    items: ['🎈', '🎈', '🎈', '🎈'],
    emoji: '🎈',
    count: 4,
    question: 'Có bao nhiêu quả bóng bay rực rỡ sắc màu?',
    options: [3, 4, 5, 6],
    answer: 4,
  },
];

export function MathCountingGame() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const supabase = createClient();

  const currentQ = QUESTIONS[currentIdx];

  const handleSelectAnswer = async (option: number) => {
    setSelectedOption(option);

    if (option === currentQ.answer) {
      sounds.playCorrect();
      sounds.playStar();
      setScore((s) => s + 25);
      toast.success('🎉 Chính xác rồi! Bé đếm rất giỏi!');

      if (currentIdx + 1 < QUESTIONS.length) {
        setTimeout(() => {
          setSelectedOption(null);
          setCurrentIdx((idx) => idx + 1);
        }, 1200);
      } else {
        setIsCompleted(true);
        setShowConfetti(true);
        sounds.playLevelUp();
        toast.custom(
          (t) => (
            <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-2xl border-2 border-primary flex items-center gap-4 animate-scale-in">
              <span className="text-4xl">👑</span>
              <div>
                <h4 className="font-heading font-bold text-lg text-primary">Xuất sắc! Nhà thông thái nhí!</h4>
                <p className="font-sans text-xs text-on-surface-variant">Bé nhận được <strong>+20 XP</strong> thưởng vào tài khoản!</p>
              </div>
            </div>
          ),
          { duration: 4000 }
        );

        // Sync XP to Supabase
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('xp_history').insert({
              student_id: user.id,
              action: 'Chơi game: Bé Tập Đếm Số (100 điểm)',
              xp_amount: 20,
              source_type: 'game',
            });

            const { data: xpRow } = await supabase
              .from('user_xp')
              .select('*')
              .eq('student_id', user.id)
              .maybeSingle();

            const newTotal = (xpRow?.total_xp || 0) + 20;
            const newStars = (xpRow?.total_stars || 0) + 1;
            const newLevel = Math.floor(newTotal / 1000) + 1;

            await supabase.from('user_xp').upsert({
              student_id: user.id,
              total_xp: newTotal,
              total_stars: newStars,
              current_level: newLevel,
            });
          }
        } catch (err) {
          console.error('Error syncing math game score:', err);
        }
      }
    } else {
      sounds.playWrong();
      toast.error('Chưa đúng rồi, bé hãy cùng đếm lại từng hình một nhé!');
    }
  };

  const handleReset = () => {
    sounds.playPop();
    setCurrentIdx(0);
    setScore(0);
    setSelectedOption(null);
    setIsCompleted(false);
  };

  return (
    <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-soft border border-outline-variant/30 space-y-6">
      <CelebrationConfetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-outline-variant/20">
        <div>
          <h3 className="font-heading font-bold text-xl text-on-surface flex items-center gap-2">
            <span>🔢 Bé Tập Đếm Số & Hình Vui Nhộn</span>
            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-bold font-heading">
              +20 XP
            </span>
          </h3>
          <p className="font-sans text-xs text-on-surface-variant mt-1">
            Bé hãy đếm số lượng đồ vật trên màn hình và chọn con số đúng bên dưới nhé!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-1.5 rounded-xl bg-primary-container text-on-primary-container font-heading font-bold text-sm">
            Điểm: {score}/100
          </div>
          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer"
            title="Chơi lại từ đầu"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isCompleted ? (
        <div className="space-y-8 text-center max-w-xl mx-auto py-4">
          {/* Question Indicator */}
          <div className="flex items-center justify-between text-xs font-heading font-bold text-on-surface-variant">
            <span>Câu hỏi {currentIdx + 1} / {QUESTIONS.length}</span>
            <span>{currentQ.question}</span>
          </div>

          {/* Visual Counting Box */}
          <div className="p-8 bg-surface-bright rounded-3xl border-2 border-primary/20 shadow-inner flex items-center justify-center gap-4 flex-wrap min-h-[140px]">
            {currentQ.items.map((item, idx) => (
              <span
                key={idx}
                className="text-5xl sm:text-6xl hover:scale-125 transition-transform cursor-pointer animate-bounce"
                style={{ animationDelay: `${idx * 0.15}s` }}
                onClick={() => sounds.playPop()}
              >
                {item}
              </span>
            ))}
          </div>

          {/* Multiple Choices */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {currentQ.options.map((opt) => {
              const isSelected = selectedOption === opt;
              const isCorrect = opt === currentQ.answer;

              return (
                <button
                  key={opt}
                  onClick={() => handleSelectAnswer(opt)}
                  className={`p-5 rounded-3xl font-heading font-bold text-2xl transition-all cursor-pointer shadow-sm ${
                    isSelected
                      ? isCorrect
                        ? 'bg-emerald-100 text-emerald-900 border-2 border-emerald-400 scale-105'
                        : 'bg-rose-100 text-rose-900 border-2 border-rose-400'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/30 hover:scale-105 active:scale-95'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-200 text-center space-y-4 animate-fade-in">
          <span className="text-6xl block animate-bounce">🏆</span>
          <h4 className="font-heading font-bold text-emerald-900 text-2xl">
            Bé Đã Hoàn Thành Trò Chơi Xuất Sắc!
          </h4>
          <p className="font-sans text-sm text-emerald-800">
            Bé đã trả lời đúng toàn bộ câu hỏi và nhận trọn vẹn <strong>+20 XP</strong> thưởng!
          </p>
          <button
            onClick={handleReset}
            className="px-8 py-3 rounded-full bg-primary text-on-primary font-heading font-bold text-sm btn-3d hover:bg-primary-dark transition-all cursor-pointer shadow-md"
          >
            Chơi lại lần nữa
          </button>
        </div>
      )}
    </div>
  );
}
