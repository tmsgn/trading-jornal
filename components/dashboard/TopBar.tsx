"use client";

import { usePathname } from "next/navigation";
import { Filter, ChevronDown, Calendar, Layers } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React, { useState, useEffect } from "react";
import { getSavedProfile } from "@/lib/data";
import { useTrades } from "@/components/providers/TradeProvider";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/journal": "Journal",
  "/daily-journal": "Daily Journal",
  "/analytics": "Analytics",
  "/trades": "Trades",
  "/ai-insights": "AI Insights",
  "/playbooks": "Playbooks",
  "/settings": "Settings",
};

export function TopBar() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? "Dashboard";
  const [profile, setProfile] = useState(() => getSavedProfile());
  const { accounts, activeAccountId, setActiveAccountId } = useTrades();

  // Dropdown states
  const [tradeFilter, setTradeFilter] = useState("All Trades");
  const [dateRange, setDateRange] = useState("This Month");

  useEffect(() => {
    const handleUpdate = () => {
      setProfile(getSavedProfile());
    };
    window.addEventListener("tz_profile_update", handleUpdate);
    return () => {
      window.removeEventListener("tz_profile_update", handleUpdate);
    };
  }, []);

  return (
    <div
      className="flex items-center justify-between px-5 h-[52px] flex-shrink-0 bg-white border-b border-gray-100"
    >
      {/* Left: page title */}
      <div className="flex items-center gap-2">
        <button className="text-gray-300 hover:text-gray-500 transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className="text-[15px] font-semibold text-gray-800">{title}</h1>
      </div>

      {/* Right: filters */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
              <Filter size={13} className="text-gray-400" />
              {tradeFilter}
              <ChevronDown size={12} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTradeFilter("All Trades")}>All Trades</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTradeFilter("Winning Trades")}>Winning Trades</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTradeFilter("Losing Trades")}>Losing Trades</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
              <Calendar size={13} className="text-gray-400" />
              {dateRange}
              <ChevronDown size={12} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setDateRange("Today")}>Today</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDateRange("This Week")}>This Week</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDateRange("This Month")}>This Month</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDateRange("All Time")}>All Time</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {accounts.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
                <Layers size={13} className="text-gray-400" />
                {accounts.find(a => a.id === activeAccountId)?.name || "Select Account"}
                <ChevronDown size={12} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {accounts.map(acc => (
                <DropdownMenuItem key={acc.id} onClick={() => setActiveAccountId(acc.id)}>
                  {acc.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ml-1 cursor-pointer shadow-sm hover:opacity-90 transition-all border border-emerald-500/20"
          style={{
            background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
          }}
          title={`${profile.firstName} ${profile.lastName}`}
        >
          {(profile.firstName[0] || "H").toUpperCase()}
        </div>
      </div>
    </div>
  );
}
