"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Target,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import {
  CumulativePnLCard,
  NetDailyPnLCard,
  PlaybookPerformance,
  ZellaScoreCard,
} from "@/components/dashboard/Charts";
import { StatsRow, WelcomeBar } from "@/components/dashboard/StatsRow";
import { TradeCalendar } from "@/components/dashboard/TradeCalendar";
import { useRouter } from "next/navigation";
import { TradesTable } from "@/components/dashboard/TradesTable";
import { useTrades } from "@/components/providers/TradeProvider";
import { Skeleton } from "@/components/ui/skeleton";
import type { Trade } from "@/lib/data";

/* ── Empty-state workflow cards ─────────────────────────────────────────── */
const WORKFLOW_CARDS = [
  {
    icon: Plus,
    title: "Log Trades",
    desc: "Record every trade with entry, exit, and strategy tags",
    gradient: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
  },
  {
    icon: TrendingUp,
    title: "Track Performance",
    desc: "See your equity curve, win rate, and key metrics",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)",
  },
  {
    icon: Target,
    title: "Improve Consistency",
    desc: "Use AI insights and playbooks to find your edge",
    gradient: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)",
  },
] as const;

/* ── Stagger animation variants ─────────────────────────────────────────── */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const { trades, updateTrade, isLoading } = useTrades();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleSelectTrade = (trade: Trade) => {
    router.push(`/journal?date=${trade.date}`);
  };

  const handleSaveTrade = async (updatedTrade: Trade) => {
    await updateTrade(updatedTrade.id, updatedTrade);
  };

  if (isLoading) {
    return (
      <div className="p-5 space-y-5 animate-pulse">
        {/* Welcome Bar Skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        {/* Stats Row Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>

        {/* Top Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>

        {/* Bottom Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
          <Skeleton className="h-96 lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-96 lg:col-span-3 rounded-2xl" />
        </div>
      </div>
    );
  }

  /* ── Empty state: zero trades ─────────────────────────────────────────── */
  if (trades.length === 0) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px 60px",
          background: "var(--tz-bg-page)",
        }}
      >
        {/* ── Hero card ──────────────────────────────────────────────────── */}
        <motion.div
          variants={itemVariants}
          style={{
            maxWidth: 520,
            width: "100%",
            background: "var(--tz-bg-card)",
            border: "1px solid var(--tz-border-subtle)",
            borderRadius: 24,
            padding: "48px 40px 44px",
            textAlign: "center",
            boxShadow: "var(--tz-shadow-lg)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative glow */}
          <div
            style={{
              position: "absolute",
              top: -60,
              left: "50%",
              transform: "translateX(-50%)",
              width: 340,
              height: 180,
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Icon badge */}
          <motion.div
            variants={itemVariants}
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background:
                "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              boxShadow:
                "0 8px 32px rgba(99,102,241,0.25), 0 0 0 6px rgba(99,102,241,0.08)",
            }}
          >
            <BarChart3 size={32} color="#fff" strokeWidth={2} />
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "var(--tz-text-primary)",
              margin: "0 0 10px",
              letterSpacing: "-0.02em",
              lineHeight: 1.3,
            }}
          >
            Welcome to your trading journal!
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            style={{
              fontSize: 15,
              lineHeight: 1.6,
              color: "var(--tz-text-muted)",
              margin: "0 0 32px",
              maxWidth: 380,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Start by adding your first trade to see your analytics come to
            life.
          </motion.p>

          {/* Primary CTA */}
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() =>
              window.dispatchEvent(new Event("tz_open_add_trade"))
            }
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "0 28px",
              height: 48,
              borderRadius: 14,
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 15,
              color: "#fff",
              background:
                "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
              boxShadow:
                "0 4px 20px rgba(99,102,241,0.3), 0 0 0 3px rgba(99,102,241,0.08)",
              transition: "box-shadow 0.2s ease",
            }}
          >
            <Plus size={18} strokeWidth={2.5} />
            Add Your First Trade
            <ArrowRight size={16} strokeWidth={2.5} />
          </motion.button>

          {/* Secondary text */}
          <motion.p
            variants={itemVariants}
            style={{
              fontSize: 13,
              color: "var(--tz-text-muted)",
              marginTop: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
            }}
          >
            <Sparkles size={13} />
            Or import trades from a CSV file
          </motion.p>
        </motion.div>

        {/* ── Workflow cards ──────────────────────────────────────────────── */}
        <motion.div
          variants={itemVariants}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            maxWidth: 760,
            width: "100%",
            marginTop: 36,
          }}
        >
          {WORKFLOW_CARDS.map((card) => (
            <motion.div
              key={card.title}
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              style={{
                background: "var(--tz-bg-card)",
                border: "1px solid var(--tz-border-subtle)",
                borderRadius: 18,
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
                boxShadow: "var(--tz-shadow-sm)",
                transition: "box-shadow 0.2s ease",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: card.gradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 4px 14px ${card.gradient.includes("#6366f1") ? "rgba(99,102,241,0.2)" : card.gradient.includes("#8b5cf6") ? "rgba(139,92,246,0.2)" : "rgba(236,72,153,0.2)"}`,
                }}
              >
                <card.icon size={20} color="#fff" strokeWidth={2.2} />
              </div>
              <div>
                <h3
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--tz-text-primary)",
                    margin: "0 0 6px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {card.title}
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    lineHeight: 1.55,
                    color: "var(--tz-text-muted)",
                    margin: 0,
                  }}
                >
                  {card.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <>
      <WelcomeBar trades={trades} />
      <StatsRow trades={trades} />

      <div className="grid gap-3 px-5 pt-3 grid-cols-1 lg:grid-cols-3">
        <ZellaScoreCard trades={trades} />
        <CumulativePnLCard trades={trades} />
        <NetDailyPnLCard trades={trades} />
      </div>

      <div className="grid gap-3 px-5 pt-3 pb-5 grid-cols-1 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <TradesTable
            trades={trades}
            selectedDate={selectedDate}
            onSelectTrade={handleSelectTrade}
            onClearDateFilter={() => setSelectedDate(null)}
          />
        </div>
        <div className="lg:col-span-3 flex flex-col gap-3">
          <TradeCalendar
            trades={trades}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
          <PlaybookPerformance trades={trades} />
        </div>
      </div>

    </>
  );
}
