'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Phone, 
  School, 
  Mail, 
  Sparkles, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Building,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { AvatarPicker } from './AvatarPicker';

export interface UserProfileData {
  id?: string;
  email?: string;
  displayName?: string | null;
  phone?: string | null;
  school?: string | null;
  avatarUrl?: string | null;
  roleAssignments?: Array<{
    role?: {
      name?: string;
      description?: string;
    };
  }>;
}

interface ProfileSettingsTabProps {
  initialProfile: UserProfileData;
  onProfileUpdated?: (updated: UserProfileData) => void;
}

export function ProfileSettingsTab({ initialProfile, onProfileUpdated }: ProfileSettingsTabProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialProfile.displayName || '');
  const [phone, setPhone] = useState(initialProfile.phone || '');
  const [school, setSchool] = useState(initialProfile.school || '');
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatarUrl || '👩‍🏫');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialProfile) {
      setDisplayName(initialProfile.displayName || '');
      setPhone(initialProfile.phone || '');
      setSchool(initialProfile.school || '');
      setAvatarUrl(initialProfile.avatarUrl || '👩‍🏫');
    }
  }, [initialProfile]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    const trimmedName = displayName.trim();
    if (!trimmedName) {
      newErrors.displayName = 'Vui lòng nhập tên hiển thị';
    } else if (trimmedName.length < 2) {
      newErrors.displayName = 'Tên hiển thị phải có ít nhất 2 ký tự';
    } else if (trimmedName.length > 100) {
      newErrors.displayName = 'Tên hiển thị không được vượt quá 100 ký tự';
    }

    const trimmedPhone = phone.trim();
    if (trimmedPhone) {
      const cleanPhone = trimmedPhone.replace(/[\s-]/g, '');
      const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
      if (!phoneRegex.test(cleanPhone)) {
        newErrors.phone = 'Số điện thoại không hợp lệ (VD: 0912345678)';
      }
    }

    if (school && school.length > 200) {
      newErrors.school = 'Tên trường không được vượt quá 200 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin nhập!');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        displayName: displayName.trim(),
        phone: phone.trim() || undefined,
        school: school.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
      };

      const response = await api.patch('/users/profile', payload);
      const updatedData = response.data?.data || response.data;

      toast.success('Hồ sơ đã được cập nhật thành công! 🎉');
      
      if (onProfileUpdated && updatedData) {
        onProfileUpdated(updatedData);
      }
      
      router.refresh();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        'Không thể cập nhật hồ sơ. Vui lòng thử lại!';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const isImageAvatar =
    avatarUrl && (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://') || avatarUrl.startsWith('/'));

  const teacherRole =
    initialProfile.roleAssignments?.[0]?.role?.description ||
    initialProfile.roleAssignments?.[0]?.role?.name ||
    'Giáo viên';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
      {/* Left Column: Edit Form (7 cols) */}
      <div className="lg:col-span-7 bg-surface-container-lowest p-6 sm:p-8 rounded-3xl border border-outline-variant/30 shadow-custom">
        <div className="flex items-center gap-3 pb-6 border-b border-outline-variant/20 mb-6">
          <div className="p-3 rounded-2xl bg-primary-container text-on-primary-container">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-xl text-on-surface">
              Chỉnh sửa thông tin cá nhân
            </h2>
            <p className="font-sans text-xs text-on-surface-variant">
              Cập nhật tên gọi, liên hệ và đơn vị trường học của bạn
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Picker Component */}
          <AvatarPicker
            value={avatarUrl}
            onChange={(newAvatar) => setAvatarUrl(newAvatar)}
            disabled={isSaving}
          />

          {/* Display Name Input */}
          <div className="space-y-2">
            <label className="font-heading font-bold text-sm text-on-surface flex items-center gap-1.5">
              <span>Họ và tên / Tên hiển thị</span>
              <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="text"
                disabled={isSaving}
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (errors.displayName) setErrors((prev) => ({ ...prev, displayName: '' }));
                }}
                placeholder="VD: Cô Nguyễn Thu Hà"
                className={`w-full pl-10 pr-4 py-3 rounded-2xl border-2 bg-surface-container-lowest font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none transition-all ${
                  errors.displayName
                    ? 'border-destructive focus:border-destructive'
                    : 'border-outline-variant/40 focus:border-primary focus:ring-2 focus:ring-primary/20'
                }`}
              />
            </div>
            {errors.displayName && (
              <p className="font-sans text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.displayName}</span>
              </p>
            )}
          </div>

          {/* Phone Number Input */}
          <div className="space-y-2">
            <label className="font-heading font-bold text-sm text-on-surface flex items-center gap-1.5">
              <span>Số điện thoại liên lạc</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="tel"
                disabled={isSaving}
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                }}
                placeholder="VD: 0912345678"
                className={`w-full pl-10 pr-4 py-3 rounded-2xl border-2 bg-surface-container-lowest font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none transition-all ${
                  errors.phone
                    ? 'border-destructive focus:border-destructive'
                    : 'border-outline-variant/40 focus:border-primary focus:ring-2 focus:ring-primary/20'
                }`}
              />
            </div>
            {errors.phone && (
              <p className="font-sans text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.phone}</span>
              </p>
            )}
          </div>

          {/* School Name Input */}
          <div className="space-y-2">
            <label className="font-heading font-bold text-sm text-on-surface flex items-center gap-1.5">
              <span>Trường học / Đơn vị giảng dạy</span>
            </label>
            <div className="relative">
              <School className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="text"
                disabled={isSaving}
                value={school}
                onChange={(e) => {
                  setSchool(e.target.value);
                  if (errors.school) setErrors((prev) => ({ ...prev, school: '' }));
                }}
                placeholder="VD: Trường Mầm non Hoa Sen"
                className={`w-full pl-10 pr-4 py-3 rounded-2xl border-2 bg-surface-container-lowest font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none transition-all ${
                  errors.school
                    ? 'border-destructive focus:border-destructive'
                    : 'border-outline-variant/40 focus:border-primary focus:ring-2 focus:ring-primary/20'
                }`}
              />
            </div>
            {errors.school && (
              <p className="font-sans text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.school}</span>
              </p>
            )}
          </div>

          {/* Action Button */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="btn-3d bg-primary text-white hover:bg-primary-dark font-heading font-bold text-sm px-7 py-3 rounded-2xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu thay đổi...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu thay đổi hồ sơ</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Right Column: Live Preview Card (5 cols) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl border border-outline-variant/30 shadow-custom relative overflow-hidden">
          {/* Decorative background blob */}
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary-container/30 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-secondary/20 blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20 mb-6">
              <span className="font-heading font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Xem trước thẻ giáo viên</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Trực tuyến</span>
              </span>
            </div>

            {/* Avatar Circle & Identity */}
            <div className="flex flex-col items-center text-center space-y-4 pt-2">
              <div className="relative group">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-primary-container/40 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
                  {isImageAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt={displayName || 'Avatar'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl sm:text-6xl filter drop-shadow-sm select-none">
                      {avatarUrl || '👩‍🏫'}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 p-1.5 bg-primary text-white rounded-xl shadow-xs">
                  <Shield className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <h3 className="font-heading font-bold text-xl text-on-surface">
                  {displayName || 'Thầy / Cô'}
                </h3>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-1 rounded-full bg-secondary text-on-secondary font-heading font-bold text-xs shadow-xs">
                  <span>{teacherRole}</span>
                </div>
              </div>
            </div>

            {/* Profile Meta List */}
            <div className="mt-8 space-y-3 pt-6 border-t border-outline-variant/20">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-low/60 text-xs">
                <div className="p-2 rounded-xl bg-surface-container-highest text-primary">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
                    Email tài khoản
                  </p>
                  <p className="font-semibold text-on-surface truncate">
                    {initialProfile.email || 'Chưa cập nhật'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-low/60 text-xs">
                <div className="p-2 rounded-xl bg-surface-container-highest text-primary">
                  <Building className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
                    Đơn vị trường học
                  </p>
                  <p className="font-semibold text-on-surface truncate">
                    {school || 'Chưa thiết lập trường'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-low/60 text-xs">
                <div className="p-2 rounded-xl bg-surface-container-highest text-primary">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
                    Số điện thoại
                  </p>
                  <p className="font-semibold text-on-surface truncate">
                    {phone || 'Chưa cập nhật'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
