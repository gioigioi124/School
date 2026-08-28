'use client';

import { useState } from 'react';
import { ScheduleItem } from './ScheduleSlotDialog';
import {
  Clock,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Sun,
  Sunset,
} from 'lucide-react';

interface DailyScheduleTimelineProps {
  schedules: ScheduleItem[];
  classId: string;
  onEditSlot: (slot: ScheduleItem) => void;
  onDeleteSlot: (slot: ScheduleItem) => void;
  onAddSlotForDay: (dayOfWeek: number, defaultTime?: { start: string; end: string }) => void;
}

const DAYS_LIST = [
  { dayOfWeek: 2, label: 'Thứ Hai', shortLabel: 'T2' },
  { dayOfWeek: 3, label: 'Thứ Ba', shortLabel: 'T3' },
  { dayOfWeek: 4, label: 'Thứ Tư', shortLabel: 'T4' },
  { dayOfWeek: 5, label: 'Thứ Năm', shortLabel: 'T5' },
  { dayOfWeek: 6, label: 'Thứ Sáu', shortLabel: 'T6' },
  { dayOfWeek: 7, label: 'Thứ Bảy', shortLabel: 'T7' },
  { dayOfWeek: 8, label: 'Chủ Nhật', shortLabel: 'CN' },
];

const isMorningSlot = (startTime: string) => {
  if (!startTime) return true;
  const hour = parseInt(startTime.split(':')[0], 10);
  return hour < 12 || (hour === 12 && parseInt(startTime.split(':')[1] || '0', 10) < 30);
};

export function DailyScheduleTimeline({
  schedules,
  classId,
  onEditSlot,
  onDeleteSlot,
  onAddSlotForDay,
}: DailyScheduleTimelineProps) {
  const [selectedDay, setSelectedDay] = useState(2);

  const dayAllSlots = schedules
    .filter((s) => s.dayOfWeek === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const morningSlots = dayAllSlots.filter((s) => isMorningSlot(s.startTime));
  const afternoonSlots = dayAllSlots.filter((s) => !isMorningSlot(s.startTime));

  const currentDayInfo =
    DAYS_LIST.find((d) => d.dayOfWeek === selectedDay) || DAYS_LIST[0];

  return (
    <div className="space-y-4">
      {/* Day Selector Navigation Pills */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-surface-container-low border border-outline-variant/30 overflow-x-auto">
        {DAYS_LIST.map((d) => {
          const count = schedules.filter((s) => s.dayOfWeek === d.dayOfWeek).length;
          const isSelected = selectedDay === d.dayOfWeek;

          return (
            <button
              key={d.dayOfWeek}
              onClick={() => setSelectedDay(d.dayOfWeek)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-heading font-bold text-xs transition-all duration-150 cursor-pointer ${
                isSelected
                  ? 'bg-primary text-on-primary shadow-2xs'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span>{d.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-sans font-semibold ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Daily Content Header */}
      <div className="flex items-center justify-between bg-surface-container-lowest px-4 py-2.5 rounded-lg border border-outline-variant/30 shadow-2xs">
        <div>
          <h3 className="font-heading text-base font-bold text-on-surface flex items-center gap-2">
            <span>Thời khóa biểu {currentDayInfo.label}</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-primary-container text-on-primary-container font-medium">
              {dayAllSlots.length} tiết
            </span>
          </h3>
          <p className="font-sans text-xs text-on-surface-variant mt-0.5">
            Phân bổ tiết học Sáng & Chiều trong ngày của lớp.
          </p>
        </div>

        <button
          onClick={() => onAddSlotForDay(selectedDay)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-on-primary font-heading font-bold text-xs shadow-2xs hover:bg-primary/90 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm tiết học</span>
        </button>
      </div>

      {/* Morning & Afternoon Sections */}
      {dayAllSlots.length === 0 ? (
        <div className="p-10 text-center rounded-xl bg-surface-container-lowest border border-dashed border-outline-variant/40 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant mb-2.5">
            <Calendar className="w-5 h-5 opacity-60" />
          </div>
          <h4 className="font-heading font-bold text-sm text-on-surface mb-1">
            Chưa có lịch học cho {currentDayInfo.label}
          </h4>
          <p className="font-sans text-xs text-on-surface-variant max-w-sm mb-3">
            Bấm nút bên dưới để thêm tiết học mới hoặc sử dụng tính năng nạp mẫu tự động.
          </p>
          <button
            onClick={() => onAddSlotForDay(selectedDay)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary font-heading font-bold text-xs shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm tiết cho {currentDayInfo.label}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* ☀️ BUỔI SÁNG SECTION */}
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/30 p-3.5 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Sun className="w-3.5 h-3.5 text-amber-600" />
                </span>
                <h4 className="font-heading font-bold text-xs text-amber-900 uppercase tracking-wider">
                  ☀️ Buổi Sáng ({morningSlots.length} tiết)
                </h4>
              </div>
              <button
                onClick={() => onAddSlotForDay(selectedDay, { start: '08:00', end: '08:45' })}
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Thêm tiết sáng</span>
              </button>
            </div>

            {morningSlots.length === 0 ? (
              <p className="text-xs text-on-surface-variant/70 italic py-2">
                Chưa có tiết học buổi sáng cho ngày này.
              </p>
            ) : (
              <div className="space-y-2">
                {morningSlots.map((slot) => (
                  <DailyTimelineCard
                    key={slot.id}
                    slot={slot}
                    onEdit={onEditSlot}
                    onDelete={onDeleteSlot}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 🌤️ BUỔI CHIỀU SECTION */}
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/30 p-3.5 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                  <Sunset className="w-3.5 h-3.5 text-indigo-600" />
                </span>
                <h4 className="font-heading font-bold text-xs text-indigo-900 uppercase tracking-wider">
                  🌤️ Buổi Chiều ({afternoonSlots.length} tiết)
                </h4>
              </div>
              <button
                onClick={() => onAddSlotForDay(selectedDay, { start: '14:00', end: '14:45' })}
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Thêm tiết chiều</span>
              </button>
            </div>

            {afternoonSlots.length === 0 ? (
              <p className="text-xs text-on-surface-variant/70 italic py-2">
                Chưa có tiết học buổi chiều cho ngày này.
              </p>
            ) : (
              <div className="space-y-2">
                {afternoonSlots.map((slot) => (
                  <DailyTimelineCard
                    key={slot.id}
                    slot={slot}
                    onEdit={onEditSlot}
                    onDelete={onDeleteSlot}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact, uniform-height Timeline Card with 3 items:
 * 1. Thời gian
 * 2. Tiết học
 * 3. Ghi chú
 */
function DailyTimelineCard({
  slot,
  onEdit,
  onDelete,
}: {
  slot: ScheduleItem;
  onEdit: (slot: ScheduleItem) => void;
  onDelete: (slot: ScheduleItem) => void;
}) {
  const cardColor = slot.color || '#3B82F6';
  const noteText = slot.description || slot.room || 'Không có ghi chú';

  return (
    <div
      onClick={() => onEdit(slot)}
      className="group relative h-[68px] rounded-md pl-3 pr-2.5 py-1.5 border border-outline-variant/30 bg-surface hover:border-primary/50 hover:shadow-xs transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer"
      style={{
        borderLeftWidth: '3.5px',
        borderLeftColor: cardColor,
      }}
    >
      <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
        {/* 1. THỜI GIAN */}
        <div className="flex items-center gap-1 text-[11px] font-bold text-primary leading-none">
          <Clock className="w-3 h-3 shrink-0 text-primary/80" />
          <span>
            {slot.startTime} - {slot.endTime}
          </span>
        </div>

        {/* 2. TIẾT HỌC */}
        <h4 className="font-heading font-bold text-xs text-on-surface truncate leading-tight group-hover:text-primary transition-colors">
          {slot.subject}
        </h4>

        {/* 3. GHI CHÚ */}
        <p className="text-[10px] text-on-surface-variant/80 truncate italic leading-none">
          {noteText}
        </p>
      </div>

      {/* ACTIONS */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-1.5 shrink-0"
      >
        <button
          onClick={() => onEdit(slot)}
          title="Sửa tiết học"
          className="px-2.5 py-1 rounded-md bg-surface-container hover:bg-primary hover:text-white text-on-surface-variant text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
        >
          <Pencil className="w-2.5 h-2.5" />
          <span className="hidden sm:inline">Sửa</span>
        </button>
        <button
          onClick={() => onDelete(slot)}
          title="Xóa tiết học"
          className="px-2.5 py-1 rounded-md bg-surface-container hover:bg-red-600 hover:text-white text-on-surface-variant text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
        >
          <Trash2 className="w-2.5 h-2.5" />
          <span className="hidden sm:inline">Xóa</span>
        </button>
      </div>
    </div>
  );
}
