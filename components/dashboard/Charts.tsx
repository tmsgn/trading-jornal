"use client";

import { Info, Zap } from "lucide-react";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Trade } from "@/lib/data";

// ─── Apex Score (Radar Chart) ─────────────────────────────────────────────
export function ZellaScoreCard({ trades }: { trades: Trade[] }) {
  const stats = useMemo(() => {
    const closed = trades.filter((t) => t.status === "Closed");
    const wins = closed.filter((t) => t.netPnl > 0);
    const losses = closed.filter((t) => t.netPnl < 0);

    const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0;

    const grossProfit = wins.reduce((sum, t) => sum + t.netPnl, 0);
    const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.netPnl, 0));

    let profitFactor = 0;
    if (grossLoss > 0) {
      profitFactor = grossProfit / grossLoss;
    } else if (grossProfit > 0) {
      profitFactor = 9.99;
    }

    const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
    const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;
    const ratio = avgLoss > 0 ? avgWin / avgLoss : 0;

    // Map metrics to 0-100 scores
    const pfScore = Math.min((profitFactor / 2.5) * 100, 100);
    const ratioScore = Math.min((ratio / 2.5) * 100, 100);
    const overallScore = Math.round((winRate + pfScore + ratioScore) / 3);

    const data = [
      { subject: "Win %", value: Math.round(winRate) },
      { subject: "Profit Factor", value: Math.round(pfScore) },
      { subject: "Risk/Reward", value: Math.round(ratioScore) },
    ];

    return { data, overallScore };
  }, [trades]);

  return (
    <div className="tz-card flex flex-col p-4 h-full bg-[var(--tz-bg-card)]">
      <div className="flex items-center gap-1 mb-2">
        <span className="text-sm font-semibold text-[var(--tz-text-primary)]">Apex Score</span>
        <Info size={13} className="text-[var(--tz-text-muted)] cursor-help" />
      </div>
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <ResponsiveContainer width="100%" height={180}>
          <RadarChart
            data={stats.data}
            margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
          >
            <PolarGrid stroke="#e8ecf4" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 10, fill: "#9ca3af", fontWeight: 600 }}
            />
            <Radar
              name="Score"
              dataKey="value"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.15}
              dot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-1.5 mt-2 border-t border-gray-50 pt-2 shrink-0">
        <span className="text-xs text-[var(--tz-text-muted)] font-semibold">
          Your Apex Score:
        </span>
        <span className="text-base font-extrabold" style={{ color: "#26a69a" }}>
          {stats.overallScore}
        </span>
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded"
          style={{ background: "#26a69a22", color: "#26a69a" }}
        >
          Active
        </span>
      </div>
    </div>
  );
}

// ─── Daily Net Cumulative P&L ───────────────────────────────────────────────
const CustomCumulativeTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const v = payload[0].value;
    return (
      <div className="bg-white border border-[var(--tz-border)] rounded-lg shadow-md px-3 py-2 text-xs">
        <p
          className="font-bold font-mono"
          style={{ color: v >= 0 ? "#26a69a" : "#ef5350" }}
        >
          {v >= 0 ? "+" : ""}${v.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

export function CumulativePnLCard({ trades }: { trades: Trade[] }) {
  const chartData = useMemo(() => {
    const closed = trades.filter((t) => t.status === "Closed");

    // Sort chronologically
    const sorted = [...closed].sort((a, b) => {
      const d = a.date.localeCompare(b.date);
      if (d !== 0) return d;
      return a.time.localeCompare(b.time);
    });

    let cumSum = 0;
    const points = sorted.map((t) => {
      cumSum += t.netPnl;
      const parts = t.date.split("-");
      const label = parts.length === 3 ? `${parts[1]}/${parts[2]}` : t.date;
      return { date: label, value: cumSum };
    });

    return [{ date: "Start", value: 0 }, ...points];
  }, [trades]);

  return (
    <div className="tz-card flex flex-col p-4 h-full bg-[var(--tz-bg-card)]">
      <div className="flex items-center gap-1 mb-2">
        <span className="text-sm font-semibold text-[var(--tz-text-primary)]">
          Daily Net Cumulative P&L
        </span>
        <Info size={13} className="text-[var(--tz-text-muted)] cursor-help" />
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height={210}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
          >
            <defs>
              <linearGradient id="pnlGradientPos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#26a69a" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#26a69a" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f8fafc"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 9, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 9, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip content={<CustomCumulativeTooltip />} />
            <ReferenceLine y={0} stroke="#e8ecf4" strokeDasharray="4 4" />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#26a69a"
              strokeWidth={2}
              fill="url(#pnlGradientPos)"
              dot={{ r: 3, fill: "#26a69a", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#26a69a" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Net Daily P&L Bar Chart ────────────────────────────────────────────────
const CustomDailyTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const v = payload[0].value;
    return (
      <div className="bg-white border border-[var(--tz-border)] rounded-lg shadow-md px-3 py-2 text-xs">
        <p
          className="font-bold font-mono"
          style={{ color: v >= 0 ? "#26a69a" : "#ef5350" }}
        >
          {v >= 0 ? "+" : ""}${v.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

export function NetDailyPnLCard({ trades }: { trades: Trade[] }) {
  const chartData = useMemo(() => {
    const closed = trades.filter((t) => t.status === "Closed");

    // Sort chronologically
    const sorted = [...closed].sort((a, b) => {
      const d = a.date.localeCompare(b.date);
      if (d !== 0) return d;
      return a.time.localeCompare(b.time);
    });

    const dailyMap: Record<string, number> = {};
    for (const t of sorted) {
      const parts = t.date.split("-");
      const label = parts.length === 3 ? `${parts[1]}/${parts[2]}` : t.date;
      dailyMap[label] = (dailyMap[label] || 0) + t.netPnl;
    }

    return Object.entries(dailyMap).map(([date, value]) => ({
      date,
      value,
    }));
  }, [trades]);

  return (
    <div className="tz-card flex flex-col p-4 h-full bg-[var(--tz-bg-card)]">
      <div className="flex items-center gap-1 mb-2">
        <span className="text-sm font-semibold text-[var(--tz-text-primary)]">
          Net Daily P&L
        </span>
        <Info size={13} className="text-[var(--tz-text-muted)] cursor-help" />
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height={210}>
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            barSize={12}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f8fafc"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 9, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 9, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip content={<CustomDailyTooltip />} />
            <ReferenceLine y={0} stroke="#e8ecf4" />
            <Bar dataKey="value" radius={[3, 3, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.value >= 0 ? "#26a69a" : "#ef5350"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Playbook Performance Distribution Widget ────────────────────────────────
export function PlaybookPerformance({ trades }: { trades: Trade[] }) {
  const playbookStats = useMemo(() => {
    const closed = trades.filter((t) => t.status === "Closed");
    const statsMap: Record<
      string,
      { pnl: number; wins: number; total: number }
    > = {};

    for (const t of closed) {
      const name = t.playbook || "Unclassified";
      if (!statsMap[name]) {
        statsMap[name] = { pnl: 0, wins: 0, total: 0 };
      }
      statsMap[name].pnl += t.netPnl;
      statsMap[name].total += 1;
      if (t.netPnl > 0) {
        statsMap[name].wins += 1;
      }
    }

    return Object.entries(statsMap)
      .map(([name, data]) => ({
        name,
        pnl: data.pnl,
        winRate: data.total > 0 ? (data.wins / data.total) * 100 : 0,
        totalTrades: data.total,
      }))
      .sort((a, b) => b.pnl - a.pnl);
  }, [trades]);

  return (
    <div className="tz-card bg-[var(--tz-bg-card)] p-4">
      <div className="flex items-center gap-1.5 mb-3">
        <Zap size={14} className="text-indigo-600 animate-pulse" />
        <span className="text-sm font-bold text-[var(--tz-text-primary)]">
          Playbook Performance
        </span>
      </div>
      <div className="space-y-3">
        {playbookStats.length === 0 ? (
          <p className="text-xs text-[var(--tz-text-muted)] text-center py-6">
            No classified playbook stats yet.
          </p>
        ) : (
          playbookStats.slice(0, 5).map((pb) => {
            const isPos = pb.pnl >= 0;
            return (
              <div key={pb.name} className="space-y-1 text-xs">
                <div className="flex justify-between items-center font-medium">
                  <span className="text-[var(--tz-text-primary)] font-bold">{pb.name}</span>
                  <span
                    className="font-bold"
                    style={{ color: isPos ? "#26a69a" : "#ef5350" }}
                  >
                    {isPos ? "+" : ""}${pb.pnl.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-[var(--tz-text-muted)]">
                  <span>
                    {pb.totalTrades} {pb.totalTrades === 1 ? "trade" : "trades"}
                  </span>
                  <span className="font-mono">
                    {pb.winRate.toFixed(0)}% win rate
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pb.winRate}%`,
                      background: isPos ? "#26a69a" : "#ef5350",
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
