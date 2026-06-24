"use client";

import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useTrades } from "@/components/providers/TradeProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { DailyJournalEditor } from "@/components/journal/DailyJournalEditor";
import type { Trade } from "@/lib/data";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatPnl(val: number): string {
  const abs = Math.abs(val);
  const sign = val < 0 ? "-" : "+";
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(1)}K`;
  return `${sign}$${abs.toFixed(2)}`;
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

// ─── Main Page Component ──────────────────────────────────────────────────────
export default function JournalPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const dateParam = params.get("date");
      if (dateParam) {
        const parts = dateParam.split("-");
        if (parts.length === 3) {
          setYear(parseInt(parts[0], 10));
          setMonth(parseInt(parts[1], 10) - 1);
          setSelectedDay(parseInt(parts[2], 10));
        }
      }
    }
  }, []);

  // Trades from context
  const { trades, isLoading: tradesLoading } = useTrades();

  // ── Computed ──────────────────────────────────────────────────────────────
  const selectedDateStr = useMemo(() => {
    if (!selectedDay) return null;
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
  }, [year, month, selectedDay]);

  const activeMonthTrades = useMemo(() => {
    return trades.filter((trade) => {
      const parts = trade.date.split("-");
      if (parts.length === 3) {
        return parseInt(parts[0]) === year && parseInt(parts[1]) - 1 === month;
      }
      return false;
    });
  }, [trades, year, month]);

  const calendarDayMap = useMemo(() => {
    const map: Record<number, { pnl: number; count: number; hasJournal: boolean }> = {};
    for (const trade of activeMonthTrades) {
      const day = parseInt(trade.date.split("-")[2]);
      if (!map[day]) map[day] = { pnl: 0, count: 0, hasJournal: false };
      map[day].pnl += trade.netPnl;
      map[day].count += 1;
      if (trade.hasNote) map[day].hasJournal = true;
    }
    return map;
  }, [activeMonthTrades, year, month]);

  const weeks = useMemo(() => buildCalendar(year, month), [year, month]);

  const dayTrades = useMemo(() => {
    if (!selectedDateStr) return [];
    return trades.filter((t) => t.date === selectedDateStr);
  }, [trades, selectedDateStr]);

  // ── Monthly stats ─────────────────────────────────────────────────────────
  const monthStats = useMemo(() => {
    const dayValues = Object.values(calendarDayMap);
    const totalPnl = dayValues.reduce((s, d) => s + d.pnl, 0);
    const tradingDays = dayValues.filter((d) => d.count > 0).length;
    const winDays = dayValues.filter((d) => d.pnl > 0).length;
    const totalTrades = dayValues.reduce((s, d) => s + d.count, 0);
    return { totalPnl, tradingDays, winDays, totalTrades };
  }, [calendarDayMap]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handlePrevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
    setSelectedDay(null);
  };

  const handleDayClick = (day: number) => {
    const data = calendarDayMap[day];
    if (!data || data.count === 0) return; // Do not open if no trades
    setSelectedDay(day);
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (tradesLoading) {
    return (
      <div className="tz-page">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-[var(--tz-text-primary)]">Journal</h1>
            <p className="text-sm text-[var(--tz-text-muted)] mt-0.5">Review trades and reflect on your performance</p>
          </div>
        </div>
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
          <Skeleton className="h-[600px] w-full rounded-xl" />
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const isToday = (day: number) => {
    const now = new Date();
    return day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="tz-page">
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--tz-text-primary)]">
            Journal
          </h1>
          <p className="text-sm text-[var(--tz-text-muted)] mt-0.5">
            Review trades and reflect on your performance
          </p>
        </div>
      </div>

      {/* ── Main Layout ─────────────────────────────────────────────── */}
      <div className="w-full flex" style={{ minHeight: "calc(100vh - 200px)" }}>
        
        {/* State 1: Calendar View (No day selected) */}
        {!selectedDay && (
          <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
            <div className="tz-card p-6 bg-[var(--tz-bg-card)]">
              {/* Month Nav */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 rounded-lg hover:bg-[var(--tz-hover-bg)] text-[var(--tz-text-muted)] transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <h2 className="text-lg font-bold text-[var(--tz-text-primary)]">
                  {MONTH_NAMES[month]} {year}
                </h2>
                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-lg hover:bg-[var(--tz-hover-bg)] text-[var(--tz-text-muted)] transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 mb-2">
                {DAY_HEADERS.map((d) => (
                  <div
                    key={d}
                    className="text-center text-xs font-bold text-[var(--tz-text-muted)] uppercase py-2"
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="flex flex-col gap-2">
                {weeks.map((week, wi) => (
                  <div key={wi} className="grid grid-cols-7 gap-2">
                    {week.map((day, di) => {
                      if (!day) return <div key={di} className="min-h-[80px]" />;

                      const data = calendarDayMap[day];
                      const hasTrades = data && data.count > 0;
                      const hasJournal = data?.hasJournal;
                      const pnl = data?.pnl ?? 0;

                      let bgColor = "transparent";
                      let textColor = "var(--tz-text-secondary)";
                      let borderColor = "var(--tz-border-subtle)";
                      
                      if (hasTrades) {
                        if (pnl > 0) {
                          bgColor = "rgba(16, 185, 129, 0.05)";
                          textColor = "#10b981";
                          borderColor = "rgba(16, 185, 129, 0.2)";
                        } else if (pnl < 0) {
                          bgColor = "rgba(239, 68, 68, 0.05)";
                          textColor = "#ef5350";
                          borderColor = "rgba(239, 68, 68, 0.2)";
                        } else {
                          bgColor = "var(--tz-hover-bg)";
                        }
                      }

                      const isSelected = selectedDay === day;
                      const isClickable = hasTrades;

                      return (
                        <button
                          key={di}
                          disabled={!isClickable}
                          onClick={() => handleDayClick(day)}
                          className={`min-h-[80px] rounded-xl flex flex-col items-center justify-center gap-1 transition-all relative border ${
                            isClickable ? "hover:border-[var(--tz-accent)] hover:shadow-sm cursor-pointer" : "opacity-70 cursor-default"
                          }`}
                          style={{
                            background: bgColor,
                            borderColor: borderColor
                          }}
                        >
                          <span
                            className={`text-sm font-semibold ${
                              isToday(day) ? "text-[var(--tz-accent)] font-bold" : ""
                            }`}
                            style={{ color: isToday(day) ? "var(--tz-accent)" : textColor }}
                          >
                            {day}
                          </span>
                          {hasTrades && (
                            <span
                              className="text-xs font-bold"
                              style={{ color: textColor }}
                            >
                              {formatPnl(pnl)}
                            </span>
                          )}
                          {/* Journal indicator dot */}
                          {hasJournal && (
                            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--tz-accent)] shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Stats Strip */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Net P&L", value: formatPnl(monthStats.totalPnl), color: monthStats.totalPnl >= 0 ? "#10b981" : "#ef5350" },
                { label: "Total Trades", value: String(monthStats.totalTrades), color: "var(--tz-accent)" },
                { label: "Win Days", value: `${monthStats.winDays}/${monthStats.tradingDays}`, color: "#10b981" },
                { label: "Trading Days", value: String(monthStats.tradingDays), color: "var(--tz-text-secondary)" },
              ].map((stat) => (
                <div key={stat.label} className="tz-card p-4 bg-[var(--tz-bg-card)] text-center flex flex-col justify-center">
                  <p className="text-[10px] font-bold text-[var(--tz-text-muted)] uppercase tracking-wider mb-1">
                    {stat.label}
                  </p>
                  <p className="text-xl font-bold" style={{ color: stat.color }}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* State 2: Day Selected View (Full Screen Editor) */}
        {selectedDay && selectedDateStr && (
          <div className="w-full flex flex-col h-full" style={{ minHeight: "calc(100vh - 200px)" }}>
            <DailyJournalEditor
              date={selectedDateStr}
              trades={dayTrades}
              onClose={() => setSelectedDay(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
