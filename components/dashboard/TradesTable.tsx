"use client";

import { Calendar, FileText, Image, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { Trade } from "@/lib/data";

interface TradesTableProps {
  trades: Trade[];
  selectedDate: string | null;
  onSelectTrade: (trade: Trade) => void;
  onClearDateFilter: () => void;
}

// Helper to format date into a clean US short format (MM/DD/YYYY)
function formatDateShort(dateStr: string): string {
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[1]}/${parts[2]}/${parts[0]}`;
  }
  return dateStr;
}

// Helper to format date into a friendly text representation (e.g., Dec 21, 2023)
function formatDateFriendly(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const date = new Date(y, m, d);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  return dateStr;
}

export function TradesTable({
  trades,
  selectedDate,
  onSelectTrade,
  onClearDateFilter,
}: TradesTableProps) {
  const [activeTab, setActiveTab] = useState<"open" | "recent">("recent");

  // Filter and split trades into open/closed
  const { openTrades, closedTrades } = useMemo(() => {
    const open = trades.filter((t) => t.status === "Open");
    const closed = trades.filter((t) => t.status === "Closed");
    return { openTrades: open, closedTrades: closed };
  }, [trades]);

  // Apply date filter to active lists
  const filteredTrades = useMemo(() => {
    const targetList = activeTab === "open" ? openTrades : closedTrades;
    if (!selectedDate) return targetList;
    return targetList.filter((t) => t.date === selectedDate);
  }, [activeTab, openTrades, closedTrades, selectedDate]);

  return (
    <div className="tz-card flex flex-col h-full bg-[var(--tz-bg-card)] relative">
      {/* Active Date Filter Alert Banner */}
      {selectedDate && (
        <div className="flex items-center justify-between px-4 py-2 bg-indigo-50 border-b border-indigo-100 text-indigo-700 text-xs font-semibold animate-fade-in">
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="text-indigo-500" />
            <span>
              Showing trades for {formatDateFriendly(selectedDate)} (
              {filteredTrades.length} found)
            </span>
          </div>
          <button
            onClick={onClearDateFilter}
            className="p-1 rounded-full hover:bg-indigo-100 transition-colors text-indigo-500 hover:text-indigo-700"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[var(--tz-border-subtle)] px-4 items-center justify-between">
        <div className="flex gap-4">
          <button
            className={`py-3 text-sm font-semibold transition-all relative ${
              activeTab === "recent"
                ? "text-[var(--tz-text-primary)]"
                : "text-[var(--tz-text-muted)] hover:text-[var(--tz-text-secondary)]"
            }`}
            onClick={() => setActiveTab("recent")}
          >
            Recent Trades
            <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-[var(--tz-text-muted)]">
              {closedTrades.length}
            </span>
            {activeTab === "recent" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5b4fcf] rounded-full" />
            )}
          </button>
          <button
            className={`py-3 text-sm font-semibold transition-all relative ${
              activeTab === "open"
                ? "text-[var(--tz-text-primary)]"
                : "text-[var(--tz-text-muted)] hover:text-[var(--tz-text-secondary)]"
            }`}
            onClick={() => setActiveTab("open")}
          >
            Open Positions
            <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#eef0ff] text-[#5b4fcf]">
              {openTrades.length}
            </span>
            {activeTab === "open" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5b4fcf] rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Table & Empty States */}
      <div className="flex-1 overflow-auto">
        {filteredTrades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center h-full min-h-[200px]">
            <div className="w-12 h-12 rounded-full bg-[var(--tz-hover-bg)] flex items-center justify-center text-[var(--tz-text-muted)] mb-3 border border-[var(--tz-border-subtle)]">
              <Calendar size={20} />
            </div>
            <h3 className="text-sm font-bold text-[var(--tz-text-secondary)]">No Trades Found</h3>
            <p className="text-xs text-[var(--tz-text-muted)] mt-1 max-w-[240px]">
              {selectedDate
                ? `No ${
                    activeTab === "open" ? "open" : "recent"
                  } trades recorded on ${formatDateFriendly(selectedDate)}.`
                : `No active ${
                    activeTab === "open" ? "open positions" : "recent trades"
                  } available.`}
            </p>
            {selectedDate && (
              <button
                onClick={onClearDateFilter}
                className="mt-3 px-3 py-1 bg-[#5b4fcf] text-white rounded-full text-xs font-bold hover:bg-[#4a3ebd] transition-all hover:scale-105"
              >
                Clear Date Filter
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid #f0f4f8" }}>
                <th className="text-left px-4 py-3 text-[var(--tz-text-muted)] font-semibold tracking-wider uppercase text-[10px]">
                  Trade Info
                </th>
                <th className="text-left px-4 py-3 text-[var(--tz-text-muted)] font-semibold tracking-wider uppercase text-[10px]">
                  Details
                </th>
                <th className="text-right px-4 py-3 text-[var(--tz-text-muted)] font-semibold tracking-wider uppercase text-[10px]">
                  Net P&L
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.map((trade) => {
                const isLong = trade.side === "Long";
                const isPositive = trade.netPnl > 0;
                const isZero = trade.netPnl === 0;

                return (
                  <tr
                    key={trade.id}
                    onClick={() => onSelectTrade(trade)}
                    className="hover:bg-[var(--tz-hover-bg)]/70 transition-all cursor-pointer group"
                    style={{ borderBottom: "1px solid #f8fafc" }}
                  >
                    {/* Trade Info Column */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-sm text-[var(--tz-text-primary)] tracking-tight group-hover:text-[#5b4fcf] transition-colors">
                            {trade.symbol}
                          </span>
                          <span
                            className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-wide leading-none"
                            style={{
                              backgroundColor: isLong ? "#d6f0ea" : "#fde8e8",
                              color: isLong ? "#1a8a72" : "#c0392b",
                            }}
                          >
                            {trade.side}
                          </span>
                        </div>
                        <span className="text-[10px] text-[var(--tz-text-muted)] font-medium font-mono">
                          {formatDateShort(trade.date)} at {trade.time}
                        </span>
                      </div>
                    </td>

                    {/* Details Column */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-0.5 justify-center">
                        <span className="text-[var(--tz-text-secondary)] font-semibold text-[11px]">
                          {trade.qty} shares @ ${trade.entry.toFixed(2)}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-[var(--tz-text-muted)]">
                          {trade.playbook && (
                            <span className="bg-gray-100 px-1 py-0.5 rounded text-[var(--tz-text-muted)] font-medium text-[9px]">
                              {trade.playbook}
                            </span>
                          )}
                          <div className="flex items-center gap-1">
                            {trade.hasNote && (
                              <FileText size={11} className="text-[var(--tz-text-muted)]" />
                            )}
                            {trade.screenshots &&
                              trade.screenshots.length > 0 && (
                                <Image size={11} className="text-[var(--tz-text-muted)]" />
                              )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Net P&L Column */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex flex-col items-end gap-0.5">
                        <span
                          className="font-black text-sm tracking-tight flex items-center gap-0.5"
                          style={{
                            color: isZero
                              ? "#64748b"
                              : isPositive
                                ? "#26a69a"
                                : "#ef5350",
                          }}
                        >
                          {!isZero && (isPositive ? "+" : "-")}$
                          {Math.abs(trade.netPnl).toFixed(2)}
                        </span>
                        {trade.status === "Closed" && (
                          <span className="text-[9px] text-[var(--tz-text-muted)] font-bold font-mono">
                            {trade.rr > 0
                              ? `+${trade.rr.toFixed(1)}R`
                              : `${trade.rr.toFixed(1)}R`}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
