"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart2,
  Target,
  Calendar,
} from "lucide-react";
import { Trade, getSavedTrades } from "@/lib/data";

type DateRange = "1W" | "1M" | "3M" | "6M" | "YTD" | "All";

const HEATMAP_HOURS = [
  "9:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
];
const HEATMAP_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(v: number, prefix = "$") {
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (abs >= 1000) return `${sign}${prefix}${(abs / 1000).toFixed(1)}K`;
  return `${sign}${prefix}${abs.toFixed(0)}`;
}

function heatmapColor(v: number): { bg: string; text: string } {
  if (v > 400) return { bg: "#1a8a72", text: "#fff" };
  if (v > 100) return { bg: "#2da87c", text: "#fff" };
  if (v > 10) return { bg: "#d6f0ea", text: "#1a8a72" };
  if (v > -10) return { bg: "#f0f4f8", text: "#6b7280" };
  if (v > -150) return { bg: "#fde8e8", text: "#c0392b" };
  return { bg: "#c0392b", text: "#fff" };
}

// ─── Custom Tooltips ──────────────────────────────────────────────────────────
function EquityTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="tz-card px-3 py-2 text-xs shadow-lg bg-white border border-gray-100">
      <p className="text-gray-500 mb-0.5">{label}</p>
      <p className="font-bold text-indigo-600">
        ${payload[0].value.toLocaleString()}
      </p>
    </div>
  );
}

function ScatterTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { duration: number; pnl: number; win: boolean } }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="tz-card px-3 py-2 text-xs shadow-lg bg-white border border-gray-100">
      <p className="text-gray-500">
        Duration:{" "}
        <span className="font-semibold text-gray-700">{d.duration} min</span>
      </p>
      <p
        className="font-bold"
        style={{ color: d.pnl >= 0 ? "#1a8a72" : "#c0392b" }}
      >
        {d.pnl >= 0 ? "+" : ""}${d.pnl.toFixed(2)}
      </p>
    </div>
  );
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  sub,
  color,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  color: "green" | "red" | "gray";
  icon: React.ElementType;
}) {
  const colorMap = {
    green: { text: "#1a8a72", bg: "#d6f0ea" },
    red: { text: "#c0392b", bg: "#fde8e8" },
    gray: { text: "#374151", bg: "#f0f4f8" },
  };
  const c = colorMap[color];
  return (
    <div className="tz-card p-4 flex items-start gap-3 bg-white">
      <div
        className="rounded-lg p-2 flex-shrink-0"
        style={{ background: c.bg }}
      >
        <Icon size={16} style={{ color: c.text }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
        <p
          className="text-base font-bold leading-tight"
          style={{ color: c.text }}
        >
          {value}
        </p>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<DateRange>("All");
  const [trades, setTrades] = useState<Trade[]>(() => getSavedTrades());

  const ranges: DateRange[] = ["1W", "1M", "3M", "6M", "YTD", "All"];

  // Sync state across navigations
  useEffect(() => {
    const handleUpdate = () => {
      setTrades(getSavedTrades());
    };
    window.addEventListener("tz_trades_update", handleUpdate);
    return () => {
      window.removeEventListener("tz_trades_update", handleUpdate);
    };
  }, []);

  // Filter trades based on date range selected (Relative to December 2023)
  const rangeFilteredTrades = useMemo(() => {
    const closed = trades.filter((t) => t.status === "Closed");
    
    // Sort chronologically for timeline evaluations
    const sorted = [...closed].sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });

    if (range === "All") return sorted;

    // Slice based on count for demonstration purposes
    if (range === "1W") return sorted.slice(-4);
    if (range === "1M") return sorted.slice(-10);
    if (range === "3M") return sorted.slice(-15);
    
    return sorted;
  }, [trades, range]);

  // ─── Dynamic Computations ────────────────────────────────────────────────────
  const computations = useMemo(() => {
    const list = rangeFilteredTrades;

    // 1. Equity Curve
    let currentEquity = 0;
    let peak = 0;
    let maxDD = 0;
    
    const equityCurve = list.map((t) => {
      currentEquity += t.netPnl;
      if (currentEquity > peak) {
        peak = currentEquity;
      } else {
        const dd = peak - currentEquity;
        if (dd > maxDD) {
          maxDD = dd;
        }
      }
      
      const parts = t.date.split("-");
      let formattedDate = t.date;
      if (parts.length === 3) {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        formattedDate = `${months[parseInt(parts[1]) - 1]} ${parts[2]}`;
      }

      return {
        date: formattedDate,
        equity: parseFloat(currentEquity.toFixed(2)),
      };
    });

    // Handle empty state
    if (equityCurve.length === 0) {
      equityCurve.push({ date: "No data", equity: 0 });
    }

    // 2. Sharpe Ratio (Mock calculation based on Win Rate & Consistency)
    const winTrades = list.filter((t) => t.netPnl > 0);
    const winRate = list.length > 0 ? winTrades.length / list.length : 0;
    const losses = list.filter((t) => t.netPnl < 0);
    const sharpe = list.length > 0
      ? Math.min(Math.max((winRate * 4.5) - (losses.length * 0.05), 0.5), 4.2).toFixed(2)
      : "0.00";

    // 3. Daily Stats for Avg Daily P&L
    const dayMap: Record<string, number> = {};
    for (const t of list) {
      dayMap[t.date] = (dayMap[t.date] || 0) + t.netPnl;
    }
    const dailyPnlValues = Object.values(dayMap);
    const avgDailyPnl = dailyPnlValues.length > 0
      ? dailyPnlValues.reduce((s, v) => s + v, 0) / dailyPnlValues.length
      : 0;

    // 4. Profit Factor
    const grossProfit = winTrades.reduce((s, t) => s + t.netPnl, 0);
    const grossLoss = Math.abs(losses.reduce((s, t) => s + t.netPnl, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 10.0 : 0;

    // 5. P&L Distribution buckets
    const distributionMap = {
      "-$500+": 0,
      "-$300": 0,
      "-$200": 0,
      "-$100": 0,
      "-$50": 0,
      "$0": 0,
      "$50": 0,
      "$100": 0,
      "$200": 0,
      "$300": 0,
      "$500+": 0,
    };

    for (const t of list) {
      const p = t.netPnl;
      if (p <= -500) distributionMap["-$500+"]++;
      else if (p > -500 && p <= -250) distributionMap["-$300"]++;
      else if (p > -250 && p <= -150) distributionMap["-$200"]++;
      else if (p > -150 && p <= -50) distributionMap["-$100"]++;
      else if (p > -50 && p < 0) distributionMap["-$50"]++;
      else if (p === 0) distributionMap["$0"]++;
      else if (p > 0 && p <= 50) distributionMap["$50"]++;
      else if (p > 50 && p <= 150) distributionMap["$100"]++;
      else if (p > 150 && p <= 250) distributionMap["$200"]++;
      else if (p > 250 && p <= 450) distributionMap["$300"]++;
      else if (p > 450) distributionMap["$500+"]++;
    }

    const pnlDistribution = Object.entries(distributionMap).map(([bucket, count]) => ({
      bucket,
      count,
      isLoss: bucket.startsWith("-"),
    }));

    // 6. Win Rate by Weekday
    const countsByDay = [0, 0, 0, 0, 0, 0, 0];
    const winsByDay = [0, 0, 0, 0, 0, 0, 0];
    for (const t of list) {
      const parts = t.date.split("-");
      if (parts.length === 3) {
        const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        const dayIdx = dateObj.getDay();
        countsByDay[dayIdx]++;
        if (t.netPnl > 0) winsByDay[dayIdx]++;
      }
    }

    const winRateByDay = ["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, idx) => {
      const dIndex = idx + 1;
      const count = countsByDay[dIndex];
      const wr = count > 0 ? Math.round((winsByDay[dIndex] / count) * 100) : 0;
      return { day, winRate: wr };
    });

    // 7. Scatter hold times
    const scatterData = list.map((t) => ({
      duration: t.duration,
      pnl: t.netPnl,
      win: t.netPnl > 0,
    }));

    // 8. Tickers Ranking
    const tickerMap: Record<string, number> = {};
    for (const t of list) {
      tickerMap[t.symbol] = (tickerMap[t.symbol] || 0) + t.netPnl;
    }
    const symbolPerformance = Object.entries(tickerMap)
      .map(([symbol, pnl]) => ({ symbol, pnl: parseFloat(pnl.toFixed(2)) }))
      .sort((a, b) => b.pnl - a.pnl)
      .slice(0, 5);

    // 9. Hourly Heatmap
    const heatmapData = HEATMAP_HOURS.map((hStr) => {
      const targetHour = parseInt(hStr.split(":")[0]);
      return HEATMAP_DAYS.map((_, dIdx) => {
        const dayOfWeekIndex = dIdx + 1; // Mon is 1
        
        const matchingTrades = list.filter((t) => {
          const tradeHour = parseInt(t.time.split(":")[0]);
          const parts = t.date.split("-");
          if (parts.length === 3) {
            const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            return dateObj.getDay() === dayOfWeekIndex && tradeHour === targetHour;
          }
          return false;
        });
        
        if (matchingTrades.length === 0) return 0;
        const total = matchingTrades.reduce((sum, t) => sum + t.netPnl, 0);
        return Math.round(total / matchingTrades.length);
      });
    });

    return {
      equityCurve,
      totalPnl: currentEquity,
      maxDrawdown: maxDD,
      sharpe,
      avgDailyPnl,
      profitFactor,
      pnlDistribution,
      winRateByDay,
      scatterData,
      symbolPerformance,
      heatmapData,
      symbolCount: Object.keys(tickerMap).length,
    };
  }, [rangeFilteredTrades]);

  return (
    <div
      className="flex flex-col gap-4 px-5 py-5"
      style={{ background: "#f4f6fb", minHeight: "100%" }}
    >
      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Deep dive into your trading performance
          </p>
        </div>
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-full p-1 shadow-sm">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className="px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer"
              style={
                range === r
                  ? {
                      background:
                        "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
                      color: "#fff",
                    }
                  : { color: "#6b7280" }
              }
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI Row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-5 gap-3">
        <KpiCard
          label="Total P&L"
          value={fmt(computations.totalPnl)}
          sub="Filtered Range"
          color={computations.totalPnl >= 0 ? "green" : "red"}
          icon={TrendingUp}
        />
        <KpiCard
          label="Sharpe Ratio"
          value={computations.sharpe}
          sub="Risk-adjusted"
          color="gray"
          icon={Activity}
        />
        <KpiCard
          label="Max Drawdown"
          value={`-${fmt(computations.maxDrawdown)}`}
          sub="Equity Peak to Dip"
          color="red"
          icon={TrendingDown}
        />
        <KpiCard
          label="Avg Daily P&L"
          value={fmt(computations.avgDailyPnl)}
          sub="Logged Days"
          color={computations.avgDailyPnl >= 0 ? "green" : "red"}
          icon={BarChart2}
        />
        <KpiCard
          label="Profit Factor"
          value={computations.profitFactor.toFixed(2)}
          sub="Gross win/loss"
          color={computations.profitFactor >= 1.5 ? "green" : "gray"}
          icon={Target}
        />
      </div>

      {/* ── Row 1: Equity Curve + P&L Distribution ────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {/* Equity Curve — 2/3 width */}
        <div className="tz-card p-4 col-span-2 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">
                Equity Curve
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Cumulative P&L over time
              </p>
            </div>
            <span
              className="text-sm font-black"
              style={{ color: computations.totalPnl >= 0 ? "#26a69a" : "#ef5350" }}
            >
              {fmt(computations.totalPnl)}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={computations.equityCurve}
              margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f4f8"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}`}
                width={42}
              />
              <Tooltip content={<EquityTooltip />} />
              <Area
                type="monotone"
                dataKey="equity"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#equityGrad)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: "#6366f1",
                  stroke: "#white",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* P&L Distribution — 1/3 width */}
        <div className="tz-card p-4 bg-white">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-800">
              P&L Distribution
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Trade outcome frequency
            </p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={computations.pnlDistribution}
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f4f8"
                vertical={false}
              />
              <XAxis
                dataKey="bucket"
                tick={{ fontSize: 9, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(v) => [`${v} trades`, "Count"]}
                contentStyle={{
                  fontSize: 11,
                  borderRadius: 8,
                  border: "1px solid #e8ecf4",
                }}
              />
              <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                {computations.pnlDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.isLoss ? "#fca5a5" : "#6ee7b7"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Row 2: Three Charts ───────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {/* Win Rate by Day */}
        <div className="tz-card p-4 bg-white">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-800">
              Win Rate by Day of Week
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Historical win % per weekday
            </p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={computations.winRateByDay}
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f4f8"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                formatter={(v) => [`${v}%`, "Win Rate"]}
                contentStyle={{
                  fontSize: 11,
                  borderRadius: 8,
                  border: "1px solid #e8ecf4",
                }}
              />
              <Bar dataKey="winRate" radius={[4, 4, 0, 0]}>
                {computations.winRateByDay.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={
                      entry.winRate >= 60
                        ? "#6366f1"
                        : entry.winRate >= 45
                          ? "#818cf8"
                          : "#c7d2fe"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 flex items-center justify-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
              <span className="text-[10px] text-gray-400">≥60%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-indigo-300" />
              <span className="text-[10px] text-gray-400">45–60%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-indigo-100" />
              <span className="text-[10px] text-gray-400">&lt;45%</span>
            </div>
          </div>
        </div>

        {/* Trade Duration vs P&L Scatter */}
        <div className="tz-card p-4 bg-white">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-800">
              Duration vs P&L
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Trade hold time correlation
            </p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <ScatterChart margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
              <XAxis
                dataKey="duration"
                type="number"
                name="Duration"
                domain={[0, "dataMax + 10"]}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                label={{
                  value: "minutes",
                  position: "insideBottom",
                  offset: -2,
                  fontSize: 9,
                  fill: "#9ca3af",
                }}
              />
              <YAxis
                dataKey="pnl"
                type="number"
                name="P&L"
                domain={["dataMin - 100", "dataMax + 100"]}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}`}
                width={46}
              />
              <Tooltip content={<ScatterTooltip />} />
              <Scatter
                data={computations.scatterData.filter((d) => d.win)}
                fill="#26a69a"
                opacity={0.8}
              />
              <Scatter
                data={computations.scatterData.filter((d) => !d.win)}
                fill="#ef5350"
                opacity={0.7}
              />
            </ScatterChart>
          </ResponsiveContainer>
          <div className="mt-2 flex items-center justify-center gap-4">
            <div className="flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: "#26a69a" }}
              />
              <span className="text-[10px] text-gray-400">Wins</span>
            </div>
            <div className="flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: "#ef5350" }}
              />
              <span className="text-[10px] text-gray-400">Losses</span>
            </div>
          </div>
        </div>

        {/* Best Performing Symbols */}
        <div className="tz-card p-4 bg-white">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-800">
              Best Performing Symbols
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Net P&L by ticker</p>
          </div>
          {computations.symbolPerformance.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs">No symbols traded yet.</div>
          ) : (
            <div className="flex flex-col gap-3 mt-2">
              {computations.symbolPerformance.map((s, idx) => {
                const maxPnl = Math.max(...computations.symbolPerformance.map((item) => item.pnl), 1);
                const pct = Math.max((s.pnl / maxPnl) * 100, 5);
                const isLoss = s.pnl < 0;

                return (
                  <div key={s.symbol}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-700">
                        {s.symbol}
                      </span>
                      <span
                        className="text-xs font-bold"
                        style={{ color: isLoss ? "#ef5350" : "#26a69a" }}
                      >
                        {isLoss ? "" : "+"}${s.pnl.toLocaleString()}
                      </span>
                    </div>
                    <div
                      className="h-2 rounded-full"
                      style={{ background: "#f0f4f8" }}
                    >
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: isLoss
                            ? "linear-gradient(90deg, #ef5350 0%, #ff8a80 100%)"
                            : "linear-gradient(90deg, #6366f1 0%, #10b981 100%)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex justify-between text-[11px] text-gray-400">
              <span>{computations.symbolCount} symbols traded</span>
              <span className="font-semibold" style={{ color: computations.totalPnl >= 0 ? "#26a69a" : "#ef5350" }}>
                {computations.totalPnl >= 0 ? "+" : ""}${computations.totalPnl.toFixed(2)} total
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 3: P&L Heatmap ───────────────────────────────────────────── */}
      <div className="tz-card p-4 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">P&L Heatmap</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Average P&L by time of day and day of week
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={13} className="text-gray-400" />
            <span className="text-xs text-gray-400">Live Trade Log</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] text-gray-400">Loss</span>
          {[
            "#c0392b",
            "#fde8e8",
            "#f0f4f8",
            "#d6f0ea",
            "#2da87c",
            "#1a8a72",
          ].map((bg, i) => (
            <div
              key={i}
              className="w-5 h-3 rounded-sm"
              style={{ background: bg }}
            />
          ))}
          <span className="text-[10px] text-gray-400">Profit</span>
        </div>

        {/* Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="w-14 text-left py-1 text-gray-400 font-medium text-[11px]">
                  Time
                </th>
                {HEATMAP_DAYS.map((d) => (
                  <th
                    key={d}
                    className="text-center py-1 text-gray-500 font-semibold text-[11px]"
                  >
                    {d}
                  </th>
                ))}
                <th className="text-right py-1 text-gray-400 font-medium text-[11px] pl-2">
                  Avg
                </th>
              </tr>
            </thead>
            <tbody>
              {HEATMAP_HOURS.map((hour, hi) => {
                const row = computations.heatmapData[hi] || [0, 0, 0, 0, 0];
                const rowAvg = Math.round(
                  row.reduce((a, b) => a + b, 0) / row.length
                );
                return (
                  <tr key={hour}>
                    <td className="py-1 text-gray-400 font-medium text-[11px]">
                      {hour}
                    </td>
                    {row.map((val, di) => {
                      const c = heatmapColor(val);
                      return (
                        <td key={di} className="py-1 px-1">
                          <div
                            className="flex items-center justify-center rounded-md text-[11px] font-semibold cursor-pointer transition-transform hover:scale-105"
                            style={{
                              background: c.bg,
                              color: c.text,
                              height: "36px",
                              minWidth: "64px",
                            }}
                            title={`${hour} ${HEATMAP_DAYS[di]}: ${val >= 0 ? "+" : ""}$${val}`}
                          >
                            {val >= 0 ? "+" : ""}
                            {fmt(val)}
                          </div>
                        </td>
                      );
                    })}
                    <td className="py-1 pl-2">
                      <div
                        className="flex items-center justify-center rounded-md text-[11px] font-bold"
                        style={{
                          ...heatmapColor(rowAvg),
                          height: "36px",
                          minWidth: "56px",
                          border: "1px solid #e8ecf4",
                        }}
                      >
                        {rowAvg >= 0 ? "+" : ""}
                        {fmt(rowAvg)}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* Column averages */}
              <tr className="border-t border-gray-100">
                <td className="pt-2 text-gray-400 font-medium text-[11px]">
                  Avg
                </td>
                {HEATMAP_DAYS.map((_, di) => {
                  const colVals = computations.heatmapData.map((r) => r[di] || 0);
                  const colAvg = Math.round(
                    colVals.reduce((a, b) => a + b, 0) / Math.max(colVals.length, 1)
                  );
                  const c = heatmapColor(colAvg);
                  return (
                    <td key={di} className="pt-2 px-1">
                      <div
                        className="flex items-center justify-center rounded-md text-[11px] font-bold"
                        style={{
                          background: c.bg,
                          color: c.text,
                          height: "32px",
                          border: "1px solid #e8ecf4",
                        }}
                      >
                        {colAvg >= 0 ? "+" : ""}
                        {fmt(colAvg)}
                      </div>
                    </td>
                  );
                })}
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
