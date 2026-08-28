'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Volume2, 
  Sparkles, 
  FileText, 
  MessageSquare, 
  CalendarCheck, 
  Save, 
  Check, 
  Play
} from 'lucide-react';
import toast from 'react-hot-toast';

export interface NotificationSettingsState {
  newSubmissions: boolean;
  classAnnouncements: boolean;
  attendanceReminder: boolean;
  soundEnabled: boolean;
}

const DEFAULT_NOTIFICATIONS: NotificationSettingsState = {
  newSubmissions: true,
  classAnnouncements: true,
  attendanceReminder: true,
  soundEnabled: true,
};

const STORAGE_KEY = 'kinderly_teacher_notifications';

export function NotificationSettingsTab() {
  const [settings, setSettings] = useState<NotificationSettingsState>(DEFAULT_NOTIFICATIONS);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not load notification settings from localStorage', e);
    }
  }, []);

  const handleToggle = (key: keyof NotificationSettingsState) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn('Could not save to localStorage', e);
      }
      return next;
    });
  };

  const playHarmonicChime = () => {
    try {
      setIsPlayingAudio(true);
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) {
        toast('Trình duyệt không hỗ trợ Web Audio API', { icon: 'ℹ️' });
        setIsPlayingAudio(false);
        return;
      }

      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Harmonic 3-tone chime: C5 (523.25), E5 (659.25), G5 (783.99)
      const tones = [
        { freq: 523.25, time: 0 },
        { freq: 659.25, time: 0.12 },
        { freq: 783.99, time: 0.24 },
      ];

      tones.forEach(({ freq, time }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

        gain.gain.setValueAtTime(0.001, ctx.currentTime + time);
        gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + time + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + time);
        osc.stop(ctx.currentTime + time + 0.36);
      });

      setTimeout(() => {
        setIsPlayingAudio(false);
        ctx.close();
      }, 700);
    } catch (err) {
      console.error('Audio play error:', err);
      setIsPlayingAudio(false);
      toast.error('Không thể phát âm thanh thử nghiệm');
    }
  };

  const handleSaveAll = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      toast.success('Đã lưu tất cả tùy chọn thông báo! 🔔');
    } catch (e) {
      toast.error('Không thể lưu tùy chọn');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl border border-outline-variant/30 shadow-custom">
        <div className="flex items-center gap-3 pb-6 border-b border-outline-variant/20 mb-6">
          <div className="p-3 rounded-2xl bg-primary-container text-on-primary-container">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-xl text-on-surface">
              Tùy chọn nhận thông báo
            </h2>
            <p className="font-sans text-xs text-on-surface-variant">
              Tùy chỉnh các sự kiện bạn muốn nhận cảnh báo và âm thanh nhắc nhở
            </p>
          </div>
        </div>

        {/* Toggle Items */}
        <div className="space-y-4">
          {/* Toggle 1: New Submissions */}
          <div className="flex items-start justify-between p-4 sm:p-5 rounded-2xl bg-surface-container-low/60 border border-outline-variant/30 hover:bg-surface-container-low transition-colors">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-surface-container-highest text-primary shrink-0 mt-0.5">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-on-surface">
                  Thông báo bài nộp & hoàn thành bài học
                </h3>
                <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                  Nhận thông báo tức thì khi có học sinh gửi bài tập mới hoặc hoàn thành trò chơi
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={settings.newSubmissions}
              onClick={() => handleToggle('newSubmissions')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.newSubmissions ? 'bg-primary' : 'bg-surface-container-highest'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  settings.newSubmissions ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 2: Class Announcements */}
          <div className="flex items-start justify-between p-4 sm:p-5 rounded-2xl bg-surface-container-low/60 border border-outline-variant/30 hover:bg-surface-container-low transition-colors">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-surface-container-highest text-primary shrink-0 mt-0.5">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-on-surface">
                  Dặn dò & Thông báo lớp học
                </h3>
                <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                  Cập nhật các trao đổi tin nhắn và thông báo quan trọng gửi tới phụ huynh
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={settings.classAnnouncements}
              onClick={() => handleToggle('classAnnouncements')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.classAnnouncements ? 'bg-primary' : 'bg-surface-container-highest'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  settings.classAnnouncements ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 3: Attendance Reminder */}
          <div className="flex items-start justify-between p-4 sm:p-5 rounded-2xl bg-surface-container-low/60 border border-outline-variant/30 hover:bg-surface-container-low transition-colors">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-surface-container-highest text-primary shrink-0 mt-0.5">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-on-surface">
                  Nhắc nhở điểm danh mỗi sáng
                </h3>
                <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                  Gợi ý kiểm tra sĩ số và điểm danh lớp vào 8:00 sáng mỗi ngày học
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={settings.attendanceReminder}
              onClick={() => handleToggle('attendanceReminder')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.attendanceReminder ? 'bg-primary' : 'bg-surface-container-highest'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  settings.attendanceReminder ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 4: Sound Alerts + Test Chime */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-2xl bg-surface-container-low/60 border border-outline-variant/30 hover:bg-surface-container-low transition-colors gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-secondary text-on-secondary shrink-0 mt-0.5">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-on-surface flex items-center gap-2">
                  <span>Âm thanh thông báo vui nhộn</span>
                  <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container text-[10px] font-bold">
                    Web Audio
                  </span>
                </h3>
                <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                  Phát tiếng chuông giai điệu nhẹ nhàng khi có thông báo mới
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <button
                type="button"
                onClick={playHarmonicChime}
                disabled={isPlayingAudio}
                className="btn-3d-secondary bg-secondary text-on-secondary hover:brightness-105 font-heading font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Play className={`w-3.5 h-3.5 fill-current ${isPlayingAudio ? 'animate-spin' : ''}`} />
                <span>{isPlayingAudio ? 'Đang phát...' : 'Nghe thử âm thanh'}</span>
              </button>

              <button
                type="button"
                role="switch"
                aria-checked={settings.soundEnabled}
                onClick={() => handleToggle('soundEnabled')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.soundEnabled ? 'bg-primary' : 'bg-surface-container-highest'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-6 mt-6 border-t border-outline-variant/20 flex justify-end">
          <button
            type="button"
            onClick={handleSaveAll}
            className="btn-3d bg-primary text-white hover:bg-primary-dark font-heading font-bold text-sm px-6 py-2.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Lưu tùy chọn thông báo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
