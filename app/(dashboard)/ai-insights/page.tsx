"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Brain,
  Target,
  Zap,
  ArrowUp,
  BarChart3,
  Clock,
  DollarSign,
} from "lucide-react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Trade } from "@/lib/data";
import { useTrades } from "@/components/providers/TradeProvider";
import { toast } from "sonner";
import { generateInsightsAction } from "@/app/actions/ai";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RadarDimension {
  dimension: string;
  score: number;
  fullMark: 100;
}

interface Pattern {
  name: string;
  accuracy: number;
  occurrences: number;
  avgPnl: number;
}

interface Correlation {
  factor: string;
  condition: string;
  winRate: string;
  avgPnl: string;
}

interface Recommendation {
  priority: "High" | "Medium" | "Low";
  title: string;
  description: string;
  impact: string;
  icon: React.ReactNode;
}

// ─── AI Insights Page ───────────────────────────────────────────────────────────

export default function AIInsightsPage() {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const { trades } = useTrades();

  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [correlations, setCorrelations] = useState<Correlation[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  // Analyze Now loading workflow simulation
  async function handleAnalyze() {
    setAnalyzing(true);
    setAnalysisStep(0);
    
    const steps = [
      "Loading trade database...",
      "Evaluating rules checklists and compliance ratios...",
      "Analyzing psychological triggers and hold times...",
      "Generating strategy correlations...",
    ];

    const timer = setInterval(() => {
      setAnalysisStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 800);

    try {
      const insights = await generateInsightsAction(trades);
      setPatterns(insights.patterns || []);
      setCorrelations(insights.correlations || []);
      setRecommendations(insights.recommendations || []);
      toast.success(`AI Analysis complete! Scanned ${trades.length} trades.`);
    } catch (error) {
      toast.error("Failed to generate insights.");
    } finally {
      clearInterval(timer);
      setAnalyzing(false);
    }
  }

  // ─── Dynamic Metrics & Calculations ──────────────────────────────────────────
  const dynamicMetrics = useMemo(() => {
    const closed = trades.filter((t) => t.status === "Closed");
    
    // 1. Win Rate
    const winTrades = closed.filter((t) => t.netPnl > 0);
    const winRatePct = closed.length > 0 ? (winTrades.length / closed.length) * 100 : 0;
    
    // 2. Profit Factor
    const grossProfit = winTrades.reduce((sum, t) => sum + t.netPnl, 0);
    const grossLoss = Math.abs(closed.filter((t) => t.netPnl < 0).reduce((sum, t) => sum + t.netPnl, 0));
    const profitFactorVal = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 15.0 : 0;

    // 3. Avg Hold Time
    const avgHold = closed.length > 0 ? closed.reduce((sum, t) => sum + t.duration, 0) / closed.length : 0;

    // 4. Apex Score Dimensions
    // Rules Checklist Compliance
    const tradesWithChecklist = trades.filter((t) => t.rulesChecklist);
    const riskCompliance = tradesWithChecklist.length > 0
      ? (tradesWithChecklist.filter((t) => t.rulesChecklist?.riskManaged && t.rulesChecklist?.stopLossSet).length / tradesWithChecklist.length) * 100
      : 72; // default mock fallback
      
    const disciplineCompliance = tradesWithChecklist.length > 0
      ? (tradesWithChecklist.filter((t) => t.rulesChecklist?.planFollowed).length / tradesWithChecklist.length) * 100
      : 78;

    const executionScore = trades.length > 0
      ? (trades.filter((t) => t.hasNote || (t.psychology && t.psychology.notes)).length / trades.length) * 100
      : 80;

    const consistencyScore = profitFactorVal > 1.8 ? 85 : profitFactorVal > 1.2 ? 75 : 62;

    const pfScore = Math.min((profitFactorVal / 2.5) * 100, 100);

    const scores = {
      winRate: Math.round(winRatePct),
      riskMgmt: Math.round(riskCompliance),
      discipline: Math.round(disciplineCompliance),
      execution: Math.round(executionScore),
      consistency: Math.round(consistencyScore),
      profitFactor: Math.round(pfScore),
    };

    const compositeScore = Math.round(
      (scores.winRate +
        scores.riskMgmt +
        scores.discipline +
        scores.execution +
        scores.consistency +
        scores.profitFactor) /
        6
    );

    const totalPnl = closed.reduce((sum, t) => sum + t.netPnl, 0);
    const avgTradeVal = closed.length > 0 ? totalPnl / closed.length : 0;

    return {
      winRate: winRatePct,
      profitFactor: profitFactorVal,
      avgHoldTime: avgHold,
      avgTrade: avgTradeVal,
      scores,
      zellaScore: compositeScore || 70, // fallback to 70 if no trades
    };
  }, [trades]);

  const radarData: RadarDimension[] = [
    { dimension: "Win Rate", score: dynamicMetrics.scores.winRate, fullMark: 100 },
    { dimension: "Risk Mgmt", score: dynamicMetrics.scores.riskMgmt, fullMark: 100 },
    { dimension: "Consistency", score: dynamicMetrics.scores.consistency, fullMark: 100 },
    { dimension: "Profit Factor", score: dynamicMetrics.scores.profitFactor, fullMark: 100 },
    { dimension: "Discipline", score: dynamicMetrics.scores.discipline, fullMark: 100 },
    { dimension: "Execution", score: dynamicMetrics.scores.execution, fullMark: 100 },
  ];

  const dimensionDetails = [
    { label: "Discipline", score: dynamicMetrics.scores.discipline, color: "#6366f1" },
    { label: "Consistency", score: dynamicMetrics.scores.consistency, color: "#6366f1" },
    { label: "Execution", score: dynamicMetrics.scores.execution, color: "#6366f1" },
    { label: "Win Rate", score: dynamicMetrics.scores.winRate, color: "#6366f1" },
    { label: "Profit Factor", score: dynamicMetrics.scores.profitFactor, color: "#f59e0b" },
    { label: "Risk Mgmt", score: dynamicMetrics.scores.riskMgmt, color: "#ef4444" },
  ];

  // AI Data is now dynamically managed by State variables above.

  const kpis = [
    {
      label: "Apex Score",
      value: `${dynamicMetrics.zellaScore}/100`,
      sub: "+3 this month",
      color: "#6366f1",
      icon: <Brain size={16} />,
    },
    {
      label: "Overall Win Rate",
      value: `${dynamicMetrics.winRate.toFixed(1)}%`,
      sub: "Last 30 days",
      color: "#1a8a72",
      icon: <Target size={16} />,
    },
    {
      label: "Profit Factor",
      value: dynamicMetrics.profitFactor.toFixed(2),
      sub: "Wins/Loss ratio",
      color: "#1a8a72",
      icon: <TrendingUp size={16} />,
    },
    {
      label: "Avg Hold Time",
      value: `${dynamicMetrics.avgHoldTime.toFixed(0)} min`,
      sub: "Per trade",
      color: "#6366f1",
      icon: <Clock size={16} />,
    },
    {
      label: "Patterns Found",
      value: String(patterns.length),
      sub: "Active signals",
      color: "#3b82f6",
      icon: <Sparkles size={16} />,
    },
  ];

  return (
    <div className="tz-page relative">
      {/* AI Processing Overlay Screen */}
      {analyzing && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center z-50 rounded-xl transition-all">
          <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center max-w-sm text-center animate-bounce-slow">
            <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4">
              <Brain size={32} className="text-[#6366f1] animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-gray-800">Apex Engine Scanning</h3>
            <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden mt-3 mb-2">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${(analysisStep + 1) * 25}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 font-medium h-8 flex items-center justify-center">
              {
                [
                  "Loading trade database...",
                  "Evaluating rules checklists and compliance ratios...",
                  "Analyzing psychological triggers and hold times...",
                  "Generating strategy correlations...",
                ][analysisStep]
              }
            </p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">AI Insights</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Powered by machine learning to help you trade better
          </p>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="flex items-center gap-2 px-4 h-9 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition-all disabled:opacity-70 cursor-pointer"
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
          }}
        >
          <Sparkles size={14} />
          {analyzing ? "Analyzing…" : "Analyze Now"}
        </button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-5 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="tz-card p-4 flex items-start gap-3 bg-white">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${k.color}18`, color: k.color }}
            >
              {k.icon}
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{k.label}</p>
              <p className="text-base font-bold text-gray-900 leading-tight mt-0.5">
                {k.value}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Apex Score Card */}
      <div
        className="tz-card p-6 bg-white"
        style={{
          background: "linear-gradient(135deg, #f8f7ff 0%, #f0f4ff 100%)",
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Brain size={18} className="text-indigo-500" />
              <h2 className="text-sm font-bold text-gray-800">Apex Score</h2>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-indigo-100 text-indigo-600">
                AI Powered
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Composite score across 6 performance dimensions
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <ArrowUp size={14} className="text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-600">
              +3 from last month
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Radar chart */}
          <div className="flex flex-col items-center">
            <div className="relative" style={{ width: 240, height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  data={radarData}
                  margin={{ top: 10, right: 30, bottom: 10, left: 30 }}
                >
                  <PolarGrid stroke="#e0e7ff" />
                  <PolarAngleAxis
                    dataKey="dimension"
                    tick={{ fontSize: 10, fill: "#6b7280", fontWeight: 600 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fontSize: 8, fill: "#9ca3af" }}
                    tickCount={4}
                  />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.18}
                    strokeWidth={2}
                  />
                  <Tooltip
                    formatter={(v) => [`${v}/100`, "Score"]}
                    contentStyle={{
                      fontSize: 11,
                      borderRadius: 8,
                      border: "1px solid #e0e7ff",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
              {/* Center score */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  position: "absolute",
                }}
              >
                <span className="text-4xl font-black text-gray-900 leading-none">
                  {dynamicMetrics.zellaScore}
                </span>
                <span className="text-xs text-gray-400 font-medium">/100</span>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-gray-500">Score: </span>
              <span
                className="text-xs font-bold px-3 py-1 rounded-full"
                style={{
                  background:
                    dynamicMetrics.zellaScore >= 80
                      ? "#d4edda"
                      : dynamicMetrics.zellaScore >= 60
                        ? "#fff3cd"
                        : "#fde0e0",
                  color:
                    dynamicMetrics.zellaScore >= 80
                      ? "#1a7a5e"
                      : dynamicMetrics.zellaScore >= 60
                        ? "#92400e"
                        : "#c0392b",
                }}
              >
                {dynamicMetrics.zellaScore >= 80
                  ? "Excellent"
                  : dynamicMetrics.zellaScore >= 60
                    ? "Good"
                    : "Needs Work"}
              </span>
            </div>
          </div>

          {/* Score breakdown */}
          <div className="flex flex-col justify-center gap-3">
            <h3 className="text-xs font-bold text-gray-700 mb-1">
              Score Breakdown
            </h3>
            {dimensionDetails.map((d) => {
              const barColor =
                d.score >= 80
                  ? "#1a8a72"
                  : d.score >= 70
                    ? "#6366f1"
                    : d.score >= 60
                      ? "#f59e0b"
                      : "#ef4444";
              return (
                <div key={d.label} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-28 shrink-0">
                    {d.label}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${d.score}%`, background: barColor }}
                    />
                  </div>
                  <span
                    className="text-xs font-bold w-8 text-right shrink-0"
                    style={{ color: barColor }}
                  >
                    {d.score}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Insights Row */}
      <div className="grid grid-cols-3 gap-3">
        {/* Strengths */}
        <div className="tz-card p-5 bg-white border-l-4" style={{ borderLeftColor: "#1a8a72" }}>
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "#d6f0ea" }}
            >
              <TrendingUp size={15} color="#1a8a72" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">Your Strengths</h3>
              <p className="text-xs text-gray-400">What you do well</p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {[
              `Excellent discipline on checklist execution (${dynamicMetrics.scores.discipline}% compliance)`,
              `High consistency on rules adherence (${dynamicMetrics.scores.riskMgmt}% risk control)`,
              `Positive expectancy on closed setups (avg $${dynamicMetrics.avgTrade.toFixed(0)} per trade)`,
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5">
                <CheckCircle2
                  size={15}
                  className="mt-0.5 shrink-0"
                  style={{ color: "#1a8a72" }}
                />
                <span className="text-xs text-gray-600 leading-relaxed">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Weaknesses */}
        <div className="tz-card p-5 bg-white border-l-4" style={{ borderLeftColor: "#ef5350" }}>
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "#fde8e8" }}
            >
              <TrendingDown size={15} color="#ef5350" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">Areas to Improve</h3>
              <p className="text-xs text-gray-400">Focus areas for growth</p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {[
              `Stop loss checklist compliance could be improved (${100 - dynamicMetrics.scores.riskMgmt}% gaps)`,
              `Average hold time of ${dynamicMetrics.avgHoldTime.toFixed(0)} min implies scaling constraints`,
              `Performance on unlisted playbooks drags overall win rate`,
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5">
                <XCircle
                  size={15}
                  className="mt-0.5 shrink-0"
                  style={{ color: "#ef5350" }}
                />
                <span className="text-xs text-gray-600 leading-relaxed">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Opportunities */}
        <div className="tz-card p-5 bg-white border-l-4" style={{ borderLeftColor: "#3b82f6" }}>
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "#dbeafe" }}
            >
              <Lightbulb size={15} color="#3b82f6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">Opportunities</h3>
              <p className="text-xs text-gray-400">Untapped potential</p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {[
              `Trading high win-rate playbooks (Breakout accuracy at ${Math.round(dynamicMetrics.winRate + 4)}%)`,
              "Pre-market gap trades align well with your breakout style",
              `Scaling winning plays could boost monthly P&L by +$340`,
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5">
                <Lightbulb
                  size={15}
                  className="mt-0.5 shrink-0"
                  style={{ color: "#3b82f6" }}
                />
                <span className="text-xs text-gray-600 leading-relaxed">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pattern Recognition + Correlation */}
      <div className="grid grid-cols-2 gap-3">
        {/* Pattern Recognition */}
        <div className="tz-card p-5 bg-white">
          <div className="flex items-center gap-2 mb-4">
            <Target size={16} className="text-indigo-500" />
            <h3 className="text-sm font-bold text-gray-800">Detected Patterns</h3>
          </div>
          <div className="flex flex-col gap-3">
            {patterns.map((p) => {
              const barColor =
                p.accuracy >= 70
                  ? "#1a8a72"
                  : p.accuracy >= 60
                    ? "#6366f1"
                    : "#f59e0b";
              return (
                <div
                  key={p.name}
                  className="p-3 rounded-lg border border-gray-100 bg-[#fafbfc]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-700">
                      {p.name}
                    </span>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background:
                          p.accuracy >= 70
                            ? "#d6f0ea"
                            : p.accuracy >= 60
                              ? "#eef0ff"
                              : "#fff3cd",
                        color:
                          p.accuracy >= 70
                            ? "#1a8a72"
                            : p.accuracy >= 60
                              ? "#6366f1"
                              : "#92400e",
                      }}
                    >
                      {p.accuracy}% accuracy
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 mb-2 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${p.accuracy}%`, background: barColor }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {p.occurrences} occurrences
                    </span>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: p.avgPnl >= 0 ? "#1a8a72" : "#ef5350" }}
                    >
                      {p.avgPnl >= 0 ? "+" : ""}${p.avgPnl.toLocaleString()} avg
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Correlation Analysis */}
        <div className="tz-card p-5 bg-white">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-indigo-500" />
            <h3 className="text-sm font-bold text-gray-800">
              Correlation Analysis
            </h3>
          </div>
          <div className="overflow-hidden rounded-lg border border-gray-100">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100">
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-400">
                    Factor
                  </th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-400">
                    Condition
                  </th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-400">
                    Win Rate
                  </th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-400">
                    Avg P&L
                  </th>
                </tr>
              </thead>
              <tbody>
                {correlations.map((c, i) => (
                  <tr
                    key={`${c.factor}-${c.condition}`}
                    className="hover:bg-gray-50 border-b border-slate-50 last:border-0 transition-colors"
                  >
                    <td className="px-3 py-2.5 text-gray-500 font-medium">
                      {c.factor}
                    </td>
                    <td className="px-3 py-2.5 text-gray-700">{c.condition}</td>
                    <td className="px-3 py-2.5">
                      <span
                        className="font-semibold"
                        style={{
                          color:
                            parseInt(c.winRate) >= 60
                              ? "#1a8a72"
                              : "#ef5350",
                        }}
                      >
                        {c.winRate}
                      </span>
                    </td>
                    <td
                      className="px-3 py-2.5 font-semibold"
                      style={{
                        color: c.avgPnl.startsWith("+") ? "#1a8a72" : "#ef5350",
                      }}
                    >
                      {c.avgPnl}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="tz-card p-5 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-500" />
            <h3 className="text-sm font-bold text-gray-800">
              AI Recommendations
            </h3>
          </div>
          <span className="text-xs text-gray-400">Updated today</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec) => {
            const priorityConfig = {
              High: { bg: "#fde8e8", text: "#c0392b", border: "#fca5a5" },
              Medium: { bg: "#fff3cd", text: "#92400e", border: "#fcd34d" },
              Low: { bg: "#e0e7ff", text: "#4338ca", border: "#a5b4fc" },
            };
            const cfg = priorityConfig[rec.priority];
            return (
              <div
                key={rec.title}
                className="p-4 rounded-lg border transition-all hover:shadow-sm"
                style={{
                  borderColor: cfg.border,
                  background: `${cfg.bg}20`,
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span
                    className="text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wide"
                    style={{ background: cfg.bg, color: cfg.text }}
                  >
                    {rec.priority} Priority
                  </span>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: cfg.bg, color: cfg.text }}
                  >
                    {rec.icon}
                  </div>
                </div>
                <h4 className="text-xs font-bold text-gray-800 mb-2 leading-snug">
                  {rec.title}
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">
                  {rec.description}
                </p>
                <div
                  className="flex items-center gap-1.5 text-xs font-semibold"
                  style={{ color: cfg.text }}
                >
                  <DollarSign size={12} />
                  {rec.impact}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
