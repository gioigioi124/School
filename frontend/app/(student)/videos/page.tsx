'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, Clock, Sparkles, BookOpen, Star, Film, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { CelebrationConfetti } from '@/components/student/CelebrationConfetti';
import { sounds } from '@/lib/sounds';

const VIDEOS = [
  {
    id: 'vid-1',
    title: 'Khám phá thế giới động vật hoang dã',
    category: 'Khoa học & Tự nhiên',
    duration: '12 phút',
    thumbnail: '🦁',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Cùng bé tìm hiểu về các bạn sư tử, hươu cao cổ và voi rừng châu Phi.',
    xpReward: 15,
  },
  {
    id: 'vid-2',
    title: 'Học đếm số vui nhộn cùng giai điệu âm nhạc',
    category: 'Làm quen Toán học',
    duration: '10 phút',
    thumbnail: '🔢',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Các bài hát thiếu nhi vui nhộn giúp bé ghi nhớ các con số từ 1 đến 20.',
    xpReward: 15,
  },
  {
    id: 'vid-3',
    title: 'Câu chuyện: Rùa và Thỏ chạy thi',
    category: 'Văn học & Kể chuyện',
    duration: '15 phút',
    thumbnail: '🐢',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Bài học ý nghĩa về tính kiên trì, không tự phụ và luôn nỗ lực hết mình.',
    xpReward: 20,
  },
  {
    id: 'vid-4',
    title: 'Làm quen bảng chữ cái tiếng Anh - Phonics',
    category: 'Ngoại ngữ cho bé',
    duration: '14 phút',
    thumbnail: '🔤',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Phát âm chuẩn âm vị các chữ cái tiếng Anh qua các hình ảnh sinh động.',
    xpReward: 15,
  },
];

export default function VideosPage() {
  const [selectedVideo, setSelectedVideo] = useState(VIDEOS[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [completedVideos, setCompletedVideos] = useState<Record<string, boolean>>({});
  const [showConfetti, setShowConfetti] = useState(false);
  const supabase = createClient();

  const categories = ['all', ...Array.from(new Set(VIDEOS.map((v) => v.category)))];

  const filteredVideos = VIDEOS.filter(
    (v) => selectedCategory === 'all' || v.category === selectedCategory,
  );

  const handleCompleteVideo = async (id: string) => {
    if (completedVideos[id]) return;

    sounds.playCorrect();
    sounds.playStar();
    setShowConfetti(true);
    setCompletedVideos((prev) => ({ ...prev, [id]: true }));
    toast.success(`🎉 Bé đã hoàn thành xem video và nhận +${selectedVideo.xpReward} XP!`);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('xp_history').insert({
          student_id: user.id,
          action: `Xem video: ${selectedVideo.title}`,
          xp_amount: selectedVideo.xpReward,
          source_type: 'video',
        });

        const { data: xpRow } = await supabase
          .from('user_xp')
          .select('*')
          .eq('student_id', user.id)
          .maybeSingle();

        const newTotal = (xpRow?.total_xp || 0) + selectedVideo.xpReward;
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
      console.error('Error syncing video xp:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 font-sans space-y-8 animate-fade-in pb-12">
      <CelebrationConfetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Breadcrumb & Title */}
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
          <span>Rạp Chiếu Phim & Video Bài Giảng</span>
          <span className="text-3xl">🎬</span>
        </h1>
        <p className="font-sans text-xs sm:text-sm text-on-surface-variant mt-1">
          Xem các video hoạt hình bổ ích, bài giảng trực quan và nhận điểm thưởng XP.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              sounds.playPop();
              setSelectedCategory(cat);
            }}
            className={`px-3.5 sm:px-4 py-2 rounded-2xl font-heading font-bold text-xs shrink-0 transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-primary text-on-primary shadow-sm scale-102 ring-2 ring-primary/20'
                : 'bg-surface-container-lowest hover:bg-surface-container-low text-on-surface border border-outline-variant/30'
            }`}
          >
            <span>{cat === 'all' ? '🌟 Tất cả chủ đề' : cat}</span>
          </button>
        ))}
      </div>

      {/* Video Player Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Video Box */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-slate-950 shadow-2xl border-4 border-surface-container-lowest flex items-center justify-center">
            <div className="text-center p-8 space-y-4">
              <span className="text-6xl animate-pulse block">{selectedVideo.thumbnail}</span>
              <h3 className="font-heading font-bold text-white text-xl">
                {selectedVideo.title}
              </h3>
              <button
                onClick={() => handleCompleteVideo(selectedVideo.id)}
                className="px-6 py-3 rounded-full bg-secondary text-on-secondary font-heading font-bold text-sm hover:scale-105 transition-all shadow-lg inline-flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-on-secondary" />
                <span>Bắt đầu xem video bài học</span>
              </button>
            </div>
          </div>

          {/* Video Details */}
          <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-soft border border-outline-variant/30 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="px-3 py-1 bg-primary-container text-on-primary-container rounded-full text-xs font-bold font-heading">
                {selectedVideo.category}
              </span>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold font-heading flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>+{selectedVideo.xpReward} XP</span>
              </span>
            </div>

            <h2 className="font-heading font-bold text-2xl text-on-surface">
              {selectedVideo.title}
            </h2>
            <p className="font-sans text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              {selectedVideo.description}
            </p>

            <div className="pt-3 border-t border-outline-variant/20 flex justify-between items-center">
              <span className="font-sans text-xs text-on-surface-variant flex items-center gap-1.5 font-medium">
                <Clock className="w-4 h-4 text-primary" />
                <span>Thời lượng: {selectedVideo.duration}</span>
              </span>

              <button
                onClick={() => handleCompleteVideo(selectedVideo.id)}
                className="px-5 py-2.5 rounded-full bg-primary text-on-primary font-heading font-bold text-xs btn-3d hover:bg-primary-dark transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Đã xem xong (+{selectedVideo.xpReward} XP)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Playlist & Recommendations */}
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-base text-on-surface flex items-center gap-2">
            <Film className="w-4 h-4 text-primary" />
            <span>Danh sách video khác</span>
          </h3>

          <div className="space-y-3">
            {filteredVideos.map((video) => {
              const isCurrent = video.id === selectedVideo.id;
              const isWatched = completedVideos[video.id];

              return (
                <div
                  key={video.id}
                  onClick={() => {
                    sounds.playPop();
                    setSelectedVideo(video);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
                    isCurrent
                      ? 'bg-primary-container/30 border-primary shadow-sm scale-101'
                      : 'bg-surface-container-lowest hover:bg-surface-container border-outline-variant/30'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-2xl shrink-0">
                    {video.thumbnail}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-heading font-bold text-xs text-on-surface truncate">
                      {video.title}
                    </h4>
                    <p className="font-sans text-[11px] text-on-surface-variant mt-0.5">
                      {video.duration} • {video.category}
                    </p>
                  </div>

                  {isWatched && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
