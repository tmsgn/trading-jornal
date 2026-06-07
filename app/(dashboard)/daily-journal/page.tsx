"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  TrendingUp,
  TrendingDown,
  Check,
  Plus,
  Trash2,
  Image as ImageIcon,
  Smile,
  Activity,
  FileText,
  X,
  Star,
  Award,
  ShieldCheck,
  AlertCircle,
  Save,
  RefreshCw,
  PlusCircle,
  Sun,
  Target,
  Moon,
  Info,
} from "lucide-react";
import {
  Trade,
  DailyJournal,
  getSavedDailyJournals,
  saveDailyJournals,
  getEmptyJournal,
  DEFAULT_RULES_CHECKLIST,
} from "@/lib/data";
import { toast } from "sonner";
import { useTrades } from "@/components/providers/TradeProvider";

// Emojis for moods
const MOODS = [
  { emoji: "🧠", label: "Calm", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { emoji: "😐", label: "Neutral", color: "bg-gray-50 text-gray-700 border-gray-200" },
  { emoji: "🚀", label: "Excited", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { emoji: "😡", label: "Frustrated", color: "bg-rose-50 text-rose-700 border-rose-200" },
  { emoji: "😨", label: "Fearful", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { emoji: "🥱", label: "Tired", color: "bg-purple-50 text-purple-700 border-purple-200" },
];

// List of common trading emotions
const POPULAR_EMOTIONS = [
  { name: "Calm", type: "positive" },
  { name: "Disciplined", type: "positive" },
  { name: "Confident", type: "positive" },
  { name: "Patient", type: "positive" },
  { name: "Focused", type: "positive" },
  { name: "Impatient", type: "negative" },
  { name: "Greedy", type: "negative" },
  { name: "FOMO", type: "negative" },
  { name: "Anxious", type: "negative" },
  { name: "Hesitant", type: "negative" },
  { name: "Revengeful", type: "negative" },
  { name: "Satisfied", type: "positive" },
];

export default function DailyJournalRedesignedPage() {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const { trades } = useTrades();
  const [journals, setJournals] = useState<Record<string, DailyJournal>>({});
  const [currentJournal, setCurrentJournal] = useState<DailyJournal | null>(null);
  
  // UI states
  const [newWatchlistSymbol, setNewWatchlistSymbol] = useState("");
  const [newScreenshotUrl, setNewScreenshotUrl] = useState("");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Focus ref for auto scroll or helper highlights
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial Load: dates and data
  useEffect(() => {
    const today = new Date();
    const formattedToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    setSelectedDate(formattedToday);

    setJournals(getSavedDailyJournals());
  }, []);

  // Sync journals when updated globally
  useEffect(() => {
    const handleJournalsUpdate = () => setJournals(getSavedDailyJournals());

    window.addEventListener("tz_daily_journals_update", handleJournalsUpdate);

    return () => {
      window.removeEventListener("tz_daily_journals_update", handleJournalsUpdate);
    };
  }, []);

  // 2. Load or Initialize current journal entry when date changes
  useEffect(() => {
    if (!selectedDate) return;

    if (journals[selectedDate]) {
      setCurrentJournal(JSON.parse(JSON.stringify(journals[selectedDate])));
    } else {
      setCurrentJournal(getEmptyJournal(selectedDate));
    }
  }, [selectedDate, journals]);

  // 3. Computed Trades for selected day
  const dailyTrades = trades.filter((t) => t.date === selectedDate);
  const totalNetPnl = dailyTrades.reduce((sum, t) => sum + t.netPnl, 0);
  const totalCommissions = dailyTrades.reduce((sum, t) => sum + t.commissions, 0);
  const winTrades = dailyTrades.filter((t) => t.netPnl > 0);
  const lossTrades = dailyTrades.filter((t) => t.netPnl < 0);
  const winRate = dailyTrades.length > 0 ? (winTrades.length / dailyTrades.length) * 100 : 0;

  // 4. Compliance Checklist Calculation
  const totalRules = currentJournal ? Object.keys(currentJournal.rulesChecklist).length : 0;
  const followedRules = currentJournal
    ? Object.values(currentJournal.rulesChecklist).filter(Boolean).length
    : 0;
  const complianceScore = totalRules > 0 ? Math.round((followedRules / totalRules) * 100) : 0;

  // 5. Date navigation helpers
  const handlePrevDay = () => {
    if (!selectedDate) return;
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() - 1);
    setSelectedDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  };

  const handleNextDay = () => {
    if (!selectedDate) return;
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + 1);
    setSelectedDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  };

  const handleJumpToToday = () => {
    const today = new Date();
    setSelectedDate(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`);
  };

  const getReadableDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // 6. Save Functionality
  const triggerSave = (updatedJournal: DailyJournal) => {
    setIsSaving(true);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      const allJournals = getSavedDailyJournals();
      allJournals[selectedDate] = updatedJournal;
      saveDailyJournals(allJournals);
      setJournals(allJournals);
      setIsSaving(false);
      
      const now = new Date();
      setLastSaved(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 400);
  };

  // 7. Input updates handler
  const updateJournal = (updater: (draft: DailyJournal) => void) => {
    if (!currentJournal) return;
    const nextJournal = JSON.parse(JSON.stringify(currentJournal)) as DailyJournal;
    updater(nextJournal);
    setCurrentJournal(nextJournal);
    triggerSave(nextJournal);
  };

  const addWatchlistSymbol = () => {
    if (!newWatchlistSymbol.trim()) return;
    const cleanSym = newWatchlistSymbol.toUpperCase().trim();
    if (currentJournal?.preMarket.watchlist.includes(cleanSym)) {
      setNewWatchlistSymbol("");
      return;
    }
    updateJournal((draft) => {
      draft.preMarket.watchlist.push(cleanSym);
    });
    setNewWatchlistSymbol("");
    toast.success(`Added ${cleanSym} to watchlist`);
  };

  const removeWatchlistSymbol = (symbol: string) => {
    updateJournal((draft) => {
      draft.preMarket.watchlist = draft.preMarket.watchlist.filter((s) => s !== symbol);
    });
  };

  const toggleRuleCheck = (rule: string) => {
    updateJournal((draft) => {
      draft.rulesChecklist[rule] = !draft.rulesChecklist[rule];
    });
  };

  const selectMood = (moodStr: string) => {
    updateJournal((draft) => {
      draft.psychology.mood = moodStr;
    });
  };

  const toggleEmotion = (emotion: string) => {
    updateJournal((draft) => {
      const emotions = draft.psychology.emotions || [];
      if (emotions.includes(emotion)) {
        draft.psychology.emotions = emotions.filter((e) => e !== emotion);
      } else {
        draft.psychology.emotions = [...emotions, emotion];
      }
    });
  };

  const addScreenshot = () => {
    if (!newScreenshotUrl.trim()) return;
    if (!newScreenshotUrl.startsWith("http://") && !newScreenshotUrl.startsWith("https://")) {
      toast.error("Please enter a valid HTTP or HTTPS image URL");
      return;
    }
    updateJournal((draft) => {
      draft.screenshots = draft.screenshots || [];
      draft.screenshots.push(newScreenshotUrl.trim());
    });
    setNewScreenshotUrl("");
    toast.success("Screenshot added successfully!");
  };

  const deleteScreenshot = (index: number) => {
    updateJournal((draft) => {
      draft.screenshots = draft.screenshots.filter((_, i) => i !== index);
    });
    toast.success("Screenshot removed");
  };

  if (!currentJournal) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
          <span className="text-xs text-gray-500 font-medium">Loading daily journal...</span>
        </div>
      </div>
    );
  }

  // Circular progress math
  const strokeRadius = 18;
  const strokeCircumference = 2 * Math.PI * strokeRadius;
  const strokeDashoffset = strokeCircumference - (complianceScore / 100) * strokeCircumference;

  return (
    <div className="tz-page px-6 py-6 max-w-7xl mx-auto space-y-6">
      
      {/* ── Page Header Dashboard Style ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-150 shadow-[0_4px_20px_-4px_rgba(99,102,241,0.05)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <FileText size={18} />
            </div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">Daily Performance Journal</h1>
            <span className="bg-indigo-50 text-indigo-700 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wide border border-indigo-100">
              PRO
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Log, track compliance, and document lessons learned for every single trading day.
          </p>
        </div>

        {/* Date Navigator Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1 shadow-inner">
            <button
              onClick={handlePrevDay}
              className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-gray-500 transition-all"
              title="Previous Day"
            >
              <ChevronLeft size={15} />
            </button>

            <div className="relative flex items-center px-3 gap-2 text-xs font-bold text-gray-700">
              <Calendar size={13} className="text-indigo-500" />
              <span className="hidden sm:inline-block w-40 text-center truncate">{getReadableDate(selectedDate)}</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <span className="sm:hidden font-mono">{selectedDate}</span>
            </div>

            <button
              onClick={handleNextDay}
              className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-gray-500 transition-all"
              title="Next Day"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          <button
            onClick={handleJumpToToday}
            className="tz-btn-secondary h-9 px-3 rounded-xl text-xs text-indigo-600 hover:bg-indigo-50 font-semibold border-gray-200"
          >
            Today
          </button>

          {/* Sync status */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100 text-[11px] font-semibold text-gray-500">
            {isSaving ? (
              <>
                <RefreshCw size={11} className="animate-spin text-indigo-500" />
                <span>Saving draft...</span>
              </>
            ) : lastSaved ? (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-emerald-700">Auto-saved ({lastSaved})</span>
              </>
            ) : (
              <span>Synced</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* ── LEFT COLUMN: Chronological Timeline of the Day ── */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="relative pl-6 sm:pl-8 border-l-2 border-dashed border-gray-200 ml-4 space-y-8">
            
            {/* Step 1: Pre-market Prep */}
            <div className="relative">
              {/* Step indicator dot */}
              <div className="absolute -left-[37px] sm:-left-[45px] top-0 w-8 h-8 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center text-xs font-bold text-indigo-600 shadow-sm z-10">
                1
              </div>

              <div className="tz-card bg-white p-5 rounded-2xl shadow-[0_4px_20px_-4px_rgba(99,102,241,0.03)] border-gray-150 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-amber-500" />
                    <h3 className="text-sm font-bold text-gray-900">Pre-Market Preparation</h3>
                  </div>
                  <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">
                    Morning Routine
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Watchlist entry */}
                  <div className="md:col-span-1 space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Watchlist Scanner</span>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="ADD SYMBOL"
                        value={newWatchlistSymbol}
                        onChange={(e) => setNewWatchlistSymbol(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addWatchlistSymbol()}
                        className="w-full h-9 px-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold text-xs uppercase bg-gray-50/50"
                      />
                      <button
                        onClick={addWatchlistSymbol}
                        className="tz-btn-primary h-9 w-9 p-0 flex items-center justify-center rounded-xl"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2 max-h-[120px] overflow-y-auto pr-1">
                      {currentJournal.preMarket.watchlist.length === 0 ? (
                        <span className="text-xs text-gray-400 italic">No tickers scanned</span>
                      ) : (
                        currentJournal.preMarket.watchlist.map((sym) => (
                          <span
                            key={sym}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold shadow-sm"
                          >
                            {sym}
                            <button
                              onClick={() => removeWatchlistSymbol(sym)}
                              className="text-indigo-400 hover:text-indigo-700 p-0.5 rounded"
                            >
                              <X size={10} className="stroke-[3]" />
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Market Outlook */}
                  <div className="md:col-span-2 space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Market Outlook & Thesis</span>
                    <textarea
                      placeholder="Write your thesis... (e.g. Bullish bias, Tech indices holding support levels, FOMC aftermath momentum)"
                      value={currentJournal.preMarket.marketOutlook}
                      onChange={(e) =>
                        updateJournal((draft) => {
                          draft.preMarket.marketOutlook = e.target.value;
                        })
                      }
                      rows={3}
                      className="w-full p-3 border border-gray-200 rounded-xl text-xs bg-gray-50/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium leading-relaxed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Key Levels */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Key Levels of Interest</span>
                    <textarea
                      placeholder="SPY: 470 Support / 475.2 Resistance&#10;TSLA: 248 Pre-market high breakout line..."
                      value={currentJournal.preMarket.keyLevels}
                      onChange={(e) =>
                        updateJournal((draft) => {
                          draft.preMarket.keyLevels = e.target.value;
                        })
                      }
                      rows={3}
                      className="w-full p-3 border border-gray-200 rounded-xl text-xs font-mono bg-gray-50/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>

                  {/* News Events */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Economic Calendar & News Catalysts</span>
                    <textarea
                      placeholder="9:45 AM: Flash Services PMI&#10;2:00 PM: FED Chair speech (Expect high volatility)..."
                      value={currentJournal.preMarket.newsEvents}
                      onChange={(e) =>
                        updateJournal((draft) => {
                          draft.preMarket.newsEvents = e.target.value;
                        })
                      }
                      rows={3}
                      className="w-full p-3 border border-gray-200 rounded-xl text-xs bg-gray-50/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Session Plan */}
            <div className="relative">
              <div className="absolute -left-[37px] sm:-left-[45px] top-0 w-8 h-8 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center text-xs font-bold text-indigo-600 shadow-sm z-10">
                2
              </div>

              <div className="tz-card bg-white p-5 rounded-2xl shadow-[0_4px_20px_-4px_rgba(99,102,241,0.03)] border-gray-150 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-indigo-500" />
                    <h3 className="text-sm font-bold text-gray-900">Session Trading Plan</h3>
                  </div>
                  <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">
                    Execution Rules
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Daily Goal */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Daily Session Goals</span>
                    <textarea
                      placeholder="e.g. Wait 15 minutes at open. Focus on execution rather than P&L today. Exit on trigger validation."
                      value={currentJournal.tradingPlan.dailyGoal}
                      onChange={(e) =>
                        updateJournal((draft) => {
                          draft.tradingPlan.dailyGoal = e.target.value;
                        })
                      }
                      rows={3}
                      className="w-full p-3 border border-gray-200 rounded-xl text-xs bg-gray-50/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    />
                  </div>

                  {/* Criteria Setups */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Setup Quality Criteria</span>
                    <textarea
                      placeholder="e.g. Clear consolidation breakout on high volume. Retest and hold of EMA. Stop loss must be placed immediately."
                      value={currentJournal.tradingPlan.setupsCriteria}
                      onChange={(e) =>
                        updateJournal((draft) => {
                          draft.tradingPlan.setupsCriteria = e.target.value;
                        })
                      }
                      rows={3}
                      className="w-full p-3 border border-gray-200 rounded-xl text-xs bg-gray-50/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  {/* Max Loss */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Max Loss Limit</span>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">$</span>
                      <input
                        type="number"
                        min="0"
                        value={currentJournal.tradingPlan.maxLoss || ""}
                        onChange={(e) =>
                          updateJournal((draft) => {
                            draft.tradingPlan.maxLoss = Math.max(0, parseInt(e.target.value) || 0);
                          })
                        }
                        className="w-full h-10 pl-8 pr-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold text-xs bg-gray-50/35"
                      />
                    </div>
                  </div>

                  {/* Max Trades */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Max Trades Permitted</span>
                    <input
                      type="number"
                      min="0"
                      value={currentJournal.tradingPlan.maxTrades || ""}
                      onChange={(e) =>
                        updateJournal((draft) => {
                          draft.tradingPlan.maxTrades = Math.max(0, parseInt(e.target.value) || 0);
                        })
                      }
                      className="w-full h-10 px-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold text-xs bg-gray-50/35"
                    />
                  </div>

                  {/* Strategy Focus */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Strategy Specialization</span>
                    <select
                      value={currentJournal.tradingPlan.strategyFocus}
                      onChange={(e) =>
                        updateJournal((draft) => {
                          draft.tradingPlan.strategyFocus = e.target.value;
                        })
                      }
                      className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white font-semibold text-xs text-gray-700"
                    >
                      <option value="">Select Strategy...</option>
                      <option value="Breakouts">Breakouts</option>
                      <option value="VWAP Rejection">VWAP Rejection</option>
                      <option value="Gap & Go">Gap & Go</option>
                      <option value="Reversals / Fades">Reversals / Fades</option>
                      <option value="Mean Reversion">Mean Reversion</option>
                      <option value="Trend Continuation">Trend Continuation</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Post-market Review */}
            <div className="relative">
              <div className="absolute -left-[37px] sm:-left-[45px] top-0 w-8 h-8 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center text-xs font-bold text-indigo-600 shadow-sm z-10">
                3
              </div>

              <div className="tz-card bg-white p-5 rounded-2xl shadow-[0_4px_20px_-4px_rgba(99,102,241,0.03)] border-gray-150 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-gray-900">Post-Market Review</h3>
                  </div>
                  <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">
                    Evening Reflection
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* What Went Well */}
                  <div className="space-y-2 p-3 bg-emerald-50/20 rounded-2xl border border-emerald-100/50">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">What Went Well (Wins)</span>
                    <textarea
                      placeholder="e.g. Cut losers early. Followed size plan on NVDA breakout. Stayed calm during pullback."
                      value={currentJournal.postMarket.whatWentWell}
                      onChange={(e) =>
                        updateJournal((draft) => {
                          draft.postMarket.whatWentWell = e.target.value;
                        })
                      }
                      rows={3}
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
                    />
                  </div>

                  {/* What Went Wrong */}
                  <div className="space-y-2 p-3 bg-rose-50/20 rounded-2xl border border-rose-100/50">
                    <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">What Went Wrong (Mistakes)</span>
                    <textarea
                      placeholder="e.g. Sized up too high on SPY short. Faded QQQ trend day midday. Overtraded during chop session."
                      value={currentJournal.postMarket.whatWentWrong}
                      onChange={(e) =>
                        updateJournal((draft) => {
                          draft.postMarket.whatWentWrong = e.target.value;
                        })
                      }
                      rows={3}
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Lessons Learned */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Core Lesson Learned</span>
                    <textarea
                      placeholder="What is the single most important takeaway from today's session?"
                      value={currentJournal.postMarket.lessonsLearned}
                      onChange={(e) =>
                        updateJournal((draft) => {
                          draft.postMarket.lessonsLearned = e.target.value;
                        })
                      }
                      rows={3}
                      className="w-full p-3 border border-gray-200 rounded-xl text-xs bg-gray-50/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    />
                  </div>

                  {/* Tomorrow Plan */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Tomorrow's Gameplan adjustments</span>
                    <textarea
                      placeholder="How will you adapt your execution strategy tomorrow?"
                      value={currentJournal.postMarket.tomorrowPlan}
                      onChange={(e) =>
                        updateJournal((draft) => {
                          draft.postMarket.tomorrowPlan = e.target.value;
                        })
                      }
                      rows={3}
                      className="w-full p-3 border border-gray-200 rounded-xl text-xs bg-gray-50/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Day's Trades Execution Log Section */}
          <div className="tz-card bg-white p-5 rounded-2xl shadow-[0_4px_20px_-4px_rgba(99,102,241,0.03)] border-gray-150 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-gray-900">Day's Executed Trades</h3>
              </div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded tracking-wide border border-indigo-100/50">
                {dailyTrades.length} Trades Active
              </span>
            </div>

            {dailyTrades.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400 italic">
                No trades recorded in database for this date. (Use dashboard modal to add trades).
              </div>
            ) : (
              <div className="overflow-hidden border border-gray-150 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Time</th>
                      <th className="py-3 px-3">Symbol</th>
                      <th className="py-3 px-3">Side</th>
                      <th className="py-3 px-3">Qty</th>
                      <th className="py-3 px-3 text-right">Entry</th>
                      <th className="py-3 px-3 text-right">Exit</th>
                      <th className="py-3 px-3 text-right">Net P&L</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-gray-100 font-semibold text-gray-700 bg-white">
                    {dailyTrades.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-4 text-gray-500 font-mono">{t.time}</td>
                        <td className="py-3 px-3 font-extrabold text-gray-900">{t.symbol}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wide ${
                              t.side === "Long"
                                ? "bg-emerald-55/10 text-emerald-700 border border-emerald-200/20"
                                : "bg-rose-55/10 text-rose-700 border border-rose-200/20"
                            }`}
                          >
                            {t.side}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-gray-600 font-mono font-bold">{t.qty}</td>
                        <td className="py-3 px-3 text-right text-gray-900 font-mono">${t.entry.toFixed(2)}</td>
                        <td className="py-3 px-3 text-right text-gray-900 font-mono">
                          {t.exit !== null ? `$${t.exit.toFixed(2)}` : <span className="text-gray-400 italic font-sans">Open</span>}
                        </td>
                        <td
                          className={`py-3 px-3 text-right font-extrabold font-mono text-[13px] ${
                            t.netPnl >= 0 ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {t.netPnl >= 0 ? "+" : ""}${t.netPnl.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                              t.status === "Closed"
                                ? "bg-gray-100 text-gray-600 border border-gray-200/40"
                                : "bg-indigo-50 text-indigo-700 border border-indigo-200/40"
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN: Metrics Dashboard & Compliance ── */}
        <div className="space-y-6">
          
          {/* Card 1: Daily Scorecard Dashboard Block */}
          <div className="tz-card bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/30 p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-150 relative overflow-hidden">
            {/* Background gradient flares */}
            <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-500/5 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-purple-500/5 rounded-full blur-xl" />

            <div className="relative space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider">
                  Session Performance Index
                </span>
                <span className="text-[10px] text-gray-400 font-bold font-mono bg-white px-2 py-0.5 rounded border border-gray-100 shadow-sm">
                  {selectedDate}
                </span>
              </div>

              {/* Day Rating Stars */}
              <div className="flex flex-col items-center justify-center py-2.5 bg-white rounded-xl border border-gray-100/80 gap-1 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">Day Score</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() =>
                        updateJournal((draft) => {
                          draft.rating = star;
                        })
                      }
                      className="transition-transform hover:scale-120 duration-150 focus:outline-none"
                    >
                      <Star
                        size={20}
                        className={
                          star <= currentJournal.rating
                            ? "fill-amber-400 stroke-amber-500"
                            : "stroke-gray-300 fill-transparent hover:stroke-amber-400"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Net PNL big metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col justify-center p-3.5 bg-white rounded-xl border border-gray-150/70 shadow-sm border-l-4 border-l-indigo-500">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Net P&L Result</span>
                  <span
                    className={`text-lg font-black font-mono tracking-tight mt-0.5 truncate ${
                      totalNetPnl >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {totalNetPnl >= 0 ? "+" : ""}${totalNetPnl.toFixed(2)}
                  </span>
                </div>

                <div className="flex flex-col justify-center p-3.5 bg-white rounded-xl border border-gray-150/70 shadow-sm border-l-4 border-l-purple-500">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Rules Compliance</span>
                  <span
                    className={`text-lg font-black tracking-tight mt-0.5 ${
                      complianceScore >= 80
                        ? "text-emerald-600"
                        : complianceScore >= 50
                        ? "text-amber-600"
                        : "text-rose-600"
                    }`}
                  >
                    {complianceScore}%
                  </span>
                </div>
              </div>

              {/* Small metrics row */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/80 p-2.5 rounded-xl border border-gray-100 shadow-sm">
                  <div className="text-[8px] font-bold text-gray-400 uppercase tracking-wide">Trades</div>
                  <div className="font-extrabold text-gray-800 mt-0.5 text-xs">{dailyTrades.length}</div>
                </div>

                <div className="bg-white/80 p-2.5 rounded-xl border border-gray-100 shadow-sm">
                  <div className="text-[8px] font-bold text-gray-400 uppercase tracking-wide">Win Rate</div>
                  <div className="font-extrabold text-emerald-600 mt-0.5 text-xs">{winRate.toFixed(0)}%</div>
                </div>

                <div className="bg-white/80 p-2.5 rounded-xl border border-gray-100 shadow-sm">
                  <div className="text-[8px] font-bold text-gray-400 uppercase tracking-wide">Fees</div>
                  <div className="font-extrabold text-gray-700 mt-0.5 text-xs font-mono">${totalCommissions.toFixed(0)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Compliance Checklist Premium Widget */}
          <div className="tz-card bg-white p-5 rounded-2xl shadow-[0_4px_20px_-4px_rgba(99,102,241,0.03)] border-gray-150 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-1.5 text-gray-900 font-bold text-xs">
                <ShieldCheck size={14} className="text-indigo-500" />
                <span>Trading Rules Compliance</span>
              </div>
              <span className="text-[10px] text-gray-400 font-bold">
                {followedRules}/{totalRules} rules
              </span>
            </div>

            {/* Circular Progress Gauge */}
            <div className="flex items-center gap-4 bg-gray-50/50 p-3.5 rounded-2xl border border-gray-100">
              <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="28"
                    cy="28"
                    r={strokeRadius}
                    className="stroke-gray-200 fill-none"
                    strokeWidth="3.5"
                  />
                  <circle
                    cx="28"
                    cy="28"
                    r={strokeRadius}
                    className={`fill-none transition-all duration-300 ${
                      complianceScore >= 80
                        ? "stroke-emerald-500"
                        : complianceScore >= 50
                        ? "stroke-amber-500"
                        : "stroke-rose-500"
                    }`}
                    strokeWidth="3.5"
                    strokeDasharray={strokeCircumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-xs font-extrabold text-gray-800">{complianceScore}%</span>
              </div>
              
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-gray-800">Rule execution score</h4>
                <p className="text-[10px] text-gray-500 leading-normal">
                  Your rules checklist determines your discipline grading for the session. Avoid deviations!
                </p>
              </div>
            </div>

            {/* Checkbox checklist */}
            <div className="space-y-2">
              {Object.keys(currentJournal.rulesChecklist).map((rule) => {
                const checked = currentJournal.rulesChecklist[rule];
                return (
                  <div
                    key={rule}
                    onClick={() => toggleRuleCheck(rule)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                      checked
                        ? "bg-emerald-50/20 border-emerald-100 text-emerald-800"
                        : "bg-white border-gray-150 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-[11px] font-bold leading-none">{rule}</span>
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                        checked
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {checked && <Check size={11} className="stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 3: Mood & Psychology Tracker */}
          <div className="tz-card bg-white p-5 rounded-2xl shadow-[0_4px_20px_-4px_rgba(99,102,241,0.03)] border-gray-150 space-y-4">
            <div className="flex items-center gap-1.5 border-b border-gray-100 pb-3 font-bold text-xs text-gray-900">
              <Smile size={14} className="text-indigo-500" />
              <span>Psychology & Emotion Index</span>
            </div>

            {/* Mood selects */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Predominant Mood</span>
              <div className="grid grid-cols-3 gap-1.5">
                {MOODS.map((m) => {
                  const isActive = currentJournal.psychology.mood.includes(m.label);
                  return (
                    <button
                      key={m.label}
                      onClick={() => selectMood(`${m.emoji} ${m.label}`)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all gap-1 focus:outline-none ${
                        isActive
                          ? `${m.color} shadow-sm ring-1 ring-offset-0 ring-indigo-500/20`
                          : "bg-white border-gray-150 hover:bg-gray-50 text-gray-500"
                      }`}
                    >
                      <span className="text-lg transition-transform hover:scale-110">{m.emoji}</span>
                      <span className="text-[9px] font-extrabold tracking-tight">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-3 pt-2 border-t border-gray-100/50">
              {[
                { key: "confidence", label: "Confidence", low: "Fearful", high: "Greedy" },
                { key: "discipline", label: "Discipline", low: "Impulsive", high: "Strict" },
                { key: "focus", label: "Session Focus", low: "Distracted", high: "Hyper" },
                { key: "sleep", label: "Sleep Quality", low: "Exhausted", high: "Rested" },
                { key: "stress", label: "Stress Level", low: "Calm", high: "Tense" },
              ].map((metric) => {
                const val = (currentJournal.psychology as any)[metric.key] || 3;
                return (
                  <div key={metric.key} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-gray-700">
                      <span className="text-[11px]">{metric.label}</span>
                      <span className="text-indigo-600 font-mono text-[11px]">{val}/5</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] text-gray-400 font-bold w-12">{metric.low}</span>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={val}
                        onChange={(e) => {
                          const num = parseInt(e.target.value);
                          updateJournal((draft) => {
                            (draft.psychology as any)[metric.key] = num;
                          });
                        }}
                        className="flex-1 accent-indigo-600 h-1 bg-gray-150 rounded-lg cursor-pointer"
                      />
                      <span className="text-[8px] text-gray-400 font-bold w-12 text-right">{metric.high}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Emotions tags */}
            <div className="space-y-2 pt-3 border-t border-gray-100/50">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Internal States Felt</span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_EMOTIONS.map((emotion) => {
                  const isSelected = (currentJournal.psychology.emotions || []).includes(emotion.name);
                  return (
                    <button
                      key={emotion.name}
                      onClick={() => toggleEmotion(emotion.name)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all focus:outline-none ${
                        isSelected
                          ? emotion.type === "positive"
                            ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                            : "bg-rose-600 border-rose-600 text-white shadow-sm"
                          : "bg-white border-gray-150 hover:bg-gray-50 text-gray-600"
                      }`}
                    >
                      {emotion.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card 4: Screenshots and screener gallery */}
          <div className="tz-card bg-white p-5 rounded-2xl shadow-[0_4px_20px_-4px_rgba(99,102,241,0.03)] border-gray-150 space-y-4">
            <div className="flex items-center gap-1.5 border-b border-gray-100 pb-3 font-bold text-xs text-gray-900">
              <ImageIcon size={14} className="text-indigo-500" />
              <span>Screener Attachments</span>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Add screenshot URL</span>
              <div className="flex gap-1.5">
                <input
                  type="url"
                  placeholder="https://..."
                  value={newScreenshotUrl}
                  onChange={(e) => setNewScreenshotUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addScreenshot()}
                  className="w-full h-9 px-3 rounded-xl border border-gray-250 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs bg-gray-50/50"
                />
                <button
                  onClick={addScreenshot}
                  className="tz-btn-primary h-9 px-3 rounded-xl flex items-center justify-center text-xs"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              {(!currentJournal.screenshots || currentJournal.screenshots.length === 0) ? (
                <div className="col-span-2 py-6 border border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center bg-gray-50/50">
                  <ImageIcon className="h-6 w-6 text-gray-300" />
                  <span className="text-[10px] text-gray-400 font-bold mt-1">No charts uploaded</span>
                </div>
              ) : (
                currentJournal.screenshots.map((img, idx) => (
                  <div
                    key={idx}
                    className="group relative aspect-video border border-gray-100 rounded-xl overflow-hidden bg-gray-100 shadow-sm cursor-zoom-in"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={`Journal day screenshot ${idx}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      onClick={() => setLightboxImage(img)}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteScreenshot(idx);
                      }}
                      className="absolute top-1 right-1 p-1 rounded bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Lightbox Screenshot Overlay */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 p-4 cursor-zoom-out animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black/40 w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <X size={24} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxImage}
            alt="Expanded chart view"
            className="max-w-full max-h-[92vh] object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-200"
          />
        </div>
      )}
    </div>
  );
}
