"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Info, RefreshCw, Pencil, Plus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Trade, getSavedProfile } from "@/lib/data";

interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
  badge?: { value: string; color: string };
  children?: React.ReactNode;
  extra?: React.ReactNode;
  count?: number;
}

function StatCard({
  label,
  value,
  badge,
  children,
  extra,
  count,
}: StatCardProps) {
  return (
    <div className="tz-card flex flex-col justify-between p-4 min-w-0 flex-1 bg-white">
      <div className="flex items-center gap-1 mb-1">
        <span className="text-xs text-gray-500 font-medium">{label}</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info size={12} className="text-gray-400 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="text-xs">{label}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {count !== undefined && (
          <span className="ml-auto text-xs font-semibold text-gray-400">
            {count}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">{value}</span>
          {badge && (
            <span
              className="text-xs font-semibold rounded px-1.5 py-0.5"
              style={{ color: badge.color, background: badge.color + "22" }}
            >
              {badge.value}
            </span>
          )}
        </div>
        {children}
      </div>
      {extra}
    </div>
  );
}

// Donut-like gauge using SVG
function GaugeMini({
  value,
  color,
  bg,
}: {
  value: number;
  color: string;
  bg: string;
}) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <svg width="52" height="52" viewBox="0 0 52 52">
      <circle cx="26" cy="26" r={r} fill="none" stroke={bg} strokeWidth="5" />
      <circle
        cx="26"
        cy="26"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform="rotate(-90 26 26)"
      />
    </svg>
  );
}

// Half-donut / profit factor arc
function ProfitArc({ factor }: { factor: number }) {
  // Map profit factor 0 to 3+ to a percentage of 180 degrees
  const clampedFactor = Math.min(Math.max(factor, 0), 3);
  const percentage = (clampedFactor / 3) * 100;
  
  const r = 23;
  const circ = Math.PI * r; // Semi-circle circumference
  const dash = (percentage / 100) * circ;

  return (
    <div className="flex items-center justify-center">
      <svg width="54" height="32" viewBox="0 0 54 32">
        <path
          d="M4,28 A23,23,0,0,1,50,28"
          fill="none"
          stroke="#e8ecf4"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M4,28 A23,23,0,0,1,50,28"
          fill="none"
          stroke={factor >= 1.5 ? "#26a69a" : factor >= 1.0 ? "#10b981" : "#ef5350"}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`}
        />
      </svg>
    </div>
  );
}

export function StatsRow({ trades }: { trades: Trade[] }) {
  // Memoize performance metrics
  const stats = useMemo(() => {
    const closed = trades.filter((t) => t.status === "Closed");
    const wins = closed.filter((t) => t.netPnl > 0);
    const losses = closed.filter((t) => t.netPnl < 0);

    const netPnl = closed.reduce((sum, t) => sum + t.netPnl, 0);
    const expectancy = closed.length > 0 ? netPnl / closed.length : 0;

    const grossProfit = wins.reduce((sum, t) => sum + t.netPnl, 0);
    const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.netPnl, 0));
    
    let profitFactor = 0;
    if (grossLoss > 0) {
      profitFactor = grossProfit / grossLoss;
    } else if (grossProfit > 0) {
      profitFactor = 9.99; // Cap at high indicator
    }

    const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0;

    const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
    const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;
    const ratio = avgLoss > 0 ? avgWin / avgLoss : 0;

    return {
      totalCount: closed.length,
      netPnl,
      expectancy,
      profitFactor,
      winRate,
      winCount: wins.length,
      lossCount: losses.length,
      avgWin,
      avgLoss,
      ratio,
    };
  }, [trades]);

  const pnlColor = stats.netPnl >= 0 ? "#26a69a" : "#ef5350";

  return (
    <div className="flex gap-3 px-5 pt-3 flex-wrap md:flex-nowrap">
      
      {/* Net P&L */}
      <StatCard
        label="Net P&L"
        value={(stats.netPnl >= 0 ? "+" : "") + "$" + stats.netPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        count={stats.totalCount}
        extra={
          <div className="mt-2 p-1.5 rounded-md w-7 h-7 flex items-center justify-center border border-gray-200 cursor-pointer hover:bg-gray-50 self-end ml-auto">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="9" width="2.5" height="4" rx="0.5" fill="#10b981" />
              <rect x="5" y="6" width="2.5" height="7" rx="0.5" fill="#10b981" fillOpacity="0.5" />
              <rect x="9" y="3" width="2.5" height="10" rx="0.5" fill="#10b981" fillOpacity="0.3" />
            </svg>
          </div>
        }
      />

      {/* Trade Expectancy */}
      <StatCard
        label="Trade Expectancy"
        value={(stats.expectancy >= 0 ? "+" : "") + "$" + stats.expectancy.toFixed(2)}
        extra={
          <div className="mt-2 p-1.5 rounded-md w-7 h-7 flex items-center justify-center border border-gray-200 cursor-pointer hover:bg-gray-50 self-end ml-auto">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 10 L5 6 L8 8 L13 3" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        }
      />

      {/* Profit Factor */}
      <StatCard
        label="Profit Factor"
        value={stats.profitFactor.toFixed(2)}
        extra={
          <div className="mt-1">
            <ProfitArc factor={stats.profitFactor} />
          </div>
        }
      />

      {/* Win % */}
      <StatCard 
        label="Win %" 
        value={`${stats.winRate.toFixed(1)}%`}
        extra={
          <div className="mt-2 flex items-center gap-2 shrink-0">
            <span className="tz-badge-win">{stats.winCount}W</span>
            <span className="tz-badge-loss">{stats.lossCount}L</span>
          </div>
        }
      >
        <div className="flex items-center select-none">
          <GaugeMini value={stats.winRate} color="#10b981" bg="#e8ecf4" />
        </div>
      </StatCard>

      {/* Avg win/loss */}
      <div className="tz-card flex flex-col justify-between p-4 flex-1 min-w-[170px] bg-white">
        <div className="flex items-center gap-1 mb-1">
          <span className="text-xs text-gray-500 font-medium">
            Avg Win/Loss Ratio
          </span>
          <Info size={12} className="text-gray-400" />
        </div>
        <div className="text-lg font-bold text-gray-900 mt-1">
          {stats.ratio.toFixed(2)}
        </div>
        <div className="flex gap-1 mt-2 shrink-0">
          <div
            className="h-1 flex-1 rounded-full"
            style={{ background: "#26a69a" }}
          ></div>
          <div
            className="h-1 flex-1 rounded-full"
            style={{ background: "#ef5350" }}
          ></div>
        </div>
        <div className="flex justify-between mt-1 shrink-0">
          <span className="text-[10px] font-bold" style={{ color: "#26a69a" }}>
            +${stats.avgWin.toFixed(0)}
          </span>
          <span className="text-[10px] font-bold" style={{ color: "#ef5350" }}>
            -${stats.avgLoss.toFixed(0)}
          </span>
        </div>
      </div>
      
    </div>
  );
}

export function WelcomeBar({ trades }: { trades: Trade[] }) {
  const [profile, setProfile] = useState(() => getSavedProfile());

  useEffect(() => {
    const handleUpdate = () => {
      setProfile(getSavedProfile());
    };
    window.addEventListener("tz_profile_update", handleUpdate);
    return () => {
      window.removeEventListener("tz_profile_update", handleUpdate);
    };
  }, []);

  const openCount = useMemo(() => {
    return trades.filter((t) => t.status === "Open").length;
  }, [trades]);

  return (
    <div className="flex items-center justify-between px-5 py-3 shrink-0">
      <div className="flex items-center gap-2">
        <h2 className="text-[15px] font-bold text-gray-800">
          Good morning {profile.firstName}! 
          {openCount > 0 && (
            <span className="ml-2 text-xs font-medium text-emerald-500">
              ({openCount} open {openCount === 1 ? "position" : "positions"} active)
            </span>
          )}
        </h2>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
          <RefreshCw size={12} />
          Last sync: 2 min ago
        </div>
        <button className="flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-semibold border border-emerald-300 text-emerald-600 hover:bg-emerald-50 transition-colors">
          <Pencil size={12} />
          Edit Widgets
        </button>
        <button
          className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 shadow-sm"
          style={{
            background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
          }}
        >
          <Plus size={13} />
          Import Trades
        </button>
      </div>
    </div>
  );
}
