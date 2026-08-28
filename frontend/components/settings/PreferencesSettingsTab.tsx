'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Globe, 
  Palette, 
  LayoutGrid, 
  Save, 
  Check, 
  Sparkles,
  FileCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

export interface SystemPreferencesState {
  language: 'vi' | 'en';
  themeTone: 'teal' | 'ocean' | 'sunshine';
  compactMode: boolean;
  autoSaveDrafts: boolean;
}

const DEFAULT_PREFERENCES: SystemPreferencesState = {
  language: 'vi',
  themeTone: 'teal',
  compactMode: false,
  autoSaveDrafts: true,
};

const STORAGE_KEY = 'kinderly_teacher_preferences';

const THEME_OPTIONS = [
  {
    id: 'teal' as const,
    label: 'Kinderly Teal (Mặc định)',
    colorCode: '#006b5d',
    bgColor: 'bg-[#006b5d]',
    desc: 'Tươi sáng, năng động và thân thiện',
  },
  {
    id: 'ocean' as const,
    label: 'Xanh Đại Dương (Ocean Blue)',
    colorCode: '#24657e',
    bgColor: 'bg-[#24657e]',
    desc: 'Điềm tĩnh, tập trung và chuyên nghiệp',
  },
  {
    id: 'sunshine' as const,
    label: 'Màu Nắng Ấm (Warm Sunshine)',
    colorCode: '#ffd97d',
    bgColor: 'bg-[#ffd97d]',
    desc: 'Ấm áp, tràn đầy năng lượng tích cực',
  },
];

export function PreferencesSettingsTab() {
  const [preferences, setPreferences] = useState<SystemPreferencesState>(DEFAULT_PREFERENCES);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setPreferences(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not read preferences from localStorage', e);
    }
  }, []);

  const updatePreference = <K extends keyof SystemPreferencesState>(
    key: K,
    value: SystemPreferencesState[K]
  ) => {
    setPreferences((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn('Could not save preferences', e);
      }
      return next;
    });
  };

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      toast.success('Đã lưu tùy chỉnh hệ thống & giao diện! 🎨');
    } catch (e) {
      toast.error('Không thể lưu cài đặt giao diện');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-surface-container-lowest p-5 sm:p-6 rounded-xl border border-outline-variant/30 shadow-xs">
        <div className="flex items-center gap-3 pb-5 border-b border-outline-variant/20 mb-5">
          <div className="p-2.5 rounded-lg bg-primary-container text-on-primary-container">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg text-on-surface">
              Tùy chỉnh giao diện & Hệ thống
            </h2>
            <p className="font-sans text-xs text-on-surface-variant">
              Điều chỉnh ngôn ngữ, màu sắc chủ đề và chế độ hiển thị phù hợp với phong cách dạy
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Language Selection */}
          <div className="space-y-2.5">
            <label className="font-heading font-bold text-xs text-on-surface flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-primary" />
              <span>Ngôn ngữ hiển thị (Display Language)</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => updatePreference('language', 'vi')}
                className={`flex items-center justify-between p-3.5 rounded-lg border transition-all cursor-pointer ${
                  preferences.language === 'vi'
                    ? 'border-primary bg-primary-container/20 shadow-2xs'
                    : 'border-outline-variant/40 bg-surface-container-low/40 hover:bg-surface-container-low'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🇻🇳</span>
                  <div className="text-left">
                    <p className="font-heading font-bold text-xs text-on-surface">Tiếng Việt</p>
                    <p className="font-sans text-[11px] text-on-surface-variant">Mặc định hệ thống</p>
                  </div>
                </div>
                {preferences.language === 'vi' && (
                  <div className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => updatePreference('language', 'en')}
                className={`flex items-center justify-between p-3.5 rounded-lg border transition-all cursor-pointer ${
                  preferences.language === 'en'
                    ? 'border-primary bg-primary-container/20 shadow-2xs'
                    : 'border-outline-variant/40 bg-surface-container-low/40 hover:bg-surface-container-low'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🇬🇧</span>
                  <div className="text-left">
                    <p className="font-heading font-bold text-xs text-on-surface">English</p>
                    <p className="font-sans text-[11px] text-on-surface-variant">Kinderly Global</p>
                  </div>
                </div>
                {preferences.language === 'en' && (
                  <div className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Theme Accent Palette */}
          <div className="space-y-2.5 pt-4 border-t border-outline-variant/20">
            <label className="font-heading font-bold text-xs text-on-surface flex items-center gap-2">
              <Palette className="w-3.5 h-3.5 text-primary" />
              <span>Tông màu giao diện giáo viên</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {THEME_OPTIONS.map((theme) => {
                const isSelected = preferences.themeTone === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => updatePreference('themeTone', theme.id)}
                    className={`flex flex-col text-left p-3.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary-container/20 shadow-2xs ring-1 ring-primary/30'
                        : 'border-outline-variant/40 bg-surface-container-low/40 hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`w-5 h-5 rounded-full ${theme.bgColor} shadow-2xs border border-white`} />
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <p className="font-heading font-bold text-xs text-on-surface">
                      {theme.label}
                    </p>
                    <p className="font-sans text-[11px] text-on-surface-variant mt-0.5 line-clamp-2">
                      {theme.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Density & Automation Toggles */}
          <div className="space-y-3 pt-4 border-t border-outline-variant/20">
            <label className="font-heading font-bold text-xs text-on-surface flex items-center gap-2">
              <LayoutGrid className="w-3.5 h-3.5 text-primary" />
              <span>Bố cục & Tính năng bổ trợ</span>
            </label>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-surface-container-low/60 border border-outline-variant/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-surface-container-highest text-primary">
                    <LayoutGrid className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-xs text-on-surface">
                      Chế độ bố cục thu gọn (Compact View)
                    </p>
                    <p className="font-sans text-[11px] text-on-surface-variant">
                      Giảm khoảng cách các dòng bảng để xem nhiều học sinh hơn trên một màn hình
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={preferences.compactMode}
                  onClick={() => updatePreference('compactMode', !preferences.compactMode)}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    preferences.compactMode ? 'bg-primary' : 'bg-surface-container-highest'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      preferences.compactMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-lg bg-surface-container-low/60 border border-outline-variant/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-surface-container-highest text-primary">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-xs text-on-surface">
                      Tự động lưu bản nháp (Auto-Save Drafts)
                    </p>
                    <p className="font-sans text-[11px] text-on-surface-variant">
                      Tự động lưu tạm nội dung bài học và thông báo khi đang soạn thảo
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={preferences.autoSaveDrafts}
                  onClick={() => updatePreference('autoSaveDrafts', !preferences.autoSaveDrafts)}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    preferences.autoSaveDrafts ? 'bg-primary' : 'bg-surface-container-highest'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      preferences.autoSaveDrafts ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 mt-5 border-t border-outline-variant/20 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="bg-primary text-white hover:bg-primary-dark font-heading font-bold text-xs px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Lưu cài đặt giao diện</span>
          </button>
        </div>
      </div>
    </div>
  );
}
