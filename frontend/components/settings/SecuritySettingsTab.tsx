'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Check, 
  AlertCircle, 
  Loader2, 
  Lock, 
  Mail, 
  ShieldAlert,
  Fingerprint
} from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';

interface SecuritySettingsTabProps {
  userEmail?: string;
}

export function SecuritySettingsTab({ userEmail }: SecuritySettingsTabProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const supabase = createClient();

  const isMinLength = newPassword.length >= 6;
  const isMatch = Boolean(newPassword && confirmPassword && newPassword === confirmPassword);
  const isFormValid = isMinLength && isMatch;

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isMinLength) {
      setErrorMessage('Mật khẩu mới phải có tối thiểu 6 ký tự!');
      toast.error('Mật khẩu mới phải có tối thiểu 6 ký tự!');
      return;
    }

    if (!isMatch) {
      setErrorMessage('Mật khẩu xác nhận không trùng khớp!');
      toast.error('Mật khẩu xác nhận không trùng khớp!');
      return;
    }

    setIsUpdating(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      toast.success('Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới nhé. 🔒');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Error updating password:', err);
      let msg = 'Không thể cập nhật mật khẩu. Vui lòng thử lại sau!';
      if (err.message?.includes('different from the old password')) {
        msg = 'Mật khẩu mới không được trùng với mật khẩu hiện tại!';
      } else if (err.message?.includes('weak')) {
        msg = 'Mật khẩu quá yếu, vui lòng chọn mật khẩu khó đoán hơn!';
      } else if (err.message) {
        msg = err.message;
      }
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Account Overview Card */}
      <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl border border-outline-variant/30 shadow-custom">
        <div className="flex items-center gap-3 pb-6 border-b border-outline-variant/20 mb-6">
          <div className="p-3 rounded-2xl bg-primary-container text-on-primary-container">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-xl text-on-surface">
              Thông tin tài khoản & Xác thực
            </h2>
            <p className="font-sans text-xs text-on-surface-variant">
              Tài khoản được bảo vệ bởi tiêu chuẩn xác thực Supabase Auth
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-surface-container-low/60 border border-outline-variant/30 flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-surface-container-highest text-primary">
              <Mail className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Email đăng nhập
              </p>
              <p className="font-semibold text-sm text-on-surface truncate">
                {userEmail || 'Chưa xác định'}
              </p>
              <div className="inline-flex items-center gap-1 mt-1 text-[11px] text-emerald-700 font-bold">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Đã xác thực</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low/60 border border-outline-variant/30 flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-surface-container-highest text-primary">
              <Fingerprint className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Phương thức bảo mật
              </p>
              <p className="font-semibold text-sm text-on-surface truncate">
                Supabase JWT + Password
              </p>
              <span className="text-[11px] text-on-surface-variant/80 mt-1 block">
                Mã hóa đầu cuối chuẩn SHA-256
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Form */}
      <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl border border-outline-variant/30 shadow-custom">
        <div className="flex items-center gap-3 pb-6 border-b border-outline-variant/20 mb-6">
          <div className="p-3 rounded-2xl bg-secondary text-on-secondary">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-xl text-on-surface">
              Đổi mật khẩu tài khoản
            </h2>
            <p className="font-sans text-xs text-on-surface-variant">
              Tạo mật khẩu an toàn mới để bảo vệ thông tin lớp học và học sinh
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-xl">
          {/* New Password Input */}
          <div className="space-y-2">
            <label className="font-heading font-bold text-sm text-on-surface flex items-center gap-1.5">
              <span>Mật khẩu mới</span>
              <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                disabled={isUpdating}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                className="w-full pl-10 pr-12 py-3 rounded-2xl border-2 border-outline-variant/40 bg-surface-container-lowest font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1 rounded-lg cursor-pointer"
                aria-label={showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-2">
            <label className="font-heading font-bold text-sm text-on-surface flex items-center gap-1.5">
              <span>Xác nhận mật khẩu mới</span>
              <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                disabled={isUpdating}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full pl-10 pr-12 py-3 rounded-2xl border-2 border-outline-variant/40 bg-surface-container-lowest font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1 rounded-lg cursor-pointer"
                aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Real-time Checklist */}
          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-2">
            <p className="text-xs font-bold text-on-surface font-heading">
              Yêu cầu mật khẩu an toàn:
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isMinLength
                      ? 'bg-emerald-500 text-white'
                      : 'bg-surface-container-highest text-on-surface-variant'
                  }`}
                >
                  {isMinLength ? <Check className="w-3 h-3 stroke-[3]" /> : '•'}
                </div>
                <span
                  className={isMinLength ? 'text-emerald-800 font-semibold' : 'text-on-surface-variant'}
                >
                  Độ dài từ 6 ký tự trở lên
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isMatch
                      ? 'bg-emerald-500 text-white'
                      : 'bg-surface-container-highest text-on-surface-variant'
                  }`}
                >
                  {isMatch ? <Check className="w-3 h-3 stroke-[3]" /> : '•'}
                </div>
                <span className={isMatch ? 'text-emerald-800 font-semibold' : 'text-on-surface-variant'}>
                  Mật khẩu xác nhận trùng khớp
                </span>
              </div>
            </div>
          </div>

          {errorMessage && (
            <p className="font-sans text-xs text-destructive flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </p>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isUpdating || !isFormValid}
              className="btn-3d bg-primary text-white hover:bg-primary-dark font-heading font-bold text-sm px-7 py-3 rounded-2xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang cập nhật mật khẩu...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Cập nhật mật khẩu mới</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
