'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  UserPlus, 
  Search, 
  Check, 
  Loader2, 
  Sparkles, 
  UserCheck, 
  Users, 
  Phone, 
  School,
  Copy,
  Info,
  Lock,
  User,
  CheckSquare,
  Square,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import toast from 'react-hot-toast';

const STUDENT_AVATARS = ['🐻', '🦁', '🐯', '🐰', '🐼', '🐬', '🦄', '🌟', '🚀', '🎨', '⚽', '🍦'];

interface StudentAvailableItem {
  id: string;
  displayName: string;
  avatarUrl: string;
  parentPhone: string;
  parentName: string;
  email: string;
  enrolledClasses: { id: string; name: string; grade: string | null }[];
  isUnassigned: boolean;
  isInTargetClass: boolean;
}

interface AddStudentDialogProps {
  classId: string;
  className: string;
  customTrigger?: React.ReactElement;
  onSuccess?: () => void;
}

export function AddStudentDialog({ 
  classId, 
  className, 
  customTrigger,
  onSuccess 
}: AddStudentDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'existing' | 'create'>('existing');
  const router = useRouter();

  // --- TAB 1: EXISTING STUDENTS STATE ---
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSubmittingEnroll, setIsSubmittingEnroll] = useState(false);
  const [availableStudents, setAvailableStudents] = useState<StudentAvailableItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnassignedOnly, setFilterUnassignedOnly] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // --- TAB 2: CREATE STUDENT STATE ---
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newParentPhone, setNewParentPhone] = useState('');
  const [newParentName, setNewParentName] = useState('');
  const [newPassword, setNewPassword] = useState('123456');
  const [newAvatar, setNewAvatar] = useState(STUDENT_AVATARS[0]);
  const [createdResult, setCreatedResult] = useState<{
    studentName: string;
    parentPhone: string;
    password: string;
    className: string;
    isExistingParent: boolean;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch available students when dialog opens or when switching to 'existing' tab
  const fetchAvailableStudents = async () => {
    setIsLoadingStudents(true);
    try {
      const res = await fetch(`/api/students/available?classId=${classId}`);
      const data = await res.json();
      if (res.ok) {
        setAvailableStudents(data.students || []);
      } else {
        toast.error(data.error || 'Không thể tải danh sách học sinh.');
      }
    } catch (err) {
      console.error('Error fetching available students:', err);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchAvailableStudents();
      setSelectedStudentIds([]);
      setCreatedResult(null);
      setCopied(false);
    }
  }, [open, classId]);

  // Filtered student list for Tab 1
  const filteredStudents = useMemo(() => {
    return availableStudents.filter((s) => {
      const matchSearch =
        s.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.parentPhone.includes(searchQuery) ||
        (s.parentName && s.parentName.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;
      if (filterUnassignedOnly && !s.isUnassigned) return false;

      return true;
    });
  }, [availableStudents, searchQuery, filterUnassignedOnly]);

  const toggleSelectStudent = (studentId: string, isInClass: boolean) => {
    if (isInClass) return; // Cannot toggle if already in target class
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    const selectable = filteredStudents
      .filter((s) => !s.isInTargetClass)
      .map((s) => s.id);
    
    if (selectedStudentIds.length === selectable.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(selectable);
    }
  };

  // Submit adding existing students to class
  const handleEnrollExisting = async () => {
    if (selectedStudentIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 học sinh để thêm vào lớp.');
      return;
    }

    setIsSubmittingEnroll(true);
    try {
      const res = await fetch('/api/students/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId,
          studentIds: selectedStudentIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi thêm học sinh.');
      }

      toast.success(data.message || `Đã thêm ${selectedStudentIds.length} học sinh vào lớp! 🎉`);
      setOpen(false);
      if (onSuccess) onSuccess();
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Lỗi thêm học sinh vào lớp.');
    } finally {
      setIsSubmittingEnroll(false);
    }
  };

  // Submit creating new student account & auto enroll
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingAccount(true);

    try {
      const response = await fetch('/api/students/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: newStudentName,
          parentPhone: newParentPhone,
          parentName: newParentName,
          defaultPassword: newPassword,
          classId,
          avatarUrl: newAvatar,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi tạo tài khoản học sinh.');
      }

      setCreatedResult({
        studentName: newStudentName.trim(),
        parentPhone: data.credentials.phone,
        password: data.credentials.defaultPassword,
        className: className || 'Lớp học',
        isExistingParent: data.isExistingParent,
      });

      toast.success('Cấp tài khoản và thêm bé vào lớp thành công! 🎉');
      if (onSuccess) onSuccess();
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Có lỗi xảy ra.');
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdResult) return;
    const message = `Kính gửi phụ huynh bé ${createdResult.studentName},\nTài khoản học tập của bé trên ứng dụng Kinderly đã được cấp:\n- Số điện thoại đăng nhập: ${createdResult.parentPhone}\n- Mật khẩu mặc định: ${createdResult.password}\n- Lớp học: ${createdResult.className}\nQuý phụ huynh đăng nhập để theo dõi và đồng hành học tập cùng con nhé!`;
    navigator.clipboard.writeText(message);
    setCopied(true);
    toast.success('Đã sao chép tin nhắn gửi phụ huynh! 📋');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleResetCreateForm = () => {
    setCreatedResult(null);
    setNewStudentName('');
    setNewParentPhone('');
    setNewParentName('');
    setNewPassword('123456');
    setNewAvatar(STUDENT_AVATARS[0]);
  };

  const defaultTrigger = (
    <button
      type="button"
      className="px-4 sm:px-5 py-2 sm:py-2.5 bg-primary text-on-primary rounded-full font-sans font-bold text-xs sm:text-sm hover:bg-primary-dark transition-all flex items-center gap-2 shadow-xs cursor-pointer"
    >
      <UserPlus className="w-4 h-4" />
      <span>+ Thêm học sinh</span>
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={customTrigger || defaultTrigger} />
      <DialogContent className="sm:max-w-[560px] bg-surface-container-lowest border-outline-variant/30 max-h-[92vh] flex flex-col p-0 overflow-hidden rounded-2xl shadow-xl">
        {/* Dialog Header */}
        <div className="p-5 pb-3 border-b border-outline-variant/20 bg-surface-bright">
          <div className="flex items-center gap-1.5 text-primary mb-1">
            <Sparkles className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Quản lý lớp học</span>
          </div>
          <DialogTitle className="font-heading text-xl font-bold text-on-surface">
            Thêm học sinh vào lớp <span className="text-primary">{className}</span>
          </DialogTitle>
          <DialogDescription className="font-sans text-on-surface-variant text-xs mt-0.5">
            Chọn học sinh đã có sẵn trong hệ thống hoặc cấp tài khoản mới cho bé.
          </DialogDescription>

          {/* 2 Tabs Header */}
          {!createdResult && (
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-surface-container-high/60 rounded-xl mt-3.5 border border-outline-variant/30">
              <button
                type="button"
                onClick={() => setActiveTab('existing')}
                className={`py-2 px-3 rounded-lg font-sans font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'existing'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Chọn học sinh có sẵn</span>
                {availableStudents.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 bg-primary/10 text-primary rounded-full font-bold">
                    {availableStudents.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('create')}
                className={`py-2 px-3 rounded-lg font-sans font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'create'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Cấp tài khoản mới</span>
              </button>
            </div>
          )}
        </div>

        {/* Dialog Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* TAB 1: SELECT EXISTING STUDENTS */}
          {activeTab === 'existing' && (
            <div className="space-y-4">
              {/* Search & Filter Bar */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <Input
                      placeholder="Tìm theo tên bé, SĐT phụ huynh..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 border-outline-variant bg-surface-bright rounded-xl text-xs font-sans"
                    />
                  </div>

                  <Button
                    type="button"
                    variant={filterUnassignedOnly ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setFilterUnassignedOnly(!filterUnassignedOnly)}
                    className={`h-9 px-3 text-xs rounded-xl gap-1.5 shrink-0 ${
                      filterUnassignedOnly ? 'bg-primary-container text-on-primary-container font-bold' : 'border-outline-variant'
                    }`}
                  >
                    <Filter className="w-3 h-3" />
                    <span>Chưa có lớp</span>
                  </Button>
                </div>

                {/* Selection helper row */}
                <div className="flex items-center justify-between text-xs text-on-surface-variant px-1">
                  <span>
                    Tìm thấy <strong className="text-on-surface">{filteredStudents.length}</strong> học sinh
                    {selectedStudentIds.length > 0 && (
                      <span className="text-primary font-bold ml-1.5">
                        (Đã chọn {selectedStudentIds.length})
                      </span>
                    )}
                  </span>

                  {filteredStudents.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-primary font-bold text-xs hover:underline cursor-pointer flex items-center gap-1"
                    >
                      {selectedStudentIds.length === filteredStudents.filter((s) => !s.isInTargetClass).length && selectedStudentIds.length > 0
                        ? 'Bỏ chọn tất cả'
                        : 'Chọn tất cả'}
                    </button>
                  )}
                </div>
              </div>

              {/* Student List */}
              {isLoadingStudents ? (
                <div className="py-12 flex flex-col items-center justify-center text-on-surface-variant gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="text-xs font-sans font-medium">Đang tải danh sách học sinh...</span>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="py-10 text-center space-y-2 border border-dashed border-outline-variant/50 rounded-2xl p-6 bg-surface-container-low/30">
                  <div className="text-3xl">👶</div>
                  <p className="font-heading font-bold text-sm text-on-surface">Không tìm thấy học sinh phù hợp</p>
                  <p className="font-sans text-xs text-on-surface-variant max-w-xs mx-auto">
                    {searchQuery
                      ? 'Thử tìm kiếm với từ khóa khác hoặc chuyển sang tab "Cấp tài khoản mới".'
                      : 'Hệ thống chưa có học sinh nào chưa phân lớp.'}
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveTab('create')}
                    className="mt-2 text-xs rounded-xl border-outline-variant text-primary font-bold"
                  >
                    + Cấp tài khoản cho bé mới
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {filteredStudents.map((student) => {
                    const isSelected = selectedStudentIds.includes(student.id);
                    const isInClass = student.isInTargetClass;

                    return (
                      <div
                        key={student.id}
                        onClick={() => toggleSelectStudent(student.id, isInClass)}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                          isInClass
                            ? 'bg-surface-container-high/40 border-outline-variant/30 opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'bg-primary-container/20 border-primary shadow-2xs cursor-pointer ring-1 ring-primary'
                            : 'bg-surface-bright border-outline-variant/30 hover:border-outline-variant hover:bg-surface-container-low cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Checkbox indicator */}
                          <div className="shrink-0 text-primary">
                            {isInClass ? (
                              <Check className="w-4 h-4 text-outline" />
                            ) : isSelected ? (
                              <CheckSquare className="w-4 h-4 text-primary" />
                            ) : (
                              <Square className="w-4 h-4 text-outline-variant" />
                            )}
                          </div>

                          {/* Student Avatar */}
                          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-xl shadow-2xs shrink-0">
                            <span>{student.avatarUrl || '🐻'}</span>
                          </div>

                          {/* Student Info */}
                          <div className="min-w-0 flex-1">
                            <h4 
                              className="font-sans font-bold text-xs text-on-surface truncate"
                              title={student.displayName}
                            >
                              {student.displayName}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px] text-on-surface-variant font-sans mt-0.5">
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-primary" />
                                <span>{student.parentPhone}</span>
                              </span>
                              <span>•</span>
                              <span>PH: {student.parentName}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0">
                          {isInClass ? (
                            <span className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant rounded-md text-[10px] font-sans font-bold">
                              Đã trong lớp
                            </span>
                          ) : student.isUnassigned ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-sans font-bold">
                              Chưa có lớp
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[10px] font-sans font-bold">
                              {student.enrolledClasses.map((c) => c.name).join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CREATE NEW STUDENT ACCOUNT */}
          {activeTab === 'create' && (
            <div>
              {createdResult ? (
                /* Success View after creating */
                <div className="space-y-3.5 py-1 animate-fade-in">
                  {createdResult.isExistingParent && (
                    <div className="p-3 bg-secondary-container/40 border border-secondary-container rounded-xl flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                      <p className="text-xs text-on-surface font-sans leading-relaxed">
                        <strong>Số điện thoại này đã có tài khoản:</strong> Bé <strong>{createdResult.studentName}</strong> đã được thêm và liên kết vào tài khoản chung của phụ huynh!
                      </p>
                    </div>
                  )}

                  <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/30 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
                      <span className="text-xs font-sans text-on-surface-variant">Bé học sinh:</span>
                      <span className="font-sans font-bold text-xs text-on-surface">{createdResult.studentName}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
                      <span className="text-xs font-sans text-on-surface-variant">Lớp học tiếp nhận:</span>
                      <span className="font-sans font-bold text-[11px] px-2 py-0.5 bg-primary-container text-on-primary-container rounded-md">{createdResult.className}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
                      <span className="text-xs font-sans text-on-surface-variant">SĐT đăng nhập:</span>
                      <span className="font-sans font-bold text-xs text-primary tracking-wide">{createdResult.parentPhone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-sans text-on-surface-variant">Mật khẩu mặc định:</span>
                      <span className="font-mono font-bold text-xs bg-surface-container-high px-2 py-0.5 rounded text-on-surface">{createdResult.password}</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleCopyCredentials}
                    className="w-full rounded-xl bg-primary text-on-primary hover:bg-primary-dark font-bold py-2.5 text-xs shadow-xs flex items-center justify-center gap-1.5"
                  >
                    {copied ? <Check className="w-4 h-4 text-secondary-container" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Đã sao chép tin nhắn!' : 'Sao chép tin nhắn gửi Zalo cho bố mẹ'}</span>
                  </Button>

                  <div className="flex gap-2 pt-2 border-t border-outline-variant/20">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResetCreateForm}
                      className="flex-1 rounded-xl border-outline-variant text-on-surface-variant hover:bg-surface-container text-xs font-bold"
                    >
                      + Cấp tiếp bé khác
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setOpen(false)}
                      className="flex-1 rounded-xl font-bold text-xs"
                    >
                      Hoàn tất
                    </Button>
                  </div>
                </div>
              ) : (
                /* Create Student Form */
                <form id="create-student-form" onSubmit={handleCreateStudent} className="space-y-3.5">
                  {/* Avatar Selector */}
                  <div className="space-y-1.5">
                    <Label className="text-on-surface font-bold text-xs">Biểu tượng yêu thích của bé</Label>
                    <div className="grid grid-cols-6 gap-1.5 p-2 bg-surface-container-low rounded-xl border border-outline-variant/30">
                      {STUDENT_AVATARS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setNewAvatar(emoji)}
                          className={`text-xl p-1 rounded-md transition-all hover:scale-105 flex items-center justify-center cursor-pointer ${
                            newAvatar === emoji
                              ? 'bg-surface-container-lowest shadow-2xs ring-2 ring-primary scale-105'
                              : 'hover:bg-surface-container'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Student Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="studentName" className="text-on-surface font-bold text-xs">
                      Họ và tên bé <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                      <Input
                        id="studentName"
                        placeholder="VD: Nguyễn Bảo Nam"
                        required
                        value={newStudentName}
                        onChange={(e) => setNewStudentName(e.target.value)}
                        className="pl-9 border-outline-variant focus-visible:ring-primary bg-surface-bright rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  {/* Parent Phone */}
                  <div className="space-y-1.5">
                    <Label htmlFor="parentPhone" className="text-on-surface font-bold text-xs">
                      Số điện thoại bố / mẹ <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                      <Input
                        id="parentPhone"
                        type="tel"
                        placeholder="VD: 0912 345 678"
                        required
                        value={newParentPhone}
                        onChange={(e) => setNewParentPhone(e.target.value)}
                        className="pl-9 border-outline-variant focus-visible:ring-primary bg-surface-bright rounded-xl text-xs font-sans"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Parent Name (Optional) */}
                    <div className="space-y-1.5">
                      <Label htmlFor="parentName" className="text-on-surface font-bold text-xs">
                        Tên phụ huynh (Tùy chọn)
                      </Label>
                      <Input
                        id="parentName"
                        placeholder="VD: Anh Tuấn"
                        value={newParentName}
                        onChange={(e) => setNewParentName(e.target.value)}
                        className="border-outline-variant focus-visible:ring-primary bg-surface-bright rounded-xl text-xs"
                      />
                    </div>

                    {/* Default Password */}
                    <div className="space-y-1.5">
                      <Label htmlFor="defaultPassword" className="text-on-surface font-bold text-xs">
                        Mật khẩu mặc định
                      </Label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                        <Input
                          id="defaultPassword"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="pl-9 border-outline-variant focus-visible:ring-primary bg-surface-bright rounded-xl text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Dialog Footer */}
        {!createdResult && (
          <div className="p-4 border-t border-outline-variant/20 bg-surface-bright flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-xl border-outline-variant text-on-surface-variant hover:bg-surface-container text-xs font-bold"
            >
              Hủy
            </Button>

            {activeTab === 'existing' ? (
              <Button
                type="button"
                onClick={handleEnrollExisting}
                disabled={isSubmittingEnroll || selectedStudentIds.length === 0}
                className="rounded-xl bg-primary text-on-primary hover:bg-primary-dark font-bold text-xs shadow-xs disabled:opacity-50"
              >
                {isSubmittingEnroll ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 mr-1.5" />
                )}
                <span>
                  Thêm {selectedStudentIds.length > 0 ? `${selectedStudentIds.length} bé` : ''} vào lớp
                </span>
              </Button>
            ) : (
              <Button
                type="submit"
                form="create-student-form"
                disabled={isCreatingAccount}
                className="rounded-xl bg-primary text-on-primary hover:bg-primary-dark font-bold text-xs shadow-xs"
              >
                {isCreatingAccount ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                )}
                <span>Cấp tài khoản & Thêm vào lớp</span>
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
