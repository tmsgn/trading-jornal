// ─── Shared data & types for ApexTrade ───────────────────────────────
// This is the single source of truth for all types across pages.

export const BRAND = {
  name: "ApexTrade",
  scoreName: "Apex Score",
  tagline: "Trading Journal & Performance Analytics",
};

export type TradeSide = "Long" | "Short";
export type TradeStatus = "Open" | "Closed";

export interface TradingAccount {
  id: string;
  name: string;
  startingBalance: number;
  currentBalance: number;
  mt5Login?: string | null;
  mt5Server?: string | null;
  mt5Password?: string | null;
  mt5AccountId?: string | null;
  mt5ConnectionStatus?: string;
}

export interface Trade {
  id: string | number;
  date: string; // ISO "YYYY-MM-DD"
  time: string; // "HH:MM"
  symbol: string;
  side: TradeSide;
  qty: number;
  entry: number;
  exit: number | null; // null if open
  netPnl: number;
  rr: number; // Risk to Reward
  duration: number; // minutes
  playbook: string | null;
  tags: string[];
  hasNote: boolean;
  status: TradeStatus;
  accountId?: string;
  winRate?: number;
  screenshots?: string[];
  playbookId?: string | null;
  stopLoss?: number;
  takeProfit?: number;
  initialRisk?: number; // Risk in dollars
  initialRr?: number;
  notes?: string;
  entryTimeFrame?: string; // e.g. "1m", "5m", "1s"
  externalId?: string | null;
  syncSource?: string;
  psychology?: {
    fomo: number; // 1-5
    discipline: number; // 1-5
    patience: number; // 1-5
    focus: number; // 1-5
    emotions: string[];
    notes: string;
  };
  rulesChecklist?: {
    planFollowed: boolean;
    riskManaged: boolean;
    entryConfirmed: boolean;
    stopLossSet: boolean;
  };
}

export interface Playbook {
  id: number;
  name: string;
  description: string;
  color: string;
  active: boolean;
  winRate: number;
  totalPnl: number;
  trades: number;
  avgRR: number;
  equity: number[]; // sparkline data
}

export interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  timezone: string;
  experience: string;
}
