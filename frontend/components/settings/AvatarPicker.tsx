'use client';

import React, { useState } from 'react';
import { Sparkles, Link as LinkIcon, Check, Image as ImageIcon } from 'lucide-react';

export interface AvatarPreset {
  emoji: string;
  label: string;
}

export const TEACHER_AVATAR_PRESETS: AvatarPreset[] = [
  { emoji: '👩‍🏫', label: 'Cô giáo' },
  { emoji: '👨‍🏫', label: 'Thầy giáo' },
  { emoji: '🌸', label: 'Hoa anh đào' },
  { emoji: '🦉', label: 'Cú thông thái' },
  { emoji: '🦁', label: 'Sư tử dũng cảm' },
  { emoji: '🐼', label: 'Gấu trúc thân thiện' },
  { emoji: '🎨', label: 'Họa sĩ sáng tạo' },
  { emoji: '📚', label: 'Sách tri thức' },
  { emoji: '🌟', label: 'Ngôi sao rạng rỡ' },
  { emoji: '🌻', label: 'Hoa hướng dương' },
  { emoji: '🐬', label: 'Cá heo thông minh' },
  { emoji: '🚀', label: 'Tàu vũ trụ ước mơ' },
];

interface AvatarPickerProps {
  value: string;
  onChange: (avatar: string) => void;
  disabled?: boolean;
}

export function AvatarPicker({ value, onChange, disabled = false }: AvatarPickerProps) {
  const [showCustomUrlInput, setShowCustomUrlInput] = useState(
    Boolean(value && !TEACHER_AVATAR_PRESETS.some((p) => p.emoji === value))
  );
  const [customUrl, setCustomUrl] = useState(
    value && !TEACHER_AVATAR_PRESETS.some((p) => p.emoji === value) ? value : ''
  );

  const isPresetSelected = (emoji: string) => value === emoji;

  const handleSelectPreset = (emoji: string) => {
    if (disabled) return;
    onChange(emoji);
  };

  const handleCustomUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setCustomUrl(url);
    onChange(url);
  };

  const isCustomImage = Boolean(value && (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="font-heading font-bold text-sm text-on-surface flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>Chọn ảnh đại diện / Biểu tượng</span>
        </label>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setShowCustomUrlInput(!showCustomUrlInput)}
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer transition-colors"
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>{showCustomUrlInput ? 'Ẩn nhập URL ảnh' : 'Dùng URL ảnh tùy chỉnh'}</span>
        </button>
      </div>

      {/* Preset Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {TEACHER_AVATAR_PRESETS.map((preset) => {
          const isSelected = isPresetSelected(preset.emoji);
          return (
            <button
              key={preset.label}
              type="button"
              disabled={disabled}
              onClick={() => handleSelectPreset(preset.emoji)}
              aria-label={preset.label}
              className={`group relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'border-primary bg-primary-container/30 shadow-md scale-105 ring-2 ring-primary/30'
                  : 'border-outline-variant/30 bg-surface-container-lowest hover:bg-surface-container hover:border-primary/50 hover:scale-102'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="text-3xl filter drop-shadow-xs transition-transform group-hover:scale-110">
                {preset.emoji}
              </span>
              <span className="text-[11px] font-sans font-medium text-on-surface-variant mt-1.5 truncate max-w-full text-center">
                {preset.label}
              </span>
              {isSelected && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shadow-xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom URL Input Accordion */}
      {showCustomUrlInput && (
        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-2 animate-fade-in">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-on-surface-variant" />
            <label className="text-xs font-semibold text-on-surface">
              Đường dẫn ảnh trực tiếp (URL)
            </label>
          </div>
          <input
            type="url"
            disabled={disabled}
            value={customUrl}
            onChange={handleCustomUrlChange}
            placeholder="https://example.com/my-avatar.jpg"
            className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
          />
          <p className="text-[11px] text-on-surface-variant">
            Hỗ trợ link ảnh trực tiếp định dạng .png, .jpg, .svg hoặc .webp
          </p>
        </div>
      )}
    </div>
  );
}
