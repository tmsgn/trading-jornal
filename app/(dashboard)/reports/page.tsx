"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  Trophy,
  Flame,
  Lightbulb,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  BookOpen,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { useTrades } from "@/components/providers/TradeProvider";
import { Skeleton } from "@/components/ui/skeleton";
import type { Trade } from "@/lib/data";

// ─── Types ────────────────────────────────────────────────────────────────────
type Period = "this-week" | "last-week" | "this-month" | "last-month" | "custom";

const PERIOD_LABELS: Record<Period, string> = {
  "this-week": "This Week",
  "last-week": "Last Week",
  "this-month": "This Month",
  "last-month": "Last Month",
  custom: "Custom",
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// ─── Date Helpers ─────────────────────────────────────────────────────────────
function getDateRange(period: Period, customStart?: string, customEnd?: string): [Date, Date] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case "this-week": {
      const dow = today.getDay();
      const start = new Date(today);
      start.setDate(today.getDate() - ((dow + 6) % 7)); // Monday
      const end = new Date(start);
      end.setDate(start.getDate() + 6); // Sunday
      return [start, end];
    }
    case "last-week": {
      const dow = today.getDay();
      const thisMonday = new Date(today);
      thisMonday.setDate(today.getDate() - ((dow + 6) % 7));
      const start = new Date(thisMonday);
      start.setDate(thisMonday.getDate() - 7);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return [start, end];
    }
    case "this-month": {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return [start, end];
    }
    case "last-month": {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      return [start, end];
    }
    case "custom": {
      const start = customStart ? new Date(customStart) : today;
      const end = customEnd ? new Date(customEnd) : today;
      return [start, end];
    }
    default:
      return [today, today];
  }
}

function formatDateRange(start: Date, end: Date): string {
  const s = `${MONTH_NAMES[start.getMonth()]} ${start.getDate()}`;
  const e = `${MONTH_NAMES[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
  return `${s} – ${e}`;
}

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fmt(v: number, prefix = "$"): string {
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : v > 0 ? "+" : "";
  if (abs >= 1000) return `${sign}${prefix}${(abs / 1000).toFixed(1)}K`;
  return `${sign}${prefix}${abs.toFixed(2)}`;
}

// ─── Animation Variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: "easeOut" as const },
  }),
};

// ─── Custom Recharts Tooltips ─────────────────────────────────────────────────
function EquityCurveTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  return (
    <div className="tz-card px-3 py-2 text-xs shadow-lg bg-[var(--tz-bg-card)] border border-[var(--tz-border-subtle)]">
      <p className="text-[var(--tz-text-muted)] mb-0.5">{label}</p>
      <p className="font-bold" style={{ color: v >= 0 ? "#10b981" : "#ef5350" }}>
        {fmt(v)}
      </p>
    </div>
  );
}

function DailyPnlTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  return (
    <div className="tz-card px-3 py-2 text-xs shadow-lg bg-[var(--tz-bg-card)] border border-[var(--tz-border-subtle)]">
      <p className="text-[var(--tz-text-muted)] mb-0.5">{label}</p>
      <p className="font-bold" style={{ color: v >= 0 ? "#10b981" : "#ef5350" }}>
        {fmt(v)}
      </p>
    </div>
  );
}

// ─── Circular Progress SVG ────────────────────────────────────────────────────
function CircularScore({ score, size = 120 }: { score: number; size?: number }) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef5350";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="var(--tz-border-subtle)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black" style={{ color }}>{score}</span>
        <span className="text-[10px] text-[var(--tz-text-muted)] font-medium">/ 100</span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const { trades, isLoading } = useTrades();
  const [period, setPeriod] = useState<Period>("this-week");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const [rangeStart, rangeEnd] = getDateRange(period, customStart, customEnd);

  // Filter trades in the period
  const filteredTrades = useMemo(() => {
    const startStr = toISODate(rangeStart);
    const endStr = toISODate(rangeEnd);
    return trades
      .filter((t) => t.status === "Closed" && t.date >= startStr && t.date <= endStr)
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  }, [trades, rangeStart, rangeEnd]);

  // ─── All computations ────────────────────────────────────────────
  const stats = useMemo(() => {
    const list = filteredTrades;
    const wins = list.filter((t) => t.netPnl > 0);
    const losses = list.filter((t) => t.netPnl < 0);
    const totalPnl = list.reduce((s, t) => s + t.netPnl, 0);
    const winRate = list.length > 0 ? (wins.length / list.length) * 100 : 0;
    const avgRR = list.length > 0 ? list.reduce((s, t) => s + t.rr, 0) / list.length : 0;
    const grossProfit = wins.reduce((s, t) => s + t.netPnl, 0);
    const grossLoss = Math.abs(losses.reduce((s, t) => s + t.netPnl, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

    // Equity curve - cumulative P&L per trade
    let cumPnl = 0;
    const equityCurve = list.map((t) => {
      cumPnl += t.netPnl;
      const d = new Date(t.date + "T00:00:00");
      return {
        label: `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`,
        cumPnl: parseFloat(cumPnl.toFixed(2)),
      };
    });

    // Daily P&L
    const dayMap: Record<string, number> = {};
    for (const t of list) {
      dayMap[t.date] = (dayMap[t.date] || 0) + t.netPnl;
    }
    const isWeekly = period === "this-week" || period === "last-week";
    const dailyPnl = Object.entries(dayMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, pnl]) => {
        const d = new Date(date + "T00:00:00");
        return {
          label: isWeekly ? DAY_NAMES[d.getDay()] : `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`,
          pnl: parseFloat(pnl.toFixed(2)),
        };
      });

    // Best / worst trades
    const sorted = [...list].sort((a, b) => b.netPnl - a.netPnl);
    const bestTrades = sorted.slice(0, 3);
    const worstTrades = sorted.slice(-3).reverse();

    // By playbook
    const playbookMap: Record<string, { pnl: number; wins: number; total: number }> = {};
    for (const t of list) {
      const name = t.playbook || "Unassigned";
      if (!playbookMap[name]) playbookMap[name] = { pnl: 0, wins: 0, total: 0 };
      playbookMap[name].pnl += t.netPnl;
      playbookMap[name].total++;
      if (t.netPnl > 0) playbookMap[name].wins++;
    }
    const byPlaybook = Object.entries(playbookMap)
      .map(([name, data]) => ({
        name,
        pnl: parseFloat(data.pnl.toFixed(2)),
        winRate: data.total > 0 ? Math.round((data.wins / data.total) * 100) : 0,
        trades: data.total,
      }))
      .sort((a, b) => b.pnl - a.pnl);

    // By symbol
    const symbolMap: Record<string, { pnl: number; count: number }> = {};
    for (const t of list) {
      if (!symbolMap[t.symbol]) symbolMap[t.symbol] = { pnl: 0, count: 0 };
      symbolMap[t.symbol].pnl += t.netPnl;
      symbolMap[t.symbol].count++;
    }
    const bySymbol = Object.entries(symbolMap)
      .map(([symbol, data]) => ({
        symbol,
        pnl: parseFloat(data.pnl.toFixed(2)),
        count: data.count,
      }))
      .sort((a, b) => b.count - a.count);

    // Discipline score
    const consistencyScore = list.length > 0 ? Math.min(100, list.length * 8) : 0;
    const rrScore = Math.min(100, Math.max(0, avgRR * 35));
    const winRateScore = Math.min(100, winRate * 1.3);
    const disciplineScore = list.length > 0
      ? Math.round(consistencyScore * 0.3 + rrScore * 0.35 + winRateScore * 0.35)
      : 0;

    // Key insights
    const insights: string[] = [];
    if (list.length > 0) {
      // Best day
      const bestDay = Object.entries(dayMap).sort(([, a], [, b]) => b - a)[0];
      if (bestDay) {
        const d = new Date(bestDay[0] + "T00:00:00");
        insights.push(
          `Your best day was ${DAY_NAMES[d.getDay()]} (${MONTH_NAMES[d.getMonth()]} ${d.getDate()}) with ${fmt(bestDay[1])} profit`
        );
      }
      insights.push(`You made ${list.length} trades this period, ${Math.round(winRate)}% were winners`);
      if (bySymbol.length > 0) {
        insights.push(`Your most traded symbol was ${bySymbol[0].symbol} (${bySymbol[0].count} trades)`);
      }
      // Long vs short
      const longPnl = list.filter((t) => t.side === "Long").reduce((s, t) => s + t.netPnl, 0);
      const shortPnl = list.filter((t) => t.side === "Short").reduce((s, t) => s + t.netPnl, 0);
      if (longPnl !== 0 || shortPnl !== 0) {
        const diff = longPnl - shortPnl;
        insights.push(
          diff >= 0
            ? `Long trades outperformed Short trades by ${fmt(Math.abs(diff))}`
            : `Short trades outperformed Long trades by ${fmt(Math.abs(diff))}`
        );
      }
      if (avgRR > 0) {
        insights.push(`Average risk-to-reward ratio was ${avgRR.toFixed(2)}`);
      }
    }

    // Streak tracker
    let currentStreak = 0;
    let currentStreakType: "win" | "loss" | null = null;
    let bestWinStreak = 0;
    let bestLossStreak = 0;
    let tempWinStreak = 0;
    let tempLossStreak = 0;

    for (const t of list) {
      if (t.netPnl > 0) {
        tempWinStreak++;
        tempLossStreak = 0;
        if (tempWinStreak > bestWinStreak) bestWinStreak = tempWinStreak;
      } else if (t.netPnl < 0) {
        tempLossStreak++;
        tempWinStreak = 0;
        if (tempLossStreak > bestLossStreak) bestLossStreak = tempLossStreak;
      }
    }

    // Current streak (from last trade)
    for (let i = list.length - 1; i >= 0; i--) {
      const t = list[i];
      const type = t.netPnl > 0 ? "win" : "loss";
      if (currentStreakType === null) {
        currentStreakType = type;
        currentStreak = 1;
      } else if (type === currentStreakType) {
        currentStreak++;
      } else {
        break;
      }
    }

    const tradingDays = Object.keys(dayMap).length;

    return {
      totalPnl, winRate, avgRR, profitFactor, totalTrades: list.length,
      wins: wins.length, losses: losses.length,
      equityCurve, dailyPnl,
      bestTrades, worstTrades,
      byPlaybook, bySymbol,
      disciplineScore,
      insights,
      currentStreak, currentStreakType,
      bestWinStreak, bestLossStreak,
      tradingDays,
    };
  }, [filteredTrades, period]);

  // Win-rate donut data
  const donutData = [
    { name: "Win", value: stats.wins },
    { name: "Loss", value: stats.losses },
  ];

  // ─── Loading State ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="tz-page space-y-4">
        <Skeleton className="h-10 w-72 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="tz-page space-y-5">
      {/* ── Page Header & Period Selector ────────────────────────────── */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        initial="hidden" animate="visible" custom={0} variants={fadeUp}
      >
        <div>
          <h1 className="text-xl font-bold text-[var(--tz-text-primary)]">Performance Reports</h1>
          <p className="text-sm text-[var(--tz-text-muted)] mt-0.5">
            {formatDateRange(rangeStart, rangeEnd)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 bg-[var(--tz-bg-card)] border border-[var(--tz-border)] rounded-full p-1 shadow-sm">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer"
              style={
                period === p
                  ? { background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "#fff" }
                  : { color: "var(--tz-text-muted)" }
              }
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Custom date pickers */}
      {period === "custom" && (
        <motion.div
          className="flex items-center gap-3"
          initial="hidden" animate="visible" custom={0.5} variants={fadeUp}
        >
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="tz-card px-3 py-1.5 text-xs bg-[var(--tz-bg-card)] text-[var(--tz-text-primary)] border border-[var(--tz-border)]"
          />
          <span className="text-xs text-[var(--tz-text-muted)]">to</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="tz-card px-3 py-1.5 text-xs bg-[var(--tz-bg-card)] text-[var(--tz-text-primary)] border border-[var(--tz-border)]"
          />
        </motion.div>
      )}

      {/* ── Empty State ─────────────────────────────────────────────── */}
      {filteredTrades.length === 0 ? (
        <motion.div
          className="tz-card bg-[var(--tz-bg-card)] flex flex-col items-center justify-center py-20 text-center"
          initial="hidden" animate="visible" custom={1} variants={fadeUp}
        >
          <CalendarDays size={40} className="text-[var(--tz-text-muted)] mb-3" />
          <p className="text-sm font-semibold text-[var(--tz-text-secondary)]">
            No trades recorded during this period
          </p>
          <p className="text-xs text-[var(--tz-text-muted)] mt-1 max-w-xs">
            Select a different date range or start logging your trades to see performance data here.
          </p>
        </motion.div>
      ) : (
        <>
          {/* ── Summary Header Cards ─────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Total P&L",
                value: fmt(stats.totalPnl),
                icon: stats.totalPnl >= 0 ? TrendingUp : TrendingDown,
                color: stats.totalPnl >= 0 ? "#10b981" : "#ef5350",
                bg: stats.totalPnl >= 0 ? "rgba(16,185,129,0.1)" : "rgba(239,83,80,0.1)",
                sub: `${stats.wins}W / ${stats.losses}L`,
              },
              {
                label: "Win Rate",
                value: `${stats.winRate.toFixed(1)}%`,
                icon: Target,
                color: stats.winRate >= 50 ? "#10b981" : "#ef5350",
                bg: stats.winRate >= 50 ? "rgba(16,185,129,0.1)" : "rgba(239,83,80,0.1)",
                sub: "Win percentage",
                showDonut: true,
              },
              {
                label: "Total Trades",
                value: String(stats.totalTrades),
                icon: BarChart3,
                color: "var(--tz-accent)",
                bg: "rgba(99,102,241,0.1)",
                sub: `${stats.tradingDays} trading days`,
              },
              {
                label: "Avg R:R",
                value: stats.avgRR.toFixed(2),
                icon: Zap,
                color: stats.avgRR >= 1.5 ? "#10b981" : "#f59e0b",
                bg: stats.avgRR >= 1.5 ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                sub: `PF: ${stats.profitFactor === Infinity ? "∞" : stats.profitFactor.toFixed(2)}`,
              },
            ].map((card, i) => (
              <motion.div
                key={card.label}
                className="tz-card p-4 bg-[var(--tz-bg-card)] flex items-start gap-3 relative overflow-hidden"
                initial="hidden" animate="visible" custom={i + 1} variants={fadeUp}
              >
                <div className="rounded-xl p-2.5 flex-shrink-0" style={{ background: card.bg }}>
                  <card.icon size={18} style={{ color: card.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-[var(--tz-text-muted)] font-medium uppercase tracking-wide">{card.label}</p>
                  <p className="text-xl font-black mt-0.5" style={{ color: card.color }}>{card.value}</p>
                  <p className="text-[11px] text-[var(--tz-text-muted)] mt-0.5">{card.sub}</p>
                </div>
                {/* Mini donut for win rate card */}
                {"showDonut" in card && card.showDonut && (
                  <div className="flex-shrink-0">
                    <PieChart width={44} height={44}>
                      <Pie
                        data={donutData}
                        cx={22} cy={22}
                        innerRadius={14} outerRadius={20}
                        paddingAngle={2}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#ef5350" />
                      </Pie>
                    </PieChart>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* ── Equity Curve ─────────────────────────────────────────── */}
          <motion.div
            className="tz-card p-5 bg-[var(--tz-bg-card)]"
            initial="hidden" animate="visible" custom={5} variants={fadeUp}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-[var(--tz-text-primary)]">Equity Curve</h2>
                <p className="text-xs text-[var(--tz-text-muted)] mt-0.5">Cumulative P&L over the period</p>
              </div>
              <span
                className="text-sm font-black"
                style={{ color: stats.totalPnl >= 0 ? "#10b981" : "#ef5350" }}
              >
                {fmt(stats.totalPnl)}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={stats.equityCurve} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="equityFillGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="equityFillRed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef5350" stopOpacity={0.02} />
                    <stop offset="100%" stopColor="#ef5350" stopOpacity={0.25} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--tz-border-subtle)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "var(--tz-text-muted)" }}
                  tickLine={false} axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "var(--tz-text-muted)" }}
                  tickLine={false} axisLine={false}
                  tickFormatter={(v) => `$${v}`}
                  width={50}
                />
                <Tooltip content={<EquityCurveTooltip />} />
                <Area
                  type="monotone"
                  dataKey="cumPnl"
                  stroke={stats.totalPnl >= 0 ? "#10b981" : "#ef5350"}
                  strokeWidth={2.5}
                  fill={stats.totalPnl >= 0 ? "url(#equityFillGreen)" : "url(#equityFillRed)"}
                  dot={false}
                  activeDot={{ r: 4, fill: stats.totalPnl >= 0 ? "#10b981" : "#ef5350", strokeWidth: 2, stroke: "var(--tz-bg-card)" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* ── Daily P&L Bar Chart ──────────────────────────────────── */}
          <motion.div
            className="tz-card p-5 bg-[var(--tz-bg-card)]"
            initial="hidden" animate="visible" custom={6} variants={fadeUp}
          >
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-[var(--tz-text-primary)]">Daily P&L</h2>
              <p className="text-xs text-[var(--tz-text-muted)] mt-0.5">Profit & loss per trading day</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.dailyPnl} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--tz-border-subtle)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "var(--tz-text-muted)" }}
                  tickLine={false} axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "var(--tz-text-muted)" }}
                  tickLine={false} axisLine={false}
                  tickFormatter={(v) => `$${v}`}
                  width={50}
                />
                <Tooltip content={<DailyPnlTooltip />} />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {stats.dailyPnl.map((entry, i) => (
                    <Cell key={i} fill={entry.pnl >= 0 ? "#10b981" : "#ef5350"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* ── Performance Breakdown (3 columns) ────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Best & Worst Trades */}
            <motion.div
              className="tz-card p-5 bg-[var(--tz-bg-card)]"
              initial="hidden" animate="visible" custom={7} variants={fadeUp}
            >
              <h2 className="text-sm font-semibold text-[var(--tz-text-primary)] mb-3 flex items-center gap-2">
                <Trophy size={14} className="text-amber-500" /> Best & Worst Trades
              </h2>

              <p className="text-[10px] uppercase tracking-wider text-[var(--tz-text-muted)] font-semibold mb-2">Top Winners</p>
              <div className="space-y-2 mb-4">
                {stats.bestTrades.map((t) => (
                  <div key={String(t.id)} className="flex items-center justify-between py-1.5 px-2 rounded-lg" style={{ background: "rgba(16,185,129,0.06)" }}>
                    <div className="flex items-center gap-2">
                      <ArrowUpRight size={12} className="text-emerald-500" />
                      <span className="text-xs font-semibold text-[var(--tz-text-secondary)]">{t.symbol}</span>
                      <span className="text-[10px] text-[var(--tz-text-muted)]">{t.side}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-500">{fmt(t.netPnl)}</span>
                  </div>
                ))}
              </div>

              <p className="text-[10px] uppercase tracking-wider text-[var(--tz-text-muted)] font-semibold mb-2">Worst Losers</p>
              <div className="space-y-2">
                {stats.worstTrades.map((t) => (
                  <div key={String(t.id)} className="flex items-center justify-between py-1.5 px-2 rounded-lg" style={{ background: "rgba(239,83,80,0.06)" }}>
                    <div className="flex items-center gap-2">
                      <ArrowDownRight size={12} className="text-red-500" />
                      <span className="text-xs font-semibold text-[var(--tz-text-secondary)]">{t.symbol}</span>
                      <span className="text-[10px] text-[var(--tz-text-muted)]">{t.side}</span>
                    </div>
                    <span className="text-xs font-bold text-red-500">{fmt(t.netPnl)}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* By Playbook */}
            <motion.div
              className="tz-card p-5 bg-[var(--tz-bg-card)]"
              initial="hidden" animate="visible" custom={8} variants={fadeUp}
            >
              <h2 className="text-sm font-semibold text-[var(--tz-text-primary)] mb-3 flex items-center gap-2">
                <BookOpen size={14} className="text-indigo-500" /> By Playbook
              </h2>
              <div className="space-y-3">
                {stats.byPlaybook.map((pb) => (
                  <div key={pb.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-[var(--tz-text-secondary)]">{pb.name}</span>
                      <span
                        className="text-xs font-bold"
                        style={{ color: pb.pnl >= 0 ? "#10b981" : "#ef5350" }}
                      >
                        {fmt(pb.pnl)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-[var(--tz-border-subtle)] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pb.winRate}%`,
                            background: pb.pnl >= 0
                              ? "linear-gradient(90deg, #10b981, #34d399)"
                              : "linear-gradient(90deg, #ef5350, #fca5a5)",
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-[var(--tz-text-muted)] w-14 text-right">
                        {pb.winRate}% WR
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--tz-text-muted)] mt-0.5">{pb.trades} trades</p>
                  </div>
                ))}
                {stats.byPlaybook.length === 0 && (
                  <p className="text-xs text-[var(--tz-text-muted)] text-center py-6">No playbook data</p>
                )}
              </div>
            </motion.div>

            {/* By Symbol */}
            <motion.div
              className="tz-card p-5 bg-[var(--tz-bg-card)]"
              initial="hidden" animate="visible" custom={9} variants={fadeUp}
            >
              <h2 className="text-sm font-semibold text-[var(--tz-text-primary)] mb-3 flex items-center gap-2">
                <BarChart3 size={14} className="text-cyan-500" /> By Symbol
              </h2>
              <div className="space-y-3">
                {stats.bySymbol.map((sym) => {
                  const maxCount = Math.max(...stats.bySymbol.map((s) => s.count), 1);
                  return (
                    <div key={sym.symbol} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-[var(--tz-text-secondary)] w-12">{sym.symbol}</span>
                      <div className="flex-1 h-2 rounded-full bg-[var(--tz-border-subtle)] overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(sym.count / maxCount) * 100}%`,
                            background: sym.pnl >= 0
                              ? "linear-gradient(90deg, #10b981, #6ee7b7)"
                              : "linear-gradient(90deg, #ef5350, #fca5a5)",
                          }}
                        />
                      </div>
                      <div className="text-right w-20">
                        <span
                          className="text-xs font-bold"
                          style={{ color: sym.pnl >= 0 ? "#10b981" : "#ef5350" }}
                        >
                          {fmt(sym.pnl)}
                        </span>
                        <p className="text-[10px] text-[var(--tz-text-muted)]">{sym.count} trades</p>
                      </div>
                    </div>
                  );
                })}
                {stats.bySymbol.length === 0 && (
                  <p className="text-xs text-[var(--tz-text-muted)] text-center py-6">No symbol data</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* ── Discipline Score + Key Insights + Streak Tracker ──────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Discipline Score */}
            <motion.div
              className="tz-card p-5 bg-[var(--tz-bg-card)] flex flex-col items-center"
              initial="hidden" animate="visible" custom={10} variants={fadeUp}
            >
              <h2 className="text-sm font-semibold text-[var(--tz-text-primary)] mb-4 self-start flex items-center gap-2">
                <Target size={14} className="text-emerald-500" /> Discipline Score
              </h2>
              <CircularScore score={stats.disciplineScore} size={130} />
              <div className="mt-4 w-full space-y-2">
                {[
                  { label: "Consistency", pct: Math.min(100, stats.totalTrades * 8) },
                  { label: "Risk Mgmt (Avg R:R)", pct: Math.min(100, Math.max(0, stats.avgRR * 35)) },
                  { label: "Win Rate", pct: Math.min(100, stats.winRate * 1.3) },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-[10px] mb-0.5">
                      <span className="text-[var(--tz-text-muted)]">{item.label}</span>
                      <span className="text-[var(--tz-text-secondary)] font-semibold">{Math.round(item.pct)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[var(--tz-border-subtle)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${item.pct}%`,
                          background:
                            item.pct >= 70
                              ? "#10b981"
                              : item.pct >= 40
                                ? "#f59e0b"
                                : "#ef5350",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Key Insights */}
            <motion.div
              className="tz-card p-5 bg-[var(--tz-bg-card)]"
              initial="hidden" animate="visible" custom={11} variants={fadeUp}
            >
              <h2 className="text-sm font-semibold text-[var(--tz-text-primary)] mb-3 flex items-center gap-2">
                <Lightbulb size={14} className="text-amber-500" /> Key Insights
              </h2>
              <div className="space-y-3">
                {stats.insights.map((insight, i) => (
                  <div key={i} className="flex gap-2.5 items-start">
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                      style={{
                        background:
                          i === 0
                            ? "#10b981"
                            : i === 1
                              ? "#6366f1"
                              : i === 2
                                ? "#f59e0b"
                                : i === 3
                                  ? "#06b6d4"
                                  : "#8b5cf6",
                      }}
                    />
                    <p className="text-xs text-[var(--tz-text-secondary)] leading-relaxed">{insight}</p>
                  </div>
                ))}
                {stats.insights.length === 0 && (
                  <p className="text-xs text-[var(--tz-text-muted)] text-center py-6">Not enough data for insights</p>
                )}
              </div>
            </motion.div>

            {/* Streak Tracker */}
            <motion.div
              className="tz-card p-5 bg-[var(--tz-bg-card)]"
              initial="hidden" animate="visible" custom={12} variants={fadeUp}
            >
              <h2 className="text-sm font-semibold text-[var(--tz-text-primary)] mb-4 flex items-center gap-2">
                <Flame size={14} className="text-orange-500" /> Streak Tracker
              </h2>
              <div className="space-y-4">
                {/* Current Streak */}
                <div className="p-3 rounded-xl" style={{
                  background: stats.currentStreakType === "win"
                    ? "rgba(16,185,129,0.08)"
                    : stats.currentStreakType === "loss"
                      ? "rgba(239,83,80,0.08)"
                      : "rgba(107,114,128,0.08)",
                }}>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--tz-text-muted)] font-semibold mb-1">Current Streak</p>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-2xl font-black"
                      style={{ color: stats.currentStreakType === "win" ? "#10b981" : stats.currentStreakType === "loss" ? "#ef5350" : "var(--tz-text-muted)" }}
                    >
                      {stats.currentStreak}
                    </span>
                    <span className="text-xs text-[var(--tz-text-muted)]">
                      {stats.currentStreakType === "win" ? "winning trades" : stats.currentStreakType === "loss" ? "losing trades" : "—"}
                    </span>
                  </div>
                </div>

                {/* Best Streaks */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-[var(--tz-hover-bg)]">
                    <p className="text-[10px] uppercase tracking-wider text-[var(--tz-text-muted)] font-semibold mb-1">Best Win Streak</p>
                    <p className="text-lg font-black text-emerald-500">{stats.bestWinStreak}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--tz-hover-bg)]">
                    <p className="text-[10px] uppercase tracking-wider text-[var(--tz-text-muted)] font-semibold mb-1">Worst Loss Streak</p>
                    <p className="text-lg font-black text-red-500">{stats.bestLossStreak}</p>
                  </div>
                </div>

                {/* Days Journaled */}
                <div className="p-3 rounded-xl bg-[var(--tz-hover-bg)]">
                  <p className="text-[10px] uppercase tracking-wider text-[var(--tz-text-muted)] font-semibold mb-1">Trading Activity</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-[var(--tz-text-primary)]">{stats.tradingDays}</span>
                    <span className="text-xs text-[var(--tz-text-muted)]">days with trades</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-[var(--tz-border-subtle)] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (stats.tradingDays / 7) * 100)}%`,
                        background: "linear-gradient(90deg, #6366f1, #10b981)",
                      }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
