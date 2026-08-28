'use client';

import { useState } from 'react';
import { 
  BookOpen, 
  Video, 
  Clock, 
  Trash2, 
  School, 
  Award, 
  Search,
  CheckCircle2,
  FileQuestion,
  Play
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { AssignmentFormDialog } from './AssignmentFormDialog';

interface LessonItem {
  id: string;
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  video_url?: string;
  duration?: number;
  classId?: string;
  class_id?: string;
  classes?: {
    name: string;
    grade?: string;
  };
  assignments?: Array<{
    id: string;
    title: string;
    type: string;
    xpReward?: number;
    xp_reward?: number;
  }>;
}

interface LessonListProps {
  initialLessons: LessonItem[];
  classes: Array<{ id: string; name: string }>;
}

export function LessonList({ initialLessons, classes }: LessonListProps) {
  const [lessons, setLessons] = useState<LessonItem[]>(initialLessons);
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const filteredLessons = lessons.filter((l) => {
    const lClassId = l.classId || l.class_id;
    const matchesClass = selectedClassId === 'all' || lClassId === selectedClassId;
    const matchesSearch =
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesSearch;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xoá bài học này không?')) return;

    setDeletingId(id);
    try {
      const { error } = await supabase.from('lessons').delete().eq('id', id);
      if (error) throw error;

      setLessons((prev) => prev.filter((l) => l.id !== id));
      toast.success('Đã xoá bài học thành công');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xoá bài học');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Class filter tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-stretch sm:items-center bg-surface-container-lowest p-3.5 sm:p-4 rounded-2xl shadow-xs border border-outline-variant/30">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedClassId('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-heading font-bold transition-all shrink-0 cursor-pointer ${
              selectedClassId === 'all'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            Tất cả lớp ({lessons.length})
          </button>
          {classes.map((cls) => {
            const count = lessons.filter(
              (l) => (l.classId || l.class_id) === cls.id,
            ).length;
            return (
              <button
                key={cls.id}
                type="button"
                onClick={() => setSelectedClassId(cls.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-heading font-bold transition-all shrink-0 cursor-pointer ${
                  selectedClassId === cls.id
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {cls.name} ({count})
              </button>
            );
          })}
        </div>

        <div className="relative min-w-full sm:min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Tìm bài học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-outline-variant/40 bg-surface focus:border-primary focus:ring-0 outline-none text-xs font-sans text-on-surface"
          />
        </div>
      </div>

      {/* Lessons List Grid */}
      {filteredLessons.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-3xl p-12 text-center border-2 border-dashed border-outline-variant/40 space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="font-heading font-bold text-lg text-on-surface">
            Chưa có bài học nào
          </h3>
          <p className="font-sans text-xs text-on-surface-variant max-w-sm mx-auto">
            Hãy bắt đầu tạo bài giảng đầu tiên kèm video và câu đố tương tác cho học sinh.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((lesson) => {
            const video = lesson.videoUrl || lesson.video_url;
            const assignmentsCount = lesson.assignments?.length || 0;

            return (
              <div
                key={lesson.id}
                className="bg-surface-container-lowest rounded-3xl p-6 shadow-xs hover:shadow-md transition-all duration-200 border border-outline-variant/30 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 bg-primary-container text-on-primary-container rounded-full text-[11px] font-heading font-bold flex items-center gap-1">
                      <School className="w-3 h-3" />
                      <span>{lesson.classes?.name || 'Lớp học'}</span>
                    </span>

                    <button
                      onClick={() => handleDelete(lesson.id)}
                      disabled={deletingId === lesson.id}
                      aria-label="Xoá bài học"
                      className="p-1.5 rounded-xl text-on-surface-variant hover:text-destructive hover:bg-error-container/30 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h4 className="font-heading font-bold text-base text-on-surface line-clamp-2">
                      {lesson.title}
                    </h4>
                    {lesson.description && (
                      <p className="font-sans text-xs text-on-surface-variant mt-1.5 line-clamp-2">
                        {lesson.description}
                      </p>
                    )}
                  </div>

                  {/* Video status indicator */}
                  <div className="flex items-center gap-3 text-xs text-on-surface-variant font-medium">
                    {video ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                        <Video className="w-3.5 h-3.5" />
                        <span>Có Video</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-lg">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Bài đọc</span>
                      </span>
                    )}

                    {lesson.duration ? (
                      <span className="inline-flex items-center gap-1 text-on-surface-variant">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{lesson.duration} phút</span>
                      </span>
                    ) : null}
                  </div>

                  {/* Attached Quizzes/Assignments */}
                  <div className="pt-2 border-t border-outline-variant/20">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-on-surface flex items-center gap-1">
                        <FileQuestion className="w-3.5 h-3.5 text-secondary" />
                        <span>Câu đố / Bài tập ({assignmentsCount})</span>
                      </span>
                    </div>

                    {lesson.assignments && lesson.assignments.length > 0 && (
                      <div className="space-y-1.5 mb-3">
                        {lesson.assignments.map((asg) => (
                          <div
                            key={asg.id}
                            className="flex items-center justify-between p-2 rounded-xl bg-surface-container text-xs"
                          >
                            <span className="truncate max-w-[180px] font-sans font-medium">
                              {asg.title}
                            </span>
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px] flex items-center gap-0.5">
                              <Award className="w-3 h-3 text-amber-600" />
                              <span>+{asg.xpReward || asg.xp_reward || 20} XP</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <AssignmentFormDialog
                      lessonId={lesson.id}
                      lessonTitle={lesson.title}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
