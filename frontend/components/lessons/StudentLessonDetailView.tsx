'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Play, 
  CheckCircle2, 
  Star, 
  Trophy, 
  HelpCircle, 
  BookOpen, 
  Upload, 
  Send,
  Sparkles,
  Heart
} from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { CelebrationConfetti } from '@/components/student/CelebrationConfetti';
import { sounds } from '@/lib/sounds';

interface StudentLessonDetailViewProps {
  lessonId: string;
  lesson?: any;
  assignments?: any[];
  isInitiallyCompleted?: boolean;
  submissionMap?: Record<string, any>;
  studentId: string;
  studentName?: string;
}

export function StudentLessonDetailView({
  lessonId,
  lesson,
  assignments = [],
  isInitiallyCompleted = false,
  submissionMap = {},
  studentId,
  studentName = 'Bé yêu',
}: StudentLessonDetailViewProps) {
  const router = useRouter();
  const supabase = createClient();

  const [isCompleted, setIsCompleted] = useState(isInitiallyCompleted);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'assignments'>('content');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});
  const [textSubmission, setTextSubmission] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fallback sample lesson if lesson is null (e.g. testing sample routes)
  const currentLesson = lesson || {
    id: lessonId,
    title: 'Bé tập tô màu Chú Bướm rực rỡ và các loài hoa',
    description: 'Bài giảng hướng dẫn bé cách phối màu sắc, phân biệt màu nóng và màu lạnh, cùng nhau tô điểm cho bức tranh thiên nhiên tuyệt đẹp.',
    content: 'Chào các bé thân yêu! Hôm nay cô trò mình sẽ cùng nhau tìm hiểu về các loài bướm xinh đẹp. Các con hãy chú ý quan sát đôi cánh rực rỡ của bạn bướm nhé!',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail_url: '🎨',
    duration: 15,
  };

  const sampleAssignments = assignments.length > 0 ? assignments : [
    {
      id: 'assign-sample-1',
      title: 'Đố vui: Chú bướm thích đậu trên cái gì nhất?',
      type: 'quiz',
      xp_reward: 20,
      content: {
        question: 'Chú bướm xinh xắn thường bay đi tìm kiếm mật ngọt ở đâu?',
        options: [
          { text: '🌸 Bông hoa thơm ngát', isCorrect: true },
          { text: '🪨 Hòn đá cứng', isCorrect: false },
          { text: '🌊 Dưới đáy nước', isCorrect: false },
        ],
      },
    },
  ];

  const handleCompleteLesson = async () => {
    if (isCompleted) return;

    sounds.playCorrect();
    sounds.playLevelUp();
    setShowConfetti(true);
    setIsCompleted(true);

    toast.success(`🎉 Bé ${studentName} đã hoàn thành bài học và nhận +20 XP!`, {
      duration: 4000,
    });

    try {
      // 1. Mark progress
      await supabase.from('student_progress').upsert({
        student_id: studentId,
        lesson_id: lessonId,
        is_completed: true,
        completed_at: new Date().toISOString(),
        xp_earned: 20,
      }, { onConflict: 'student_id,lesson_id' });

      // 2. Insert xp_history
      await supabase.from('xp_history').insert({
        student_id: studentId,
        action: `Hoàn thành bài giảng: ${currentLesson.title}`,
        xp_amount: 20,
        source_type: 'lesson',
        source_id: lessonId,
      });

      // 3. Update user_xp
      const { data: xpRow } = await supabase
        .from('user_xp')
        .select('*')
        .eq('student_id', studentId)
        .maybeSingle();

      const newTotal = (xpRow?.total_xp || 0) + 20;
      const newStars = (xpRow?.total_stars || 0) + 1;
      const newLevel = Math.floor(newTotal / 1000) + 1;

      await supabase.from('user_xp').upsert({
        student_id: studentId,
        total_xp: newTotal,
        total_stars: newStars,
        current_level: newLevel,
      });
    } catch (err) {
      console.error('Error recording lesson completion:', err);
    }
  };

  const handleSelectQuizOption = (assignId: string, optionIndex: number, isCorrect: boolean) => {
    setQuizAnswers((prev) => ({ ...prev, [assignId]: optionIndex }));
    setQuizSubmitted((prev) => ({ ...prev, [assignId]: true }));

    if (isCorrect) {
      sounds.playCorrect();
      sounds.playStar();
      setShowConfetti(true);
      toast.success('🌟 Hoan hô! Bé chọn đáp án hoàn toàn chính xác! +20 XP');
    } else {
      sounds.playWrong();
      toast.error('Chưa đúng rồi, bé hãy quan sát kỹ và thử chọn lại nhé!');
    }
  };

  const handleSubmitAssignment = async (assignId: string) => {
    if (!textSubmission.trim()) {
      toast.error('Bé hoặc phụ huynh hãy nhập lời nhắn hoặc mô tả bài làm nhé!');
      return;
    }

    setIsSubmitting(true);
    sounds.playCorrect();
    setShowConfetti(true);

    try {
      await supabase.from('submissions').upsert({
        assignment_id: assignId,
        student_id: studentId,
        content: { text: textSubmission, note: 'Bài làm của học sinh' },
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        xp_earned: 20,
      }, { onConflict: 'student_id,assignment_id' });

      toast.success('🎉 Nộp bài tập thành công! Cô giáo sẽ sớm chấm bài cho bé nhé!');
      setTextSubmission('');
    } catch (err) {
      console.error('Error submitting assignment:', err);
      toast.error('Có lỗi xảy ra khi nộp bài');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-3.5 sm:p-6 md:p-8 space-y-6 animate-fade-in font-sans pb-16">
      <CelebrationConfetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link
            href="/learn"
            onClick={() => sounds.playPop()}
            className="inline-flex items-center text-xs font-bold text-on-surface-variant hover:text-primary transition-colors gap-2 group mb-2"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Quay lại Danh sách bài giảng</span>
          </Link>
          <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-on-surface leading-tight">
            {currentLesson.title}
          </h1>
        </div>

        {/* Action Button & XP Badge */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <span className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-heading font-bold flex items-center gap-1.5 shadow-2xs">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>+20 XP</span>
          </span>

          {isCompleted ? (
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-heading font-bold flex items-center gap-1.5 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Đã học xong</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleCompleteLesson}
              className="px-4 py-2 rounded-full bg-primary text-on-primary font-heading font-bold text-xs btn-3d hover:bg-primary-dark transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Đánh dấu đã học xong</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-outline-variant/30 pb-2">
        <button
          onClick={() => {
            sounds.playPop();
            setActiveTab('content');
          }}
          className={`px-4 py-2 rounded-2xl font-heading font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'content'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Nội Dung Bài Học</span>
        </button>

        <button
          onClick={() => {
            sounds.playPop();
            setActiveTab('assignments');
          }}
          className={`px-4 py-2 rounded-2xl font-heading font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'assignments'
              ? 'bg-secondary text-on-secondary shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Bài Tập & Thử Thách ({sampleAssignments.length})</span>
        </button>
      </div>

      {/* Tab 1: Video & Lecture Content */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          {/* Video Player Box */}
          <div className="bg-slate-950 rounded-3xl aspect-video overflow-hidden shadow-2xl border-4 border-surface-container-lowest flex items-center justify-center relative">
            <div className="text-center p-8 space-y-4">
              <span className="text-7xl animate-pulse block">{currentLesson.thumbnail_url || '🎨'}</span>
              <h3 className="font-heading font-bold text-white text-xl max-w-lg mx-auto">
                {currentLesson.title}
              </h3>
              <button
                onClick={handleCompleteLesson}
                className="px-6 py-3 rounded-full bg-secondary text-on-secondary font-heading font-bold text-sm hover:scale-105 transition-all shadow-lg inline-flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-on-secondary" />
                <span>Bắt đầu xem bài giảng video</span>
              </button>
            </div>
          </div>

          {/* Description & Lecture Notes */}
          <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-soft border border-outline-variant/30 space-y-4">
            <h3 className="font-heading font-bold text-xl text-on-surface flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-secondary" />
              <span>Lời dặn của Cô giáo</span>
            </h3>
            <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
              {currentLesson.description}
            </p>
            {currentLesson.content && (
              <div className="p-4 bg-primary-container/20 rounded-2xl border border-primary-container/40 text-xs sm:text-sm text-on-surface leading-relaxed">
                {currentLesson.content}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Interactive Assignments & Quizzes */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          {sampleAssignments.map((assignment, index) => {
            const isQuiz = assignment.type === 'quiz' || assignment.content?.options;
            const options = assignment.content?.options || [];
            const selectedOpt = quizAnswers[assignment.id];
            const hasAnswered = quizSubmitted[assignment.id];
            const submission = submissionMap[assignment.id];

            return (
              <div
                key={assignment.id}
                className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-soft border border-outline-variant/30 space-y-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-secondary-container flex items-center justify-center font-heading font-bold text-secondary text-lg">
                      #{index + 1}
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg text-on-surface">
                        {assignment.title}
                      </h3>
                      <p className="font-sans text-xs text-on-surface-variant">
                        {assignment.description || 'Hoàn thành câu hỏi để nhận điểm thưởng XP'}
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-heading font-bold">
                    +{assignment.xp_reward || 20} XP
                  </span>
                </div>

                {/* Multiple choice quiz */}
                {isQuiz && (
                  <div className="space-y-4">
                    {assignment.content?.question && (
                      <p className="font-sans font-bold text-sm text-on-surface bg-surface-container-low p-4 rounded-2xl">
                        ❓ {assignment.content.question}
                      </p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {options.map((opt: any, optIdx: number) => {
                        const isSelected = selectedOpt === optIdx;
                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectQuizOption(assignment.id, optIdx, !!opt.isCorrect)}
                            className={`p-4 rounded-2xl font-sans font-bold text-sm text-left transition-all flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? opt.isCorrect
                                  ? 'bg-emerald-100 text-emerald-900 border-2 border-emerald-400 shadow-sm'
                                  : 'bg-rose-100 text-rose-900 border-2 border-rose-400 shadow-sm'
                                : 'bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/30'
                            }`}
                          >
                            <span>{opt.text}</span>
                            {isSelected && (
                              <span>{opt.isCorrect ? '✅ Đúng rồi!' : '❌ Thử lại'}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Text / Drawing Photo Submission */}
                {!isQuiz && (
                  <div className="space-y-4">
                    {submission ? (
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                        <div className="flex items-center gap-2 text-emerald-800 font-heading font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Bé đã nộp bài thành công</span>
                        </div>
                        <p className="text-xs text-on-surface-variant">
                          Nội dung: {typeof submission.content === 'string' ? submission.content : submission.content?.text || 'Đã nộp bài'}
                        </p>
                        {submission.feedback && (
                          <div className="p-3 bg-white rounded-xl border border-emerald-100 text-xs">
                            <strong>Cô giáo nhận xét:</strong> {submission.feedback}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <textarea
                          value={textSubmission}
                          onChange={(e) => setTextSubmission(e.target.value)}
                          placeholder="Bé hoặc ba mẹ hãy viết đôi dòng cảm nhận hoặc mô tả bài làm của bé..."
                          rows={3}
                          className="w-full p-4 bg-surface-container-low border border-outline-variant/30 rounded-2xl text-xs font-sans focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                        <button
                          onClick={() => handleSubmitAssignment(assignment.id)}
                          disabled={isSubmitting}
                          className="px-6 py-2.5 bg-primary text-on-primary rounded-full font-heading font-bold text-xs btn-3d hover:bg-primary-dark transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isSubmitting ? 'Đang gửi...' : 'Nộp bài cho cô giáo'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
