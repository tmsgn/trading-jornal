import type { Trade } from "./data";

export function safeMath(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateWinRate(trades: Trade[]): number {
  const closed = trades.filter((t) => t.status === "Closed");
  if (closed.length === 0) return 0;
  const wins = closed.filter((t) => t.outcome === "Win" || (!t.outcome && t.netPnl > 0));
  return safeMath((wins.length / closed.length) * 100);
}

export function calculateProfitFactor(trades: Trade[]): number {
  const closed = trades.filter((t) => t.status === "Closed");
  const grossProfit = closed
    .filter((t) => t.outcome === "Win" || (!t.outcome && t.netPnl > 0))
    .reduce((sum, t) => sum + t.netPnl, 0);
  const grossLoss = Math.abs(
    closed
      .filter((t) => t.outcome === "Loss" || (!t.outcome && t.netPnl < 0))
      .reduce((sum, t) => sum + t.netPnl, 0),
  );

  if (grossLoss === 0) return grossProfit > 0 ? Number.MAX_SAFE_INTEGER : 0;
  return safeMath(grossProfit / grossLoss);
}

export function calculateAverageRMultiple(trades: Trade[]): number {
  const closed = trades.filter((t) => t.status === "Closed");
  if (closed.length === 0) return 0;

  let totalR = 0;
  let count = 0;
  for (const t of closed) {
    if (t.initialRisk && t.initialRisk > 0 && t.netPnl !== undefined) {
      totalR += t.netPnl / t.initialRisk;
      count++;
    } else if (t.rr !== undefined) {
      totalR += t.rr;
      count++;
    }
  }
  return count > 0 ? safeMath(totalR / count) : 0;
}

export function calculateMaxDrawdown(trades: Trade[]): {
  amount: number;
  percentage: number;
} {
  const closed = [...trades]
    .filter((t) => t.status === "Closed")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let peak = 0;
  let currentEquity = 0;
  let maxDrawdownAmt = 0;
  let maxDrawdownPct = 0;

  for (const t of closed) {
    currentEquity += t.netPnl;
    if (currentEquity > peak) {
      peak = currentEquity;
    }
    const drawdown = peak - currentEquity;
    if (drawdown > maxDrawdownAmt) {
      maxDrawdownAmt = drawdown;
      maxDrawdownPct = peak > 0 ? (drawdown / peak) * 100 : 0;
    }
  }

  return {
    amount: safeMath(maxDrawdownAmt),
    percentage: safeMath(maxDrawdownPct),
  };
}

export function calculateExpectancy(trades: Trade[]): number {
  const closed = trades.filter((t) => t.status === "Closed");
  if (closed.length === 0) return 0;
  const wins = closed.filter((t) => t.outcome === "Win" || (!t.outcome && t.netPnl > 0));
  const losses = closed.filter((t) => t.outcome === "Loss" || (!t.outcome && t.netPnl < 0));

  const winRate = wins.length / closed.length;

  const avgWin =
    wins.length > 0
      ? wins.reduce((sum, t) => sum + t.netPnl, 0) / wins.length
      : 0;
  const avgLoss =
    losses.length > 0
      ? Math.abs(losses.reduce((sum, t) => sum + t.netPnl, 0) / losses.length)
      : 0;

  const expectancy = winRate * avgWin - (1 - winRate) * avgLoss;
  return safeMath(expectancy);
}
