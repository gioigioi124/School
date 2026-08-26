'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Star, Award, Trophy, Heart, Sparkles, Check } from 'lucide-react';
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

const REWARD_TYPES = [
  { id: 'star', title: 'Tặng 1 Sao', icon: Star, color: 'bg-secondary-container text-on-secondary-container', points: 10 },
  { id: 'heart', title: 'Chăm chỉ', icon: Heart, color: 'bg-pink-100 text-pink-700', points: 15 },
  { id: 'trophy', title: 'Xuất sắc', icon: Trophy, color: 'bg-amber-100 text-amber-800', points: 30 },
  { id: 'award', title: 'Tiến bộ', icon: Award, color: 'bg-emerald-100 text-emerald-800', points: 20 },
];

export function AwardStudentDialog({ studentName, avatar }: { studentName: string; avatar?: string }) {
  const [open, setOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState(REWARD_TYPES[0]);
  const [note, setNote] = useState('');

  const handleAward = () => {
    toast.success(`Đã trao "${selectedReward.title}" (+${selectedReward.points} XP) cho bé ${studentName}! ⭐`, {
      icon: '🎉',
      duration: 3500,
    });
    setOpen(false);
    setNote('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-secondary-container text-on-secondary-container hover:scale-105 transition-all shadow-sm"
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            Tặng sao
          </button>
        }
      />
      <DialogContent className="sm:max-w-[420px] bg-surface-container-lowest border-outline-variant/30">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl text-on-surface flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-secondary" />
            Khen thưởng bé {studentName}
          </DialogTitle>
          <DialogDescription className="font-sans text-on-surface-variant flex items-center gap-2 pt-1">
            <span className="text-2xl">{avatar || '🐻'}</span>
            <span>Chọn phần thưởng để khích lệ tinh thần học tập của bé!</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-3">
          {REWARD_TYPES.map((reward) => {
            const Icon = reward.icon;
            const isSelected = selectedReward.id === reward.id;
            return (
              <button
                key={reward.id}
                type="button"
                onClick={() => setSelectedReward(reward)}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  isSelected
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-custom'
                    : 'border-outline-variant/40 hover:bg-surface-container-low'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-2 right-2 w-5 h-5 bg-primary text-on-primary rounded-full flex items-center justify-center text-xs">
                    <Check className="w-3 h-3" />
                  </span>
                )}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${reward.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-heading font-bold text-sm text-on-surface">{reward.title}</div>
                <div className="text-xs text-primary font-bold">+{reward.points} XP</div>
              </button>
            );
          })}
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="rounded-full border-outline-variant text-on-surface-variant hover:bg-surface-container"
          >
            Đóng
          </Button>
          <Button
            type="button"
            onClick={handleAward}
            className="rounded-full bg-primary text-on-primary hover:bg-primary-dark font-bold"
          >
            Trao thưởng ngay ⭐
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
