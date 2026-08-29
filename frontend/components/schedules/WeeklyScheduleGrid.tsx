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

interface WeeklyScheduleGridProps {
  schedules: ScheduleItem[];
  classId: string;
  onEditSlot?: (slot: ScheduleItem) => void;
  onDeleteSlot?: (slot: ScheduleItem) => void;
  onAddSlotForDay?: (dayOfWeek: number, defaultTime?: { start: string; end: string }) => void;
  readOnly?: boolean;
}

const DAYS_MAP = [
  { dayOfWeek: 2, label: 'Thứ Hai', shortLabel: 'T2', tagColor: 'bg-blue-100 text-blue-800' },
  { dayOfWeek: 3, label: 'Thứ Ba', shortLabel: 'T3', tagColor: 'bg-emerald-100 text-emerald-800' },
  { dayOfWeek: 4, label: 'Thứ Tư', shortLabel: 'T4', tagColor: 'bg-purple-100 text-purple-800' },
  { dayOfWeek: 5, label: 'Thứ Năm', shortLabel: 'T5', tagColor: 'bg-amber-100 text-amber-800' },
  { dayOfWeek: 6, label: 'Thứ Sáu', shortLabel: 'T6', tagColor: 'bg-rose-100 text-rose-800' },
  { dayOfWeek: 7, label: 'Thứ Bảy', shortLabel: 'T7', tagColor: 'bg-cyan-100 text-cyan-800' },
  { dayOfWeek: 8, label: 'Chủ Nhật', shortLabel: 'CN', tagColor: 'bg-indigo-100 text-indigo-800' },
];

// Helper to determine if slot is in morning (< 12:30)
const isMorningSlot = (startTime: string) => {
  if (!startTime) return true;
  const hour = parseInt(startTime.split(':')[0], 10);
  return hour < 12 || (hour === 12 && parseInt(startTime.split(':')[1] || '0', 10) < 30);
};

export function WeeklyScheduleGrid({
  schedules,
  classId,
  onEditSlot,
  onDeleteSlot,
  onAddSlotForDay,
  readOnly = false,
}: WeeklyScheduleGridProps) {
  const [showWeekend, setShowWeekend] = useState(false);
  const [selectedMobileDay, setSelectedMobileDay] = useState<number>(() => {
    const today = new Date().getDay();
    const vnDay = today === 0 ? 8 : today + 1;
    return vnDay <= 6 ? vnDay : 2;
  });

  const displayDays = showWeekend
    ? DAYS_MAP
    : DAYS_MAP.filter((d) => d.dayOfWeek <= 6);

  // Group schedules by dayOfWeek and split into morning/afternoon
  const schedulesByDay = displayDays.reduce((acc, d) => {
    const dayAll = schedules
      .filter((s) => s.dayOfWeek === d.dayOfWeek)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    acc[d.dayOfWeek] = {
      morning: dayAll.filter((s) => isMorningSlot(s.startTime)),
      afternoon: dayAll.filter((s) => !isMorningSlot(s.startTime)),
    };
    return acc;
  }, {} as Record<number, { morning: ScheduleItem[]; afternoon: ScheduleItem[] }>);

  const totalSlots = schedules.length;

  const renderDayColumn = (day: typeof DAYS_MAP[0]) => {
    const { morning, afternoon } = schedulesByDay[day.dayOfWeek] || { morning: [], afternoon: [] };
    const dayTotalCount = morning.length + afternoon.length;

    return (
      <div
        key={day.dayOfWeek}
        className="flex flex-col bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-2xs overflow-hidden transition-all duration-150"
      >
        {/* Column Header */}
        <div className="px-3 py-2.5 bg-surface-container-low/90 border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-heading font-bold ${day.tagColor}`}
            >
              {day.shortLabel}
            </span>
            <span className="font-heading font-bold text-xs sm:text-sm text-on-surface">
              {day.label}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface text-on-surface-variant font-bold border border-outline-variant/30">
              {dayTotalCount} tiết
            </span>
            {!readOnly && onAddSlotForDay && (
              <button
                type="button"
                onClick={() => onAddSlotForDay(day.dayOfWeek)}
                title={`Thêm tiết cho ${day.label}`}
                className="w-6 h-6 rounded-lg bg-surface hover:bg-primary hover:text-white text-on-surface-variant flex items-center justify-center transition-all cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Column Content: Morning and Afternoon */}
        <div className="p-2.5 flex-1 flex flex-col gap-2.5 bg-surface/20 min-h-[300px] lg:min-h-[340px]">
          {/* ☀️ BUỔI SÁNG */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-300/40 text-[10px] font-bold text-amber-900">
              <span className="inline-flex items-center gap-1">
                <Sun className="w-3 h-3 text-amber-600" />
                <span>SÁNG (Tiết 1 - 4)</span>
              </span>
              {!readOnly && onAddSlotForDay && (
                <button
                  type="button"
                  onClick={() => onAddSlotForDay(day.dayOfWeek, { start: '08:00', end: '08:45' })}
                  title="Thêm tiết sáng"
                  className="hover:text-primary cursor-pointer p-0.5"
                >
                  <Plus className="w-3 h-3" />
                </button>
              )}
            </div>

            {morning.length === 0 ? (
              readOnly ? (
                <div className="h-[68px] rounded-lg border border-dashed border-outline-variant/30 bg-surface/10 flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] text-on-surface-variant/50 font-medium">
                    Không có tiết sáng
                  </span>
                </div>
              ) : (
                <div
                  onClick={() => onAddSlotForDay?.(day.dayOfWeek, { start: '08:00', end: '08:45' })}
                  className="h-[68px] rounded-lg border border-dashed border-outline-variant/40 bg-surface/30 hover:border-amber-400 hover:bg-amber-50/30 transition-all flex flex-col items-center justify-center text-center cursor-pointer group"
                >
                  <span className="text-[11px] text-on-surface-variant/60 group-hover:text-amber-700 font-medium">
                    + Thêm tiết sáng
                  </span>
                </div>
              )
            ) : (
              morning.map((slot) => (
                <SlotCard
                  key={slot.id}
                  slot={slot}
                  onEdit={onEditSlot}
                  onDelete={onDeleteSlot}
                  readOnly={readOnly}
                />
              ))
            )}
          </div>

          {/* 🌤️ BUỔI CHIỀU */}
          <div className="flex flex-col gap-1.5 mt-1">
            <div className="flex items-center justify-between px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-300/40 text-[10px] font-bold text-indigo-900">
              <span className="inline-flex items-center gap-1">
                <Sunset className="w-3 h-3 text-indigo-600" />
                <span>CHIỀU (Tiết 1 - 3)</span>
              </span>
              {!readOnly && onAddSlotForDay && (
                <button
                  type="button"
                  onClick={() => onAddSlotForDay(day.dayOfWeek, { start: '14:00', end: '14:45' })}
                  title="Thêm tiết chiều"
                  className="hover:text-primary cursor-pointer p-0.5"
                >
                  <Plus className="w-3 h-3" />
                </button>
              )}
            </div>

            {afternoon.length === 0 ? (
              readOnly ? (
                <div className="h-[68px] rounded-lg border border-dashed border-outline-variant/30 bg-surface/10 flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] text-on-surface-variant/50 font-medium">
                    Không có tiết chiều
                  </span>
                </div>
              ) : (
                <div
                  onClick={() => onAddSlotForDay?.(day.dayOfWeek, { start: '14:00', end: '14:45' })}
                  className="h-[68px] rounded-lg border border-dashed border-outline-variant/40 bg-surface/30 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all flex flex-col items-center justify-center text-center cursor-pointer group"
                >
                  <span className="text-[11px] text-on-surface-variant/60 group-hover:text-indigo-700 font-medium">
                    + Thêm tiết chiều
                  </span>
                </div>
              )
            ) : (
              afternoon.map((slot) => (
                <SlotCard
                  key={slot.id}
                  slot={slot}
                  onEdit={onEditSlot}
                  onDelete={onDeleteSlot}
                  readOnly={readOnly}
                />
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Header controls inside Grid */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-surface-container-low/80 p-3 sm:px-4 sm:py-2 rounded-xl border border-outline-variant/30 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-on-surface-variant font-medium">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>Tổng: </span>
            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold">
              {totalSlots} tiết
            </span>
          </div>

          <span className="text-outline-variant hidden sm:inline">•</span>

          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1 text-amber-900 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-300/40">
              <Sun className="w-3 h-3 text-amber-600" /> Sáng (1-4)
            </span>
            <span className="inline-flex items-center gap-1 text-indigo-900 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-300/40">
              <Sunset className="w-3 h-3 text-indigo-600" /> Chiều (1-3)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs font-sans font-medium text-on-surface-variant cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showWeekend}
              onChange={(e) => setShowWeekend(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-primary focus:ring-primary cursor-pointer accent-primary"
            />
            <span>Thứ Bảy & CN</span>
          </label>
        </div>
      </div>

      {/* Mobile Day-Tabs Bar (Visible on < lg screens) */}
      <div className="lg:hidden">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar bg-surface-container-lowest p-2 rounded-xl border border-outline-variant/30">
          {displayDays.map((day) => {
            const isSelected = day.dayOfWeek === selectedMobileDay;
            const { morning, afternoon } = schedulesByDay[day.dayOfWeek] || { morning: [], afternoon: [] };
            const count = morning.length + afternoon.length;

            return (
              <button
                key={day.dayOfWeek}
                type="button"
                onClick={() => setSelectedMobileDay(day.dayOfWeek)}
                className={`flex-1 min-w-[58px] py-2 px-1 rounded-lg text-xs font-heading font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-on-primary shadow-xs scale-102'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                <span>{day.shortLabel}</span>
                <span className={`text-[10px] font-sans font-semibold mt-0.5 ${isSelected ? 'text-white/80' : 'text-on-surface-variant/70'}`}>
                  {count} tiết
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Day View on Mobile */}
        <div className="mt-3">
          {(() => {
            const activeDay = displayDays.find((d) => d.dayOfWeek === selectedMobileDay) || displayDays[0];
            return renderDayColumn(activeDay);
          })()}
        </div>
      </div>

      {/* Desktop Multi-Column Grid (Visible on >= lg screens) */}
      <div
        className={`hidden lg:grid gap-3 ${
          showWeekend ? 'grid-cols-7' : 'grid-cols-5'
        }`}
      >
        {displayDays.map((day) => renderDayColumn(day))}
      </div>
    </div>
  );
}

/**
 * Compact, uniform-height slot card with strictly 3 pieces of information:
 * 1. Thời gian (Time)
 * 2. Tiết học / Môn học (Subject)
 * 3. Ghi chú (Note / Room)
 */
function SlotCard({
  slot,
  onEdit,
  onDelete,
  readOnly = false,
}: {
  slot: ScheduleItem;
  onEdit?: (slot: ScheduleItem) => void;
  onDelete?: (slot: ScheduleItem) => void;
  readOnly?: boolean;
}) {
  const cardColor = slot.color || '#3B82F6';
  const noteText = slot.description || slot.room || 'Không có ghi chú';

  return (
    <div
      onClick={() => {
        if (!readOnly && onEdit) {
          onEdit(slot);
        }
      }}
      className={`group relative h-[68px] rounded-md pl-2.5 pr-2 py-1.5 text-left transition-all duration-150 border border-outline-variant/30 bg-surface hover:border-primary/50 hover:shadow-xs flex flex-col justify-between overflow-hidden ${
        readOnly ? 'cursor-default' : 'cursor-pointer'
      }`}
      style={{
        borderLeftWidth: '3.5px',
        borderLeftColor: cardColor,
      }}
    >
      {/* 1. THỜI GIAN & QUICK ACTIONS */}
      <div className="flex items-center justify-between gap-1 leading-none">
        <div className="flex items-center gap-1 text-[10px] font-bold text-primary">
          <Clock className="w-2.5 h-2.5 shrink-0" />
          <span>
            {slot.startTime} - {slot.endTime}
          </span>
        </div>

        {/* Action Buttons (Teacher only) */}
        {!readOnly && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
          >
            {onEdit && (
              <button
                onClick={() => onEdit(slot)}
                title="Sửa tiết học"
                className="w-4 h-4 rounded bg-surface-container hover:bg-primary hover:text-white text-on-surface-variant flex items-center justify-center transition-colors cursor-pointer"
              >
                <Pencil className="w-2 h-2" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(slot)}
                title="Xóa tiết học"
                className="w-4 h-4 rounded bg-surface-container hover:bg-red-600 hover:text-white text-on-surface-variant flex items-center justify-center transition-colors cursor-pointer"
              >
                <Trash2 className="w-2 h-2" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. TIẾT HỌC / MÔN HỌC */}
      <h4 className="font-heading font-bold text-xs text-on-surface truncate leading-tight group-hover:text-primary transition-colors">
        {slot.subject}
      </h4>

      {/* 3. GHI CHÚ */}
      <p className="text-[10px] text-on-surface-variant/80 truncate italic leading-none">
        {noteText}
      </p>
    </div>
  );
}
