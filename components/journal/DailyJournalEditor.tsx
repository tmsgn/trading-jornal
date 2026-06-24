"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Save, X, Calendar, Activity, Zap, Shield, Star, Clock } from "lucide-react";
import { toast } from "sonner";
import { RichTextEditor } from "./RichTextEditor";
import type { Trade } from "@/lib/data";
import { getDailyJournalsAction, updateDailyJournalAction, type DailyLog } from "@/app/actions/journal";
import { getPlaybooksAction } from "@/app/actions/playbooks";

interface DailyJournalEditorProps {
  date: string; // YYYY-MM-DD
  trades: Trade[];
  onClose: () => void;
}

export function DailyJournalEditor({ date, trades, onClose }: DailyJournalEditorProps) {
  const [journal, setJournal] = useState<Partial<DailyLog>>({
    date,
    notes: "",
    preMarketNotes: "",
    postMarketNotes: "",
    confidence: 3,
    discipline: 3,
    rating: 0,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [activeTab, setActiveTab] = useState<"pre" | "main" | "post">("main");
  const [playbooks, setPlaybooks] = useState<{ id: string; name: string }[]>([]);

  // Format date
  const dateObj = new Date(date + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Calculate day stats
  const totalPnl = trades.reduce((sum, t) => sum + t.netPnl, 0);
  const winCount = trades.filter((t) => t.netPnl > 0).length;
  const isProfit = totalPnl >= 0;

  // Fetch journal on mount
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getPlaybooksAction().then((data) => {
      if (isMounted) setPlaybooks(data);
    });

    getDailyJournalsAction()
      .then((data) => {
        if (!isMounted) return;
        const entry = data[date];
        if (entry) {
          setJournal(entry);
        }
      })
      .catch(() => {
        toast.error("Failed to load journal entry");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [date]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateDailyJournalAction(date, journal);
      setIsDirty(false);
      toast.success("Daily journal saved");
    } catch {
      toast.error("Failed to save journal");
    } finally {
      setIsSaving(false);
    }
  };

  const handleContentChange = useCallback((field: keyof DailyLog, content: string) => {
    setJournal((prev) => ({ ...prev, [field]: content }));
    setIsDirty(true);
  }, []);

  const handleScoreChange = (field: keyof DailyLog, value: number) => {
    setJournal((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-[var(--tz-bg-card)] rounded-xl border border-[var(--tz-border-subtle)] overflow-hidden animate-pulse">
        <div className="h-[72px] border-b border-[var(--tz-border-subtle)] bg-[var(--tz-hover-bg)]/50"></div>
        <div className="flex flex-1">
          <div className="w-64 border-r border-[var(--tz-border-subtle)] bg-[var(--tz-hover-bg)]/20 p-5">
            <div className="h-4 bg-[var(--tz-border)] rounded w-1/2 mb-8"></div>
            <div className="space-y-6">
              <div className="h-12 bg-[var(--tz-border)] rounded"></div>
              <div className="h-12 bg-[var(--tz-border)] rounded"></div>
              <div className="h-12 bg-[var(--tz-border)] rounded"></div>
            </div>
          </div>
          <div className="flex-1 p-6">
            <div className="h-8 bg-[var(--tz-border)] rounded w-1/3 mb-6"></div>
            <div className="h-[400px] bg-[var(--tz-border)]/50 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--tz-bg-card)] rounded-xl border border-[var(--tz-border-subtle)] overflow-hidden">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-[var(--tz-border-subtle)] gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[var(--tz-text-muted)] hover:bg-[var(--tz-hover-bg)] hover:text-[var(--tz-text-primary)] transition-colors"
          >
            <X size={18} />
          </button>
          <div>
            <h2 className="text-lg font-bold text-[var(--tz-text-primary)] flex items-center gap-2">
              <Calendar size={18} className="text-[var(--tz-accent)]" />
              {formattedDate}
            </h2>
            <p className="text-[12px] text-[var(--tz-text-muted)] mt-0.5">
              Daily trading reflection
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Quick Stats Strip */}
          <div className="flex items-center gap-4 bg-[var(--tz-hover-bg)] px-4 py-2 rounded-lg">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[var(--tz-text-muted)] uppercase tracking-wider">Trades</span>
              <span className="text-sm font-bold text-[var(--tz-text-primary)]">{trades.length}</span>
            </div>
            <div className="w-px h-6 bg-[var(--tz-border)]"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[var(--tz-text-muted)] uppercase tracking-wider">Win Rate</span>
              <span className="text-sm font-bold text-[var(--tz-text-primary)]">
                {trades.length > 0 ? Math.round((winCount / trades.length) * 100) : 0}%
              </span>
            </div>
            <div className="w-px h-6 bg-[var(--tz-border)]"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[var(--tz-text-muted)] uppercase tracking-wider">Net P&L</span>
              <span className={`text-sm font-bold ${isProfit ? "text-emerald-500" : "text-red-500"}`}>
                {isProfit ? "+" : ""}${Math.abs(totalPnl).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white bg-[var(--tz-accent)] hover:bg-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Save size={14} />
            {isSaving ? "Saving..." : "Save Journal"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Sidebar (Metrics & Setup) ──────────────────────────────── */}
        <div className="w-64 flex-shrink-0 border-r border-[var(--tz-border-subtle)] bg-[var(--tz-hover-bg)]/30 p-5 overflow-y-auto">
          <h3 className="text-xs font-bold text-[var(--tz-text-primary)] uppercase tracking-wider mb-6 flex items-center gap-2">
            <Activity size={14} className="text-[var(--tz-text-muted)]" />
            Daily Metrics
          </h3>

          <div className="space-y-6">
            {/* Playbook */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[var(--tz-text-muted)] uppercase tracking-wider flex items-center justify-between">
                <span>Playbook</span>
              </label>
              <select
                value={journal.playbook || ""}
                onChange={(e) => handleContentChange("playbook" as keyof DailyLog, e.target.value)}
                className="w-full h-9 px-2 rounded-lg border border-[var(--tz-border-subtle)] focus:outline-none focus:ring-1 focus:ring-[var(--tz-accent)] bg-[var(--tz-bg-card)] text-[var(--tz-text-primary)] text-xs font-semibold"
              >
                <option value="">None</option>
                {playbooks.map((pb) => (
                  <option key={pb.id} value={pb.name}>
                    {pb.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[var(--tz-text-muted)] uppercase tracking-wider flex items-center justify-between">
                <span>Overall Rating</span>
                <span className="text-[var(--tz-text-primary)]">{journal.rating}/5</span>
              </label>
              <div className="flex items-center justify-between">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    onClick={() => handleScoreChange("rating", score)}
                    className={`w-8 h-8 rounded flex items-center justify-center transition-all ${
                      (journal.rating || 0) >= score
                        ? "text-yellow-400 hover:text-yellow-500"
                        : "text-gray-300 dark:text-gray-700 hover:text-gray-400 dark:hover:text-gray-500"
                    }`}
                  >
                    <Star size={18} fill={(journal.rating || 0) >= score ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
            </div>

            {/* Confidence */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[var(--tz-text-muted)] uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Zap size={12} /> Confidence</span>
                <span className="text-[var(--tz-text-primary)]">{journal.confidence}/5</span>
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={journal.confidence || 3}
                onChange={(e) => handleScoreChange("confidence", parseInt(e.target.value))}
                className="w-full accent-[var(--tz-accent)]"
              />
              <div className="flex justify-between text-[10px] text-[var(--tz-text-muted)]">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            {/* Discipline */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[var(--tz-text-muted)] uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Shield size={12} /> Discipline</span>
                <span className="text-[var(--tz-text-primary)]">{journal.discipline}/5</span>
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={journal.discipline || 3}
                onChange={(e) => handleScoreChange("discipline", parseInt(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-[var(--tz-text-muted)]">
                <span>Poor</span>
                <span>Perfect</span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xs font-bold text-[var(--tz-text-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity size={14} className="text-[var(--tz-text-muted)]" />
              Today's Trades
            </h3>
            <div className="space-y-3">
              {trades.length === 0 ? (
                <p className="text-xs text-[var(--tz-text-muted)] italic">No trades today.</p>
              ) : (
                trades.map((t) => (
                  <div key={t.id} className="p-3 bg-[var(--tz-bg-card)] rounded-lg border border-[var(--tz-border-subtle)] shadow-sm">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-[var(--tz-text-primary)]">{t.symbol} <span className={t.side === "Long" ? "text-emerald-500" : "text-red-500"}>{t.side}</span></span>
                      <span className={`text-xs font-bold ${t.netPnl >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                        {t.netPnl >= 0 ? "+" : ""}${Math.abs(t.netPnl).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-[var(--tz-text-muted)] mb-1">
                      <Clock size={10} />
                      <span>{t.time}</span>
                      {t.entryTimeFrame && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-[var(--tz-border)]" />
                          <span>{t.entryTimeFrame} TF</span>
                        </>
                      )}
                    </div>
                    <div className="flex justify-between text-[10px] text-[var(--tz-text-secondary)]">
                      <span>In: ${t.entry.toFixed(2)}</span>
                      <span>Out: {t.exit ? `$${t.exit.toFixed(2)}` : "Open"}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Main Content Area (Text Editors) ───────────────────────────── */}
        <div className="flex-1 flex flex-col bg-[var(--tz-bg-card)]">
          {/* Tabs */}
          <div className="flex items-center gap-6 px-6 pt-4 border-b border-[var(--tz-border-subtle)]">
            {[
              { id: "pre", label: "Pre-Market" },
              { id: "main", label: "Trade Journal" },
              { id: "post", label: "Post-Market" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 text-sm font-bold border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "text-[var(--tz-accent)] border-[var(--tz-accent)]"
                    : "text-[var(--tz-text-muted)] border-transparent hover:text-[var(--tz-text-primary)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Editor Container */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "pre" && (
              <div className="h-full flex flex-col">
                <p className="text-xs text-[var(--tz-text-muted)] mb-4">
                  What is your game plan for today? Any news events, key levels, or specific setups you are watching?
                </p>
                <div className="flex-1 min-h-[300px]">
                  <RichTextEditor
                    content={journal.preMarketNotes || ""}
                    onChange={(html) => handleContentChange("preMarketNotes", html)}
                    placeholder="Write your pre-market analysis here..."
                    minHeight="400px"
                  />
                </div>
              </div>
            )}

            {activeTab === "main" && (
              <div className="h-full flex flex-col">
                <p className="text-xs text-[var(--tz-text-muted)] mb-4">
                  Log your thoughts, emotions, and decisions while trading today. Paste screenshots of your charts.
                </p>
                <div className="flex-1 min-h-[300px]">
                  <RichTextEditor
                    content={journal.notes || ""}
                    onChange={(html) => handleContentChange("notes", html)}
                    placeholder="Start journaling your trades here..."
                    minHeight="400px"
                  />
                </div>
              </div>
            )}

            {activeTab === "post" && (
              <div className="h-full flex flex-col">
                <p className="text-xs text-[var(--tz-text-muted)] mb-4">
                  Reflect on the day. Did you follow your rules? What did you do well? What can you improve?
                </p>
                <div className="flex-1 min-h-[300px]">
                  <RichTextEditor
                    content={journal.postMarketNotes || ""}
                    onChange={(html) => handleContentChange("postMarketNotes", html)}
                    placeholder="Write your post-market reflection here..."
                    minHeight="400px"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
