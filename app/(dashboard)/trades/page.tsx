"use client";

import {
  BarChart2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Download,
  Eye,
  Percent,
  Plus,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useTrades } from "@/components/providers/TradeProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { getPlaybooksAction } from "@/app/actions/playbooks";
import type { Trade } from "@/lib/data";
import { calculateAverageRMultiple, calculateWinRate } from "@/lib/metrics";

type SideFilter = "All" | "Long" | "Short";
type StatusFilter = "All" | "Open" | "Closed";
type DateFilter = "This Month" | "Last Month" | "All Time";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  // Trades State from Context
  const { trades, updateTrade, deleteTrade, accounts, activeAccountId } = useTrades();

  // Filters
  const [symbol, setSymbol] = useState("");
  const [side, setSide] = useState<SideFilter>("All");
  const [dateFilter, setDateFilter] = useState<DateFilter>("All Time");
  const [playbook, setPlaybook] = useState("All");
  const [status, setStatus] = useState<StatusFilter>("All");

  useEffect(() => {
    const pbParam = searchParams.get("playbook");
    if (pbParam) {
      setPlaybook(pbParam);
    }
  }, [searchParams]);

  // UI state
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<string | number | null>(null);
  const [playbookOptions, setPlaybookOptions] = useState<string[]>(["All"]);
  const [playbooks, setPlaybooks] = useState<{ id: string; name: string }[]>([]);

  // Edit Form States
  const [editSymbol, setEditSymbol] = useState("");
  const [editSide, setEditSide] = useState<"Long" | "Short">("Long");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editEntryTimeFrame, setEditEntryTimeFrame] = useState("5m");
  const [editQty, setEditQty] = useState(100);
  const [editEntry, setEditEntry] = useState("0");
  const [editExit, setEditExit] = useState("0");
  const [editRR, setEditRR] = useState("");
  const [editNetPnl, setEditNetPnl] = useState("");
  const [editPlaybookId, setEditPlaybookId] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editAccountId, setEditAccountId] = useState("");
  const [editOutcome, setEditOutcome] = useState<"Win" | "Loss" | "BE">("Win");
  const [isSaving, setIsSaving] = useState(false);

  // Sync edit form states when selectedTrade changes
  useEffect(() => {
    if (selectedTrade) {
      setEditSymbol(selectedTrade.symbol || "");
      setEditSide((selectedTrade.side as "Long" | "Short") || "Long");
      setEditDate(selectedTrade.date || "");
      setEditTime(selectedTrade.time || "");
      setEditEntryTimeFrame(selectedTrade.entryTimeFrame || "5m");
      setEditQty(selectedTrade.qty || 100);
      setEditEntry(selectedTrade.entry ? String(selectedTrade.entry) : "0");
      setEditExit(selectedTrade.exit ? String(selectedTrade.exit) : "0");
      setEditRR(selectedTrade.rr !== undefined && selectedTrade.rr !== null ? String(selectedTrade.rr) : "");
      setEditNetPnl(selectedTrade.netPnl !== undefined && selectedTrade.netPnl !== null ? String(selectedTrade.netPnl) : "");
      setEditPlaybookId(selectedTrade.playbookId || "");
      setEditTags(selectedTrade.tags ? selectedTrade.tags.join(", ") : "");
      setEditNotes(selectedTrade.notes || "");
      setEditAccountId(selectedTrade.accountId || "");
      setEditOutcome(selectedTrade.outcome || (selectedTrade.netPnl > 0 ? "Win" : selectedTrade.netPnl < 0 ? "Loss" : "BE"));
    }
  }, [selectedTrade]);

  // Fetch actual playbooks from database
  useEffect(() => {
    async function loadPlaybooks() {
      try {
        const pbs = await getPlaybooksAction();
        setPlaybooks(pbs as any);
        setPlaybookOptions(["All", ...pbs.map((pb: any) => pb.name)]);
      } catch {
        // fallback to extracting from trades
        const names = [...new Set(trades.map(t => t.playbook).filter(Boolean))];
        setPlaybookOptions(["All", ...names as string[]]);
      }
    }
    loadPlaybooks();
  }, [trades]);

  const handleSaveTrade = async (updatedTrade: Trade) => {
    await updateTrade(updatedTrade.id, updatedTrade);
  };

  const handleSaveTradeEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrade) return;

    if (!editSymbol || !editDate || !editTime || !editQty || !editNetPnl) {
      toast.error("Please fill Symbol, Date, Time, Quantity, and Net P&L.");
      return;
    }

    setIsSaving(true);
    try {
      const netPnl = parseFloat(editNetPnl) || 0;
      let parsedRr = 0;
      if (editRR) {
        const cleaned = editRR.replace(/r/i, "").trim();
        parsedRr = parseFloat(cleaned) || 0;
      }

      // Find playbook name from playbooks list
      const selectedPb = playbooks.find((p) => p.id === editPlaybookId);
      const pbName = selectedPb ? selectedPb.name : "None";

      const updatedTrade = {
        ...selectedTrade,
        symbol: editSymbol.toUpperCase(),
        side: editSide,
        date: editDate,
        time: editTime,
        entryTimeFrame: editEntryTimeFrame,
        qty: editQty,
        entry: parseFloat(editEntry) || 0,
        exit: parseFloat(editExit) || 0,
        rr: parsedRr,
        netPnl: netPnl,
        playbookId: editPlaybookId || null,
        playbook: pbName,
        tags: editTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        notes: selectedTrade.notes || "",
        hasNote: selectedTrade.hasNote || false,
        accountId: editAccountId || undefined,
        outcome: editOutcome,
      };

      await updateTrade(selectedTrade.id, updatedTrade);
      setPanelOpen(false);
      setSelectedTrade(null);
      toast.success("Trade updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update trade");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTrade = async (
    id: string | number,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this trade?")) {
      await deleteTrade(id);
    }
  };

  // Filter trades
  const filtered = useMemo(() => {
    const now = new Date();
    const thisMonth = String(now.getMonth() + 1).padStart(2, "0");
    const thisYear = String(now.getFullYear());
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = String(lastMonthDate.getMonth() + 1).padStart(2, "0");
    const lastYear = String(lastMonthDate.getFullYear());

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
          return parts[0] === thisYear && parts[1] === thisMonth;
        }
      } else if (dateFilter === "Last Month") {
        const parts = t.date.split("-");
        if (parts.length === 3) {
          return parts[0] === lastYear && parts[1] === lastMonth;
        }
      }
      return true;
    });
  }, [trades, symbol, side, playbook, status, dateFilter]);

  // Dynamic statistics calculations
  const stats = useMemo(() => {
    const closed = filtered.filter((t) => t.status === "Closed");
    const totalPnl = closed.reduce((sum, t) => sum + t.netPnl, 0);
    const winRate = calculateWinRate(filtered);
    const avgRR = calculateAverageRMultiple(filtered);
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

  // ── Sorting ──────────────────────────────────────────────────────────
  type SortKey = "date" | "symbol" | "side" | "qty" | "entry" | "exit" | "netPnl" | "rr" | "duration";
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const arr = [...filtered];
    arr.sort((a, b) => {
      let va: number | string = 0;
      let vb: number | string = 0;
      switch (sortKey) {
        case "date": va = a.date; vb = b.date; break;
        case "symbol": va = a.symbol; vb = b.symbol; break;
        case "side": va = a.side; vb = b.side; break;
        case "qty": va = a.qty; vb = b.qty; break;
        case "entry": va = a.entry; vb = b.entry; break;
        case "exit": va = a.exit || 0; vb = b.exit || 0; break;
        case "netPnl": va = a.netPnl; vb = b.netPnl; break;
        case "rr": va = a.rr; vb = b.rr; break;
        case "duration": va = a.duration; vb = b.duration; break;
      }
      if (typeof va === "string" && typeof vb === "string") {
        return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return sortDir === "asc" ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const colDefs: { label: string; sortKey?: SortKey }[] = [
    { label: "" },
    { label: "Date", sortKey: "date" },
    { label: "Time" },
    { label: "Symbol", sortKey: "symbol" },
    { label: "Side", sortKey: "side" },
    { label: "Qty", sortKey: "qty" },
    { label: "Entry", sortKey: "entry" },
    { label: "Exit", sortKey: "exit" },
    { label: "Net P&L", sortKey: "netPnl" },
    { label: "R:R", sortKey: "rr" },
    { label: "Duration", sortKey: "duration" },
    { label: "Playbook" },
    { label: "Tags" },
    { label: "Actions" },
  ];

  return (
    <div className="tz-page">
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--tz-text-primary)]">Trades</h1>
          <p className="text-sm text-[var(--tz-text-muted)] mt-0.5">
            Your complete trade history
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const headers = [
                "Date",
                "Time",
                "Symbol",
                "Side",
                "Qty",
                "Entry",
                "Exit",
                "Net P&L",
                "R:R",
                "Duration",
                "Playbook",
                "Tags",
                "Status",
              ];
              const rows = filtered.map((t) =>
                [
                  t.date,
                  t.time,
                  t.symbol,
                  t.side,
                  t.qty,
                  t.entry.toFixed(2),
                  t.exit !== null ? t.exit.toFixed(2) : "",
                  t.netPnl.toFixed(2),
                  `${t.rr.toFixed(1)}R`,
                  `${t.duration}m`,
                  t.playbook || "",
                  t.tags.join(";"),
                  t.status,
                ]
                  .map((v) => `"${String(v).replace(/"/g, '""')}"`)
                  .join(","),
              );
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
            className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium border border-[var(--tz-border)] bg-[var(--tz-bg-card)] text-[var(--tz-text-secondary)] hover:bg-[var(--tz-hover-bg)] transition-colors"
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
      <div className="tz-card px-4 py-3 bg-[var(--tz-bg-card)]">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Symbol search */}
          <div className="relative">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--tz-text-muted)]"
            />
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="Symbol…"
              className="pl-8 pr-3 h-8 rounded-lg border border-[var(--tz-border)] bg-[var(--tz-bg-card)] text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200 w-36"
            />
          </div>

          {/* Side */}
          <div className="relative">
            <select
              value={side}
              onChange={(e) => setSide(e.target.value as SideFilter)}
              className="h-8 pl-3 pr-7 rounded-lg border border-[var(--tz-border)] bg-[var(--tz-bg-card)] text-xs text-[var(--tz-text-secondary)] focus:outline-none focus:ring-2 focus:ring-indigo-200 appearance-none cursor-pointer"
            >
              {(["All", "Long", "Short"] as SideFilter[]).map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--tz-text-muted)] pointer-events-none"
            />
          </div>

          {/* Date range */}
          <div className="flex rounded-lg overflow-hidden border border-[var(--tz-border)] bg-[var(--tz-bg-card)]">
            {DATE_OPTS.map((d) => (
              <button
                key={d}
                onClick={() => setDateFilter(d)}
                className={`px-3 h-8 text-xs font-medium transition-colors border-r border-[var(--tz-border)] last:border-0 ${
                  dateFilter === d
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-[var(--tz-text-muted)] hover:bg-[var(--tz-hover-bg)]"
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
              className="h-8 pl-3 pr-7 rounded-lg border border-[var(--tz-border)] bg-[var(--tz-bg-card)] text-xs text-[var(--tz-text-secondary)] focus:outline-none focus:ring-2 focus:ring-indigo-200 appearance-none cursor-pointer"
            >
              {playbookOptions.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--tz-text-muted)] pointer-events-none"
            />
          </div>

          {/* Status */}
          <div className="flex rounded-lg overflow-hidden border border-[var(--tz-border)] bg-[var(--tz-bg-card)]">
            {(["All", "Open", "Closed"] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 h-8 text-xs font-medium transition-colors border-r border-[var(--tz-border)] last:border-0 ${
                  status === s
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-[var(--tz-text-muted)] hover:bg-[var(--tz-hover-bg)]"
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
          {
            label: "Total Trades",
            value: String(stats.totalTrades),
            icon: BarChart2,
            color: "#6366f1",
          },
          {
            label: "Total P&L",
            value: fmtPnl(stats.totalPnl),
            icon: DollarSign,
            color: stats.totalPnl >= 0 ? "#26a69a" : "#ef5350",
          },
          {
            label: "Win Rate",
            value: `${stats.winRate.toFixed(1)}%`,
            icon: Percent,
            color: "#26a69a",
          },
          {
            label: "Avg R:R",
            value: `${stats.avgRR.toFixed(1)}R`,
            icon: TrendingUp,
            color: "#26a69a",
          },
          {
            label: "Avg Trade",
            value: fmtPnl(stats.avgTrade),
            icon: DollarSign,
            color: stats.avgTrade >= 0 ? "#26a69a" : "#ef5350",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="tz-card p-3.5 flex items-center gap-3 bg-[var(--tz-bg-card)]"
          >
            <div
              className="rounded-lg p-2 flex-shrink-0"
              style={{ background: `${s.color}18` }}
            >
              <s.icon size={15} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-[11px] text-[var(--tz-text-muted)] font-medium">{s.label}</p>
              <p className="text-sm font-bold text-[var(--tz-text-primary)]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Trade Table ──────────────────────────────────────────────── */}
      <div className="tz-card overflow-hidden bg-[var(--tz-bg-card)]">
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ minWidth: "1100px" }}>
            <thead>
              <tr
                style={{
                  background: "var(--tz-hover-bg)",
                  borderBottom: "1px solid var(--tz-border-subtle)",
                }}
              >
                {colDefs.map((col, i) => (
                  <th
                    key={i}
                    onClick={col.sortKey ? () => handleSort(col.sortKey!) : undefined}
                    className={`px-3 py-2.5 text-left font-semibold text-[var(--tz-text-muted)] whitespace-nowrap ${
                      col.sortKey ? "cursor-pointer hover:text-[var(--tz-text-secondary)] select-none" : ""
                    }`}
                  >
                    {col.label === "" && i === 0 ? (
                      <input type="checkbox" className="rounded" />
                    ) : (
                      <span className="flex items-center gap-1">
                        {col.label}
                        {col.sortKey && sortKey === col.sortKey && (
                          <span className="text-[9px]">{sortDir === "asc" ? "▲" : "▼"}</span>
                        )}
                      </span>
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
                      <p className="text-[var(--tz-text-muted)] font-medium">
                        No trades found
                      </p>
                      <p className="text-gray-300 text-[11px]">
                        Try adjusting your filters
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                sorted.map((trade) => {
                  const _isLong = trade.side === "Long";
                  return (
                    <tr
                      key={trade.id}
                      className="transition-colors cursor-pointer"
                      style={{
                        borderBottom: "1px solid var(--tz-border-subtle)",
                        background:
                          hoveredRow === trade.id ? "var(--tz-hover-bg)" : undefined,
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
                      <td className="px-3 py-3 text-[var(--tz-text-muted)] whitespace-nowrap">
                        {formatDateShort(trade.date)}
                      </td>
                      {/* Time */}
                      <td className="px-3 py-3 text-[var(--tz-text-muted)]">{trade.time}</td>
                      {/* Symbol */}
                      <td className="px-3 py-3 font-bold text-[var(--tz-text-primary)]">
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
                      <td className="px-3 py-3 text-[var(--tz-text-secondary)]">{trade.qty}</td>
                      {/* Entry */}
                      <td className="px-3 py-3 text-[var(--tz-text-secondary)]">
                        {trade.entry > 0 ? `$${trade.entry.toFixed(2)}` : "—"}
                      </td>
                      {/* Exit */}
                      <td className="px-3 py-3 text-[var(--tz-text-secondary)]">
                        {trade.exit && trade.exit > 0
                          ? `$${trade.exit.toFixed(2)}`
                          : "—"}
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
                      <td className="px-3 py-3 text-[var(--tz-text-muted)]">
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
                              style={{
                                background: "#f0f4f8",
                                color: "#6b7280",
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                          {trade.tags.length > 2 && (
                            <span className="text-[10px] text-[var(--tz-text-muted)] font-bold">
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
                            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-indigo-50 text-[var(--tz-text-muted)] hover:text-indigo-600 transition-colors"
                            title="View / Edit"
                          >
                            <Eye size={12} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteTrade(trade.id, e)}
                            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-red-50 text-[var(--tz-text-muted)] hover:text-red-500 transition-colors"
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
          <p className="text-xs text-[var(--tz-text-muted)]">
            Showing{" "}
            <span className="font-semibold text-[var(--tz-text-secondary)]">
              1–{filtered.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[var(--tz-text-secondary)]">
              {filtered.length}
            </span>{" "}
            trades
          </p>
          <div className="flex items-center gap-1">
            <button
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--tz-border)] bg-[var(--tz-bg-card)] text-[var(--tz-text-muted)] hover:bg-[var(--tz-hover-bg)] transition-colors disabled:opacity-40"
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
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--tz-border)] bg-[var(--tz-bg-card)] text-[var(--tz-text-muted)] hover:bg-[var(--tz-hover-bg)] transition-colors disabled:opacity-40"
              disabled
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Trade Modal */}
      {panelOpen && selectedTrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[var(--tz-bg-card)] border border-[var(--tz-border)] w-full max-w-lg rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[var(--tz-border-subtle)]">
              <h2 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">
                Edit Trade
              </h2>
              <button
                type="button"
                onClick={() => {
                  setPanelOpen(false);
                  setSelectedTrade(null);
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-800 dark:hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form
              onSubmit={handleSaveTradeEdit}
              className="p-6 space-y-4 overflow-y-auto flex-1 text-xs"
            >
              {/* Account Selector */}
              {accounts && accounts.length > 1 && (
                <div className="space-y-1 mb-2">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    Trading Account
                  </label>
                  <select
                    value={editAccountId || activeAccountId || ""}
                    onChange={(e) => setEditAccountId(e.target.value)}
                    className="w-full h-9 px-2 rounded-lg border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white dark:bg-white/5 dark:text-white text-xs font-semibold"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} (${acc.startingBalance.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Symbol */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    Symbol
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TSLA"
                    value={editSymbol}
                    onChange={(e) =>
                      setEditSymbol(e.target.value.toUpperCase())
                    }
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                  />
                </div>

                {/* Side */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Side
                  </label>
                  <div className="flex bg-gray-100 dark:bg-white/5 p-0.5 rounded-lg border border-gray-200/50 dark:border-white/10 h-9">
                    <button
                      type="button"
                      onClick={() => setEditSide("Long")}
                      className={`flex-1 rounded-md text-xs font-bold transition-all ${
                        editSide === "Long"
                          ? "bg-white dark:bg-white/10 text-emerald-700 dark:text-emerald-400 shadow-sm border border-gray-200/20 dark:border-white/10"
                          : "text-gray-400 hover:text-gray-600 dark:hover:text-white"
                      }`}
                    >
                      Long
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditSide("Short")}
                      className={`flex-1 rounded-md text-xs font-bold transition-all ${
                        editSide === "Short"
                          ? "bg-white dark:bg-white/10 text-rose-700 dark:text-rose-400 shadow-sm border border-gray-200/20 dark:border-white/10"
                          : "text-gray-400 hover:text-gray-600 dark:hover:text-white"
                      }`}
                    >
                      Short
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Date */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Time */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Time
                  </label>
                  <input
                    type="time"
                    required
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Entry Time Frame */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Entry Time Frame
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1m, 5m, 1h"
                    value={editEntryTimeFrame}
                    onChange={(e) => setEditEntryTimeFrame(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                  />
                </div>

                {/* Qty */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Quantity / Lot Size
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editQty}
                    onChange={(e) =>
                      setEditQty(parseInt(e.target.value, 10) || 0)
                    }
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Entry Price */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Entry Price ($)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editEntry}
                    onChange={(e) => setEditEntry(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>

                {/* Exit Price */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Exit Price ($)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editExit}
                    onChange={(e) => setEditExit(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* R:R */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    R:R (Risk to Reward)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2.5 or -1R"
                    value={editRR}
                    onChange={(e) => setEditRR(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>

                {/* Net P&L */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Net P&L ($)
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 500"
                    value={editNetPnl}
                    onChange={(e) => {
                      setEditNetPnl(e.target.value);
                      const num = parseFloat(e.target.value);
                      if (!isNaN(num)) {
                        if (num > 0) setEditOutcome("Win");
                        else if (num < 0) setEditOutcome("Loss");
                        else setEditOutcome("BE");
                      }
                    }}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>

                {/* Outcome */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Outcome
                  </label>
                  <div className="flex bg-gray-100 dark:bg-white/5 p-0.5 rounded-lg border border-gray-200/50 dark:border-white/10 h-9">
                    <button
                      type="button"
                      onClick={() => setEditOutcome("Win")}
                      className={`flex-1 rounded-md text-[10px] font-bold transition-all ${
                        editOutcome === "Win"
                          ? "bg-white dark:bg-white/10 text-emerald-700 dark:text-emerald-400 shadow-sm border border-gray-200/20 dark:border-white/10"
                          : "text-gray-400 hover:text-gray-600 dark:hover:text-white"
                      }`}
                    >
                      Win
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditOutcome("Loss")}
                      className={`flex-1 rounded-md text-[10px] font-bold transition-all ${
                        editOutcome === "Loss"
                          ? "bg-white dark:bg-white/10 text-rose-700 dark:text-rose-400 shadow-sm border border-gray-200/20 dark:border-white/10"
                          : "text-gray-400 hover:text-gray-600 dark:hover:text-white"
                      }`}
                    >
                      Loss
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditOutcome("BE")}
                      className={`flex-1 rounded-md text-[10px] font-bold transition-all ${
                        editOutcome === "BE"
                          ? "bg-white dark:bg-white/10 text-amber-700 dark:text-amber-400 shadow-sm border border-gray-200/20 dark:border-white/10"
                          : "text-gray-400 hover:text-gray-600 dark:hover:text-white"
                      }`}
                    >
                      BE
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Playbook */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Playbook
                  </label>
                  <select
                    value={editPlaybookId}
                    onChange={(e) => setEditPlaybookId(e.target.value)}
                    className="w-full h-9 px-2 rounded-lg border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white dark:bg-white/5 dark:text-white text-xs font-semibold"
                  >
                    <option value="">No Playbook</option>
                    {playbooks.map((pb) => (
                      <option key={pb.id} value={pb.id}>
                        {pb.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. trend, breakout, morning"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>



              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 dark:border-[var(--tz-border-subtle)]">
                <button
                  type="button"
                  onClick={() => {
                    setPanelOpen(false);
                    setSelectedTrade(null);
                  }}
                  className="px-4 h-9 rounded-lg border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPanelOpen(false);
                    router.push(`/journal?date=${selectedTrade.date}`);
                  }}
                  className="px-4 h-9 rounded-lg border border-indigo-200 dark:border-indigo-500/25 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-colors"
                >
                  Open Journal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
                    boxShadow: "0 4px 14px 0 rgba(99, 102, 241, 0.2)",
                  }}
                >
                  {isSaving ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
