'use client';

import React from 'react';
import { User, ShieldCheck, Bell, Sliders } from 'lucide-react';

export type SettingsTabId = 'profile' | 'security' | 'notifications' | 'preferences';

export interface TabItem {
  id: SettingsTabId;
  label: string;
  shortLabel?: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const SETTINGS_TABS: TabItem[] = [
  {
    id: 'profile',
    label: 'Hồ sơ giáo viên',
    shortLabel: 'Hồ sơ',
    description: 'Thông tin cá nhân, trường học & avatar',
    icon: User,
  },
  {
    id: 'security',
    label: 'Bảo mật & Mật khẩu',
    shortLabel: 'Bảo mật',
    description: 'Đổi mật khẩu & email tài khoản',
    icon: ShieldCheck,
  },
  {
    id: 'notifications',
    label: 'Tùy chọn thông báo',
    shortLabel: 'Thông báo',
    description: 'Cảnh báo bài nộp & âm thanh',
    icon: Bell,
  },
  {
    id: 'preferences',
    label: 'Giao diện & Hệ thống',
    shortLabel: 'Tùy chỉnh',
    description: 'Ngôn ngữ, tone màu & giao diện',
    icon: Sliders,
  },
];

interface SettingsTabsProps {
  activeTab: SettingsTabId;
  onTabChange: (tabId: SettingsTabId) => void;
}

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  return (
    <div className="w-full bg-surface-container-low p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl border border-outline-variant/30 overflow-x-auto no-scrollbar">
      <nav className="flex items-center gap-1.5 sm:gap-2 min-w-max" aria-label="Cài đặt">
        {SETTINGS_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl font-sans text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-surface-container-lowest text-primary shadow-custom scale-[1.02] ring-1 ring-primary/20'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container'
                    : 'bg-surface-container-high/60 text-on-surface-variant'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="inline sm:hidden">{tab.shortLabel || tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
