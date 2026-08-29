'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Phone, 
  School, 
  Search, 
  UserCheck, 
  UserX, 
  Sparkles, 
  AlertCircle, 
  Filter, 
  Plus,
  Trash2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CreateStudentAccountDialog } from '@/components/students/CreateStudentAccountDialog';
import { AwardStudentDialog } from '@/components/classes/AwardStudentDialog';
import { AssignClassDialog } from '@/components/students/AssignClassDialog';
import { RemoveStudentFromClassDialog } from '@/components/classes/RemoveStudentFromClassDialog';

export interface StudentItem {
  id: string;
  displayName: string;
  avatarUrl: string;
  parentPhone: string;
  parentName: string;
  className: string;
  classId: string | null;
  createdAt: string;
  isUnassigned: boolean;
}

interface StudentManagementClientProps {
  initialStudents: StudentItem[];
  teacherClassCount: number;
}

export function StudentManagementClient({
  initialStudents,
  teacherClassCount,
}: StudentManagementClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'enrolled' | 'unassigned'>('all');

  // Filter students based on search and tab
  const filteredStudents = useMemo(() => {
    return initialStudents.filter((student) => {
      const matchSearch =
        student.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.parentPhone.includes(searchQuery) ||
        student.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.className.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (activeTab === 'enrolled') return !student.isUnassigned;
      if (activeTab === 'unassigned') return student.isUnassigned;

      return true;
    });
  }, [initialStudents, searchQuery, activeTab]);

  const enrolledCount = initialStudents.filter((s) => !s.isUnassigned).length;
  const unassignedCount = initialStudents.filter((s) => s.isUnassigned).length;

  const uniqueParents = new Set(
    initialStudents
      .map((s) => s.parentPhone)
      .filter((p) => p && p !== 'Chưa cập nhật')
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-on-surface flex items-center gap-2.5">
            <span>Danh sách Học sinh</span>
            <span className="text-xs px-3 py-1 rounded-full bg-primary-container text-on-primary-container font-sans font-bold">
              {initialStudents.length} Bé
            </span>
          </h1>
          <p className="font-sans text-on-surface-variant mt-1 text-sm">
            Quản lý tài khoản đăng nhập theo Số điện thoại bố mẹ và phân lớp học cho bé.
          </p>
        </div>

        <div className="w-full sm:w-auto">
          <CreateStudentAccountDialog />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-container flex items-center justify-center text-primary">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-sans text-on-surface-variant font-bold uppercase tracking-wider">Tổng học sinh</span>
            <div className="font-heading text-2xl font-bold text-on-surface mt-0.5">{initialStudents.length} Bé</div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-sans text-on-surface-variant font-bold uppercase tracking-wider">Đã vào lớp</span>
            <div className="font-heading text-2xl font-bold text-emerald-800 mt-0.5">{enrolledCount} Bé</div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-sans text-on-surface-variant font-bold uppercase tracking-wider">Chưa phân lớp</span>
            <div className="font-heading text-2xl font-bold text-amber-800 mt-0.5">{unassignedCount} Bé</div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary-container flex items-center justify-center text-secondary">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-sans text-on-surface-variant font-bold uppercase tracking-wider">Phụ huynh (SĐT)</span>
            <div className="font-heading text-2xl font-bold text-on-surface mt-0.5">{uniqueParents.size} Tài khoản</div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-soft border border-outline-variant/30 overflow-hidden">
        {/* Filter & Search Bar */}
        <div className="p-5 border-b border-outline-variant/20 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-surface-bright">
          {/* Tabs */}
          <div className="flex p-1 bg-surface-container-high/60 rounded-xl border border-outline-variant/30 self-start">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg font-sans font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>Tất cả</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-primary/10 text-primary rounded-full">
                {initialStudents.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('enrolled')}
              className={`px-3.5 py-1.5 rounded-lg font-sans font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'enrolled'
                  ? 'bg-surface-container-lowest text-emerald-700 shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>Đã vào lớp</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full font-bold">
                {enrolledCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('unassigned')}
              className={`px-3.5 py-1.5 rounded-lg font-sans font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'unassigned'
                  ? 'bg-surface-container-lowest text-amber-700 shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>Chưa phân lớp</span>
              {unassignedCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-full font-bold">
                  {unassignedCount}
                </span>
              )}
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <Input
              type="text"
              placeholder="Tìm tên bé, SĐT, lớp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 border-outline-variant bg-surface-bright rounded-xl text-xs font-sans"
            />
          </div>
        </div>

        {/* Student List View */}
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 bg-surface-container rounded-full flex items-center justify-center text-3xl mx-auto">
              👶
            </div>
            <h3 className="font-heading text-lg font-bold text-on-surface">Không có học sinh nào</h3>
            <p className="font-sans text-xs text-on-surface-variant max-w-sm mx-auto">
              {searchQuery
                ? 'Không tìm thấy kết quả phù hợp với từ khóa tìm kiếm.'
                : activeTab === 'unassigned'
                ? 'Tuyệt vời! Hiện tại tất cả học sinh đã được phân vào lớp.'
                : 'Chưa có học sinh nào trong hệ thống.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/15">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-surface-container-low/40 transition-colors"
              >
                {/* Left: Avatar & Info */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-secondary-container/80 flex items-center justify-center text-2xl shadow-2xs shrink-0">
                    <span>{student.avatarUrl || '🐻'}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 
                        className="font-sans font-bold text-sm sm:text-[15px] text-on-surface truncate"
                        title={student.displayName}
                      >
                        {student.displayName}
                      </h3>
                      {student.isUnassigned ? (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[10px] font-sans font-bold shrink-0">
                          Chờ xếp lớp
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-sans font-bold shrink-0">
                          {student.className}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant mt-1">
                      <span className="flex items-center gap-1 text-primary font-bold">
                        <Phone className="w-3.5 h-3.5" />
                        <span>SĐT: {student.parentPhone}</span>
                      </span>
                      <span>•</span>
                      <span>PH: {student.parentName}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-outline-variant/10">
                  {student.isUnassigned ? (
                    <AssignClassDialog
                      studentId={student.id}
                      studentName={student.displayName}
                      studentAvatar={student.avatarUrl}
                      parentPhone={student.parentPhone}
                    />
                  ) : (
                    <>
                      {student.classId && (
                        <Link
                          href={`/classes/${student.classId}`}
                          className="px-3 py-1.5 bg-surface-container-high hover:bg-primary-container text-on-surface-variant hover:text-on-primary-container rounded-xl text-xs font-sans font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                        >
                          <School className="w-3.5 h-3.5" />
                          <span>{student.className}</span>
                        </Link>
                      )}

                      <AwardStudentDialog
                        studentName={student.displayName}
                        avatar={student.avatarUrl || '🐻'}
                      />

                      {student.classId && (
                        <RemoveStudentFromClassDialog
                          classId={student.classId}
                          className={student.className}
                          studentId={student.id}
                          studentName={student.displayName}
                          studentAvatar={student.avatarUrl}
                          customTrigger={
                            <button
                              type="button"
                              className="p-1.5 rounded-xl text-outline-variant hover:text-destructive hover:bg-error-container/30 transition-all cursor-pointer hover:scale-105"
                              title="Xóa bé khỏi lớp"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          }
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
