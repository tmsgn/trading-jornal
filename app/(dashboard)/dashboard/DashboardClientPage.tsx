"use client";

import React, { useState, useEffect } from "react";
import { WelcomeBar, StatsRow } from "@/components/dashboard/StatsRow";
import { ZellaScoreCard, CumulativePnLCard, NetDailyPnLCard, PlaybookPerformance } from "@/components/dashboard/Charts";
import { TradeCalendar } from "@/components/dashboard/TradeCalendar";
import { TradesTable } from "@/components/dashboard/TradesTable";
import { TradeDetailDrawer } from "@/components/dashboard/TradeDetailDrawer";
import { Trade } from "@/lib/data";
import { useTrades } from "@/components/providers/TradeProvider";

export default function DashboardPage() {
  const { trades, updateTrade } = useTrades();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // Drawer states
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleSelectTrade = (trade: Trade) => {
    setSelectedTrade(trade);
    setIsDrawerOpen(true);
  };

  const handleSaveTrade = async (updatedTrade: Trade) => {
    await updateTrade(updatedTrade.id, updatedTrade);
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
