"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  BarChart3,
  TrendingUp,
  Brain,
  Package,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React, { useState, useEffect } from "react";
import { getSavedProfile, getSavedTrades, saveTrades } from "@/lib/data";
import { toast } from "sonner";

const topNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: BookOpen, label: "Journal", href: "/journal" },
  { icon: FileText, label: "Daily Journal", href: "/daily-journal" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: TrendingUp, label: "Trades", href: "/trades" },
  { icon: Brain, label: "AI Insights", href: "/ai-insights" },
  { icon: Package, label: "Playbooks", href: "/playbooks" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState(() => getSavedProfile());
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Add Trade Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formSymbol, setFormSymbol] = useState("");
  const [formSide, setFormSide] = useState<"Long" | "Short">("Long");
  const [formQty, setFormQty] = useState(100);
  const [formEntry, setFormEntry] = useState(100);
  const [formExit, setFormExit] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("09:30");
  const [formPlaybook, setFormPlaybook] = useState("None");
  const [formTags, setFormTags] = useState("");

  // Set default date on client to avoid hydration mismatch
  useEffect(() => {
    const d = new Date();
    setFormDate(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`
    );
  }, [isAddModalOpen]);

  // Load sidebar collapsed state on mount to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tz_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    }
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

  useEffect(() => {
    const handleUpdate = () => {
      setProfile(getSavedProfile());
    };
    window.addEventListener("tz_profile_update", handleUpdate);
    return () => {
      window.removeEventListener("tz_profile_update", handleUpdate);
    };
  }, []);

  const handleAddTradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSymbol) return;

    const exitVal = formExit.trim() !== "" ? parseFloat(formExit) : null;
    const isClosed = exitVal !== null;
    const grossPnlVal = isClosed
      ? (exitVal - formEntry) * formQty * (formSide === "Long" ? 1 : -1)
      : 0;
    const comms = isClosed ? 2.5 : 0;
    const netPnlVal = grossPnlVal - comms;
    const rrVal = isClosed
      ? parseFloat(((exitVal - formEntry) / (formEntry * 0.01)).toFixed(1))
      : 0;

    const newTrade = {
      id: Date.now(),
      date: formDate,
      time: formTime,
      symbol: formSymbol.toUpperCase(),
      side: formSide,
      qty: formQty,
      entry: formEntry,
      exit: exitVal,
      grossPnl: grossPnlVal,
      commissions: comms,
      netPnl: netPnlVal,
      rr: rrVal,
      duration: isClosed ? Math.floor(Math.random() * 80) + 10 : 0,
      playbook: formPlaybook === "None" ? null : formPlaybook,
      tags: formTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      hasNote: false,
      status: isClosed ? ("Closed" as const) : ("Open" as const),
    };

    const currentTrades = getSavedTrades();
    const updated = [newTrade, ...currentTrades];
    saveTrades(updated);

    // Reset form
    setFormSymbol("");
    setFormSide("Long");
    setFormQty(100);
    setFormEntry(100);
    setFormExit("");
    setFormPlaybook("None");
    setFormTags("");
    setIsAddModalOpen(false);

    toast.success(`Trade for ${newTrade.symbol} added successfully!`);
  };

  return (
    <>
      <aside
        className={`flex flex-col h-screen py-3 gap-1 flex-shrink-0 transition-all duration-300 ${
          isCollapsed ? "w-[56px] items-center" : "w-[240px] px-3"
        }`}
        style={{
          background: "#1e2030",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Logo Area */}
        <Link href="/" className="w-full">
          {isCollapsed ? (
            <div
              className="flex items-center justify-center w-9 h-9 rounded-lg mb-3 cursor-pointer hover:opacity-90 transition-all mx-auto"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
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
                className="flex items-center justify-center w-8 h-8 rounded-lg"
                style={{
                  background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
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
              <span className="font-bold text-white text-base tracking-tight">
                trade<span className="text-indigo-400">zella</span>
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
                  className="flex items-center justify-center w-9 h-9 rounded-lg mb-3 transition-all hover:opacity-90 mx-auto"
                  style={{
                    background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
                  }}
                >
                  <Plus size={18} color="white" />
                </button>
              ) : (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center justify-center w-full h-9 rounded-lg mb-3 transition-all hover:opacity-90 gap-1.5 px-4 font-semibold text-xs text-white"
                  style={{
                    background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
                  }}
                >
                  <Plus size={14} color="white" />
                  <span>Add Trade</span>
                </button>
              )}
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right">Add Trade</TooltipContent>}
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
                        <div className={`tz-nav-item mx-auto ${isActive ? "active" : ""}`}>
                          <item.icon size={19} />
                        </div>
                      ) : (
                        <div
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer font-medium ${
                            isActive
                              ? "bg-indigo-600/20 text-[#818cf8]"
                              : "text-[#a8b3cf] hover:bg-white/8 hover:text-white"
                          }`}
                        >
                          <item.icon size={18} className="flex-shrink-0" />
                          <span className="text-xs tracking-wide">{item.label}</span>
                        </div>
                      )}
                    </Link>
                  </TooltipTrigger>
                  {isCollapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
                </Tooltip>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="flex flex-col gap-2 mt-auto w-full items-center">
            {/* Toggle button */}
            <button
              onClick={toggleSidebar}
              className={`flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/8 text-[#a8b3cf] hover:text-white transition-all mb-1 ${
                isCollapsed ? "" : "w-full justify-start px-3 gap-3"
              }`}
            >
              {isCollapsed ? (
                <ChevronRight size={18} />
              ) : (
                <>
                  <ChevronLeft size={18} className="flex-shrink-0" />
                  <span className="text-xs font-medium tracking-wide">Collapse</span>
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
                          ? "bg-indigo-600/20 text-[#818cf8]"
                          : "text-[#a8b3cf] hover:bg-white/8 hover:text-white"
                      }`}
                    >
                      <Settings size={18} className="flex-shrink-0" />
                      <span className="text-xs tracking-wide">Settings</span>
                    </div>
                  )}
                </Link>
              </TooltipTrigger>
              {isCollapsed && <TooltipContent side="right">Settings</TooltipContent>}
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-full mt-1">
                  {isCollapsed ? (
                    <button className="flex justify-center w-full">
                      <Avatar className="w-8 h-8 cursor-pointer ring-2 ring-indigo-500/40">
                        <AvatarFallback
                          className="text-xs font-semibold"
                          style={{ background: "#3b4168", color: "#a8b3cf" }}
                        >
                          {(profile.firstName[0] || "H").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-white/5 border border-white/5 mx-1">
                      <Avatar className="w-8 h-8 flex-shrink-0 ring-2 ring-indigo-500/40">
                        <AvatarFallback
                          className="text-xs font-semibold"
                          style={{ background: "#3b4168", color: "#a8b3cf" }}
                        >
                          {(profile.firstName[0] || "H").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs font-semibold text-white truncate leading-tight">
                          {profile.firstName} {profile.lastName}
                        </span>
                        <span className="text-[10px] text-gray-400 truncate leading-none mt-0.5">
                          {profile.email}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              {isCollapsed && <TooltipContent side="right">Profile</TooltipContent>}
            </Tooltip>
          </div>
        </TooltipProvider>
      </aside>

      {/* Add Trade Modal Popup */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="text-base font-bold text-gray-950">Add New Trade</h3>
                <p className="text-xs text-gray-500 mt-0.5">Manually record a trade to your journal</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleAddTradeSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-2 gap-4">
                {/* Symbol */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Symbol</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TSLA"
                    value={formSymbol}
                    onChange={(e) => setFormSymbol(e.target.value.toUpperCase())}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                  />
                </div>

                {/* Side */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Side</label>
                  <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200/50 h-9">
                    <button
                      type="button"
                      onClick={() => setFormSide("Long")}
                      className={`flex-1 rounded-md text-xs font-bold transition-all ${
                        formSide === "Long"
                          ? "bg-white text-emerald-700 shadow-sm border border-gray-200/20"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      Long
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormSide("Short")}
                      className={`flex-1 rounded-md text-xs font-bold transition-all ${
                        formSide === "Short"
                          ? "bg-white text-rose-700 shadow-sm border border-gray-200/20"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      Short
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Qty */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quantity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formQty}
                    onChange={(e) => setFormQty(parseInt(e.target.value) || 0)}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Entry */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Entry Price</label>
                  <input
                    type="number"
                    required
                    step="any"
                    min="0.0001"
                    value={formEntry}
                    onChange={(e) => setFormEntry(parseFloat(e.target.value) || 0)}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>

                {/* Exit */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Exit Price (Optional)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Open position"
                    value={formExit}
                    onChange={(e) => setFormExit(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Date */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Time */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Time</label>
                  <input
                    type="time"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Playbook */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Playbook</label>
                  <select
                    value={formPlaybook}
                    onChange={(e) => setFormPlaybook(e.target.value)}
                    className="w-full h-9 px-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  >
                    <option value="None">None</option>
                    <option value="Breakout">Breakout</option>
                    <option value="VWAP Rejection">VWAP Rejection</option>
                    <option value="Gap & Go">Gap & Go</option>
                    <option value="Reversal">Reversal</option>
                    <option value="Mean Reversion">Mean Reversion</option>
                  </select>
                </div>

                {/* Tags */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. trend, breakout, morning"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 h-9 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 h-9 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition-all"
                  style={{
                    background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
                  }}
                >
                  Save Trade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
