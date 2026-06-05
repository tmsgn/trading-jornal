"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  Camera,
  Info,
  BookOpen,
} from "lucide-react";
import { Trade } from "@/lib/data";

interface TradeCalendarProps {
  trades: Trade[];
  selectedDate: string | null;
  onSelectDate: (dateStr: string | null) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatPnl(val: number): string {
  const abs = Math.abs(val);
  const sign = val < 0 ? "-" : "";
  if (abs >= 1000) {
    return `${sign}$${(abs / 1000).toFixed(abs % 1000 === 0 ? 0 : 2)}K`;
  }
  return `${sign}$${abs.toFixed(2)}`;
}

function getCellStyle(pnl: number): { bg: string; textColor: string } {
  if (pnl > 50) return { bg: "#d6f0ea", textColor: "#1a8a72" };
  if (pnl < -50) return { bg: "#fde8e8", textColor: "#c0392b" };
  return { bg: "#e8e6f5", textColor: "#5b4fcf" };
}

function buildCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export function TradeCalendar({ trades, selectedDate, onSelectDate }: TradeCalendarProps) {
  const [year, setYear] = useState(2023);
  const [month, setMonth] = useState(11); // Default to December (index 11)

  // Memoize calendar grid cells build
  const weeks = useMemo(() => buildCalendar(year, month), [year, month]);

  // Compute active month trades
  const activeMonthTrades = useMemo(() => {
    return trades.filter((trade) => {
      const parts = trade.date.split("-");
      if (parts.length === 3) {
        const y = parseInt(parts[0]);
        const m = parseInt(parts[1]) - 1; // 0-indexed
        return y === year && m === month;
      }
      return false;
    });
  }, [trades, year, month]);

  // Group trades by day for active month
  const calendarDayMap = useMemo(() => {
    const map: Record<number, { pnl: number; tradesCount: number; winRate: number; hasNote: boolean }> = {};
    for (const trade of activeMonthTrades) {
      const parts = trade.date.split("-");
      const day = parseInt(parts[2]);
      if (!map[day]) {
        map[day] = { pnl: 0, tradesCount: 0, winRate: 0, hasNote: false };
      }
      map[day].pnl += trade.netPnl;
      map[day].tradesCount += 1;
      if (trade.netPnl > 0) {
        map[day].winRate += 1;
      }
      if (trade.hasNote || (trade.screenshots && trade.screenshots.length > 0)) {
        map[day].hasNote = true;
      }
    }

    // Finalize win rate percentages
    for (const d of Object.keys(map)) {
      const dayNum = parseInt(d);
      const dayData = map[dayNum];
      if (dayData.tradesCount > 0) {
        dayData.winRate = (dayData.winRate / dayData.tradesCount) * 100;
      }
    }
    return map;
  }, [activeMonthTrades]);

  // Monthly stats calculations
  const monthStats = useMemo(() => {
    const pnl = Object.values(calendarDayMap).reduce((s, d) => s + d.pnl, 0);
    const days = Object.keys(calendarDayMap).length;
    return { pnl, days };
  }, [calendarDayMap]);

  // Weekly stats calculations
  const weekStats = useMemo(() => {
    return weeks.map((week) => {
      let pnl = 0,
        days = 0;
      for (const d of week) {
        if (d && calendarDayMap[d]) {
          pnl += calendarDayMap[d].pnl;
          days++;
        }
      }
      return { pnl, days };
    });
  }, [weeks, calendarDayMap]);

  // Navigation handlers
  const handlePrevMonth = () => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
    onSelectDate(null);
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
    onSelectDate(null);
  };

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (selectedDate === dateStr) {
      onSelectDate(null);
    } else {
      onSelectDate(dateStr);
    }
  };

  return (
    <div className="tz-card flex flex-col bg-white" style={{ minHeight: 0 }}>
      {/* Calendar Header Controls */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid #f0f4f8" }}
      >
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevMonth}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={15} className="text-gray-500" />
          </button>
          <span className="text-sm font-bold text-gray-800 mx-1 min-w-[110px] text-center">
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
          >
            <ChevronRight size={15} className="text-gray-500" />
          </button>
          <button
            onClick={() => {
              setYear(2023);
              setMonth(11);
              onSelectDate(null);
            }}
            className="ml-2 px-3 py-1 rounded-full text-[10px] font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Current month
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 font-medium">
            Monthly P&L:
          </span>
          <span
            className="text-sm font-bold"
            style={{ color: monthStats.pnl >= 0 ? "#26a69a" : "#ef5350" }}
          >
            {formatPnl(monthStats.pnl)}
          </span>
          <span className="text-xs text-gray-400 font-mono">({monthStats.days} days)</span>
          <div className="flex items-center gap-0.5 ml-1 border-l border-gray-100 pl-2">
            <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
              <Settings size={13} />
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
              <Camera size={13} />
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
              <Info size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid + Weekly Sidebar */}
      <div className="flex flex-1 min-h-0">
        {/* Calendar Grid */}
        <div className="flex-1 min-w-0">
          {/* Day Headers */}
          <div
            className="grid grid-cols-7"
            style={{ borderBottom: "1px solid #f0f4f8" }}
          >
            {DAY_HEADERS.map((d) => (
              <div
                key={d}
                className="text-center text-[10px] font-bold text-gray-400 py-2 uppercase tracking-wider"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Weeks Rows */}
          {weeks.map((week, wi) => (
            <div
              key={wi}
              className="grid grid-cols-7"
              style={{
                borderBottom:
                  wi < weeks.length - 1 ? "1px solid #f0f4f8" : undefined,
              }}
            >
              {week.map((day, di) => {
                const data = day ? calendarDayMap[day] : undefined;
                const style = data ? getCellStyle(data.pnl) : null;
                const dateKey = day ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` : "";
                const isSelected = selectedDate === dateKey;

                return (
                  <div
                    key={di}
                    onClick={() => day && handleDayClick(day)}
                    className="relative p-1.5 cursor-pointer transition-all hover:bg-gray-50/50"
                    style={{
                      minHeight: "82px",
                      borderRight: di < 6 ? "1px solid #f0f4f8" : undefined,
                      background: isSelected
                        ? style
                          ? style.bg + "cc"
                          : "#eef0ff"
                        : style
                          ? style.bg
                          : "transparent",
                      outline: isSelected ? "2px solid #6366f1" : undefined,
                      outlineOffset: "-2px",
                    }}
                  >
                    {day && (
                      <>
                        {/* Note indicator */}
                        {data?.hasNote && (
                          <div className="absolute top-1.5 left-2">
                            <BookOpen size={11} className="text-gray-400" />
                          </div>
                        )}

                        {/* Day number */}
                        <span
                          className="absolute top-1.5 right-2 text-[10px] font-bold font-mono"
                          style={{ color: data ? style!.textColor : "#9ca3af" }}
                        >
                          {day}
                        </span>

                        {/* Day metrics */}
                        {data && (
                          <div
                            className="flex flex-col items-center justify-center h-full pt-3"
                            style={{ color: style!.textColor }}
                          >
                            <span className="text-sm font-black tracking-tight leading-none">
                              {formatPnl(data.pnl)}
                            </span>
                            <span className="text-[9px] font-bold mt-1 opacity-85 uppercase">
                              {data.tradesCount} {data.tradesCount === 1 ? "trade" : "trades"}
                            </span>
                            <span className="text-[9px] font-medium opacity-80 font-mono">
                              {data.winRate.toFixed(0)}% win
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Weekly Stats Sidebar */}
        <div
          className="flex flex-col py-0 flex-shrink-0"
          style={{ width: "88px", borderLeft: "1px solid #f0f4f8" }}
        >
          <div style={{ height: "33px", borderBottom: "1px solid #f0f4f8" }} />

          {weeks.map((week, wi) => {
            const { pnl, days } = weekStats[wi] ?? { pnl: 0, days: 0 };
            const isPositive = pnl > 0;
            const isZero = pnl === 0;

            return (
              <div
                key={wi}
                className="flex flex-col justify-center px-3"
                style={{
                  minHeight: "82px",
                  borderBottom:
                    wi < weeks.length - 1 ? "1px solid #f0f4f8" : undefined,
                  background: "#fafbfc",
                }}
              >
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  Week {wi + 1}
                </span>
                <span
                  className="text-sm font-black tracking-tight leading-none"
                  style={{
                    color: isZero
                      ? "#9ca3af"
                      : isPositive
                        ? "#26a69a"
                        : "#ef5350",
                  }}
                >
                  {formatPnl(pnl)}
                </span>
                <span className="text-[9px] text-gray-400 mt-1 font-mono">
                  {days} {days === 1 ? "day" : "days"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
