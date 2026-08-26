'use client';

import { useState } from 'react';
import { 
  MessageSquare, 
  AlertCircle, 
  Calendar, 
  Trash2, 
  School, 
  User, 
  Search,
  Sparkles,
  Pin
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  isImportant?: boolean;
  is_important?: boolean;
  createdAt?: string;
  created_at?: string;
  classId?: string;
  class_id?: string;
  classes?: {
    name: string;
    grade?: string;
  };
  profiles?: {
    displayName: string;
    avatarUrl?: string;
  };
}

interface AnnouncementListProps {
  initialAnnouncements: AnnouncementItem[];
  classes: Array<{ id: string; name: string }>;
}

export function AnnouncementList({
  initialAnnouncements,
  classes,
}: AnnouncementListProps) {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(initialAnnouncements);
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const filteredAnnouncements = announcements.filter((a) => {
    const aClassId = a.classId || a.class_id;
    const matchesClass = selectedClassId === 'all' || aClassId === selectedClassId;
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesSearch;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xoá thông báo này không?')) return;

    setDeletingId(id);
    try {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw error;

      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      toast.success('Đã xoá thông báo thành công');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xoá thông báo');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-surface-container-lowest p-4 rounded-2xl shadow-xs border border-outline-variant/30">
        {/* Class Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedClassId('all')}
            className={`px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all shrink-0 cursor-pointer ${
              selectedClassId === 'all'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            Tất cả lớp ({announcements.length})
          </button>
          {classes.map((cls) => {
            const count = announcements.filter(
              (a) => (a.classId || a.class_id) === cls.id,
            ).length;
            return (
              <button
                key={cls.id}
                onClick={() => setSelectedClassId(cls.id)}
                className={`px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all shrink-0 cursor-pointer ${
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

        {/* Search Bar */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Tìm kiếm thông báo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-outline-variant/40 bg-surface focus:border-primary focus:ring-0 outline-none text-xs font-sans text-on-surface"
          />
        </div>
      </div>

      {/* Announcements Feed */}
      {filteredAnnouncements.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-3xl p-12 text-center border-2 border-dashed border-outline-variant/40 space-y-4">
          <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container mx-auto">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h3 className="font-heading font-bold text-lg text-on-surface">
            Chưa có thông báo nào
          </h3>
          <p className="font-sans text-xs text-on-surface-variant max-w-sm mx-auto">
            Hãy tạo thông báo đầu tiên để gửi thông tin bài học, dặn dò hoặc lịch trình tới phụ huynh và học sinh.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAnnouncements.map((item) => {
            const isImportant = item.isImportant || item.is_important;
            const dateStr = item.createdAt || item.created_at;
            const formattedDate = dateStr
              ? new Date(dateStr).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Gần đây';

            const className = item.classes?.name || 'Lớp học';

            return (
              <div
                key={item.id}
                className={`relative bg-surface-container-lowest rounded-3xl p-6 shadow-xs hover:shadow-md transition-all duration-200 border ${
                  isImportant
                    ? 'border-amber-400/60 bg-gradient-to-br from-surface-container-lowest to-amber-500/5'
                    : 'border-outline-variant/30'
                } flex flex-col justify-between`}
              >
                {/* Header Tag */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 bg-primary-container text-on-primary-container rounded-full text-[11px] font-heading font-bold flex items-center gap-1">
                        <School className="w-3 h-3" />
                        <span>{className}</span>
                      </span>
                      {isImportant && (
                        <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[11px] font-heading font-bold flex items-center gap-1 shadow-2xs animate-pulse">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          <span>Quan trọng</span>
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      aria-label="Xóa thông báo"
                      className="p-2 rounded-xl text-on-surface-variant hover:text-destructive hover:bg-error-container/30 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Title & Content */}
                  <div>
                    <h4 className="font-heading font-bold text-lg text-on-surface line-clamp-2">
                      {item.title}
                    </h4>
                    <p className="font-sans text-xs text-on-surface-variant mt-2 whitespace-pre-line leading-relaxed">
                      {item.content}
                    </p>
                  </div>
                </div>

                {/* Footer info */}
                <div className="mt-6 pt-4 border-t border-outline-variant/20 flex items-center justify-between text-[11px] text-on-surface-variant font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span>{formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-sans">
                    <User className="w-3.5 h-3.5" />
                    <span>{item.profiles?.displayName || 'Giáo viên'}</span>
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
