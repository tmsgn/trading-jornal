"use client";

import React, { useState, useEffect } from "react";
import { WelcomeBar, StatsRow } from "@/components/dashboard/StatsRow";
import { ZellaScoreCard, CumulativePnLCard, NetDailyPnLCard, PlaybookPerformance } from "@/components/dashboard/Charts";
import { TradeCalendar } from "@/components/dashboard/TradeCalendar";
import { TradesTable } from "@/components/dashboard/TradesTable";
import { TradeDetailDrawer } from "@/components/dashboard/TradeDetailDrawer";
import { Trade, getSavedTrades, saveTrades } from "@/lib/data";

export default function DashboardPage() {
  const [trades, setTrades] = useState<Trade[]>(() => getSavedTrades());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // Drawer states
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Keep state synced across navigations / tab changes
  useEffect(() => {
    const handleUpdate = () => {
      setTrades(getSavedTrades());
    };
    window.addEventListener("tz_trades_update", handleUpdate);
    return () => {
      window.removeEventListener("tz_trades_update", handleUpdate);
    };
  }, []);

  const handleSelectTrade = (trade: Trade) => {
    setSelectedTrade(trade);
    setIsDrawerOpen(true);
  };

  const handleSaveTrade = (updatedTrade: Trade) => {
    const updatedList = trades.map((t) => (t.id === updatedTrade.id ? updatedTrade : t));
    saveTrades(updatedList);
  };

  return (
    <>
      <WelcomeBar trades={trades} />
      <StatsRow trades={trades} />
      
      <div
        className="grid gap-3 px-5 pt-3 grid-cols-1 lg:grid-cols-3"
      >
        <ZellaScoreCard trades={trades} />
        <CumulativePnLCard trades={trades} />
        <NetDailyPnLCard trades={trades} />
      </div>

      <div
        className="grid gap-3 px-5 pt-3 pb-5 grid-cols-1 lg:grid-cols-5"
      >
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

      <TradeDetailDrawer
        trade={selectedTrade}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleSaveTrade}
      />
    </>
  );
}
