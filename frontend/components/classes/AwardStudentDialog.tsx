'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Star, Award, Trophy, Heart, Sparkles, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import api from '@/lib/api';
import { createClient } from '@/lib/supabase/client';

const REWARD_TYPES = [
  { id: 'star', title: 'Tặng 1 Sao', icon: Star, color: 'bg-secondary-container text-on-secondary-container', points: 10, stars: 1 },
  { id: 'heart', title: 'Chăm chỉ', icon: Heart, color: 'bg-pink-100 text-pink-700', points: 15, stars: 1 },
  { id: 'trophy', title: 'Xuất sắc', icon: Trophy, color: 'bg-amber-100 text-amber-800', points: 30, stars: 2 },
  { id: 'award', title: 'Tiến bộ', icon: Award, color: 'bg-emerald-100 text-emerald-800', points: 20, stars: 1 },
];

export function AwardStudentDialog({
  studentId,
  studentName,
  avatar,
  classId,
  onAwardSuccess,
  customTrigger,
}: {
  studentId?: string;
  studentName: string;
  avatar?: string;
  classId?: string;
  onAwardSuccess?: () => void;
  customTrigger?: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState(REWARD_TYPES[0]);
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleAward = async () => {
    setIsLoading(true);
    try {
      if (studentId) {
        // Attempt via NestJS backend API first
        try {
          await api.post('/gamification/award-xp', {
            studentId,
            xpAmount: selectedReward.points,
            starsAmount: selectedReward.stars,
            action: `Cô giáo khen thưởng: ${selectedReward.title}${note ? ` (${note})` : ''}`,
            sourceType: 'award',
            sourceId: classId || undefined,
          });
        } catch (apiErr) {
          // Direct Supabase fallback
          await supabase.from('xp_history').insert({
            student_id: studentId,
            action: `Cô giáo khen thưởng: ${selectedReward.title}${note ? ` (${note})` : ''}`,
            xp_amount: selectedReward.points,
            source_type: 'award',
            source_id: classId || null,
          });

          // Fetch current XP to upsert
          const { data: currentXp } = await supabase
            .from('user_xp')
            .select('*')
            .eq('student_id', studentId)
            .single();

          const totalXp = (currentXp?.total_xp || 0) + selectedReward.points;
          const totalStars = (currentXp?.total_stars || 0) + selectedReward.stars;
          const currentLevel = Math.floor(totalXp / 1000) + 1;

          await supabase.from('user_xp').upsert({
            student_id: studentId,
            total_xp: totalXp,
            total_stars: totalStars,
            current_level: currentLevel,
          });
        }
      }

      toast.success(
        `Đã trao "${selectedReward.title}" (+${selectedReward.points} XP, +${selectedReward.stars} ⭐) cho bé ${studentName}!`,
        {
          icon: '🎉',
          duration: 3500,
        }
      );
      setOpen(false);
      setNote('');
      onAwardSuccess?.();
    } catch (error: any) {
      console.error('Award error:', error);
      toast.error('Có lỗi xảy ra khi trao thưởng.');
    } finally {
      setIsLoading(false);
    }
  };

  const defaultTrigger = (
    <button
      type="button"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 transition-all shadow-2xs cursor-pointer"
    >
      <Star className="w-3.5 h-3.5 fill-current" />
      <span>Tặng sao</span>
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={customTrigger || defaultTrigger} />
      <DialogContent className="sm:max-w-[420px] bg-surface-container-lowest border-outline-variant/30 rounded-xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl text-on-surface flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-secondary" />
            Khen thưởng bé {studentName}
          </DialogTitle>
          <DialogDescription className="font-sans text-xs text-on-surface-variant flex items-center gap-2 pt-1">
            <span className="text-2xl">{avatar || '🐻'}</span>
            <span>Chọn phần thưởng để khích lệ tinh thần học tập của bé!</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2.5 py-2.5">
          {REWARD_TYPES.map((reward) => {
            const Icon = reward.icon;
            const isSelected = selectedReward.id === reward.id;
            return (
              <button
                key={reward.id}
                type="button"
                onClick={() => setSelectedReward(reward)}
                className={`p-3 rounded-lg border text-left transition-all relative cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/40 shadow-xs'
                    : 'border-outline-variant/40 hover:bg-surface-container-low'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-primary text-on-primary rounded-full flex items-center justify-center text-[10px]">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
                <div className={`w-8 h-8 rounded-md flex items-center justify-center mb-1.5 ${reward.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="font-heading font-bold text-xs text-on-surface">{reward.title}</div>
                <div className="text-[11px] text-primary font-bold">+{reward.points} XP • +{reward.stars} ⭐</div>
              </button>
            );
          })}
        </div>

        <DialogFooter className="pt-2 border-t border-outline-variant/20">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="rounded-lg border-outline-variant text-on-surface-variant hover:bg-surface-container text-xs font-bold"
          >
            Đóng
          </Button>
          <Button
            type="button"
            disabled={isLoading}
            onClick={handleAward}
            className="rounded-lg bg-primary text-on-primary hover:bg-primary-dark font-bold text-xs shadow-xs"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : null}
            Trao thưởng ngay ⭐
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
