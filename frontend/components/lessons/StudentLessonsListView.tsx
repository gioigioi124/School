'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Play, 
  CheckCircle2, 
  Clock, 
  Star, 
  Sparkles, 
  Search, 
  ArrowLeft,
  Trophy
} from 'lucide-react';
import { sounds } from '@/lib/sounds';

interface LessonItem {
  id: string;
  class_id?: string;
  title: string;
  description?: string;
  content?: string;
  video_url?: string;
  thumbnail_url?: string;
  duration?: number;
  order_index?: number;
  classes?: any;
}

interface StudentLessonsListViewProps {
  lessons: LessonItem[];
  completedLessonMap: Record<string, boolean>;
  className?: string;
}

const CATEGORIES = [
  { id: 'all', label: 'Tất cả bài học', emoji: '🌟' },
  { id: 'math', label: 'Toán học vui', emoji: '🔢' },
  { id: 'language', label: 'Tiếng Việt & Chữ cái', emoji: '🔤' },
  { id: 'art', label: 'Tạo hình & Nghệ thuật', emoji: '🎨' },
  { id: 'science', label: 'Khám phá thế giới', emoji: '🔬' },
];

const DEFAULT_SAMPLE_LESSONS: LessonItem[] = [
  {
    id: 'sample-1',
    title: 'Bé tập đếm từ 1 đến 10 cùng Thỏ trắng',
    description: 'Làm quen với các chữ số từ 1 đến 10 thông qua hình ảnh động vật vui nhộn.',
    duration: 15,
    thumbnail_url: '🔢',
  },
  {
    id: 'sample-2',
    title: 'Khám phá bảng chữ cái tiếng Việt: Chữ A, Ă, Â',
    description: 'Học phát âm chuẩn và nhận diện các nét chữ đầu tiên cùng cô giáo.',
    duration: 20,
    thumbnail_url: '🔤',
  },
  {
    id: 'sample-3',
    title: 'Tô màu Chú Bướm rực rỡ và các loài hoa',
    description: 'Phối màu sáng tạo, phân biệt màu sắc ấm áp và màu sắc tươi mát.',
    duration: 15,
    thumbnail_url: '🎨',
  },
  {
    id: 'sample-4',
    title: 'Tìm hiểu về các loài vật nuôi trong gia đình',
    description: 'Phân biệt tiếng kêu, thức ăn và đặc điểm của chú cún, chú mèo, bạn gà con.',
    duration: 18,
    thumbnail_url: '🐶',
  },
  {
    id: 'sample-5',
    title: 'Kỹ năng bé tự gấp quần áo gọn gàng',
    description: 'Bài học thực hành kỹ năng tự lập bổ ích giúp bé tự tin mỗi ngày.',
    duration: 12,
    thumbnail_url: '👕',
  },
  {
    id: 'sample-6',
    title: 'Hát và vận động theo bài hát: Chú ếch con',
    description: 'Phát triển nhịp điệu âm nhạc và vận động cơ thể sôi động cùng bạn bè.',
    duration: 15,
    thumbnail_url: '🎵',
  },
];

export function StudentLessonsListView({
  lessons = [],
  completedLessonMap = {},
  className = 'Lớp Mầm A1',
}: StudentLessonsListViewProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const displayLessons = lessons.length > 0 ? lessons : DEFAULT_SAMPLE_LESSONS;

  const filteredLessons = displayLessons.filter((lesson) => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lesson.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const totalLessons = displayLessons.length;
  const completedCount = displayLessons.filter((l) => completedLessonMap[l.id]).length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link
            href="/portal"
            onClick={() => sounds.playPop()}
            className="inline-flex items-center text-xs font-bold text-on-surface-variant hover:text-primary transition-colors gap-2 group mb-2"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Quay lại Cổng học sinh</span>
          </Link>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-on-surface flex items-center gap-2.5">
            <span>Không Gian Bài Giảng Của Bé</span>
            <span className="text-3xl">📚</span>
          </h1>
          <p className="font-sans text-xs md:text-sm text-on-surface-variant mt-1">
            Khám phá các bài học tương tác của {className}, tích lũy điểm thưởng và nhận huy hiệu xuất sắc!
          </p>
        </div>

        {/* Progress Overview Card */}
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-soft flex items-center gap-4 w-full md:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-secondary-container flex items-center justify-center text-secondary font-heading font-bold text-lg">
            {progressPercent}%
          </div>
          <div>
            <div className="text-xs font-heading font-bold text-on-surface flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-primary" />
              <span>Tiến độ học tập</span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Đã hoàn thành <strong>{completedCount}</strong> / {totalLessons} bài học
            </p>
          </div>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col md:flex-row gap-3 sm:gap-4 items-stretch md:items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                sounds.playPop();
                setSelectedCategory(cat.id);
              }}
              className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl font-heading font-bold text-xs shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-primary text-on-primary shadow-sm scale-102 ring-2 ring-primary/20'
                  : 'bg-surface-container-lowest hover:bg-surface-container-low text-on-surface border border-outline-variant/30'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        <div className="relative min-w-full sm:min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
          <input
            type="text"
            placeholder="Tìm kiếm bài học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl text-xs font-sans focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-2xs"
          />
        </div>
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLessons.map((lesson, idx) => {
          const isCompleted = !!completedLessonMap[lesson.id];
          return (
            <div
              key={lesson.id}
              className={`bg-surface-container-lowest rounded-3xl p-6 shadow-soft border transition-all duration-200 flex flex-col justify-between group ${
                isCompleted
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : 'border-outline-variant/30 hover:border-primary/40 hover:scale-101'
              }`}
            >
              <div className="space-y-4">
                {/* Card Header & Thumbnail */}
                <div className="flex items-center justify-between gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-secondary-container/40 flex items-center justify-center text-3xl shadow-xs group-hover:scale-110 transition-transform">
                    {lesson.thumbnail_url || (idx % 2 === 0 ? '🎨' : '🔢')}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold font-heading flex items-center gap-1 shadow-2xs">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>+20 XP</span>
                    </span>
                    {isCompleted && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold font-heading flex items-center gap-1 shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Đã học</span>
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-heading font-bold text-base text-on-surface group-hover:text-primary transition-colors">
                    {lesson.title}
                  </h3>
                  <p className="font-sans text-xs text-on-surface-variant mt-1 line-clamp-2 leading-relaxed">
                    {lesson.description || 'Bài giảng sinh động giúp bé tiếp thu kiến thức một cách tự nhiên và thú vị.'}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-5 mt-4 border-t border-outline-variant/20 flex items-center justify-between">
                <span className="font-sans text-xs text-on-surface-variant flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>{lesson.duration ? `${lesson.duration} phút` : '15 phút'}</span>
                </span>

                <Link
                  href={`/learn/${lesson.id}`}
                  onClick={() => sounds.playPop()}
                  className={`px-4 py-2 rounded-full font-heading font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                    isCompleted
                      ? 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                      : 'bg-primary text-on-primary btn-3d hover:bg-primary-dark shadow-xs'
                  }`}
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{isCompleted ? 'Học lại' : 'Vào học'}</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
