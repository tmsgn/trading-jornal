"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Download,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  FileText,
  Plus,
  Settings,
  Camera,
  Info,
  BookOpen,
  Smile,
  Moon,
  Activity,
  CheckCircle,
  PlusCircle,
  Trash2,
  Upload,
  Brain,
} from "lucide-react";
import { Trade } from "@/lib/data";
import { useTrades } from "@/components/providers/TradeProvider";
import { toast } from "sonner";
import { TradeDetailDrawer } from "@/components/dashboard/TradeDetailDrawer";
import { Button } from "@/components/ui/button";

// ─── Types ───────────────────────────────────────────────────────────────────
interface DailyLog {
  mood: string;
  sleep: number; // 1-5
  stress: number; // 1-5
  notes: string;
  checklist: Record<string, boolean>;
  screenshots: string[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatPnl(val: number): string {
  const abs = Math.abs(val);
  const sign = val < 0 ? "-" : "";
  if (abs >= 1000)
    return `${sign}$${(abs / 1000).toFixed(abs % 1000 === 0 ? 0 : 2)}K`;
  return `${sign}$${abs.toFixed(2)}`;
}

function getCellStyle(pnl: number) {
  if (pnl > 50) return { bg: "#d4edda", text: "#1a7a5e" };
  if (pnl < -50) return { bg: "#fde0e0", text: "#c0392b" };
  return { bg: "#e8e5f5", text: "#5b4fcf" };
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
  const [year, setYear] = useState(2023);
  const [month, setMonth] = useState(11); // December (index 11)
  const [selectedDay, setSelectedDay] = useState<number | null>(21);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"calendar" | "log">("calendar");

  // Trades State from context
  const { trades, updateTrade } = useTrades();

  const [dailyLogs, setDailyLogs] = useState<Record<string, DailyLog>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tz_daily_logs");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse daily logs:", e);
        }
      }
    }
    return {
      "2023-12-21": {
        mood: "🧠 Calm",
        sleep: 4,
        stress: 2,
        notes:
          "A stellar trading day. Resisted chasing the open and waited for clean setups. TSLA breakout worked perfectly. AAPL short off the resistance was a high-probability trade. Managed risk well on QQQ fade by cutting it immediately when the trend invalidated.",
        checklist: {
          "Pre-market plan prepared": true,
          "Position sizing followed": true,
          "Set hard stop loss": true,
          "No revenge trading": true,
        },
        screenshots: [
          "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
        ],
      },
      "2023-12-20": {
        mood: "😐 Neutral",
        sleep: 3,
        stress: 3,
        notes:
          "Decent day. NVDA trade was played well on the VWAP pullback. MRD trade was a bit rushed, got chopped up and exited for a small loss. Discipline was average, need to focus more on trade criteria.",
        checklist: {
          "Pre-market plan prepared": true,
          "Position sizing followed": false,
          "Set hard stop loss": true,
          "No revenge trading": true,
        },
        screenshots: [],
      },
      "2023-12-18": {
        mood: "🚀 Excited",
        sleep: 5,
        stress: 1,
        notes:
          "Slept great last night, energy was high. META breakout was a beauty. Let it run to my 3.5R target. No hesitation on entry. Beautiful day.",
        checklist: {
          "Pre-market plan prepared": true,
          "Position sizing followed": true,
          "Set hard stop loss": true,
          "No revenge trading": true,
        },
        screenshots: [
          "https://images.unsplash.com/photo-1642390091310-2de31d1f0485?auto=format&fit=crop&w=800&q=80",
        ],
      },
    };
  });

  // Listen for daily logs updates from other components/pages
  React.useEffect(() => {
    const handleLogsUpdate = () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("tz_daily_logs");
        if (saved) {
          try {
            setDailyLogs(JSON.parse(saved));
          } catch (e) {
            console.error("Failed to sync daily logs:", e);
          }
        }
      }
    };
    window.addEventListener("tz_daily_logs_update", handleLogsUpdate);
    return () => {
      window.removeEventListener("tz_daily_logs_update", handleLogsUpdate);
    };
  }, []);

  // Drawer popup state
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Active Selected Date string YYYY-MM-DD
  const selectedDateStr = useMemo(() => {
    if (!selectedDay) return null;
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
  }, [year, month, selectedDay]);

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

  // Group trades by day for active month cell render
  const calendarDayMap = useMemo(() => {
    const map: Record<
      number,
      { pnl: number; tradesCount: number; winRate: number; hasNote: boolean }
    > = {};
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
      if (
        trade.hasNote ||
        (trade.screenshots && trade.screenshots.length > 0)
      ) {
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

  // Calendar cells weeks list
  const weeks = useMemo(() => buildCalendar(year, month), [year, month]);

  // Monthly stats calculations
  const monthPnl = useMemo(() => {
    return Object.values(calendarDayMap).reduce((s, d) => s + d.pnl, 0);
  }, [calendarDayMap]);

  const monthDays = useMemo(() => {
    return Object.keys(calendarDayMap).length;
  }, [calendarDayMap]);

  const allPnls = useMemo(() => {
    const pnls = Object.values(calendarDayMap).map((d) => d.pnl);
    return pnls.length > 0 ? pnls : [0];
  }, [calendarDayMap]);

  const winDays = useMemo(() => {
    return allPnls.filter((p) => p > 0).length;
  }, [allPnls]);

  const winRate = useMemo(() => {
    return monthDays > 0 ? (winDays / monthDays) * 100 : 0;
  }, [winDays, monthDays]);

  const bestDay = useMemo(() => Math.max(...allPnls, 0), [allPnls]);
  const worstDay = useMemo(() => Math.min(...allPnls, 0), [allPnls]);

  // Weekly sidebar stats
  const weekStats = useMemo(() => {
    return weeks.map((week) => {
      let pnl = 0,
        days = 0;
      for (const d of week)
        if (d && calendarDayMap[d]) {
          pnl += calendarDayMap[d].pnl;
          days++;
        }
      return { pnl, days };
    });
  }, [weeks, calendarDayMap]);

  // Filtered trades by search query
  const filteredTrades = useMemo(() => {
    return trades.filter(
      (t) =>
        t.symbol.toLowerCase().includes(search.toLowerCase()) ||
        (t.playbook?.toLowerCase().includes(search.toLowerCase()) ?? false),
    );
  }, [trades, search]);

  // Selected date trades
  const dayTrades = useMemo(() => {
    if (!selectedDateStr) return filteredTrades;
    return filteredTrades.filter((t) => t.date === selectedDateStr);
  }, [filteredTrades, selectedDateStr]);

  // Navigation handlers
  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
    setSelectedDay(null);
  };

  // Save Trade details from Drawer
  const handleSaveTrade = async (updatedTrade: Trade) => {
    await updateTrade(updatedTrade.id, updatedTrade);
  };

  // Get active selected day check-in log
  const activeDailyLog = useMemo(() => {
    if (!selectedDateStr) return null;
    return (
      dailyLogs[selectedDateStr] ?? {
        mood: "",
        sleep: 3,
        stress: 3,
        notes: "",
        checklist: {
          "Pre-market plan prepared": false,
          "Position sizing followed": false,
          "Set hard stop loss": false,
          "No revenge trading": false,
        },
        screenshots: [],
      }
    );
  }, [dailyLogs, selectedDateStr]);

  // Update Daily Log fields
  const updateDailyLog = (field: keyof DailyLog, value: any) => {
    if (!selectedDateStr) return;
    setDailyLogs((prev) => {
      const nextLogs = {
        ...prev,
        [selectedDateStr]: {
          ...(prev[selectedDateStr] ?? {
            mood: "",
            sleep: 3,
            stress: 3,
            notes: "",
            checklist: {
              "Pre-market plan prepared": false,
              "Position sizing followed": false,
              "Set hard stop loss": false,
              "No revenge trading": false,
            },
            screenshots: [],
          }),
          [field]: value,
        },
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("tz_daily_logs", JSON.stringify(nextLogs));
        window.dispatchEvent(new Event("tz_daily_logs_update"));
      }
      return nextLogs;
    });
  };

  // Handler for checklist checkbox toggle
  const handleChecklistToggle = (item: string) => {
    if (!activeDailyLog) return;
    const nextChecklist = {
      ...activeDailyLog.checklist,
      [item]: !activeDailyLog.checklist[item],
    };
    updateDailyLog("checklist", nextChecklist);
  };

  // Handler for daily screenshots mock upload
  const handleDailyScreenshotUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files[0] && activeDailyLog) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          updateDailyLog("screenshots", [
            ...activeDailyLog.screenshots,
            reader.result,
          ]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler for deleting a daily screenshot
  const handleDeleteDailyScreenshot = (index: number) => {
    if (!activeDailyLog) return;
    updateDailyLog(
      "screenshots",
      activeDailyLog.screenshots.filter((_, i) => i !== index),
    );
  };

  return (
    <div className="tz-page">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Journal</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Track and review your trading history, screenshots, and psychology
            logs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg overflow-hidden border border-gray-200 bg-white">
            <button
              onClick={() => setView("calendar")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === "calendar" ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-gray-500 hover:bg-gray-50"}`}
            >
              Calendar
            </button>
            <button
              onClick={() => setView("log")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors border-l border-gray-200 ${view === "log" ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-gray-500 hover:bg-gray-50"}`}
            >
              Trade Log
            </button>
          </div>
          <button
            onClick={() => {
              const headers = ["Date","Time","Symbol","Side","Qty","Entry","Exit","Gross P&L","Commissions","Net P&L","R:R","Duration","Playbook","Tags","Status"];
              const rows = activeMonthTrades.map((t) => [
                t.date,
                t.time,
                t.symbol,
                t.side,
                t.qty,
                t.entry.toFixed(2),
                t.exit !== null ? t.exit.toFixed(2) : "",
                t.grossPnl.toFixed(2),
                t.commissions.toFixed(2),
                t.netPnl.toFixed(2),
                t.rr.toFixed(1) + "R",
                t.duration + "m",
                t.playbook || "",
                t.tags.join(";"),
                t.status,
              ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
              const csv = [headers.join(","), ...rows].join("\n");
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = `journal_trades_${MONTH_NAMES[month]}_${year}.csv`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              toast.success(`Exported ${activeMonthTrades.length} trades to CSV`);
            }}
            className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Download size={13} /> Export
          </button>
          <button
            onClick={() => window.dispatchEvent(new Event("tz_open_add_trade"))}
            className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition-all"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
            }}
          >
            <Plus size={13} /> Add Trade
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-5 gap-3 shrink-0">
        {[
          {
            label: "Total P&L",
            value: formatPnl(monthPnl),
            pos: monthPnl >= 0,
          },
          { label: "Trading Days", value: String(monthDays), pos: null },
          {
            label: "Win Rate",
            value: `${winRate.toFixed(1)}%`,
            pos: winRate >= 50,
          },
          {
            label: "Best Day",
            value: formatPnl(bestDay),
            pos: true,
          },
          {
            label: "Worst Day",
            value: formatPnl(worstDay),
            pos: false,
          },
        ].map((s) => (
          <div key={s.label} className="tz-card p-4 bg-white">
            <p className="text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wider">
              {s.label}
            </p>
            <p
              className="text-lg font-bold"
              style={{
                color:
                  s.pos === null ? "#1e2030" : s.pos ? "#26a69a" : "#ef5350",
              }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {view === "calendar" ? (
        <>
          {/* Calendar Card */}
          <div className="tz-card overflow-hidden bg-white shrink-0">
            {/* Calendar Controls */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b border-gray-100"
            >
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevMonth}
                  className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft size={15} className="text-gray-500" />
                </button>
                <span className="text-sm font-bold text-gray-800 min-w-[120px] text-center">
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
                    setSelectedDay(21);
                  }}
                  className="ml-2 px-3 py-1 rounded-full text-[10px] font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Current month
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-medium">
                  Monthly Net P&L:
                </span>
                <span
                  className="text-sm font-bold"
                  style={{ color: monthPnl >= 0 ? "#26a69a" : "#ef5350" }}
                >
                  {formatPnl(monthPnl)}
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  ({monthDays} days)
                </span>
                <div className="flex items-center gap-0.5 ml-2 border-l border-gray-100 pl-2">
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
            <div className="flex">
              {/* Calendar Grid */}
              <div className="flex-1 min-w-0">
                {/* Day Headers */}
                <div
                  className="grid grid-cols-7 border-b border-gray-100"
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

                {/* Day Cells */}
                {weeks.map((week, wi) => (
                  <div
                    key={wi}
                    className={`grid grid-cols-7 ${wi < weeks.length - 1 ? "border-b border-gray-100" : ""}`}
                  >
                    {week.map((day, di) => {
                      const d = day ? calendarDayMap[day] : undefined;
                      const cs = d ? getCellStyle(d.pnl) : null;
                      const isSel = day !== null && day === selectedDay;

                      // Check if daily note exists in state
                      const cellDateStr = day
                        ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                        : "";
                      const cellLog = dailyLogs[cellDateStr];
                      const dayHasLog =
                        cellLog &&
                        (cellLog.notes.trim().length > 0 ||
                          cellLog.screenshots.length > 0 ||
                          cellLog.mood.length > 0);

                      const showNoteIcon = d?.hasNote || dayHasLog;

                      return (
                        <div
                          key={di}
                          onClick={() => day && setSelectedDay(day)}
                          className={`relative p-1.5 cursor-pointer transition-all hover:bg-gray-50/50 ${di < 6 ? "border-r border-gray-100" : ""}`}
                          style={{
                            minHeight: "86px",
                            background: isSel
                              ? cs
                                ? cs.bg + "cc"
                                : "#eef0ff"
                              : cs
                                ? cs.bg
                                : "transparent",
                            outline: isSel ? "2px solid #6366f1" : undefined,
                            outlineOffset: "-2px",
                          }}
                        >
                          {day && (
                            <>
                              {showNoteIcon && (
                                <div className="absolute top-1.5 left-2">
                                  <BookOpen
                                    size={11}
                                    className="text-gray-400"
                                  />
                                </div>
                              )}
                              <span
                                className="absolute top-1.5 right-2 text-[10px] font-bold font-mono"
                                style={{ color: cs ? cs.text : "#9ca3af" }}
                              >
                                {day}
                              </span>
                              {d && (
                                <div
                                  className="flex flex-col items-center justify-center h-full pt-3"
                                  style={{ color: cs!.text }}
                                >
                                  <span className="text-sm font-black tracking-tight leading-none">
                                    {formatPnl(d.pnl)}
                                  </span>
                                  <span className="text-[9px] font-bold mt-1 opacity-85 uppercase">
                                    {d.tradesCount}{" "}
                                    {d.tradesCount === 1 ? "trade" : "trades"}
                                  </span>
                                  <span className="text-[9px] font-medium opacity-80 font-mono">
                                    {d.winRate.toFixed(0)}% win
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

              {/* Weekly Sidebar */}
              <div
                className="flex-shrink-0 flex flex-col bg-gray-50 border-l border-gray-100 w-[95px]"
              >
                <div
                  className="py-2 h-[33px] border-b border-gray-100"
                />
                {weekStats.map((ws, i) => {
                  const color =
                    ws.pnl > 0 ? "#26a69a" : ws.pnl < 0 ? "#ef5350" : "#9ca3af";
                  return (
                    <div
                      key={i}
                    className={`flex flex-col justify-center px-3 min-h-[86px] ${i < weekStats.length - 1 ? "border-b border-gray-100" : ""}`}
                    >
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                        Week {i + 1}
                      </span>
                      <span
                        className="text-sm font-black tracking-tight leading-none"
                        style={{ color }}
                      >
                        {formatPnl(ws.pnl)}
                      </span>
                      <span className="text-[9px] font-medium text-gray-400 mt-1 font-mono">
                        {ws.days} {ws.days === 1 ? "day" : "days"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Side-by-Side Detail Panel (Trades + Daily Psychology Check-in) */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Daily Trades Column (60% Width) */}
            <div className="lg:col-span-3 space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity size={13} className="text-indigo-500" />
                  {selectedDay
                    ? `Trades on ${MONTH_NAMES[month]} ${selectedDay}, ${year}`
                    : "Trades List"}
                </h2>
                <div className="relative">
                  <Search
                    size={12}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search symbol..."
                    className="pl-8 pr-3 h-7 rounded-lg border border-gray-200 bg-white text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-300 w-36"
                  />
                </div>
              </div>

              {/* Trade Log Table */}
              <div className="tz-card overflow-hidden bg-white">
                <table className="w-full text-[11px] text-gray-600">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {[
                        "Time",
                        "Symbol",
                        "Side",
                        "Qty",
                        "Entry",
                        "Exit",
                        "Net P&L",
                        "R:R",
                        "Strategy",
                        "",
                      ].map((h, i) => (
                        <th
                          key={i}
                          className="px-3 py-2 text-left font-bold text-gray-400 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dayTrades.length === 0 ? (
                      <tr>
                        <td
                          colSpan={10}
                          className="px-4 py-12 text-center text-gray-400 font-medium"
                        >
                          No trades logged for this day
                        </td>
                      </tr>
                    ) : (
                      dayTrades.map((row) => {
                        const trWin = row.netPnl >= 0;
                        return (
                          <tr
                            key={row.id}
                            onClick={() => {
                              setSelectedTrade(row);
                              setIsDrawerOpen(true);
                            }}
                            className="hover:bg-indigo-50/35 cursor-pointer transition-colors border-b border-gray-100 last:border-0"
                          >
                            <td className="px-3 py-3 text-gray-400 font-mono">
                              {row.time}
                            </td>
                            <td className="px-3 py-3 font-bold text-gray-900">
                              {row.symbol}
                            </td>
                            <td className="px-3 py-3">
                              <span
                                className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                                style={{
                                  background:
                                    row.side === "Long" ? "#e6f4ea" : "#fce8e6",
                                  color:
                                    row.side === "Long" ? "#1a7a5e" : "#c0392b",
                                }}
                              >
                                {row.side}
                              </span>
                            </td>
                            <td className="px-3 py-3 font-medium text-gray-700">
                              {row.qty}
                            </td>
                            <td className="px-3 py-3 font-mono text-gray-500">
                              ${row.entry.toFixed(2)}
                            </td>
                            <td className="px-3 py-3 font-mono text-gray-500">
                              {row.exit ? `$${row.exit.toFixed(2)}` : "—"}
                            </td>
                            <td
                              className="px-3 py-3 font-black"
                              style={{ color: trWin ? "#26a69a" : "#ef5350" }}
                            >
                              {trWin ? "+" : ""}${row.netPnl.toFixed(2)}
                            </td>
                            <td
                              className="px-3 py-3 font-bold"
                              style={{
                                color: row.rr >= 0 ? "#1a7a5e" : "#c0392b",
                              }}
                            >
                              {row.rr >= 0 ? "+" : ""}
                              {row.rr.toFixed(1)}R
                            </td>
                            <td className="px-3 py-3">
                              {row.playbook ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 whitespace-nowrap">
                                  {row.playbook}
                                </span>
                              ) : (
                                <span className="text-gray-300">—</span>
                              )}
                            </td>
                            <td className="px-3 py-3">
                              {(row.hasNote ||
                                (row.screenshots &&
                                  row.screenshots.length > 0)) && (
                                <FileText
                                  size={13}
                                  className="text-indigo-400"
                                />
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Daily Psychology Check-in Column (40% Width) */}
            <div className="lg:col-span-2 space-y-2">
              <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                <Brain size={13} className="text-indigo-500" />
                Daily Notes & Psychology
              </h2>

              {selectedDay ? (
                <div className="tz-card bg-white p-4 space-y-4">
                  {/* Mood Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                      <Smile size={12} className="text-indigo-400" /> Daily Mood
                      / State
                    </label>
                    <div className="flex justify-between gap-1 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                      {[
                        "😞 Stressed",
                        "😐 Neutral",
                        "🙂 Focused",
                        "🧠 Calm",
                        "🚀 Excited",
                      ].map((m) => {
                        const isSelected = activeDailyLog?.mood === m;
                        return (
                          <button
                            key={m}
                            onClick={() => updateDailyLog("mood", m)}
                            className={`flex-1 text-[10px] py-1.5 px-1 rounded-md font-bold transition-all text-center ${
                              isSelected
                                ? "bg-white text-indigo-600 shadow-sm border border-gray-100"
                                : "text-gray-400 hover:text-gray-600"
                            }`}
                          >
                            {m.split(" ")[0]}
                            <span className="block mt-0.5 text-[9px] font-medium opacity-80">
                              {m.split(" ")[1]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sleep & Stress Sliders */}
                  <div className="grid grid-cols-2 gap-4 bg-gray-50/60 p-3 rounded-lg border border-gray-100/50">
                    {/* Sleep */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        <span>Sleep Quality</span>
                        <span className="text-indigo-600 font-mono">
                          {activeDailyLog?.sleep ?? 3}/5
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={activeDailyLog?.sleep ?? 3}
                        onChange={(e) =>
                          updateDailyLog("sleep", parseInt(e.target.value))
                        }
                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>
                    {/* Stress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        <span>Market Stress</span>
                        <span className="text-indigo-600 font-mono">
                          {activeDailyLog?.stress ?? 3}/5
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={activeDailyLog?.stress ?? 3}
                        onChange={(e) =>
                          updateDailyLog("stress", parseInt(e.target.value))
                        }
                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>
                  </div>

                  {/* Compliance Checklist */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle size={12} className="text-indigo-400" />{" "}
                      Daily Compliance Checklist
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-gray-600">
                      {activeDailyLog &&
                        Object.entries(activeDailyLog.checklist).map(
                          ([item, checked]) => (
                            <div
                              key={item}
                              onClick={() => handleChecklistToggle(item)}
                              className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                                checked
                                  ? "bg-emerald-50/50 border-emerald-200 text-emerald-800"
                                  : "bg-white border-gray-200 hover:bg-gray-50 text-gray-500"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                readOnly
                                className="rounded border-gray-300 text-indigo-600 focus:ring-0 pointer-events-none"
                              />
                              <span className="truncate">{item}</span>
                            </div>
                          ),
                        )}
                    </div>
                  </div>

                  {/* Daily Notes */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                      <FileText size={12} className="text-indigo-400" /> Daily
                      Journal Notes
                    </label>
                    <textarea
                      value={activeDailyLog?.notes ?? ""}
                      onChange={(e) => updateDailyLog("notes", e.target.value)}
                      placeholder="Summarize market conditions, psychological triggers, rules follow, and takeaways..."
                      rows={4}
                      className="w-full text-xs p-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none leading-relaxed"
                    />
                  </div>

                  {/* Daily Screenshots */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                      <Camera size={12} className="text-indigo-400" /> Daily
                      Chart Preparations
                    </label>
                    <div className="relative border border-dashed border-gray-200 hover:border-indigo-400 rounded-lg p-3 text-center cursor-pointer transition-colors bg-gray-50/50">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleDailyScreenshotUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <span className="text-[10px] font-bold text-gray-600 flex items-center justify-center gap-1.5">
                        <PlusCircle size={14} className="text-indigo-500" />{" "}
                        Upload daily prep chart
                      </span>
                    </div>

                    {/* Screenshot Previews */}
                    {activeDailyLog &&
                      activeDailyLog.screenshots.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto py-1">
                          {activeDailyLog.screenshots.map((url, i) => (
                            <div
                              key={i}
                              className="relative w-16 h-12 rounded border overflow-hidden shrink-0 group"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={url}
                                alt={`Prep ${i + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={() => handleDeleteDailyScreenshot(i)}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                              >
                                <Trash2
                                  size={11}
                                  className="hover:text-red-400"
                                />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              ) : (
                <div className="tz-card bg-white p-6 text-center text-gray-400 text-xs py-20 font-medium">
                  Select a day from the calendar to check in
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Trade Log view (Full-width list of filtered trades) */
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="relative">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search symbol, playbook..."
                className="pl-8 pr-3 h-8 rounded-lg border border-gray-200 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-300 w-56"
              />
            </div>
            <button className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors">
              <SlidersHorizontal size={13} /> Filters <ChevronDown size={12} />
            </button>
          </div>

          <div className="tz-card overflow-hidden bg-white">
            <table className="w-full text-xs text-gray-600">
              <thead>
                <tr
                  style={{
                    background: "#f8fafc",
                    borderBottom: "1px solid #f0f4f8",
                  }}
                >
                  {[
                    "Date",
                    "Time",
                    "Symbol",
                    "Side",
                    "Qty",
                    "Entry",
                    "Exit",
                    "Net P&L",
                    "R:R",
                    "Playbook",
                    "",
                  ].map((h, i) => (
                    <th
                      key={i}
                      className="px-4 py-2.5 text-left font-bold text-gray-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTrades.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-4 py-16 text-center text-gray-400 font-medium"
                    >
                      No trades found matching search criteria
                    </td>
                  </tr>
                ) : (
                  filteredTrades.map((row) => {
                    const trWin = row.netPnl >= 0;
                    return (
                      <tr
                        key={row.id}
                        onClick={() => {
                          setSelectedTrade(row);
                          setIsDrawerOpen(true);
                        }}
                        className="hover:bg-indigo-50/35 cursor-pointer transition-colors border-b border-gray-100 last:border-0"
                      >
                        <td className="px-4 py-3 text-gray-500">{row.date}</td>
                        <td className="px-4 py-3 text-gray-400 font-mono">
                          {row.time}
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-900">
                          {row.symbol}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                            style={{
                              background:
                                row.side === "Long" ? "#e6f4ea" : "#fce8e6",
                              color:
                                row.side === "Long" ? "#1a7a5e" : "#c0392b",
                            }}
                          >
                            {row.side}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-700">
                          {row.qty}
                        </td>
                        <td className="px-4 py-3 font-mono text-gray-500">
                          ${row.entry.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 font-mono text-gray-500">
                          {row.exit ? `$${row.exit.toFixed(2)}` : "—"}
                        </td>
                        <td
                          className="px-4 py-3 font-black"
                          style={{ color: trWin ? "#26a69a" : "#ef5350" }}
                        >
                          {trWin ? "+" : ""}${row.netPnl.toFixed(2)}
                        </td>
                        <td
                          className="px-4 py-3 font-bold"
                          style={{ color: row.rr >= 0 ? "#1a7a5e" : "#c0392b" }}
                        >
                          {row.rr >= 0 ? "+" : ""}
                          {row.rr.toFixed(1)}R
                        </td>
                        <td className="px-4 py-3">
                          {row.playbook ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 whitespace-nowrap">
                              {row.playbook}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {(row.hasNote ||
                            (row.screenshots &&
                              row.screenshots.length > 0)) && (
                            <FileText size={13} className="text-indigo-400" />
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Trade Detail slide-over Sheet Drawer */}
      <TradeDetailDrawer
        trade={selectedTrade}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleSaveTrade}
      />
    </div>
  );
}
