'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { 
  UserPlus, 
  Phone, 
  User, 
  Lock, 
  School, 
  Copy, 
  Check, 
  Loader2, 
  Sparkles,
  Info,
  Users
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

const STUDENT_AVATARS = ['🐻', '🦁', '🐯', '🐰', '🐼', '🐬', '🦄', '🌟', '🚀', '🎨', '⚽', '🍦'];

interface ClassOption {
  id: string;
  name: string;
  grade: string | null;
}

interface CreateStudentAccountDialogProps {
  customTrigger?: React.ReactElement;
  defaultClassId?: string;
}

export function CreateStudentAccountDialog({
  customTrigger,
  defaultClassId,
}: CreateStudentAccountDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  
  // Form State
  const [studentName, setStudentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [defaultPassword, setDefaultPassword] = useState('123456');
  const [selectedClassId, setSelectedClassId] = useState(defaultClassId || '');
  const [selectedAvatar, setSelectedAvatar] = useState(STUDENT_AVATARS[0]);

  // Success result state
  const [createdResult, setCreatedResult] = useState<{
    studentName: string;
    parentPhone: string;
    password: string;
    className: string;
    isExistingParent: boolean;
    existingChildrenCount: number;
  } | null>(null);

  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Load teacher's classes when dialog opens
  useEffect(() => {
    if (open) {
      const fetchClasses = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: teacherEnrollments } = await supabase
          .from('class_enrollments')
          .select('class_id, classes(id, name, grade)')
          .eq('profile_id', user.id)
          .eq('role', 'teacher');

        const { data: allClasses } = await supabase
          .from('classes')
          .select('id, name, grade')
          .order('name');

        const list = (teacherEnrollments?.map(e => Array.isArray(e.classes) ? e.classes[0] : e.classes).filter(Boolean) || allClasses || []) as ClassOption[];
        setClasses(list);

        if (!selectedClassId && list.length > 0) {
          setSelectedClassId(defaultClassId || list[0].id);
        }
      };

      fetchClasses();
      setCreatedResult(null);
      setCopied(false);
    }
  }, [open, defaultClassId]);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/students/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          parentPhone,
          parentName,
          defaultPassword,
          classId: selectedClassId || null,
          avatarUrl: selectedAvatar,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi tạo tài khoản học sinh.');
      }

      const targetClass = classes.find(c => c.id === selectedClassId);
      
      setCreatedResult({
        studentName: studentName.trim(),
        parentPhone: data.credentials.phone,
        password: data.credentials.defaultPassword,
        className: targetClass ? targetClass.name : 'Chưa phân lớp',
        isExistingParent: data.isExistingParent,
        existingChildrenCount: data.existingChildrenCount,
      });

      toast.success(
        data.isExistingParent 
          ? 'Đã thêm bé vào tài khoản phụ huynh thành công! 🎉'
          : 'Tạo tài khoản học sinh thành công! 🎉'
      );
      
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Có lỗi xảy ra.');
    } finally {
      setIsLoading(false);
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

  const handleResetForm = () => {
    setCreatedResult(null);
    setStudentName('');
    setParentPhone('');
    setParentName('');
    setDefaultPassword('123456');
    setSelectedAvatar(STUDENT_AVATARS[0]);
  };

  const defaultTrigger = (
    <button
      type="button"
      className="w-full py-3 bg-primary text-on-primary rounded-xl font-sans font-bold text-sm btn-3d transition-all duration-200 flex items-center justify-center gap-2 hover:bg-primary-dark cursor-pointer shadow-sm"
    >
      <UserPlus className="w-4 h-4" />
      <span>+ Cấp tài khoản học sinh</span>
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={customTrigger || defaultTrigger} />
      <DialogContent className="sm:max-w-[480px] bg-surface-container-lowest border-outline-variant/30 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-1">
            <Sparkles className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Hệ thống cấp tài khoản</span>
          </div>
          <DialogTitle className="font-heading text-2xl text-on-surface">
            {createdResult ? 'Tài khoản đã tạo thành công! 🎉' : 'Tạo tài khoản học sinh'}
          </DialogTitle>
          <DialogDescription className="font-sans text-on-surface-variant text-xs">
            {createdResult 
              ? 'Sao chép thông tin tài khoản bên dưới để gửi cho phụ huynh qua Zalo hoặc SMS.' 
              : 'Tài khoản được đăng nhập bằng Số điện thoại của bố mẹ. Một số điện thoại có thể liên kết nhiều con.'}
          </DialogDescription>
        </DialogHeader>

        {/* Success View */}
        {createdResult ? (
          <div className="space-y-4 py-3 animate-fade-in">
            {createdResult.isExistingParent && (
              <div className="p-3 bg-secondary-container/40 border border-secondary-container rounded-2xl flex items-start gap-2.5">
                <Info className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                <p className="text-xs text-on-surface font-sans leading-relaxed">
                  <strong>Số điện thoại này đã có tài khoản:</strong> Bé <strong>{createdResult.studentName}</strong> đã được liên kết vào tài khoản chung của bố mẹ. Bố mẹ dùng chung SĐT này sẽ thấy cả các bé!
                </p>
              </div>
            )}

            <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/30 space-y-3">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2.5">
                <span className="text-xs font-sans text-on-surface-variant">Bé học sinh:</span>
                <span className="font-sans font-bold text-sm text-on-surface">{createdResult.studentName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2.5">
                <span className="text-xs font-sans text-on-surface-variant">Lớp học:</span>
                <span className="font-sans font-bold text-xs px-2.5 py-0.5 bg-primary-container text-on-primary-container rounded-full">{createdResult.className}</span>
              </div>
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2.5">
                <span className="text-xs font-sans text-on-surface-variant">Số điện thoại đăng nhập:</span>
                <span className="font-sans font-bold text-sm text-primary tracking-wide">{createdResult.parentPhone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans text-on-surface-variant">Mật khẩu mặc định:</span>
                <span className="font-mono font-bold text-sm bg-surface-container-high px-2 py-0.5 rounded-lg text-on-surface">{createdResult.password}</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleCopyCredentials}
              className="w-full rounded-full bg-primary text-on-primary hover:bg-primary-dark font-bold py-6 btn-3d flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-5 h-5 text-secondary-container" /> : <Copy className="w-5 h-5" />}
              <span>{copied ? 'Đã sao chép tin nhắn!' : 'Sao chép tin nhắn gửi Zalo cho bố mẹ'}</span>
            </Button>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleResetForm}
                className="flex-1 rounded-full border-outline-variant text-on-surface-variant hover:bg-surface-container"
              >
                + Cấp tiếp bé khác
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full font-bold"
              >
                Hoàn tất
              </Button>
            </div>
          </div>
        ) : (
          /* Create Form */
          <form onSubmit={handleCreateStudent} className="space-y-4 py-2">
            {/* Avatar Selector */}
            <div className="space-y-1.5">
              <Label className="text-on-surface font-bold text-xs">Biểu tượng / Con vật yêu thích của bé</Label>
              <div className="grid grid-cols-6 gap-2 p-2 bg-surface-container-low rounded-2xl">
                {STUDENT_AVATARS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedAvatar(emoji)}
                    className={`text-2xl p-1.5 rounded-xl transition-all hover:scale-110 flex items-center justify-center ${
                      selectedAvatar === emoji
                        ? 'bg-surface-container-lowest shadow-custom ring-2 ring-primary scale-105'
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
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <Input
                  id="studentName"
                  placeholder="VD: Nguyễn Bảo Nam"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="pl-10 border-outline-variant focus-visible:ring-primary bg-surface-bright rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Parent Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="parentPhone" className="text-on-surface font-bold text-xs">
                Số điện thoại bố / mẹ <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <Input
                  id="parentPhone"
                  type="tel"
                  placeholder="VD: 0912 345 678"
                  required
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="pl-10 border-outline-variant focus-visible:ring-primary bg-surface-bright rounded-xl text-sm font-sans"
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
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="border-outline-variant focus-visible:ring-primary bg-surface-bright rounded-xl text-sm"
                />
              </div>

              {/* Default Password */}
              <div className="space-y-1.5">
                <Label htmlFor="defaultPassword" className="text-on-surface font-bold text-xs">
                  Mật khẩu mặc định
                </Label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <Input
                    id="defaultPassword"
                    value={defaultPassword}
                    onChange={(e) => setDefaultPassword(e.target.value)}
                    className="pl-10 border-outline-variant focus-visible:ring-primary bg-surface-bright rounded-xl text-sm font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Class Selector */}
            <div className="space-y-1.5">
              <Label htmlFor="classSelect" className="text-on-surface font-bold text-xs">
                Phân vào lớp học
              </Label>
              <select
                id="classSelect"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-bright text-on-surface text-sm focus:border-primary outline-none"
              >
                <option value="">-- Chưa phân lớp (Thêm vào danh sách chờ) --</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.grade ? `(${c.grade})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="rounded-full border-outline-variant text-on-surface-variant hover:bg-surface-container"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="rounded-full bg-primary text-on-primary hover:bg-primary-dark font-bold btn-3d"
              >
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Cấp tài khoản ngay
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
