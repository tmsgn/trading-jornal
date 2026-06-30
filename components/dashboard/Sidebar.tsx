"use client";

import {
  BarChart3,
  BookOpen,
  Brain,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutDashboard,
  Package,
  Plus,
  Settings,
  TrendingUp,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { logout } from "@/app/(auth)/login/actions";
import { getPlaybooksAction } from "@/app/actions/playbooks";
import { useTrades } from "@/components/providers/TradeProvider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BRAND } from "@/lib/data";

const topNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: BookOpen, label: "Journal", href: "/journal" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: TrendingUp, label: "Trades", href: "/trades" },
  { icon: FileText, label: "Reports", href: "/reports" },
  { icon: Brain, label: "AI Insights", href: "/ai-insights" },
  { icon: Package, label: "Playbooks", href: "/playbooks" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { addTrade, accounts, activeAccountId, profile } = useTrades();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSymbol, setFormSymbol] = useState("");
  const [formSide, setFormSide] = useState<"Long" | "Short">("Long");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("09:30");
  const [formEntryTimeFrame, setFormEntryTimeFrame] = useState("5m");
  const [formQty, setFormQty] = useState(100);
  const [formRR, setFormRR] = useState<string>("");
  const [formNetPnl, setFormNetPnl] = useState<string>("");
  const [formTags, setFormTags] = useState("");
  const [formAccountId, setFormAccountId] = useState<string>("");
  const [formPlaybookId, setFormPlaybookId] = useState<string>("");
  const [formOutcome, setFormOutcome] = useState<"Win" | "Loss" | "BE">("Win");

  const [playbooks, setPlaybooks] = useState<{ id: string; name: string }[]>(
    [],
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const { parseCSV } = await import("@/lib/parsers");
        const { aggregateExecutions } = await import("@/lib/aggregator");
        const parsed = parseCSV(text, "Generic");
        
        if (parsed.errors.length > 0) {
          toast.warning(`Imported ${parsed.executions.length} executions, but found ${parsed.errors.length} errors.`);
          console.warn("CSV Import Errors:", parsed.errors);
        }
        
        const aggregated = aggregateExecutions(parsed.executions);
        for (const t of aggregated) {
          await addTrade({ ...t, id: Date.now() + Math.random() } as any);
        }
        toast.success(`Imported ${aggregated.length} trades from CSV!`);
        setIsAddModalOpen(false);
      } catch (_err) {
        toast.error("Failed to parse CSV file.");
      }
    };
    reader.readAsText(file);
  };

  const _resetForm = () => {
    setFormSymbol("");
    setFormSide("Long");
    setFormEntryTimeFrame("5m");
    setFormQty(100);
    setFormRR("");
    setFormNetPnl("");
    setFormTags("");
    setFormPlaybookId("");
    setFormOutcome("Win");
  };


  // Set default date on client to avoid hydration mismatch
  useEffect(() => {
    const d = new Date();
    setFormDate(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate(),
      ).padStart(2, "0")}`,
    );
  }, []);

  // Load sidebar collapsed state on mount to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tz_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    }

    // Fetch playbooks
    getPlaybooksAction().then((data) => {
      setPlaybooks(data);
    });
  }, []);

  // Listen for global open modal events
  useEffect(() => {
    const handleOpenModal = () => {
      setIsAddModalOpen(true);
    };
    window.addEventListener("tz_open_add_trade", handleOpenModal);
    return () => {
      window.removeEventListener("tz_open_add_trade", handleOpenModal);
    };
  }, []);

  const toggleSidebar = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    if (typeof window !== "undefined") {
      localStorage.setItem("tz_sidebar_collapsed", String(nextState));
      // Dispatch resize event
      window.dispatchEvent(new Event("resize"));
    }
  };

  const handleAddTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSymbol || !formDate || !formTime || !formQty || !formNetPnl) {
      toast.error("Please fill Symbol, Date, Time, Quantity, and Net P&L.");
      return;
    }

    setIsSubmitting(true);
    try {
      const netPnl = parseFloat(formNetPnl) || 0;
      
      let parsedRr = 0;
      if (formRR) {
        const cleaned = formRR.replace(/r/i, "").trim();
        parsedRr = parseFloat(cleaned) || 0;
      }

      const newTrade = {
        date: formDate,
        time: formTime,
        symbol: formSymbol.toUpperCase(),
        side: formSide,
        qty: formQty,
        entry: 0,
        exit: 0,
        netPnl: netPnl,
        rr: parsedRr,
        duration: 0,
        playbookId: formPlaybookId || null,
        accountId: formAccountId || activeAccountId || undefined,
        initialRisk: 0,
        entryTimeFrame: formEntryTimeFrame,
        tags: formTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        hasNote: false,
        status: "Closed" as const,
        outcome: formOutcome,
      };

      await addTrade(newTrade as any);

      // Reset form
      setFormSymbol("");
      setFormSide("Long");
      setFormEntryTimeFrame("5m");
      setFormQty(100);
      setFormRR("");
      setFormNetPnl("");
      setFormTags("");
      setFormPlaybookId("");
      setFormOutcome("Win");
      setIsAddModalOpen(false);

      toast.success(`Trade for ${newTrade.symbol} added successfully!`);
    } catch (err) {
      toast.error("Failed to add trade");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <aside
        className={`flex flex-col h-full py-3 gap-1 flex-shrink-0 transition-all duration-300 bg-[var(--tz-sidebar-bg)] border-r border-[var(--tz-border-subtle)] ${
          isCollapsed ? "w-[56px] items-center" : "w-[240px] px-3"
        }`}
      >
        {/* Logo Area */}
        <Link href="/" className="w-full">
          {isCollapsed ? (
            <div
              className="flex items-center justify-center w-9 h-9 rounded-lg mb-3 cursor-pointer hover:opacity-90 transition-all mx-auto shadow-sm"
              style={{
                background: "#228be6",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L4 6v12l8 4 8-4V6L12 2z"
                  fill="white"
                  fillOpacity="0.9"
                />
                <path
                  d="M12 2v18M4 6l8 4 8-4"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeOpacity="0.4"
                />
              </svg>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 px-3 py-1.5 mb-3 cursor-pointer hover:opacity-90 transition-all">
              <div
                className="flex items-center justify-center w-8 h-8 rounded-lg shadow-sm"
                style={{
                  background: "#228be6",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L4 6v12l8 4 8-4V6L12 2z"
                    fill="white"
                    fillOpacity="0.9"
                  />
                  <path
                    d="M12 2v18M4 6l8 4 8-4"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeOpacity="0.4"
                  />
                </svg>
              </div>
              <span className="font-bold text-[var(--tz-sidebar-text)] text-[17px] tracking-tight">
                {BRAND.name.substring(0, 4)}
                <span className="text-emerald-500">
                  {BRAND.name.substring(4)}
                </span>
              </span>
            </div>
          )}
        </Link>

        {/* Add Button */}
        <TooltipProvider delayDuration={isCollapsed ? 100 : 999999}>
          <Tooltip>
            <TooltipTrigger asChild>
              {isCollapsed ? (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center justify-center w-9 h-9 rounded-lg mb-3 transition-all hover:opacity-90 mx-auto shadow-sm"
                  style={{
                    background:
                      "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
                  }}
                >
                  <Plus size={18} color="white" />
                </button>
              ) : (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center justify-center w-full h-9 rounded-lg mb-3 transition-all hover:opacity-90 gap-1.5 px-4 font-semibold text-xs text-white shadow-sm"
                  style={{
                    background:
                      "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
                  }}
                >
                  <Plus size={14} color="white" />
                  <span>Add Trade</span>
                </button>
              )}
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">Add Trade</TooltipContent>
            )}
          </Tooltip>

          {/* Top navigation */}
          <nav className="flex flex-col gap-1 w-full flex-1">
            {topNavItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Tooltip key={item.label}>
                  <TooltipTrigger asChild>
                    <Link href={item.href} className="w-full">
                      {isCollapsed ? (
                        <div
                          className={`tz-nav-item mx-auto ${isActive ? "active" : ""}`}
                        >
                          <item.icon size={19} />
                        </div>
                      ) : (
                        <div
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer font-medium ${
                            isActive
                              ? "bg-white/10 text-white"
                              : "text-[var(--tz-sidebar-text)] hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <item.icon size={18} className="flex-shrink-0" />
                          <span className="text-xs tracking-wide">
                            {item.label}
                          </span>
                        </div>
                      )}
                    </Link>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="flex flex-col gap-2 mt-auto w-full items-center">
            {/* Toggle button */}
            <button
              onClick={toggleSidebar}
              className={`flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/5 text-[var(--tz-sidebar-text)] hover:text-white transition-all mb-1 ${
                isCollapsed ? "" : "w-full justify-start px-3 gap-3"
              }`}
            >
              {isCollapsed ? (
                <ChevronRight size={18} />
              ) : (
                <>
                  <ChevronLeft size={18} className="flex-shrink-0" />
                  <span className="text-xs font-medium tracking-wide">
                    Collapse
                  </span>
                </>
              )}
            </button>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/settings" className="w-full">
                  {isCollapsed ? (
                    <div className="tz-nav-item mx-auto">
                      <Settings size={19} />
                    </div>
                  ) : (
                    <div
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer font-medium ${
                        pathname === "/settings"
                          ? "bg-white/10 text-white"
                          : "text-[var(--tz-sidebar-text)] hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Settings size={18} className="flex-shrink-0" />
                      <span className="text-xs tracking-wide">Settings</span>
                    </div>
                  )}
                </Link>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right">Settings</TooltipContent>
              )}
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-full mt-1">
                  {isCollapsed ? (
                    <button
                      className="flex justify-center w-full"
                      onClick={() => logout()}
                    >
                      <Avatar className="w-8 h-8 cursor-pointer shadow-sm border border-emerald-500/20">
                        <AvatarFallback
                          className="text-xs font-semibold"
                          style={{
                            background:
                              "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
                            color: "#ffffff",
                          }}
                        >
                          {(
                            profile?.firstName?.[0] ||
                            profile?.email?.[0] ||
                            "U"
                          ).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  ) : (
                    <div
                      className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 mx-1 cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => logout()}
                      title="Click to Logout"
                    >
                      <Avatar className="w-8 h-8 flex-shrink-0 shadow-sm border border-emerald-500/20">
                        <AvatarFallback
                          className="text-xs font-semibold"
                          style={{
                            background:
                              "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
                            color: "#ffffff",
                          }}
                        >
                          {(
                            profile?.firstName?.[0] ||
                            profile?.email?.[0] ||
                            "U"
                          ).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs font-semibold text-white truncate leading-tight">
                          {profile?.firstName
                            ? `${profile.firstName} ${profile.lastName || ""}`
                            : profile?.email?.split("@")[0]}
                        </span>
                        <span className="text-[10px] text-[var(--tz-sidebar-text)] truncate leading-none mt-0.5">
                          {profile?.email}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right">Profile</TooltipContent>
              )}
            </Tooltip>
          </div>
        </TooltipProvider>
      </aside>

      {/* Add Trade Modal Popup */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-[var(--tz-card-bg)] rounded-xl shadow-2xl overflow-hidden border border-gray-100 dark:border-[var(--tz-border-subtle)] flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[var(--tz-border-subtle)] bg-gray-50 dark:bg-white/5">
              <div>
                <h3 className="text-base font-bold text-gray-950 dark:text-white">
                  Add New Trade
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Manually record a trade to your journal
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form
              onSubmit={handleAddTrade}
              className="p-6 space-y-4 overflow-y-auto flex-1 text-xs"
            >
              {/* CSV Upload */}
              <div className="mb-4 p-4 border border-dashed border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-500/10 rounded-lg flex flex-col items-center justify-center text-center">
                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-2">
                  Import from CSV
                </p>
                <label className="cursor-pointer bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors">
                  Upload CSV
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-2">
                  Supports generic CSV format with trade data
                </p>
              </div>

              {/* Account Selector */}
              {accounts.length > 1 && (
                <div className="space-y-1 mb-2">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    Trading Account
                  </label>
                  <select
                    value={formAccountId || activeAccountId || ""}
                    onChange={(e) => setFormAccountId(e.target.value)}
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
              <div className="flex items-center gap-2 mb-2">
                <div className="h-px bg-gray-200 dark:bg-white/10 flex-1"></div>
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  OR MANUAL ENTRY
                </span>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>

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
                    value={formSymbol}
                    onChange={(e) =>
                      setFormSymbol(e.target.value.toUpperCase())
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
                      onClick={() => setFormSide("Long")}
                      className={`flex-1 rounded-md text-xs font-bold transition-all ${
                        formSide === "Long"
                          ? "bg-white dark:bg-white/10 text-emerald-700 dark:text-emerald-400 shadow-sm border border-gray-200/20 dark:border-white/10"
                          : "text-gray-400 hover:text-gray-600 dark:hover:text-white"
                      }`}
                    >
                      Long
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormSide("Short")}
                      className={`flex-1 rounded-md text-xs font-bold transition-all ${
                        formSide === "Short"
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
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
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
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
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
                    value={formEntryTimeFrame}
                    onChange={(e) => setFormEntryTimeFrame(e.target.value)}
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
                    value={formQty}
                    onChange={(e) =>
                      setFormQty(parseInt(e.target.value, 10) || 0)
                    }
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                    value={formRR}
                    onChange={(e) => setFormRR(e.target.value)}
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
                    value={formNetPnl}
                    onChange={(e) => {
                      setFormNetPnl(e.target.value);
                      const num = parseFloat(e.target.value);
                      if (!isNaN(num)) {
                        if (num > 0) setFormOutcome("Win");
                        else if (num < 0) setFormOutcome("Loss");
                        else setFormOutcome("BE");
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
                      onClick={() => setFormOutcome("Win")}
                      className={`flex-1 rounded-md text-[10px] font-bold transition-all ${
                        formOutcome === "Win"
                          ? "bg-white dark:bg-white/10 text-emerald-700 dark:text-emerald-400 shadow-sm border border-gray-200/20 dark:border-white/10"
                          : "text-gray-400 hover:text-gray-600 dark:hover:text-white"
                      }`}
                    >
                      Win
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormOutcome("Loss")}
                      className={`flex-1 rounded-md text-[10px] font-bold transition-all ${
                        formOutcome === "Loss"
                          ? "bg-white dark:bg-white/10 text-rose-700 dark:text-rose-400 shadow-sm border border-gray-200/20 dark:border-white/10"
                          : "text-gray-400 hover:text-gray-600 dark:hover:text-white"
                      }`}
                    >
                      Loss
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormOutcome("BE")}
                      className={`flex-1 rounded-md text-[10px] font-bold transition-all ${
                        formOutcome === "BE"
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
                    value={formPlaybookId}
                    onChange={(e) => setFormPlaybookId(e.target.value)}
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
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 dark:border-[var(--tz-border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 h-9 rounded-lg border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{
                      background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
                      boxShadow: "0 4px 14px 0 rgba(99, 102, 241, 0.2)",
                    }}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      "Save Trade"
                    )}
                  </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
