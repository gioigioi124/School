'use client';

import { useState } from 'react';
import { Sparkles, Trophy, RotateCcw, CheckCircle2, Delete } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';

const PUZZLES = [
  {
    target: 'BÉ NGOAN',
    hint: 'Em bé lễ phép, nghe lời cô giáo và cha mẹ gọi là gì?',
    scrambled: ['N', 'B', 'A', 'É', 'O', 'G'],
  },
  {
    target: 'TRƯỜNG HỌC',
    hint: 'Nơi bé cùng các bạn đến học chữ và vui chơi mỗi ngày?',
    scrambled: ['Ọ', 'T', 'H', 'Ư', 'Ờ', 'R', 'N', 'G', 'C'],
  },
];

export function WordPuzzleGame() {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const supabase = createClient();

  const currentPuzzle = PUZZLES[puzzleIndex];
  const targetClean = currentPuzzle.target.replace(/\s+/g, '');
  const currentSelectedStr = selectedLetters.join('');

  const handleAddLetter = (letter: string) => {
    if (selectedLetters.length >= targetClean.length) return;
    const next = [...selectedLetters, letter];
    setSelectedLetters(next);

    if (next.join('') === targetClean) {
      toast.success('🎉 Chính xác! Bé ghép từ rất chuẩn!', { duration: 1500 });
      if (puzzleIndex + 1 < PUZZLES.length) {
        setTimeout(() => {
          setPuzzleIndex((p) => p + 1);
          setSelectedLetters([]);
        }, 1200);
      } else {
        setIsCompleted(true);
        // Record score to Supabase and update user XP
        (async () => {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const { data: profiles } = await supabase
                .from('profiles')
                .select('id')
                .or(`id.eq.${user.id},email.eq.${user.email}`);
              
              const studentId = profiles?.[0]?.id || user.id;

              // 1. Insert history
              await supabase.from('xp_history').insert({
                student_id: studentId,
                action: 'Chơi game: Ghép Chữ Thành Từ',
                xp_amount: 20,
                source_type: 'game',
              });

              // 2. Update user_xp
              const { data: currentXp } = await supabase
                .from('user_xp')
                .select('*')
                .eq('student_id', studentId)
                .single();

              const totalXp = (currentXp?.total_xp || 0) + 20;
              const totalStars = (currentXp?.total_stars || 0) + 1;
              const currentLevel = Math.floor(totalXp / 1000) + 1;

              await supabase.from('user_xp').upsert({
                student_id: studentId,
                total_xp: totalXp,
                total_stars: totalStars,
                current_level: currentLevel,
              });
            }
          } catch (err) {
            console.error('Error recording word puzzle xp:', err);
          }
        })();
      }
    }
  };

  const handleRemoveLast = () => {
    setSelectedLetters((prev) => prev.slice(0, -1));
  };

  const resetGame = () => {
    setPuzzleIndex(0);
    setSelectedLetters([]);
    setIsCompleted(false);
  };

  return (
    <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-md border border-outline-variant/30 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-outline-variant/20">
        <div>
          <h3 className="font-heading font-bold text-xl text-on-surface flex items-center gap-2">
            <span>🧩 Ghép Chữ Thành Từ</span>
            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-bold font-heading">
              +20 XP
            </span>
          </h3>
          <p className="font-sans text-xs text-on-surface-variant mt-1">
            Gợi ý: <strong>{currentPuzzle.hint}</strong>
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-xl bg-primary-container text-on-primary-container font-heading font-bold text-xs">
          Màn {puzzleIndex + 1}/{PUZZLES.length}
        </span>
      </div>

      {!isCompleted ? (
        <div className="space-y-6">
          {/* Target Word Slots */}
          <div className="flex justify-center items-center gap-2 sm:gap-3 py-4 flex-wrap">
            {targetClean.split('').map((_, i) => {
              const char = selectedLetters[i] || '';
              return (
                <div
                  key={i}
                  className={`w-12 h-14 sm:w-14 sm:h-16 rounded-2xl flex items-center justify-center font-heading font-bold text-2xl border-2 transition-all ${
                    char
                      ? 'bg-primary text-on-primary border-primary shadow-md scale-105'
                      : 'bg-surface-container border-dashed border-outline-variant/50 text-on-surface-variant'
                  }`}
                >
                  {char}
                </div>
              );
            })}
          </div>

          {/* Letter Selection Tiles */}
          <div className="flex justify-center items-center gap-2 sm:gap-3 flex-wrap pt-2">
            {currentPuzzle.scrambled.map((letter, i) => (
              <button
                key={i}
                onClick={() => handleAddLetter(letter)}
                className="w-11 h-12 sm:w-13 sm:h-14 rounded-2xl bg-surface-container hover:bg-secondary hover:text-on-secondary text-on-surface font-heading font-bold text-xl border border-outline-variant/30 shadow-xs transition-all transform hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center"
              >
                {letter}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={handleRemoveLast}
              disabled={selectedLetters.length === 0}
              className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-heading font-bold text-on-surface-variant transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>Xóa chữ vừa chọn</span>
            </button>
            <button
              onClick={() => setSelectedLetters([])}
              className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-heading font-bold text-on-surface-variant transition-colors cursor-pointer"
            >
              <span>Làm lại từ này</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 space-y-4 animate-scale-in">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-4xl mx-auto shadow-inner">
            🌟
          </div>
          <div>
            <h4 className="font-heading font-bold text-2xl text-on-surface">
              Bé ghép chữ siêu đỉnh!
            </h4>
            <p className="font-sans text-sm text-on-surface-variant mt-1">
              Bé đã giải mã tất cả các ô chữ và nhận thưởng <strong>+20 XP</strong>!
            </p>
          </div>

          <button
            onClick={resetGame}
            className="px-8 py-3 rounded-2xl bg-primary text-on-primary font-heading font-bold text-sm hover:bg-primary/90 transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Chơi lại từ đầu</span>
          </button>
        </div>
      )}
    </div>
  );
}
