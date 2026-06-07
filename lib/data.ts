// ─── Shared mock data & types for ApexTrade ───────────────────────────────
// This is the single source of truth for all mock data across pages.

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
  grossPnl: number;
  commissions: number;
  netPnl: number;
  rr: number;
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
  initialRr?: number;
  notes?: string;
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

// ─── Trades ──────────────────────────────────────────────────────────────────
export const TRADES: Trade[] = [
  {
    id: 1,
    date: "2023-12-21",
    time: "09:32",
    symbol: "TSLA",
    side: "Long",
    qty: 100,
    entry: 248.5,
    exit: 255.2,
    grossPnl: 670.0,
    commissions: 2.5,
    netPnl: 667.5,
    rr: 2.1,
    duration: 48,
    playbook: "Breakout",
    tags: ["trend", "open"],
    hasNote: true,
    status: "Closed",
    screenshots: [
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1642390091310-2de31d1f0485?auto=format&fit=crop&w=800&q=80",
    ],
    psychology: {
      fomo: 2,
      discipline: 5,
      patience: 4,
      focus: 5,
      emotions: ["Calm", "Disciplined", "Confident"],
      notes:
        "Waited patiently for the breakout of the pre-market high. Took entry on the retest and scaled out at 2R and 3R targets. Extremely clean execution.",
    },
    rulesChecklist: {
      planFollowed: true,
      riskManaged: true,
      entryConfirmed: true,
      stopLossSet: true,
    },
  },
  {
    id: 2,
    date: "2023-12-21",
    time: "10:15",
    symbol: "AAPL",
    side: "Short",
    qty: 50,
    entry: 192.8,
    exit: 190.1,
    grossPnl: 135.0,
    commissions: 1.5,
    netPnl: 133.5,
    rr: 1.8,
    duration: 23,
    playbook: "Reversal",
    tags: ["reversal"],
    hasNote: false,
    status: "Closed",
    screenshots: [
      "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80",
    ],
    psychology: {
      fomo: 1,
      discipline: 4,
      patience: 5,
      focus: 4,
      emotions: ["Patient", "Neutral"],
      notes:
        "Short trade at daily resistance. Rejection candle on 5m chart confirmed the entry. Cut the trade on target as buying volume began to creep back in.",
    },
    rulesChecklist: {
      planFollowed: true,
      riskManaged: true,
      entryConfirmed: true,
      stopLossSet: true,
    },
  },
  {
    id: 3,
    date: "2023-12-21",
    time: "11:04",
    symbol: "SPY",
    side: "Long",
    qty: 200,
    entry: 470.2,
    exit: 473.5,
    grossPnl: 660.0,
    commissions: 4.0,
    netPnl: 656.0,
    rr: 3.2,
    duration: 65,
    playbook: null,
    tags: ["index"],
    hasNote: true,
    status: "Closed",
    screenshots: [
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
    ],
    psychology: {
      fomo: 4,
      discipline: 3,
      patience: 2,
      focus: 4,
      emotions: ["Anxious", "Impatient"],
      notes:
        "Felt some FOMO entering as the index surged on the open. Chased it slightly, leading to a wider stop than planned, but market momentum bailed me out. Need to be more patient.",
    },
    rulesChecklist: {
      planFollowed: false,
      riskManaged: true,
      entryConfirmed: false,
      stopLossSet: true,
    },
  },
  {
    id: 4,
    date: "2023-12-21",
    time: "13:30",
    symbol: "QQQ",
    side: "Short",
    qty: 75,
    entry: 402.1,
    exit: 404.8,
    grossPnl: -202.5,
    commissions: 1.88,
    netPnl: -204.38,
    rr: -1.0,
    duration: 15,
    playbook: null,
    tags: ["fade"],
    hasNote: false,
    status: "Closed",
  },
  {
    id: 5,
    date: "2023-12-20",
    time: "09:48",
    symbol: "NVDA",
    side: "Long",
    qty: 30,
    entry: 490.0,
    exit: 498.4,
    grossPnl: 252.0,
    commissions: 0.9,
    netPnl: 251.1,
    rr: 2.8,
    duration: 91,
    playbook: "VWAP Rejection",
    tags: ["momentum"],
    hasNote: true,
    status: "Closed",
  },
  {
    id: 6,
    date: "2023-12-20",
    time: "14:01",
    symbol: "MRD",
    side: "Long",
    qty: 400,
    entry: 12.3,
    exit: 12.08,
    grossPnl: -88.0,
    commissions: 8.0,
    netPnl: -96.0,
    rr: -0.9,
    duration: 34,
    playbook: null,
    tags: [],
    hasNote: false,
    status: "Closed",
  },
  {
    id: 7,
    date: "2023-12-19",
    time: "10:22",
    symbol: "AMZN",
    side: "Short",
    qty: 20,
    entry: 151.4,
    exit: 155.9,
    grossPnl: -90.0,
    commissions: 0.6,
    netPnl: -90.6,
    rr: -1.2,
    duration: 28,
    playbook: null,
    tags: ["news"],
    hasNote: false,
    status: "Closed",
  },
  {
    id: 8,
    date: "2023-12-18",
    time: "09:33",
    symbol: "META",
    side: "Long",
    qty: 15,
    entry: 355.2,
    exit: 368.7,
    grossPnl: 202.5,
    commissions: 0.45,
    netPnl: 202.05,
    rr: 3.5,
    duration: 112,
    playbook: "Breakout",
    tags: ["trend", "gap"],
    hasNote: true,
    status: "Closed",
  },
  {
    id: 9,
    date: "2023-12-18",
    time: "11:45",
    symbol: "TSLA",
    side: "Short",
    qty: 80,
    entry: 252.1,
    exit: 248.3,
    grossPnl: 304.0,
    commissions: 2.4,
    netPnl: 301.6,
    rr: 2.3,
    duration: 44,
    playbook: "Reversal",
    tags: ["reversal"],
    hasNote: false,
    status: "Closed",
  },
  {
    id: 10,
    date: "2023-12-15",
    time: "09:41",
    symbol: "SPY",
    side: "Long",
    qty: 150,
    entry: 468.5,
    exit: 471.2,
    grossPnl: 405.0,
    commissions: 3.0,
    netPnl: 402.0,
    rr: 2.7,
    duration: 78,
    playbook: "VWAP Rejection",
    tags: ["index", "trend"],
    hasNote: true,
    status: "Closed",
  },
  {
    id: 11,
    date: "2023-12-15",
    time: "14:20",
    symbol: "AAPL",
    side: "Long",
    qty: 100,
    entry: 194.2,
    exit: 193.1,
    grossPnl: -110.0,
    commissions: 2.0,
    netPnl: -112.0,
    rr: -0.8,
    duration: 22,
    playbook: null,
    tags: [],
    hasNote: false,
    status: "Closed",
  },
  {
    id: 12,
    date: "2023-12-14",
    time: "10:05",
    symbol: "NVDA",
    side: "Short",
    qty: 25,
    entry: 492.0,
    exit: 496.4,
    grossPnl: -110.0,
    commissions: 0.75,
    netPnl: -110.75,
    rr: -1.1,
    duration: 31,
    playbook: null,
    tags: ["news"],
    hasNote: false,
    status: "Closed",
  },
  {
    id: 13,
    date: "2023-12-13",
    time: "09:35",
    symbol: "TSLA",
    side: "Long",
    qty: 120,
    entry: 245.0,
    exit: 252.8,
    grossPnl: 936.0,
    commissions: 3.6,
    netPnl: 932.4,
    rr: 3.8,
    duration: 95,
    playbook: "Breakout",
    tags: ["trend", "open"],
    hasNote: true,
    status: "Closed",
  },
  {
    id: 14,
    date: "2023-12-13",
    time: "13:10",
    symbol: "QQQ",
    side: "Long",
    qty: 60,
    entry: 400.3,
    exit: 401.1,
    grossPnl: 48.0,
    commissions: 1.2,
    netPnl: 46.8,
    rr: 0.6,
    duration: 19,
    playbook: null,
    tags: [],
    hasNote: false,
    status: "Closed",
  },
  {
    id: 15,
    date: "2023-12-12",
    time: "10:30",
    symbol: "META",
    side: "Short",
    qty: 20,
    entry: 358.0,
    exit: 362.5,
    grossPnl: -90.0,
    commissions: 0.6,
    netPnl: -90.6,
    rr: -0.9,
    duration: 40,
    playbook: "Reversal",
    tags: ["fade"],
    hasNote: false,
    status: "Closed",
  },
  // Open positions
  {
    id: 16,
    date: "2023-12-22",
    time: "09:45",
    symbol: "MRD",
    side: "Long",
    qty: 500,
    entry: 12.1,
    exit: null,
    grossPnl: 21.21,
    commissions: 10.0,
    netPnl: 21.21,
    rr: 0.5,
    duration: 0,
    playbook: null,
    tags: [],
    hasNote: false,
    status: "Open",
  },
  {
    id: 17,
    date: "2023-12-22",
    time: "10:20",
    symbol: "MRD",
    side: "Long",
    qty: 500,
    entry: 12.05,
    exit: null,
    grossPnl: -134.21,
    commissions: 10.0,
    netPnl: -134.21,
    rr: -1.2,
    duration: 0,
    playbook: null,
    tags: [],
    hasNote: false,
    status: "Open",
  },
];

// ─── Playbooks ────────────────────────────────────────────────────────────────
export const PLAYBOOKS: Playbook[] = [
  {
    id: 1,
    name: "Breakout",
    description:
      "Trades momentum breakouts above key resistance levels with volume confirmation.",
    color: "#6366f1",
    active: true,
    winRate: 74,
    totalPnl: 4200,
    trades: 31,
    avgRR: 2.8,
    equity: [
      0, 200, 350, 280, 600, 800, 750, 1100, 1400, 1600, 1800, 2200, 2800, 3200,
      3800, 4200,
    ],
  },
  {
    id: 2,
    name: "VWAP Rejection",
    description:
      "Fades price rejections at the VWAP level during high-volume periods.",
    color: "#26a69a",
    active: true,
    winRate: 68,
    totalPnl: 2890,
    trades: 28,
    avgRR: 1.9,
    equity: [
      0, 150, 300, 200, 400, 350, 500, 700, 900, 1100, 1400, 1800, 2100, 2500,
      2700, 2890,
    ],
  },
  {
    id: 3,
    name: "Gap & Go",
    description:
      "Capitalizes on opening gap continuations with strict entry criteria.",
    color: "#f59e0b",
    active: true,
    winRate: 61,
    totalPnl: 1740,
    trades: 18,
    avgRR: 2.1,
    equity: [
      0, 100, 250, 100, 300, 400, 350, 600, 700, 900, 1100, 1300, 1500, 1600,
      1740, 1740,
    ],
  },
  {
    id: 4,
    name: "Reversal",
    description:
      "Counter-trend entries at extreme overextension with R:R minimum of 1.5.",
    color: "#ef5350",
    active: true,
    winRate: 55,
    totalPnl: 920,
    trades: 14,
    avgRR: 1.4,
    equity: [
      0, -50, 100, 50, 200, 150, 300, 400, 350, 500, 600, 700, 800, 920, 920,
      920,
    ],
  },
  {
    id: 5,
    name: "Momentum",
    description:
      "Trend-following entries with trailing stops. Archived due to poor performance.",
    color: "#64748b",
    active: false,
    winRate: 42,
    totalPnl: -380,
    trades: 11,
    avgRR: 0.8,
    equity: [
      0, 100, 50, -100, 0, -50, -150, -100, -200, -250, -300, -380, -380, -380,
      -380, -380,
    ],
  },
  {
    id: 6,
    name: "Mean Reversion",
    description:
      "Statistical mean reversion on liquid ETFs with Bollinger Band extremes.",
    color: "#8b5cf6",
    active: true,
    winRate: 71,
    totalPnl: 3100,
    trades: 22,
    avgRR: 2.4,
    equity: [
      0, 200, 400, 350, 600, 800, 700, 1000, 1200, 1500, 1800, 2000, 2300, 2600,
      2900, 3100,
    ],
  },
];

// ─── Equity curve (for analytics) ─────────────────────────────────────────
export const EQUITY_CURVE = [
  { date: "Dec 01", pnl: 0, cumPnl: 0 },
  { date: "Dec 04", pnl: 202, cumPnl: 202 },
  { date: "Dec 05", pnl: 420, cumPnl: 622 },
  { date: "Dec 06", pnl: -88, cumPnl: 534 },
  { date: "Dec 07", pnl: 311, cumPnl: 845 },
  { date: "Dec 08", pnl: -204, cumPnl: 641 },
  { date: "Dec 11", pnl: 402, cumPnl: 1043 },
  { date: "Dec 12", pnl: -91, cumPnl: 952 },
  { date: "Dec 13", pnl: 979, cumPnl: 1931 },
  { date: "Dec 14", pnl: -111, cumPnl: 1820 },
  { date: "Dec 15", pnl: 290, cumPnl: 2110 },
  { date: "Dec 18", pnl: 504, cumPnl: 2614 },
  { date: "Dec 19", pnl: -91, cumPnl: 2523 },
  { date: "Dec 20", pnl: 155, cumPnl: 2678 },
  { date: "Dec 21", pnl: 1253, cumPnl: 3931 },
];

// ─── LocalStorage Synchronization Helpers ─────────────────────────────────────
export function getSavedTrades(): Trade[] {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("tz_trades");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse trades from localStorage:", e);
      }
    }
  }
  return TRADES;
}

export function saveTrades(trades: Trade[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("tz_trades", JSON.stringify(trades));
    // Dispatch a custom event to notify other components in the same tab
    window.dispatchEvent(new Event("tz_trades_update"));
  }
}

export function getSavedPlaybooks(): Playbook[] {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("tz_playbooks");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse playbooks from localStorage:", e);
      }
    }
  }
  return PLAYBOOKS;
}

export function savePlaybooks(playbooks: Playbook[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("tz_playbooks", JSON.stringify(playbooks));
    window.dispatchEvent(new Event("tz_playbooks_update"));
  }
}

export interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  timezone: string;
  experience: string;
}

export const DEFAULT_PROFILE: Profile = {
  firstName: "Hunter",
  lastName: "Mason",
  email: "hunter.mason@gmail.com",
  username: "huntermason_trades",
  timezone: "America/New_York",
  experience: "Intermediate",
};

export function getSavedProfile(): Profile {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("tz_profile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse profile from localStorage:", e);
      }
    }
  }
  return DEFAULT_PROFILE;
}

export function saveProfile(profile: Profile): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("tz_profile", JSON.stringify(profile));
    window.dispatchEvent(new Event("tz_profile_update"));
  }
}

// ─── Daily Journal ────────────────────────────────────────────────────────────

export interface DailyJournal {
  date: string; // ISO "YYYY-MM-DD"
  preMarket: {
    marketOutlook: string;
    watchlist: string[];
    keyLevels: string;
    newsEvents: string;
  };
  tradingPlan: {
    dailyGoal: string;
    maxLoss: number;
    maxTrades: number;
    strategyFocus: string;
    setupsCriteria: string;
  };
  postMarket: {
    whatWentWell: string;
    whatWentWrong: string;
    lessonsLearned: string;
    tomorrowPlan: string;
  };
  psychology: {
    mood: string;
    confidence: number; // 1-5
    discipline: number; // 1-5
    focus: number; // 1-5
    sleep: number; // 1-5
    stress: number; // 1-5
    emotions: string[];
  };
  rulesChecklist: Record<string, boolean>;
  notes: string;
  screenshots: string[];
  rating: number; // 1-5 overall day rating
}

export const DEFAULT_RULES_CHECKLIST: Record<string, boolean> = {
  "Pre-market plan prepared": false,
  "Watchlist reviewed": false,
  "Max loss limit set": false,
  "Position sizing followed": false,
  "Stop loss on every trade": false,
  "No revenge trading": false,
  "Followed trading plan": false,
  "Journaled all trades": false,
};

export const DEFAULT_DAILY_JOURNALS: Record<string, DailyJournal> = {
  "2023-12-21": {
    date: "2023-12-21",
    preMarket: {
      marketOutlook: "Bullish bias — SPY gapping up on Fed dovish comments from yesterday. Expecting momentum continuation in tech names. Key support at SPY 470, resistance at 475. TSLA has a clean pre-market high at $250 that could break for a gap-and-go.",
      watchlist: ["TSLA", "AAPL", "SPY", "QQQ"],
      keyLevels: "SPY: 470 support / 475 resistance\nTSLA: 248 VWAP / 250 pre-market high\nAAPL: 193 resistance / 190 support\nQQQ: 400 psychological / 403 resistance",
      newsEvents: "Fed rate decision aftermath — dovish tone. No major earnings today. Watch for profit-taking after yesterday's rally.",
    },
    tradingPlan: {
      dailyGoal: "Focus on 2-3 A+ setups only. Target $500+ net P&L. Be patient and wait for the first 15 minutes of price action before committing.",
      maxLoss: 500,
      maxTrades: 5,
      strategyFocus: "Breakout & VWAP rejection plays",
      setupsCriteria: "Only enter on volume confirmation above average. Minimum 2R target. Must have clear invalidation level.",
    },
    postMarket: {
      whatWentWell: "Nailed the TSLA breakout perfectly. Waited patiently for the retest of the pre-market high. AAPL short off resistance was textbook. Managed risk well on the QQQ fade by cutting immediately when invalidated.",
      whatWentWrong: "Got a bit aggressive on the QQQ short against the trend. Should have recognized the overall bullish context and skipped that trade entirely. Entry was below VWAP but above the rising 9 EMA.",
      lessonsLearned: "Don't fade a strong trend day. When the market is clearly in a momentum push, only trade in the direction of the trend. The QQQ loss was small because of discipline, but the setup quality was low.",
      tomorrowPlan: "Watch for continuation or pullback on TSLA. If SPY holds above 473, look for long setups. Reduce position size if opening with a gap up — don't chase.",
    },
    psychology: {
      mood: "🧠 Calm",
      confidence: 5,
      discipline: 5,
      focus: 5,
      sleep: 4,
      stress: 2,
      emotions: ["Calm", "Disciplined", "Confident"],
    },
    rulesChecklist: {
      "Pre-market plan prepared": true,
      "Watchlist reviewed": true,
      "Max loss limit set": true,
      "Position sizing followed": true,
      "Stop loss on every trade": true,
      "No revenge trading": true,
      "Followed trading plan": true,
      "Journaled all trades": true,
    },
    notes: "One of my best trading days this month. Total net P&L of $1,252.62. Hit all my targets and maintained composure even after the QQQ loss. The key takeaway is that patience is everything — waiting for the TSLA retest instead of chasing the initial breakout saved me from potential slippage and gave me a much better R:R.",
    screenshots: [
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 5,
  },
  "2023-12-20": {
    date: "2023-12-20",
    preMarket: {
      marketOutlook: "Neutral-to-bullish. Market digesting recent moves. NVDA showing strength in pre-market. MRD on the scanner for small-cap momentum.",
      watchlist: ["NVDA", "MRD", "SPY"],
      keyLevels: "NVDA: 490 VWAP / 498 resistance\nMRD: 12.50 breakout / 12.00 support",
      newsEvents: "No major catalysts. NVDA upgrade from Goldman Sachs circulating.",
    },
    tradingPlan: {
      dailyGoal: "Two solid setups. Target $300 net. Focus on NVDA if it pulls back to VWAP.",
      maxLoss: 400,
      maxTrades: 4,
      strategyFocus: "VWAP pullback entries",
      setupsCriteria: "Wait for VWAP test and bounce. Minimum 1.5R. Clear momentum confirmation.",
    },
    postMarket: {
      whatWentWell: "NVDA VWAP pull was executed well. Held to target without cutting early.",
      whatWentWrong: "MRD trade was rushed. Entered without proper volume confirmation. Got chopped and took a small loss.",
      lessonsLearned: "Small-cap plays need extra volume confirmation. Don't let the scanner excitement override the checklist.",
      tomorrowPlan: "Fed decision day tomorrow. Expect high volatility. Reduce position sizes and be selective.",
    },
    psychology: {
      mood: "😐 Neutral",
      confidence: 3,
      discipline: 3,
      focus: 4,
      sleep: 3,
      stress: 3,
      emotions: ["Neutral", "Slightly Impatient"],
    },
    rulesChecklist: {
      "Pre-market plan prepared": true,
      "Watchlist reviewed": true,
      "Max loss limit set": true,
      "Position sizing followed": false,
      "Stop loss on every trade": true,
      "No revenge trading": true,
      "Followed trading plan": false,
      "Journaled all trades": true,
    },
    notes: "Decent day overall. NVDA trade was solid but the MRD position was a deviation from my plan. Need to focus on only A-grade setups tomorrow, especially with the Fed event creating volatility.",
    screenshots: [],
    rating: 3,
  },
  "2023-12-18": {
    date: "2023-12-18",
    preMarket: {
      marketOutlook: "Strong bullish setup. META gap up on positive analyst revisions. TSLA showing pre-market reversal pattern near resistance.",
      watchlist: ["META", "TSLA", "SPY"],
      keyLevels: "META: 355 gap fill / 370 target\nTSLA: 252 resistance / 248 support",
      newsEvents: "META analyst upgrades. Market anticipating Fed dovish pivot.",
    },
    tradingPlan: {
      dailyGoal: "Ride the META momentum. Let winners run. Target $400+.",
      maxLoss: 350,
      maxTrades: 3,
      strategyFocus: "Breakout continuation trades",
      setupsCriteria: "Gap-up continuation with volume above 1.5x average. Target 3R+.",
    },
    postMarket: {
      whatWentWell: "META trade was a beauty — held to 3.5R. No hesitation on entry. TSLA reversal was clean.",
      whatWentWrong: "Nothing significant. Could have sized up on META given the strong setup.",
      lessonsLearned: "When conviction is high and the setup is A+, don't be afraid to go for a full position. The META trade had everything aligned and I still used my standard size.",
      tomorrowPlan: "Watch for META continuation. Look for pullback entries if it holds above yesterday's high.",
    },
    psychology: {
      mood: "🚀 Excited",
      confidence: 5,
      discipline: 5,
      focus: 5,
      sleep: 5,
      stress: 1,
      emotions: ["Excited", "Confident", "Focused"],
    },
    rulesChecklist: {
      "Pre-market plan prepared": true,
      "Watchlist reviewed": true,
      "Max loss limit set": true,
      "Position sizing followed": true,
      "Stop loss on every trade": true,
      "No revenge trading": true,
      "Followed trading plan": true,
      "Journaled all trades": true,
    },
    notes: "Incredible day. Slept 8 hours, felt sharp. META breakout was the cleanest setup I've had in weeks. Let it run to my 3.5R target without any doubt. This is how trading should feel — calm, methodical, and profitable. Net P&L: $503.65.",
    screenshots: [
      "https://images.unsplash.com/photo-1642390091310-2de31d1f0485?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 5,
  },
};

export function getSavedDailyJournals(): Record<string, DailyJournal> {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("tz_daily_journals");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse daily journals from localStorage:", e);
      }
    }
  }
  return DEFAULT_DAILY_JOURNALS;
}

export function saveDailyJournals(
  journals: Record<string, DailyJournal>
): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("tz_daily_journals", JSON.stringify(journals));
    window.dispatchEvent(new Event("tz_daily_journals_update"));
  }
}

export function getEmptyJournal(date: string): DailyJournal {
  return {
    date,
    preMarket: {
      marketOutlook: "",
      watchlist: [],
      keyLevels: "",
      newsEvents: "",
    },
    tradingPlan: {
      dailyGoal: "",
      maxLoss: 500,
      maxTrades: 5,
      strategyFocus: "",
      setupsCriteria: "",
    },
    postMarket: {
      whatWentWell: "",
      whatWentWrong: "",
      lessonsLearned: "",
      tomorrowPlan: "",
    },
    psychology: {
      mood: "",
      confidence: 3,
      discipline: 3,
      focus: 3,
      sleep: 3,
      stress: 3,
      emotions: [],
    },
    rulesChecklist: { ...DEFAULT_RULES_CHECKLIST },
    notes: "",
    screenshots: [],
    rating: 0,
  };
}

