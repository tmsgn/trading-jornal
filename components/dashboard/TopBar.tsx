"use client";

import { ChevronDown, Layers, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { useTrades } from "@/components/providers/TradeProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/journal": "Journal",
  "/analytics": "Analytics",
  "/trades": "Trades",
  "/ai-insights": "AI Insights",
  "/playbooks": "Playbooks",
  "/settings": "Settings",
};

export function TopBar() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? "Dashboard";
  const { accounts, activeAccountId, setActiveAccountId, profile } = useTrades();

  return (
    <div className="flex items-center justify-between px-5 h-[52px] flex-shrink-0 bg-white border-b border-gray-100 dark:bg-[#1a1b23] dark:border-[#2a2b35]">
      {/* Left: page title */}
      <div className="flex items-center gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <button className="md:hidden flex items-center justify-center w-8 h-8 rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-[#1f2029] transition-colors">
              <Menu size={18} />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[240px] flex">
            <Sidebar />
          </SheetContent>
        </Sheet>
        <button className="hidden md:block text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400 transition-colors">
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
        <h1 className="text-[15px] font-semibold text-gray-800 dark:text-gray-200">{title}</h1>
      </div>

      {/* Right: filters */}
      <div className="flex items-center gap-2">
        {accounts.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 dark:text-gray-300 dark:border-[#2a2b35] dark:hover:bg-[#1f2029] transition-colors">
                <Layers size={13} className="text-gray-400 dark:text-gray-500" />
                {accounts.find((a) => a.id === activeAccountId)?.name ||
                  "Select Account"}
                <ChevronDown size={12} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {accounts.map((acc) => (
                <DropdownMenuItem
                  key={acc.id}
                  onClick={() => setActiveAccountId(acc.id)}
                >
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
          title={`${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`}
        >
          {(profile?.firstName?.[0] || "H").toUpperCase()}
        </div>
      </div>
    </div>
  );
}
