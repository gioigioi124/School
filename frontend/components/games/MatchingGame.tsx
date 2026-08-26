'use client';

import { useState } from 'react';
import { Sparkles, Trophy, RotateCcw, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';

const PAIRS = [
  { id: '1', item: '🦁 Sư Tử', match: 'Chúa tể sơn lâm dũng mãnh' },
  { id: '2', item: '🐘 Voi Con', match: 'Loài vật to lớn có chiếc vòi dài' },
  { id: '3', item: '🐬 Cá Heo', match: 'Người bạn thông minh bơi dưới biển' },
  { id: '4', item: '🐰 Thỏ Trắng', match: 'Đôi tai dài và thích ăn cà rốt' },
];

export function MatchingGame() {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const supabase = createClient();

  const handleSelectItem = (id: string) => {
    if (matchedIds.includes(id)) return;
    setSelectedItem(id);
    if (selectedMatch) {
      checkMatch(id, selectedMatch);
    }
  };

  const handleSelectMatch = (id: string) => {
    if (matchedIds.includes(id)) return;
    setSelectedMatch(id);
    if (selectedItem) {
      checkMatch(selectedItem, id);
    }
  };

  const checkMatch = async (itemId: string, matchId: string) => {
    if (itemId === matchId) {
      const newMatched = [...matchedIds, itemId];
      setMatchedIds(newMatched);
      setScore((s) => s + 25);
      toast.success('🎉 Chính xác rồi! Bé giỏi quá!', { duration: 1500 });
      setSelectedItem(null);
      setSelectedMatch(null);

      if (newMatched.length === PAIRS.length) {
        setIsCompleted(true);
        toast.custom(
          (t) => (
            <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-2xl border-2 border-primary flex items-center gap-4 animate-scale-in">
              <span className="text-4xl">👑</span>
              <div>
                <h4 className="font-heading font-bold text-lg text-primary">Tuyệt vời! Hoàn thành xuất sắc!</h4>
                <p className="font-sans text-xs text-on-surface-variant">Bé nhận được <strong>+20 XP</strong> thưởng vào tài khoản!</p>
              </div>
            </div>
          ),
          { duration: 4000 }
        );

        // Record score to Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('xp_history').insert({
            studentId: user.id,
            action: 'Chơi game: Nối Hình Con Vật (100 điểm)',
            xpAmount: 20,
            sourceType: 'game',
          });
        }
      }
    } else {
      toast.error('Chưa đúng rồi, bé hãy thử lại nhé!', { duration: 1200 });
      setSelectedItem(null);
      setSelectedMatch(null);
    }
  };

  const resetGame = () => {
    setMatchedIds([]);
    setSelectedItem(null);
    setSelectedMatch(null);
    setScore(0);
    setIsCompleted(false);
  };

  return (
    <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-md border border-outline-variant/30 space-y-6">
      {/* Game Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-outline-variant/20">
        <div>
          <h3 className="font-heading font-bold text-xl text-on-surface flex items-center gap-2">
            <span>🦁 Nối Hình Con Vật</span>
            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-bold font-heading">
              +20 XP
            </span>
          </h3>
          <p className="font-sans text-xs text-on-surface-variant mt-1">
            Bé hãy chọn một con vật bên trái, sau đó chọn đặc điểm đúng tương ứng ở bên phải nhé!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-1.5 rounded-xl bg-primary-container text-on-primary-container font-heading font-bold text-sm">
            Điểm: {score}/100
          </div>
          <button
            onClick={resetGame}
            aria-label="Chơi lại"
            className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Matching Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Left Column: Animals */}
        <div className="space-y-3">
          <p className="font-heading font-bold text-xs text-on-surface-variant uppercase tracking-wider">
            Cột Con Vật
          </p>
          {PAIRS.map((pair) => {
            const isMatched = matchedIds.includes(pair.id);
            const isSelected = selectedItem === pair.id;

            return (
              <button
                key={pair.id}
                disabled={isMatched}
                onClick={() => handleSelectItem(pair.id)}
                className={`w-full p-4 rounded-2xl font-heading font-bold text-sm text-left transition-all duration-200 flex items-center justify-between cursor-pointer ${
                  isMatched
                    ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-300 opacity-80 cursor-default'
                    : isSelected
                    ? 'bg-primary text-on-primary shadow-md scale-102 ring-4 ring-primary/20'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/30 active:scale-98'
                }`}
              >
                <span>{pair.item}</span>
                {isMatched && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              </button>
            );
          })}
        </div>

        {/* Right Column: Descriptions */}
        <div className="space-y-3">
          <p className="font-heading font-bold text-xs text-on-surface-variant uppercase tracking-wider">
            Cột Đặc Điểm
          </p>
          {PAIRS.map((pair) => {
            const isMatched = matchedIds.includes(pair.id);
            const isSelected = selectedMatch === pair.id;

            return (
              <button
                key={pair.id}
                disabled={isMatched}
                onClick={() => handleSelectMatch(pair.id)}
                className={`w-full p-4 rounded-2xl font-sans font-medium text-xs text-left transition-all duration-200 flex items-center justify-between cursor-pointer ${
                  isMatched
                    ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-300 opacity-80 cursor-default'
                    : isSelected
                    ? 'bg-secondary text-on-secondary shadow-md scale-102 ring-4 ring-secondary/20'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/30 active:scale-98'
                }`}
              >
                <span>{pair.match}</span>
                {isMatched && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              </button>
            );
          })}
        </div>
      </div>

      {isCompleted && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2 animate-fade-in">
          <p className="font-heading font-bold text-emerald-800 text-sm">
            🎉 Bé đã hoàn thành trò chơi xuất sắc và nhận trọn vẹn 20 XP!
          </p>
          <button
            onClick={resetGame}
            className="px-6 py-2 rounded-xl bg-primary text-on-primary font-heading font-bold text-xs hover:bg-primary/90 transition-all cursor-pointer"
          >
            Chơi lại lần nữa
          </button>
        </div>
      )}
    </div>
  );
}
