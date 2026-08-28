'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Settings, 
  Loader2, 
  User, 
  ShieldCheck, 
  Bell, 
  Sliders 
} from 'lucide-react';
import api from '@/lib/api';
import { createClient } from '@/lib/supabase/client';
import { SettingsTabs, SettingsTabId } from '@/components/settings/SettingsTabs';
import { ProfileSettingsTab, UserProfileData } from '@/components/settings/ProfileSettingsTab';
import { SecuritySettingsTab } from '@/components/settings/SecuritySettingsTab';
import { NotificationSettingsTab } from '@/components/settings/NotificationSettingsTab';
import { PreferencesSettingsTab } from '@/components/settings/PreferencesSettingsTab';

export default function TeacherSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTabId>('profile');
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Attempt 1: Fetch through Backend API
      try {
        const response = await api.get('/users/profile');
        if (response.data) {
          const profileData = response.data.data || response.data;
          setProfile(profileData);
          setLoading(false);
          return;
        }
      } catch (apiErr) {
        console.warn('Backend API /users/profile fetch failed, falling back to Supabase directly:', apiErr);
      }

      // Attempt 2: Fallback directly to Supabase client
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Chưa đăng nhập. Vui lòng đăng nhập lại!');
      }

      const { data: profileRecord, error: dbError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (dbError) {
        throw dbError;
      }

      setProfile({
        id: profileRecord.id,
        email: profileRecord.email || user.email,
        displayName: profileRecord.display_name || profileRecord.displayName,
        phone: profileRecord.phone,
        school: profileRecord.school,
        avatarUrl: profileRecord.avatar_url || profileRecord.avatarUrl || '👩‍🏫',
      });
    } catch (err: any) {
      console.error('Error fetching teacher profile:', err);
      setError(err.message || 'Không thể tải thông tin tài khoản');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleProfileUpdated = (updated: UserProfileData) => {
    setProfile((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Page Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-6 sm:p-8 rounded-3xl border border-outline-variant/30 shadow-custom relative overflow-hidden">
        {/* Background glow decoration */}
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-primary-container/20 via-primary-container/5 to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container/40 text-on-primary-container text-xs font-bold font-heading mb-1">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Cài đặt hệ thống Kinderly</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-on-surface flex items-center gap-3">
            <span>Cài đặt tài khoản giáo viên</span>
          </h1>
          <p className="font-sans text-xs sm:text-sm text-on-surface-variant max-w-xl">
            Quản lý thông tin cá nhân, cập nhật mật khẩu và tùy biến trải nghiệm giảng dạy mầm non vui tươi, hiệu quả.
          </p>
        </div>

        <div className="relative z-10 shrink-0 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-secondary/80 text-on-secondary flex items-center justify-center font-heading text-2xl shadow-xs">
            ⚙️
          </div>
        </div>
      </div>

      {/* Tab Navigation Pill Bar */}
      <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area with Skeleton Loader */}
      {loading ? (
        <div className="bg-surface-container-lowest p-12 rounded-3xl border border-outline-variant/30 shadow-custom flex flex-col items-center justify-center text-center space-y-4 min-h-[360px]">
          <div className="p-4 rounded-2xl bg-primary-container/30 text-primary animate-bounce">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <p className="font-heading font-bold text-base text-on-surface">
            Đang tải thông tin cài đặt...
          </p>
          <p className="font-sans text-xs text-on-surface-variant">
            Vui lòng chờ trong giây lát
          </p>
        </div>
      ) : error ? (
        <div className="bg-surface-container-lowest p-8 rounded-3xl border border-destructive/30 shadow-custom text-center space-y-4">
          <p className="font-heading font-bold text-base text-destructive">
            {error}
          </p>
          <button
            type="button"
            onClick={fetchUserProfile}
            className="btn-3d bg-primary text-white px-6 py-2.5 rounded-2xl font-bold text-xs"
          >
            Thử tải lại
          </button>
        </div>
      ) : (
        <div>
          {activeTab === 'profile' && profile && (
            <ProfileSettingsTab
              initialProfile={profile}
              onProfileUpdated={handleProfileUpdated}
            />
          )}

          {activeTab === 'security' && (
            <SecuritySettingsTab userEmail={profile?.email} />
          )}

          {activeTab === 'notifications' && <NotificationSettingsTab />}

          {activeTab === 'preferences' && <PreferencesSettingsTab />}
        </div>
      )}
    </div>
  );
}
