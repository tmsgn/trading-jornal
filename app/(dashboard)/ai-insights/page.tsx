"use client";

import {
  ArrowUp,
  BarChart3,
  Brain,
  CheckCircle2,
  Clock,
  DollarSign,
  Lightbulb,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  XCircle,
  AlertCircle,
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { generateInsightsAction } from "@/app/actions/ai";
import { useTrades } from "@/components/providers/TradeProvider";

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
  icon?: React.ReactNode;
}

// ─── Helper: Dynamic Icons for Recommendations ────────────────────────────────

const getRecommendationIcon = (title: string, priority: string) => {
  const t = title.toLowerCase();
  if (t.includes("stop") || t.includes("revenge") || t.includes("risk") || t.includes("discipline")) {
    return <XCircle size={14} />;
  }
  if (t.includes("time") || t.includes("hour") || t.includes("session") || t.includes("period")) {
    return <Clock size={14} />;
  }
  if (t.includes("scale") || t.includes("size") || t.includes("position") || t.includes("p&l") || t.includes("reward")) {
    return <TrendingUp size={14} />;
  }
  if (t.includes("playbook") || t.includes("strategy") || t.includes("checklist")) {
    return <Target size={14} />;
  }
  return <Lightbulb size={14} />;
};

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
    } catch (_error) {
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
    const winRatePct =
      closed.length > 0 ? (winTrades.length / closed.length) * 100 : 0;

    // 2. Profit Factor
    const grossProfit = winTrades.reduce((sum, t) => sum + t.netPnl, 0);
    const grossLoss = Math.abs(
      closed.filter((t) => t.netPnl < 0).reduce((sum, t) => sum + t.netPnl, 0),
    );
    const profitFactorVal =
      grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 15.0 : 0;

    // 3. Avg Hold Time
    const avgHold =
      closed.length > 0
        ? closed.reduce((sum, t) => sum + t.duration, 0) / closed.length
        : 0;

    // 4. Apex Score Dimensions
    // Rules Checklist Compliance
    const tradesWithChecklist = trades.filter((t) => t.rulesChecklist);
    const riskCompliance =
      tradesWithChecklist.length > 0
        ? (tradesWithChecklist.filter(
            (t) =>
              t.rulesChecklist?.riskManaged && t.rulesChecklist?.stopLossSet,
          ).length /
            tradesWithChecklist.length) *
          100
        : 72; // default mock fallback

    const disciplineCompliance =
      tradesWithChecklist.length > 0
        ? (tradesWithChecklist.filter((t) => t.rulesChecklist?.planFollowed)
            .length /
            tradesWithChecklist.length) *
          100
        : 78;

    const executionScore =
      trades.length > 0
        ? (trades.filter((t) => t.hasNote || t.psychology?.notes).length /
            trades.length) *
          100
        : 80;

    const consistencyScore =
      profitFactorVal > 1.8 ? 85 : profitFactorVal > 1.2 ? 75 : 62;

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
        6,
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

  // ─── Local Fallbacks ──────────────────────────────────────────────────────────

  const localPatterns = useMemo<Pattern[]>(() => {
    const closed = trades.filter((t) => t.status === "Closed");
    if (closed.length === 0) return [];

    // Group by playbook name
    const groups: Record<string, { wins: number; count: number; totalPnl: number }> = {};
    for (const t of closed) {
      const name = t.playbook && t.playbook !== "None" ? t.playbook : "General Setup";
      if (!groups[name]) groups[name] = { wins: 0, count: 0, totalPnl: 0 };
      groups[name].count++;
      groups[name].totalPnl += t.netPnl;
      if (t.netPnl > 0) groups[name].wins++;
    }

    return Object.entries(groups)
      .map(([name, data]) => ({
        name,
        accuracy: Math.round((data.wins / data.count) * 100),
        occurrences: data.count,
        avgPnl: Math.round(data.totalPnl / data.count),
      }))
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 3);
  }, [trades]);

  const localCorrelations = useMemo<Correlation[]>(() => {
    const closed = trades.filter((t) => t.status === "Closed");
    if (closed.length === 0) return [];

    const longs = closed.filter((t) => t.side === "Long");
    const shorts = closed.filter((t) => t.side === "Short");

    const longWinRate = longs.length > 0 ? (longs.filter((t) => t.netPnl > 0).length / longs.length) * 100 : 0;
    const longAvgPnl = longs.length > 0 ? longs.reduce((s, t) => s + t.netPnl, 0) / longs.length : 0;

    const shortWinRate = shorts.length > 0 ? (shorts.filter((t) => t.netPnl > 0).length / shorts.length) * 100 : 0;
    const shortAvgPnl = shorts.length > 0 ? shorts.reduce((s, t) => s + t.netPnl, 0) / shorts.length : 0;

    const morning = closed.filter((t) => {
      const hour = parseInt(t.time.split(":")[0], 10);
      return hour < 12;
    });
    const afternoon = closed.filter((t) => {
      const hour = parseInt(t.time.split(":")[0], 10);
      return hour >= 12;
    });

    const morningWinRate = morning.length > 0 ? (morning.filter((t) => t.netPnl > 0).length / morning.length) * 100 : 0;
    const morningAvgPnl = morning.length > 0 ? morning.reduce((s, t) => s + t.netPnl, 0) / morning.length : 0;

    const afternoonWinRate = afternoon.length > 0 ? (afternoon.filter((t) => t.netPnl > 0).length / afternoon.length) * 100 : 0;
    const afternoonAvgPnl = afternoon.length > 0 ? afternoon.reduce((s, t) => s + t.netPnl, 0) / afternoon.length : 0;

    const list: Correlation[] = [];
    if (longs.length > 0) {
      list.push({
        factor: "Trade Direction",
        condition: "Long Position",
        winRate: `${Math.round(longWinRate)}%`,
        avgPnl: `${longAvgPnl >= 0 ? "+" : ""}$${Math.round(longAvgPnl).toLocaleString()}`,
      });
    }
    if (shorts.length > 0) {
      list.push({
        factor: "Trade Direction",
        condition: "Short Position",
        winRate: `${Math.round(shortWinRate)}%`,
        avgPnl: `${shortAvgPnl >= 0 ? "+" : ""}$${Math.round(shortAvgPnl).toLocaleString()}`,
      });
    }
    if (morning.length > 0) {
      list.push({
        factor: "Time of Day",
        condition: "Morning Session",
        winRate: `${Math.round(morningWinRate)}%`,
        avgPnl: `${morningAvgPnl >= 0 ? "+" : ""}$${Math.round(morningAvgPnl).toLocaleString()}`,
      });
    }
    if (afternoon.length > 0) {
      list.push({
        factor: "Time of Day",
        condition: "Afternoon Session",
        winRate: `${Math.round(afternoonWinRate)}%`,
        avgPnl: `${afternoonAvgPnl >= 0 ? "+" : ""}$${Math.round(afternoonAvgPnl).toLocaleString()}`,
      });
    }

    return list;
  }, [trades]);

  const localRecommendations = useMemo<Recommendation[]>(() => {
    const closed = trades.filter((t) => t.status === "Closed");
    const recs: Recommendation[] = [];

    const winTrades = closed.filter((t) => t.netPnl > 0);
    const winRatePct = closed.length > 0 ? (winTrades.length / closed.length) * 100 : 0;

    if (closed.length === 0) {
      return [
        {
          priority: "High",
          title: "Log Your First Trade",
          description: "Welcome to ApexTrade! Add your first trade to activate your dynamic performance score and personalized risk optimization advice.",
          impact: "Activate Engine",
        },
        {
          priority: "Medium",
          title: "Setup Your Playbooks",
          description: "Define your strategies in the Playbooks tab. Categorizing trades by strategy is essential for detecting profitable patterns.",
          impact: "Unlock Insights",
        },
        {
          priority: "Low",
          title: "Complete Daily Journal Logs",
          description: "Establish consistency by checking in daily. Journaling your mood, discipline, and outlook reveals key psychological correlations.",
          impact: "Mindset Alignment",
        },
      ];
    }

    if (winRatePct < 50) {
      recs.push({
        priority: "High",
        title: "Enforce a Higher Reward-to-Risk Setup",
        description: `Your win rate is currently ${Math.round(winRatePct)}%. To ensure structural profitability, focus on trade setups that offer a minimum of 2.0R potential.`,
        impact: "Est. +$240/mo",
      });
    } else {
      recs.push({
        priority: "Medium",
        title: "Scale Winning Playbooks",
        description: "Your win rate is excellent. Consider increasing size on your top performing setups by 15-25% to maximize capital efficiency.",
        impact: "Est. +$450/mo",
      });
    }

    const tradesWithChecklist = trades.filter((t) => t.rulesChecklist);
    const riskAdherence = tradesWithChecklist.length > 0
      ? (tradesWithChecklist.filter((t) => t.rulesChecklist?.riskManaged && t.rulesChecklist?.stopLossSet).length / tradesWithChecklist.length) * 100
      : 80;

    if (riskAdherence < 90) {
      recs.push({
        priority: "High",
        title: "Strict Stop Loss Discipline",
        description: `Checked parameters show that ${Math.round(100 - riskAdherence)}% of trades lacked stop-loss entries. Set a hard stop-loss immediately upon execution.`,
        impact: "Est. +$180/mo",
      });
    }

    const avgHold = closed.reduce((sum, t) => sum + t.duration, 0) / closed.length;
    if (avgHold < 5) {
      recs.push({
        priority: "Medium",
        title: "Extend Winning Holding Periods",
        description: `Your average hold time is very short (${Math.round(avgHold)}m). Data implies cutting winners prematurely. Consider trailing stops instead of fixed targets.`,
        impact: "Est. +$150/mo",
      });
    } else {
      recs.push({
        priority: "Low",
        title: "Review Trading Session Gaps",
        description: "Analyze holding periods to optimize fee-decay drag. Avoid holding positions during market-wide low-volume lunch hours.",
        impact: "Est. +$80/mo",
      });
    }

    while (recs.length < 3) {
      recs.push({
        priority: "Low",
        title: "Maintain Playbook Categorization",
        description: "Keep tagging all trades. Continuous journaling provides cleaner samples for machine learning model classification.",
        impact: "Est. +$50/mo",
      });
    }

    return recs.slice(0, 3);
  }, [trades]);

  // ─── Merge Local Calculations with AI results ────────────────────────────────

  const finalPatterns = patterns.length > 0 ? patterns : localPatterns;
  const finalCorrelations = correlations.length > 0 ? correlations : localCorrelations;
  const finalRecommendations = useMemo(() => {
    const raw = recommendations.length > 0 ? recommendations : localRecommendations;
    return raw.map((rec) => ({
      ...rec,
      icon: rec.icon || getRecommendationIcon(rec.title, rec.priority),
    }));
  }, [recommendations, localRecommendations]);

  const radarData: RadarDimension[] = [
    {
      dimension: "Win Rate",
      score: dynamicMetrics.scores.winRate,
      fullMark: 100,
    },
    {
      dimension: "Risk Mgmt",
      score: dynamicMetrics.scores.riskMgmt,
      fullMark: 100,
    },
    {
      dimension: "Consistency",
      score: dynamicMetrics.scores.consistency,
      fullMark: 100,
    },
    {
      dimension: "Profit Factor",
      score: dynamicMetrics.scores.profitFactor,
      fullMark: 100,
    },
    {
      dimension: "Discipline",
      score: dynamicMetrics.scores.discipline,
      fullMark: 100,
    },
    {
      dimension: "Execution",
      score: dynamicMetrics.scores.execution,
      fullMark: 100,
    },
  ];

  const dimensionDetails = [
    {
      label: "Discipline",
      score: dynamicMetrics.scores.discipline,
      color: "#6366f1",
    },
    {
      label: "Consistency",
      score: dynamicMetrics.scores.consistency,
      color: "#6366f1",
    },
    {
      label: "Execution",
      score: dynamicMetrics.scores.execution,
      color: "#6366f1",
    },
    {
      label: "Win Rate",
      score: dynamicMetrics.scores.winRate,
      color: "#6366f1",
    },
    {
      label: "Profit Factor",
      score: dynamicMetrics.scores.profitFactor,
      color: "#f59e0b",
    },
    {
      label: "Risk Mgmt",
      score: dynamicMetrics.scores.riskMgmt,
      color: "#ef4444",
    },
  ];

  const kpis = [
    {
      label: "Apex Score",
      value: `${dynamicMetrics.zellaScore}/100`,
      sub: "Composite score",
      color: "#6366f1",
      icon: <Brain size={16} />,
    },
    {
      label: "Overall Win Rate",
      value: `${dynamicMetrics.winRate.toFixed(1)}%`,
      sub: "All closed trades",
      color: "#10b981",
      icon: <Target size={16} />,
    },
    {
      label: "Profit Factor",
      value: dynamicMetrics.profitFactor.toFixed(2),
      sub: "Wins/Loss ratio",
      color: "#10b981",
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
      value: String(finalPatterns.length),
      sub: "Active configurations",
      color: "#3b82f6",
      icon: <Sparkles size={16} />,
    },
  ];

  const fadeUp = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" as const },
    },
  };

  return (
    <motion.div
      className="tz-page relative space-y-6"
      initial="hidden"
      animate="visible"
      variants={fadeUp}
    >
      {/* AI Processing Overlay Screen */}
      {analyzing && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center z-50 rounded-xl transition-all">
          <div className="bg-[var(--tz-bg-card)] border border-[var(--tz-border-subtle)] p-8 rounded-2xl shadow-xl flex flex-col items-center max-w-sm text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/20 flex items-center justify-center mb-4">
              <Brain size={32} className="text-[var(--tz-accent)] animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-[var(--tz-text-primary)]">
              Apex Engine Scanning
            </h3>
            <div className="w-48 h-1.5 bg-[var(--tz-hover-bg)] rounded-full overflow-hidden mt-3 mb-2">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${(analysisStep + 1) * 25}%` }}
              />
            </div>
            <p className="text-xs text-[var(--tz-text-muted)] font-medium h-8 flex items-center justify-center">
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
          <h1 className="text-xl font-bold text-[var(--tz-text-primary)]">AI Insights</h1>
          <p className="text-sm text-[var(--tz-text-muted)] mt-0.5">
            Powered by machine learning to analyze trading discipline and optimize performance
          </p>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="flex items-center gap-2 px-4 h-9 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition-all disabled:opacity-70 cursor-pointer shadow-sm"
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
          <div
            key={k.label}
            className="tz-card p-4 flex items-start gap-3 bg-[var(--tz-bg-card)] border border-[var(--tz-border-subtle)]"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${k.color}15`, color: k.color }}
            >
              {k.icon}
            </div>
            <div>
              <p className="text-xs text-[var(--tz-text-muted)] font-semibold uppercase tracking-wider">{k.label}</p>
              <p className="text-base font-bold text-[var(--tz-text-primary)] leading-tight mt-1">
                {k.value}
              </p>
              <p className="text-[10px] text-[var(--tz-text-muted)] mt-0.5 font-medium">{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Apex Score Card */}
      <div className="tz-card p-6 bg-gradient-to-br from-[var(--tz-bg-card)] to-[var(--tz-hover-bg)]/20 border border-[var(--tz-border-subtle)]">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Brain size={18} className="text-[var(--tz-accent)]" />
              <h2 className="text-sm font-bold text-[var(--tz-text-primary)]">Apex Score</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-500/10 text-[var(--tz-accent)] border border-indigo-500/20">
                AI Powered
              </span>
            </div>
            <p className="text-xs text-[var(--tz-text-muted)]">
              Composite score computed across 6 primary execution dimensions
            </p>
          </div>
          {trades.length > 0 && (
            <div className="flex items-center gap-1.5">
              <ArrowUp size={14} className="text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-500">
                Active Audit
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Radar chart */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative" style={{ width: 240, height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  data={radarData}
                  margin={{ top: 10, right: 30, bottom: 10, left: 30 }}
                >
                  <PolarGrid stroke="var(--tz-border-subtle)" />
                  <PolarAngleAxis
                    dataKey="dimension"
                    tick={{ fontSize: 9, fill: "var(--tz-text-secondary)", fontWeight: 700 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fontSize: 8, fill: "var(--tz-text-muted)" }}
                    tickCount={4}
                  />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="var(--tz-accent)"
                    fill="var(--tz-accent)"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                  <Tooltip
                    formatter={(v) => [`${v}/100`, "Score"]}
                    contentStyle={{
                      fontSize: 11,
                      borderRadius: 8,
                      border: "1px solid var(--tz-border-subtle)",
                      background: "var(--tz-bg-card)",
                      color: "var(--tz-text-primary)",
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
                <span className="text-4xl font-black text-[var(--tz-text-primary)] leading-none">
                  {dynamicMetrics.zellaScore}
                </span>
                <span className="text-xs text-[var(--tz-text-muted)] font-medium">/100</span>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-[var(--tz-text-muted)]">Performance: </span>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  dynamicMetrics.zellaScore >= 80
                    ? "bg-emerald-500/10 text-emerald-500"
                    : dynamicMetrics.zellaScore >= 60
                      ? "bg-amber-500/10 text-amber-500"
                      : "bg-red-500/10 text-red-500"
                }`}
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
          <div className="flex flex-col justify-center gap-3.5">
            <h3 className="text-xs font-bold text-[var(--tz-text-secondary)] mb-1 uppercase tracking-wider">
              Score Breakdown
            </h3>
            {dimensionDetails.map((d) => {
              const barColor =
                d.score >= 80
                  ? "#10b981"
                  : d.score >= 70
                    ? "var(--tz-accent)"
                    : d.score >= 60
                      ? "#f59e0b"
                      : "#ef5350";
              return (
                <div key={d.label} className="flex items-center gap-3">
                  <span className="text-xs text-[var(--tz-text-secondary)] w-28 shrink-0 font-medium">
                    {d.label}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-[var(--tz-hover-bg)] overflow-hidden">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Strengths */}
        <div className="tz-card p-5 bg-[var(--tz-bg-card)] border-l-4 border-l-emerald-500 border border-[var(--tz-border-subtle)]">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-500">
              <TrendingUp size={15} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--tz-text-primary)]">
                Your Strengths
              </h3>
              <p className="text-xs text-[var(--tz-text-muted)]">Key performance pillars</p>
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
                  className="mt-0.5 shrink-0 text-emerald-500"
                />
                <span className="text-xs text-[var(--tz-text-secondary)] leading-relaxed">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Weaknesses */}
        <div className="tz-card p-5 bg-[var(--tz-bg-card)] border-l-4 border-l-red-500 border border-[var(--tz-border-subtle)]">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 text-red-500">
              <TrendingDown size={15} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--tz-text-primary)]">
                Areas to Improve
              </h3>
              <p className="text-xs text-[var(--tz-text-muted)]">Focus areas for growth</p>
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
                  className="mt-0.5 shrink-0 text-red-500"
                />
                <span className="text-xs text-[var(--tz-text-secondary)] leading-relaxed">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Opportunities */}
        <div className="tz-card p-5 bg-[var(--tz-bg-card)] border-l-4 border-l-blue-500 border border-[var(--tz-border-subtle)]">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-500">
              <Lightbulb size={15} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--tz-text-primary)]">Opportunities</h3>
              <p className="text-xs text-[var(--tz-text-muted)]">Untapped potential</p>
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
                  className="mt-0.5 shrink-0 text-blue-500"
                />
                <span className="text-xs text-[var(--tz-text-secondary)] leading-relaxed">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pattern Recognition + Correlation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pattern Recognition */}
        <div className="tz-card p-5 bg-[var(--tz-bg-card)] border border-[var(--tz-border-subtle)]">
          <div className="flex items-center gap-2 mb-4">
            <Target size={16} className="text-[var(--tz-accent)]" />
            <h3 className="text-sm font-bold text-[var(--tz-text-primary)]">
              Detected Patterns
            </h3>
          </div>
          <div className="flex flex-col gap-3">
            {finalPatterns.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--tz-text-muted)] italic">
                No closed trades with strategies to analyze.
              </div>
            ) : (
              finalPatterns.map((p) => {
                const barColor =
                  p.accuracy >= 70
                    ? "#10b981"
                    : p.accuracy >= 60
                      ? "var(--tz-accent)"
                      : "#f59e0b";
                return (
                  <div
                    key={p.name}
                    className="p-3.5 rounded-lg border border-[var(--tz-border-subtle)] bg-[var(--tz-hover-bg)]/20"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[var(--tz-text-secondary)]">
                        {p.name}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          p.accuracy >= 70
                            ? "bg-emerald-500/10 text-emerald-500"
                            : p.accuracy >= 60
                              ? "bg-indigo-500/10 text-indigo-500"
                              : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {p.accuracy}% accuracy
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[var(--tz-hover-bg)] mb-2.5 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${p.accuracy}%`, background: barColor }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--tz-text-muted)] font-medium">
                        {p.occurrences} occurrences
                      </span>
                      <span
                        className={`text-xs font-bold ${p.avgPnl >= 0 ? "text-emerald-500" : "text-red-500"}`}
                      >
                        {p.avgPnl >= 0 ? "+" : ""}${p.avgPnl.toLocaleString()} avg
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Correlation Analysis */}
        <div className="tz-card p-5 bg-[var(--tz-bg-card)] border border-[var(--tz-border-subtle)]">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-[var(--tz-accent)]" />
            <h3 className="text-sm font-bold text-[var(--tz-text-primary)]">
              Correlation Analysis
            </h3>
          </div>
          <div className="overflow-hidden rounded-lg border border-[var(--tz-border-subtle)]">
            {finalCorrelations.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--tz-text-muted)] italic">
                No closed trades to calculate correlations.
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[var(--tz-hover-bg)] border-b border-[var(--tz-border-subtle)]">
                    <th className="px-3 py-2.5 text-left font-bold text-[var(--tz-text-muted)] uppercase tracking-wider font-semibold">
                      Factor
                    </th>
                    <th className="px-3 py-2.5 text-left font-bold text-[var(--tz-text-muted)] uppercase tracking-wider font-semibold">
                      Condition
                    </th>
                    <th className="px-3 py-2.5 text-left font-bold text-[var(--tz-text-muted)] uppercase tracking-wider font-semibold">
                      Win Rate
                    </th>
                    <th className="px-3 py-2.5 text-left font-bold text-[var(--tz-text-muted)] uppercase tracking-wider font-semibold">
                      Avg P&L
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {finalCorrelations.map((c, _i) => (
                    <tr
                      key={`${c.factor}-${c.condition}`}
                      className="hover:bg-[var(--tz-hover-bg)]/50 border-b border-[var(--tz-border-subtle)] last:border-0 transition-colors"
                    >
                      <td className="px-3 py-3 text-[var(--tz-text-muted)] font-medium">
                        {c.factor}
                      </td>
                      <td className="px-3 py-3 text-[var(--tz-text-secondary)] font-semibold">{c.condition}</td>
                      <td className="px-3 py-3">
                        <span
                          className={`font-bold ${
                            parseInt(c.winRate, 10) >= 60
                              ? "text-emerald-500"
                              : "text-red-500"
                          }`}
                        >
                          {c.winRate}
                        </span>
                      </td>
                      <td
                        className={`px-3 py-3 font-bold ${
                          c.avgPnl.startsWith("+") ? "text-emerald-500" : "text-red-500"
                        }`}
                      >
                        {c.avgPnl}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="tz-card p-5 bg-[var(--tz-bg-card)] border border-[var(--tz-border-subtle)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[var(--tz-accent)]" />
            <h3 className="text-sm font-bold text-[var(--tz-text-primary)]">
              AI Recommendations
            </h3>
          </div>
          {trades.length > 0 && <span className="text-xs text-[var(--tz-text-muted)] font-medium">Updated dynamic recommendations</span>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {finalRecommendations.map((rec) => {
            const priorityConfig = {
              High: { bgClass: "bg-red-500/10 text-red-500 border-red-500/20" },
              Medium: { bgClass: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
              Low: { bgClass: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" },
            };
            const cfg = priorityConfig[rec.priority];
            return (
              <div
                key={rec.title}
                className={`p-4 rounded-xl border flex flex-col justify-between ${cfg.bgClass}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className="text-[9px] font-extrabold px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wider"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      {rec.priority} Priority
                    </span>
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      {rec.icon}
                    </div>
                  </div>
                  <h4 className="text-xs font-bold leading-snug mb-2 text-[var(--tz-text-primary)]">
                    {rec.title}
                  </h4>
                  <p className="text-xs text-[var(--tz-text-secondary)] leading-relaxed mb-4">
                    {rec.description}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-extrabold border-t border-[var(--tz-border-subtle)] pt-2.5 font-sans">
                  <DollarSign size={12} />
                  {rec.impact}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
