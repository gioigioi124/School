'use client';

import { useState } from 'react';
import { Sparkles, Trophy, RotateCcw, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';

const QUESTIONS = [
  {
    question: 'Mặt trời mọc vào buổi nào trong ngày hả bé?',
    options: ['Buổi sáng sớm', 'Buổi trưa nắng', 'Buổi tối muộn'],
    answer: 0,
    explanation: 'Mặt trời mọc ở hướng Đông vào mỗi buổi sáng sớm!',
  },
  {
    question: 'Đèn tín hiệu giao thông màu nào báo hiệu bé phải DỪNG LẠI?',
    options: ['Đèn màu xanh lá', 'Đèn màu đỏ', 'Đèn màu vàng'],
    answer: 1,
    explanation: 'Đèn đỏ báo hiệu dừng lại để đảm bảo an toàn giao thông.',
  },
  {
    question: 'Con vật nào sau đây biết gáy "Ò ó o o" gọi mọi người thức giấc?',
    options: ['Chú Chó cưng', 'Chú Mèo con', 'Chú Gà trống'],
    answer: 2,
    explanation: 'Chú gà trống chăm chỉ gáy mỗi sớm mai.',
  },
  {
    question: 'Cầu vồng rực rỡ trên bầu trời có bao nhiêu màu sắc chính?',
    options: ['3 màu sắc', '5 màu sắc', '7 màu sắc'],
    answer: 2,
    explanation: 'Cầu vồng gồm 7 sắc màu lung linh: Đỏ, Cam, Vàng, Lục, Lam, Chàm, Tím!',
  },
];

export function QuizGame() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const supabase = createClient();

  const currentQuestion = QUESTIONS[currentIdx];

  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    setShowResult(true);

    if (idx === currentQuestion.answer) {
      setScore((s) => s + 25);
      toast.success('Chính xác! Bé xuất sắc quá!', { duration: 1500 });
    } else {
      toast.error('Tiếc quá, chưa đúng rồi!', { duration: 1500 });
    }
  };

  const handleNext = async () => {
    if (currentIdx + 1 < QUESTIONS.length) {
      setCurrentIdx((i) => i + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setIsFinished(true);
      const earnedXp = Math.round((score / 100) * 25);
      toast.success(`Bé hoàn thành bài đố vui và nhận được +${earnedXp} XP!`);

      // Record score and sync XP to Supabase / Backend
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
            action: `Chơi game: Đố Vui Thông Thái (${score}/100 điểm)`,
            xp_amount: earnedXp,
            source_type: 'game',
          });

          // 2. Update user_xp
          const { data: currentXp } = await supabase
            .from('user_xp')
            .select('*')
            .eq('student_id', studentId)
            .single();

          const totalXp = (currentXp?.total_xp || 0) + earnedXp;
          const totalStars = (currentXp?.total_stars || 0) + 1;
          const currentLevel = Math.floor(totalXp / 1000) + 1;

          await supabase.from('user_xp').upsert({
            student_id: studentId,
            total_xp: totalXp,
            total_stars: totalStars,
            current_level: currentLevel,
          });

          // 3. Check first_lesson or quiz_master badge
          if (score === 100) {
            const { data: badge } = await supabase
              .from('badges')
              .select('id')
              .eq('code', 'quiz_master')
              .single();
            if (badge) {
              await supabase.from('user_badges').upsert({
                student_id: studentId,
                badge_id: badge.id,
              }, { onConflict: 'student_id,badge_id' });
            }
          }
        }
      } catch (err) {
        console.error('Error recording quiz game xp:', err);
      }
    }
  };

  const resetGame = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setShowResult(false);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-md border border-outline-variant/30 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-outline-variant/20">
        <div>
          <h3 className="font-heading font-bold text-xl text-on-surface flex items-center gap-2">
            <span>🎯 Đố Vui Thông Thái</span>
            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-bold font-heading">
              +25 XP
            </span>
          </h3>
          <p className="font-sans text-xs text-on-surface-variant mt-1">
            Trả lời các câu hỏi đố vui nhanh để nâng cao kiến thức và nhận sao thưởng!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-xl bg-secondary-container text-on-secondary-container font-heading font-bold text-xs">
            Câu {currentIdx + 1}/{QUESTIONS.length}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-primary-container text-on-primary-container font-heading font-bold text-xs">
            Điểm: {score}
          </span>
        </div>
      </div>

      {!isFinished ? (
        <div className="space-y-6">
          {/* Question Box */}
          <div className="p-5 rounded-2xl bg-surface-container text-on-surface">
            <h4 className="font-heading font-bold text-base sm:text-lg leading-relaxed">
              {currentQuestion.question}
            </h4>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQuestion.answer;

              let btnStyle =
                'bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/30';
              if (showResult) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-100 text-emerald-900 border-2 border-emerald-500 font-bold';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'bg-rose-100 text-rose-900 border-2 border-rose-400';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={showResult}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full p-4 rounded-2xl font-sans text-sm text-left transition-all duration-200 flex items-center justify-between cursor-pointer ${btnStyle}`}
                >
                  <span className="flex items-center gap-3 font-medium">
                    <span className="w-7 h-7 rounded-xl bg-surface flex items-center justify-center font-bold text-xs">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </span>
                  {showResult && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation & Next button */}
          {showResult && (
            <div className="space-y-4 pt-2 animate-fade-in">
              <div className="p-3.5 rounded-xl bg-primary-container/20 border border-primary/30 text-xs font-sans text-on-surface">
                💡 <strong>Giải thích:</strong> {currentQuestion.explanation}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-2xl bg-secondary text-on-secondary font-heading font-bold text-xs hover:bg-secondary/90 transition-all shadow-sm cursor-pointer flex items-center gap-2"
                >
                  <span>{currentIdx + 1 < QUESTIONS.length ? 'Câu tiếp theo ➜' : 'Xem kết quả 🎉'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 space-y-4 animate-scale-in">
          <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center text-4xl mx-auto shadow-inner">
            🏆
          </div>
          <div>
            <h4 className="font-heading font-bold text-2xl text-on-surface">
              Hoàn thành xuất sắc bài đố vui!
            </h4>
            <p className="font-sans text-sm text-on-surface-variant mt-1">
              Bé đạt được <strong>{score}/100</strong> điểm và nhận được{' '}
              <strong className="text-secondary">+{Math.round((score / 100) * 25)} XP</strong>.
            </p>
          </div>

          <button
            onClick={resetGame}
            className="px-8 py-3 rounded-2xl bg-primary text-on-primary font-heading font-bold text-sm hover:bg-primary/90 transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Chơi lại lần nữa</span>
          </button>
        </div>
      )}
    </div>
  );
}
