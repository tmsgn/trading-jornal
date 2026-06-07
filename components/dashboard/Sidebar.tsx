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
import { BRAND, getSavedProfile, TradeSide } from "@/lib/data";
import { toast } from "sonner";
import { useTrades } from "@/components/providers/TradeProvider";
import { logout } from "@/app/(auth)/login/actions";
import { getPlaybooksAction } from "@/app/actions/playbooks";

const topNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: BookOpen, label: "Journal", href: "/journal" },
  { icon: FileText, label: "Daily Journal", href: "/daily-journal" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: TrendingUp, label: "Trades", href: "/trades" },
  { icon: Brain, label: "AI Insights", href: "/ai-insights" },
  { icon: Package, label: "Playbooks", href: "/playbooks" },
];

export function Sidebar({ profile: serverProfile }: { profile?: any }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { addTrade } = useTrades();
  const [profile, setProfile] = useState(() => serverProfile || getSavedProfile());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formSymbol, setFormSymbol] = useState("");
  const [formSide, setFormSide] = useState<"Long" | "Short">("Long");
  const [formQty, setFormQty] = useState(100);
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("09:30");
  const [formPlaybook, setFormPlaybook] = useState<string>("None");
  const [formTags, setFormTags] = useState("");
  
  // Advanced Fields
  const [formCommissions, setFormCommissions] = useState<number>(0);
  const [formNetPnlOverride, setFormNetPnlOverride] = useState<string>("");
  const [formRr, setFormRr] = useState<string>("");
  const [formNotes, setFormNotes] = useState<string>("");
  
  const [playbooks, setPlaybooks] = useState<{id: string, name: string}[]>([]);

  const resetForm = () => {
    setFormSymbol("");
    setFormSide("Long");
    setFormQty(100);
    setFormPlaybook("None");
    setFormTags("");
    setFormCommissions(0);
    setFormRr("");
    setFormNetPnlOverride("");
    setFormNotes("");
  };

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
    
    // Fetch playbooks
    getPlaybooksAction().then(data => {
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
    if (!formSymbol || !formDate || !formTime || !formQty || !formNetPnlOverride) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const netPnl = parseFloat(formNetPnlOverride || "0");
    const parsedRr = formRr ? parseFloat(formRr) : 0;

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
      commissions: formCommissions,
      fees: 0,
      playbookId: formPlaybook === "None" ? null : formPlaybook,
      initialRr: parsedRr,
      notes: formNotes,
      tags: formTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      hasNote: !!formNotes,
      status: "Closed" as const,
    };

    await addTrade(newTrade as any);

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
        className={`flex flex-col h-screen py-3 gap-1 flex-shrink-0 transition-all duration-300 bg-white border-r border-gray-100 ${
          isCollapsed ? "w-[56px] items-center" : "w-[240px] px-3"
        }`}
      >
        {/* Logo Area */}
        <Link href="/" className="w-full">
          {isCollapsed ? (
            <div
              className="flex items-center justify-center w-9 h-9 rounded-lg mb-3 cursor-pointer hover:opacity-90 transition-all mx-auto shadow-sm"
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
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
                  background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
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
              <span className="font-bold text-gray-900 text-[17px] tracking-tight">
                {BRAND.name.substring(0, 4)}<span className="text-emerald-500">{BRAND.name.substring(4)}</span>
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
                    background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
                  }}
                >
                  <Plus size={18} color="white" />
                </button>
              ) : (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center justify-center w-full h-9 rounded-lg mb-3 transition-all hover:opacity-90 gap-1.5 px-4 font-semibold text-xs text-white shadow-sm"
                  style={{
                    background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
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
                              ? "bg-emerald-50 text-emerald-600"
                              : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
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
              className={`flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-900 transition-all mb-1 ${
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
                          ? "bg-emerald-50 text-emerald-600"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
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
                    <button className="flex justify-center w-full" onClick={() => logout()}>
                      <Avatar className="w-8 h-8 cursor-pointer shadow-sm border border-emerald-500/20">
                        <AvatarFallback
                          className="text-xs font-semibold"
                          style={{ background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)", color: "#ffffff" }}
                        >
                          {(profile?.firstName?.[0] || profile?.email?.[0] || "U").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-100 mx-1 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => logout()} title="Click to Logout">
                      <Avatar className="w-8 h-8 flex-shrink-0 shadow-sm border border-emerald-500/20">
                        <AvatarFallback
                          className="text-xs font-semibold"
                          style={{ background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)", color: "#ffffff" }}
                        >
                          {(profile?.firstName?.[0] || profile?.email?.[0] || "U").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs font-semibold text-gray-900 truncate leading-tight">
                          {profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}` : profile?.email?.split('@')[0]}
                        </span>
                        <span className="text-[10px] text-gray-500 truncate leading-none mt-0.5">
                          {profile?.email}
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
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
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
            <form onSubmit={handleAddTrade} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
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
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
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

              <div className="grid grid-cols-2 gap-4">
                {/* Qty */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quantity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formQty}
                    onChange={(e) => setFormQty(parseInt(e.target.value) || 0)}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Net P&L Override */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Net P&L ($)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 500"
                    required
                    value={formNetPnlOverride}
                    onChange={(e) => setFormNetPnlOverride(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
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
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                    className="w-full h-9 px-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                  >
                    <option value="None">None</option>
                    {playbooks.map(pb => (
                      <option key={pb.id} value={pb.id}>{pb.name}</option>
                    ))}
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

              <div className="grid grid-cols-3 gap-3">
                {/* Commissions */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Commissions ($)</label>
                  <input
                    type="number"
                    step="any"
                    value={formCommissions}
                    onChange={(e) => setFormCommissions(parseFloat(e.target.value) || 0)}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>

                {/* Risk / Reward */}
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Risk / Reward (R)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 2.5"
                    value={formRr}
                    onChange={(e) => setFormRr(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Trade Notes</label>
                <textarea
                  placeholder="What was the setup? How did you feel?"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full h-20 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                />
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
                  className="px-4 h-9 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition-all shadow-sm"
                  style={{
                    background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
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
