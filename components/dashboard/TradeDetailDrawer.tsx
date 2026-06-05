"use client";

import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trade } from "@/lib/data";
import {
  Calendar,
  Clock,
  DollarSign,
  Percent,
  TrendingUp,
  TrendingDown,
  FileText,
  Upload,
  Trash2,
  Check,
  CheckSquare,
  Smile,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface TradeDetailDrawerProps {
  trade: Trade | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTrade: Trade) => void;
}

const EMOTIONS = [
  "Calm",
  "Disciplined",
  "Confident",
  "Anxious",
  "Impatient",
  "Greedy",
  "Fear of Loss",
  "FOMO",
  "Revenge",
  "Boredom",
];

export function TradeDetailDrawer({
  trade,
  isOpen,
  onClose,
  onSave,
}: TradeDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // State for editable fields
  const [playbook, setPlaybook] = useState("");
  const [notes, setNotes] = useState("");
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [emotions, setEmotions] = useState<string[]>([]);
  const [fomo, setFomo] = useState(3);
  const [discipline, setDiscipline] = useState(3);
  const [patience, setPatience] = useState(3);
  const [focus, setFocus] = useState(3);

  // Checklist
  const [planFollowed, setPlanFollowed] = useState(false);
  const [riskManaged, setRiskManaged] = useState(false);
  const [entryConfirmed, setEntryConfirmed] = useState(false);
  const [stopLossSet, setStopLossSet] = useState(false);

  // Sync state with selected trade
  useEffect(() => {
    if (trade) {
      setPlaybook(trade.playbook || "");
      setNotes(trade.psychology?.notes || "");
      setScreenshots(trade.screenshots || []);
      setEmotions(trade.psychology?.emotions || []);
      setFomo(trade.psychology?.fomo || 3);
      setDiscipline(trade.psychology?.discipline || 3);
      setPatience(trade.psychology?.patience || 3);
      setFocus(trade.psychology?.focus || 3);

      setPlanFollowed(trade.rulesChecklist?.planFollowed ?? false);
      setRiskManaged(trade.rulesChecklist?.riskManaged ?? false);
      setEntryConfirmed(trade.rulesChecklist?.entryConfirmed ?? false);
      setStopLossSet(trade.rulesChecklist?.stopLossSet ?? false);
    }
  }, [trade]);

  if (!trade) return null;

  const handleEmotionToggle = (emo: string) => {
    setEmotions((prev) =>
      prev.includes(emo) ? prev.filter((e) => e !== emo) : [...prev, emo],
    );
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setScreenshots((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteScreenshot = (index: number) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const updatedTrade: Trade = {
      ...trade,
      playbook: playbook || null,
      hasNote: notes.trim().length > 0,
      screenshots,
      psychology: {
        fomo,
        discipline,
        patience,
        focus,
        emotions,
        notes,
      },
      rulesChecklist: {
        planFollowed,
        riskManaged,
        entryConfirmed,
        stopLossSet,
      },
    };
    onSave(updatedTrade);
    onClose();
  };

  const isWin = trade.netPnl >= 0;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[550px] border-l border-gray-100 p-0 flex flex-col h-full bg-white text-gray-800"
      >
        {/* Header Section */}
        <div className="p-5 border-b border-gray-100 shrink-0">
          <div className="flex justify-between items-start gap-4 pr-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">
                  Trade #{trade.id}
                </span>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                  style={{
                    background: trade.side === "Long" ? "#d4edda" : "#fde0e0",
                    color: trade.side === "Long" ? "#1a7a5e" : "#c0392b",
                  }}
                >
                  {trade.side}
                </span>
              </div>
              <SheetTitle className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                {trade.symbol}{" "}
                <span className="text-gray-300 font-light font-sans">|</span>
                <span style={{ color: isWin ? "#26a69a" : "#ef5350" }}>
                  {isWin ? "+" : ""}${Math.abs(trade.netPnl).toFixed(2)}
                </span>
              </SheetTitle>
              <p className="text-xs text-gray-400 mt-1">
                Executed on {trade.date} at {trade.time}
              </p>
            </div>

            <div className="text-right flex flex-col items-end">
              <span
                className="text-xs font-bold px-2 py-1 rounded-lg"
                style={{
                  background: trade.rr >= 0 ? "#e6f4ea" : "#fce8e6",
                  color: trade.rr >= 0 ? "#1a7a5e" : "#c0392b",
                }}
              >
                {trade.rr >= 0 ? "+" : ""}
                {trade.rr.toFixed(2)} R
              </span>
              <span className="text-[10px] text-gray-400 mt-1 font-mono">
                Duration: {trade.duration} mins
              </span>
            </div>
          </div>
        </div>

        {/* Tabs and Body Scroll Area */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="px-5 pt-2 border-b border-gray-100 bg-gray-50/50 shrink-0">
            <TabsList className="bg-gray-100/80 p-0.5 h-8 rounded-lg w-full flex">
              <TabsTrigger value="overview" className="flex-1 py-1">
                Overview
              </TabsTrigger>
              <TabsTrigger value="screenshots" className="flex-1 py-1">
                Screenshots ({screenshots.length})
              </TabsTrigger>
              <TabsTrigger value="psychology" className="flex-1 py-1">
                Psychology & Rules
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* OVERVIEW TAB */}
            <TabsContent
              value="overview"
              className="space-y-4 m-0 focus:outline-none"
            >
              {/* Execution Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="tz-card p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                    <DollarSign size={16} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                      Entry Price
                    </p>
                    <p className="text-sm font-bold text-gray-800">
                      ${trade.entry.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="tz-card p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                    <Percent size={16} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                      Exit Price
                    </p>
                    <p className="text-sm font-bold text-gray-800">
                      {trade.exit
                        ? `$${trade.exit.toFixed(2)}`
                        : "Open Position"}
                    </p>
                  </div>
                </div>
                <div className="tz-card p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                    <Clock size={16} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                      Quantity
                    </p>
                    <p className="text-sm font-bold text-gray-800">
                      {trade.qty} shares
                    </p>
                  </div>
                </div>
                <div className="tz-card p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                    <Calendar size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                      Commissions
                    </p>
                    <p className="text-sm font-bold text-gray-800">
                      ${trade.commissions.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Playbook Classification */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                  <Zap size={13} className="text-indigo-500" /> Playbook
                  Strategy
                </label>
                <select
                  value={playbook}
                  onChange={(e) => setPlaybook(e.target.value)}
                  className="w-full text-xs h-9 px-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">No Strategy Select</option>
                  <option value="Breakout">Breakout</option>
                  <option value="VWAP Rejection">VWAP Rejection</option>
                  <option value="Gap & Go">Gap & Go</option>
                  <option value="Reversal">Reversal</option>
                  <option value="Momentum">Momentum</option>
                  <option value="Mean Reversion">Mean Reversion</option>
                </select>
              </div>

              {/* General Trade Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                  <FileText size={13} className="text-indigo-500" /> General
                  Trade Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Analyze execution setup, what went well, what could be improved..."
                  rows={6}
                  className="w-full text-xs p-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none leading-relaxed"
                />
              </div>
            </TabsContent>

            {/* SCREENSHOTS TAB */}
            <TabsContent
              value="screenshots"
              className="space-y-4 m-0 focus:outline-none"
            >
              {/* Dropzone Upload */}
              <div className="relative border-2 border-dashed border-gray-200 hover:border-indigo-400 rounded-xl p-6 text-center cursor-pointer transition-colors bg-gray-50/50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-700">
                  Upload execution chart screenshot
                </p>
                <p className="text-[10px] text-gray-400 mt-1">
                  Drag and drop or click to browse files (PNG, JPG)
                </p>
              </div>

              {/* Screenshots Gallery */}
              <div className="space-y-3.5 mt-2">
                {screenshots.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 text-xs">
                    No screenshots uploaded for this trade yet.
                  </div>
                ) : (
                  screenshots.map((url, i) => (
                    <div
                      key={i}
                      className="group relative rounded-xl overflow-hidden border border-gray-100 shadow-xs bg-black/5"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Screenshot ${i + 1}`}
                        className="w-full object-cover max-h-[250px]"
                      />
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteScreenshot(i)}
                          className="p-1.5 rounded-lg bg-white/95 hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors shadow-sm"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <div className="bg-white px-3.5 py-2 border-t border-gray-100">
                        <p className="text-[10px] font-semibold text-gray-400">
                          Chart Screenshot #{i + 1}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* PSYCHOLOGY & RULES TAB */}
            <TabsContent
              value="psychology"
              className="space-y-5 m-0 focus:outline-none"
            >
              {/* Emotion Tags */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                  <Smile size={13} className="text-indigo-500" /> Mindset &
                  Emotions during trade
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {EMOTIONS.map((emo) => {
                    const selected = emotions.includes(emo);
                    const negative = [
                      "Anxious",
                      "Impatient",
                      "Greedy",
                      "Fear of Loss",
                      "FOMO",
                      "Revenge",
                    ].includes(emo);
                    return (
                      <button
                        key={emo}
                        onClick={() => handleEmotionToggle(emo)}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                          selected
                            ? negative
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {emo}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Psychology Sliders */}
              <div className="space-y-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <h4 className="text-xs font-bold text-gray-700 border-b border-gray-100 pb-2">
                  Psychological Self-Rating
                </h4>

                {/* Discipline */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-medium">
                      Discipline to Plan
                    </span>
                    <span className="font-bold text-indigo-600 font-mono">
                      {discipline}/5
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={discipline}
                    onChange={(e) => setDiscipline(parseInt(e.target.value))}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[9px] text-gray-400">
                    <span>Revenge Trade</span>
                    <span>Perfect Execution</span>
                  </div>
                </div>

                {/* FOMO Level */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-medium">
                      FOMO (Fear Of Missing Out)
                    </span>
                    <span className="font-bold text-indigo-600 font-mono">
                      {fomo}/5
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={fomo}
                    onChange={(e) => setFomo(parseInt(e.target.value))}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[9px] text-gray-400">
                    <span>No FOMO</span>
                    <span>Severe Chasing</span>
                  </div>
                </div>

                {/* Patience */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-medium">
                      Patience for Setup
                    </span>
                    <span className="font-bold text-indigo-600 font-mono">
                      {patience}/5
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={patience}
                    onChange={(e) => setPatience(parseInt(e.target.value))}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[9px] text-gray-400">
                    <span>Impulsive Entry</span>
                    <span>Waited perfectly</span>
                  </div>
                </div>

                {/* Focus */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-medium">
                      Execution Focus
                    </span>
                    <span className="font-bold text-indigo-600 font-mono">
                      {focus}/5
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={focus}
                    onChange={(e) => setFocus(parseInt(e.target.value))}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[9px] text-gray-400">
                    <span>Distracted</span>
                    <span>Highly Focused</span>
                  </div>
                </div>
              </div>

              {/* Rules Checklist */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                  <Shield size={13} className="text-indigo-500" /> Rules
                  Compliance Checklist
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors bg-white">
                    <input
                      type="checkbox"
                      checked={planFollowed}
                      onChange={(e) => setPlanFollowed(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <p className="text-xs font-bold text-gray-700">
                        Traded the plan
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Entry, target, and stop loss were pre-determined and
                        followed.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors bg-white">
                    <input
                      type="checkbox"
                      checked={riskManaged}
                      onChange={(e) => setRiskManaged(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <p className="text-xs font-bold text-gray-700">
                        Position sized correctly
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Risked the proper percentage of capital based on setup
                        rating.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors bg-white">
                    <input
                      type="checkbox"
                      checked={entryConfirmed}
                      onChange={(e) => setEntryConfirmed(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <p className="text-xs font-bold text-gray-700">
                        Entry criteria met & confirmed
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Waited for candle close or technical confirmation before
                        clicking buy/sell.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors bg-white">
                    <input
                      type="checkbox"
                      checked={stopLossSet}
                      onChange={(e) => setStopLossSet(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <p className="text-xs font-bold text-gray-700">
                        Hard stop loss set in broker
                      </p>
                      <p className="text-[10px] text-gray-400">
                        A physical stop order was active in the market
                        immediately upon entry.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 text-xs border-gray-200 hover:bg-gray-100 font-semibold text-gray-600 h-9"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 text-xs text-white font-semibold h-9"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
            }}
          >
            Save Changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
