"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Upload,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  X,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart2,
  DollarSign,
  Percent,
  ChevronDown,
  Plus,
} from "lucide-react";
import { TradeDetailDrawer } from "@/components/dashboard/TradeDetailDrawer";
import { Trade } from "@/lib/data";
import { useTrades } from "@/components/providers/TradeProvider";
import { toast } from "sonner";

type SideFilter = "All" | "Long" | "Short";
type StatusFilter = "All" | "Open" | "Closed";
type DateFilter = "This Month" | "Last Month" | "All Time";

const PLAYBOOKS = [
  "All",
  "Breakout",
  "VWAP Rejection",
  "Gap & Go",
  "Reversal",
  "Mean Reversion",
];
const DATE_OPTS: DateFilter[] = ["This Month", "Last Month", "All Time"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtPnl = (v: number) => {
  const isNeg = v < 0;
  const abs = Math.abs(v);
  return `${isNeg ? "-" : "+"}$${abs.toFixed(2)}`;
};

const pnlStyle = (v: number) => ({
  color: v === 0 ? "#64748b" : v > 0 ? "#26a69a" : "#ef5350",
});

const sideBadge = (side: "Long" | "Short") => ({
  background: side === "Long" ? "#d6f0ea" : "#fde8e8",
  color: side === "Long" ? "#1a8a72" : "#c0392b",
});

function formatDateShort(dateStr: string): string {
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[1]}/${parts[2]}/${parts[0]}`;
  }
  return dateStr;
}

export default function TradesPage() {
  // Trades State from Context
  const { trades, updateTrade, deleteTrade } = useTrades();

  // Filters
  const [symbol, setSymbol] = useState("");
  const [side, setSide] = useState<SideFilter>("All");
  const [dateFilter, setDateFilter] = useState<DateFilter>("All Time");
  const [playbook, setPlaybook] = useState("All");
  const [status, setStatus] = useState<StatusFilter>("All");

  // UI state
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<string | number | null>(null);

  const handleSaveTrade = async (updatedTrade: Trade) => {
    await updateTrade(updatedTrade.id, updatedTrade);
  };

  const handleDeleteTrade = async (id: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this trade?")) {
      await deleteTrade(id);
    }
  };

  // Filter trades
  const filtered = useMemo(() => {
    return trades.filter((t) => {
      if (symbol && !t.symbol.toLowerCase().includes(symbol.toLowerCase()))
        return false;
      if (side !== "All" && t.side !== side) return false;
      if (playbook !== "All" && t.playbook !== playbook) return false;
      if (status !== "All" && t.status !== status) return false;
      
      // Date filter
      if (dateFilter === "This Month") {
        const parts = t.date.split("-");
        if (parts.length === 3) {
          // Default data is Dec 2023
          return parts[0] === "2023" && parts[1] === "12";
        }
      } else if (dateFilter === "Last Month") {
        const parts = t.date.split("-");
        if (parts.length === 3) {
          return parts[0] === "2023" && parts[1] === "11";
        }
      }
      return true;
    });
  }, [trades, symbol, side, playbook, status, dateFilter]);

  // Dynamic statistics calculations
  const stats = useMemo(() => {
    const closed = filtered.filter((t) => t.status === "Closed");
    const totalPnl = closed.reduce((sum, t) => sum + t.netPnl, 0);
    const winTrades = closed.filter((t) => t.netPnl > 0);
    const winRate = closed.length > 0 ? (winTrades.length / closed.length) * 100 : 0;
    const avgRR = closed.length > 0 ? closed.reduce((sum, t) => sum + t.rr, 0) / closed.length : 0;
    const avgTrade = closed.length > 0 ? totalPnl / closed.length : 0;

    return {
      totalTrades: filtered.length,
      totalPnl,
      winRate,
      avgRR,
      avgTrade,
    };
  }, [filtered]);

  const clearFilters = () => {
    setSymbol("");
    setSide("All");
    setDateFilter("All Time");
    setPlaybook("All");
    setStatus("All");
    toast.info("Filters cleared");
  };

  const handleRowClick = (trade: Trade) => {
    setSelectedTrade(trade);
    setPanelOpen(true);
  };

  const cols = [
    "",
    "Date",
    "Time",
    "Symbol",
    "Side",
    "Qty",
    "Entry",
    "Exit",
    "Gross P&L",
    "Comm.",
    "Net P&L",
    "R:R",
    "Duration",
    "Playbook",
    "Tags",
    "Actions",
  ];

  return (
    <div className="tz-page">
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Trades</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Your complete trade history
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const headers = ["Date","Time","Symbol","Side","Qty","Entry","Exit","Gross P&L","Commissions","Net P&L","R:R","Duration","Playbook","Tags","Status"];
              const rows = filtered.map((t) => [
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
              link.download = "trades_export.csv";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              toast.success(`Exported ${filtered.length} trades to CSV`);
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

      {/* ── Filter Bar ───────────────────────────────────────────────── */}
      <div className="tz-card px-4 py-3 bg-white">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Symbol search */}
          <div className="relative">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="Symbol…"
              className="pl-8 pr-3 h-8 rounded-lg border border-gray-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200 w-36"
            />
          </div>

          {/* Side */}
          <div className="relative">
            <select
              value={side}
              onChange={(e) => setSide(e.target.value as SideFilter)}
              className="h-8 pl-3 pr-7 rounded-lg border border-gray-200 bg-white text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-200 appearance-none cursor-pointer"
            >
              {(["All", "Long", "Short"] as SideFilter[]).map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>

          {/* Date range */}
          <div className="flex rounded-lg overflow-hidden border border-gray-200 bg-white">
            {DATE_OPTS.map((d) => (
              <button
                key={d}
                onClick={() => setDateFilter(d)}
                className={`px-3 h-8 text-xs font-medium transition-colors border-r border-gray-200 last:border-0 ${
                  dateFilter === d
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Playbook */}
          <div className="relative">
            <select
              value={playbook}
              onChange={(e) => setPlaybook(e.target.value)}
              className="h-8 pl-3 pr-7 rounded-lg border border-gray-200 bg-white text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-200 appearance-none cursor-pointer"
            >
              {PLAYBOOKS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>

          {/* Status */}
          <div className="flex rounded-lg overflow-hidden border border-gray-200 bg-white">
            {(["All", "Open", "Closed"] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 h-8 text-xs font-medium transition-colors border-r border-gray-200 last:border-0 ${
                  status === s
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={clearFilters}
            className="ml-auto text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors flex items-center gap-1"
          >
            <X size={12} /> Clear filters
          </button>
        </div>
      </div>

      {/* ── Summary Strip ────────────────────────────────────────────── */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Total Trades", value: String(stats.totalTrades), icon: BarChart2, color: "#6366f1" },
          {
            label: "Total P&L",
            value: fmtPnl(stats.totalPnl),
            icon: DollarSign,
            color: stats.totalPnl >= 0 ? "#26a69a" : "#ef5350",
          },
          { label: "Win Rate", value: `${stats.winRate.toFixed(1)}%`, icon: Percent, color: "#26a69a" },
          { label: "Avg R:R", value: `${stats.avgRR.toFixed(1)}R`, icon: TrendingUp, color: "#26a69a" },
          { label: "Avg Trade", value: fmtPnl(stats.avgTrade), icon: DollarSign, color: stats.avgTrade >= 0 ? "#26a69a" : "#ef5350" },
        ].map((s) => (
          <div key={s.label} className="tz-card p-3.5 flex items-center gap-3 bg-white">
            <div
              className="rounded-lg p-2 flex-shrink-0"
              style={{ background: `${s.color}18` }}
            >
              <s.icon size={15} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 font-medium">{s.label}</p>
              <p className="text-sm font-bold text-gray-800">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Trade Table ──────────────────────────────────────────────── */}
      <div className="tz-card overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ minWidth: "1100px" }}>
            <thead>
              <tr
                style={{
                  background: "#f8fafc",
                  borderBottom: "1px solid #f0f4f8",
                }}
              >
                {cols.map((col, i) => (
                  <th
                    key={i}
                    className="px-3 py-2.5 text-left font-semibold text-gray-400 whitespace-nowrap"
                  >
                    {col === "" && i === 0 ? (
                      <input type="checkbox" className="rounded" />
                    ) : (
                      col
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={16} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <TrendingDown size={28} className="text-gray-300" />
                      <p className="text-gray-400 font-medium">
                        No trades found
                      </p>
                      <p className="text-gray-300 text-[11px]">
                        Try adjusting your filters
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((trade) => {
                  const isLong = trade.side === "Long";
                  return (
                    <tr
                      key={trade.id}
                      className="transition-colors cursor-pointer"
                      style={{
                        borderBottom: "1px solid #f8fafc",
                        background:
                          hoveredRow === trade.id ? "#f8faff" : undefined,
                      }}
                      onMouseEnter={() => setHoveredRow(trade.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      onClick={() => handleRowClick(trade)}
                    >
                      {/* Checkbox */}
                      <td
                        className="px-3 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input type="checkbox" className="rounded" />
                      </td>
                      {/* Date */}
                      <td className="px-3 py-3 text-gray-500 whitespace-nowrap">
                        {formatDateShort(trade.date)}
                      </td>
                      {/* Time */}
                      <td className="px-3 py-3 text-gray-500">{trade.time}</td>
                      {/* Symbol */}
                      <td className="px-3 py-3 font-bold text-gray-800">
                        {trade.symbol}
                      </td>
                      {/* Side */}
                      <td className="px-3 py-3">
                        <span
                          className="px-2 py-0.5 rounded text-[11px] font-semibold"
                          style={sideBadge(trade.side)}
                        >
                          {trade.side}
                        </span>
                      </td>
                      {/* Qty */}
                      <td className="px-3 py-3 text-gray-600">{trade.qty}</td>
                      {/* Entry */}
                      <td className="px-3 py-3 text-gray-600">
                        ${trade.entry.toFixed(2)}
                      </td>
                      {/* Exit */}
                      <td className="px-3 py-3 text-gray-600">
                        {trade.exit !== null ? `$${trade.exit.toFixed(2)}` : "—"}
                      </td>
                      {/* Gross P&L */}
                      <td
                        className="px-3 py-3 font-semibold"
                        style={pnlStyle(trade.grossPnl)}
                      >
                        {fmtPnl(trade.grossPnl)}
                      </td>
                      {/* Commissions */}
                      <td className="px-3 py-3 text-gray-400">
                        -${trade.commissions.toFixed(2)}
                      </td>
                      {/* Net P&L */}
                      <td
                        className="px-3 py-3 font-bold"
                        style={pnlStyle(trade.netPnl)}
                      >
                        {fmtPnl(trade.netPnl)}
                      </td>
                      {/* R:R */}
                      <td
                        className="px-3 py-3 font-semibold"
                        style={pnlStyle(trade.rr)}
                      >
                        {trade.status === "Closed" ? (
                          <>
                            {trade.rr >= 0 ? "+" : ""}
                            {trade.rr.toFixed(1)}R
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                      {/* Duration */}
                      <td className="px-3 py-3 text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={10} className="text-gray-300" />
                          {trade.duration}m
                        </span>
                      </td>
                      {/* Playbook */}
                      <td className="px-3 py-3">
                        {trade.playbook ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-600 border border-indigo-100">
                            {trade.playbook}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      {/* Tags */}
                      <td className="px-3 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {trade.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                              style={{ background: "#f0f4f8", color: "#6b7280" }}
                            >
                              {tag}
                            </span>
                          ))}
                          {trade.tags.length > 2 && (
                            <span className="text-[10px] text-gray-400 font-bold">
                              +{trade.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      {/* Actions */}
                      <td
                        className="px-3 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div
                          className="flex items-center gap-1 transition-opacity"
                          style={{ opacity: hoveredRow === trade.id ? 1 : 0 }}
                        >
                          <button
                            onClick={() => handleRowClick(trade)}
                            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors"
                            title="View / Edit"
                          >
                            <Eye size={12} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteTrade(trade.id, e)}
                            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ─────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderTop: "1px solid #f0f4f8" }}
        >
          <p className="text-xs text-gray-400">
            Showing{" "}
            <span className="font-semibold text-gray-600">
              1–{filtered.length}
            </span>{" "}
            of <span className="font-semibold text-gray-600">{filtered.length}</span> trades
          </p>
          <div className="flex items-center gap-1">
            <button
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40"
              disabled
            >
              <ChevronLeft size={14} />
            </button>
            <button
              className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold text-white"
              style={{
                background: "linear-gradient(135deg,#6366f1,#818cf8)",
              }}
            >
              1
            </button>
            <button
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40"
              disabled
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Detail Drawer ─────────────────────────────────────────────── */}
      <TradeDetailDrawer
        trade={selectedTrade}
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        onSave={handleSaveTrade}
      />
    </div>
  );
}
