import Decimal from "decimal.js";
import type { Trade } from "./data";

export function calculateWinRate(trades: Trade[]): number {
  const closed = trades.filter((t) => t.status === "Closed");
  if (closed.length === 0) return 0;
  const wins = closed.filter((t) => t.outcome === "Win" || (!t.outcome && t.netPnl > 0));
  return new Decimal(wins.length).dividedBy(closed.length).times(100).toDecimalPlaces(2).toNumber();
}

export function calculateProfitFactor(trades: Trade[]): number {
  const closed = trades.filter((t) => t.status === "Closed");
  const grossProfit = closed
    .filter((t) => t.outcome === "Win" || (!t.outcome && t.netPnl > 0))
    .reduce((sum, t) => sum.plus(t.netPnl), new Decimal(0));
    
  const grossLoss = closed
    .filter((t) => t.outcome === "Loss" || (!t.outcome && t.netPnl < 0))
    .reduce((sum, t) => sum.plus(t.netPnl), new Decimal(0)).abs();

  if (grossLoss.isZero()) return grossProfit.gt(0) ? Number.MAX_SAFE_INTEGER : 0;
  return grossProfit.dividedBy(grossLoss).toDecimalPlaces(2).toNumber();
}

export function calculateAverageRMultiple(trades: Trade[]): number {
  const closed = trades.filter((t) => t.status === "Closed");
  if (closed.length === 0) return 0;

  let totalR = new Decimal(0);
  let count = 0;
  for (const t of closed) {
    if (t.initialRisk && t.initialRisk > 0 && t.netPnl !== undefined) {
      totalR = totalR.plus(new Decimal(t.netPnl).dividedBy(t.initialRisk));
      count++;
    } else if (t.rr !== undefined) {
      totalR = totalR.plus(t.rr);
      count++;
    }
  }
  return count > 0 ? totalR.dividedBy(count).toDecimalPlaces(2).toNumber() : 0;
}

export function calculateMaxDrawdown(trades: Trade[]): {
  amount: number;
  percentage: number;
} {
  const closed = [...trades]
    .filter((t) => t.status === "Closed")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let peak = new Decimal(0);
  let currentEquity = new Decimal(0);
  let maxDrawdownAmt = new Decimal(0);
  let maxDrawdownPct = new Decimal(0);

  for (const t of closed) {
    currentEquity = currentEquity.plus(t.netPnl);
    if (currentEquity.gt(peak)) {
      peak = currentEquity;
    }
    const drawdown = peak.minus(currentEquity);
    if (drawdown.gt(maxDrawdownAmt)) {
      maxDrawdownAmt = drawdown;
      maxDrawdownPct = peak.gt(0) ? drawdown.dividedBy(peak).times(100) : new Decimal(0);
    }
  }

  return {
    amount: maxDrawdownAmt.toDecimalPlaces(2).toNumber(),
    percentage: maxDrawdownPct.toDecimalPlaces(2).toNumber(),
  };
}

export function calculateExpectancy(trades: Trade[]): number {
  const closed = trades.filter((t) => t.status === "Closed");
  if (closed.length === 0) return 0;
  const wins = closed.filter((t) => t.outcome === "Win" || (!t.outcome && t.netPnl > 0));
  const losses = closed.filter((t) => t.outcome === "Loss" || (!t.outcome && t.netPnl < 0));

  const winRate = new Decimal(wins.length).dividedBy(closed.length);

  const avgWin = wins.length > 0
      ? wins.reduce((sum, t) => sum.plus(t.netPnl), new Decimal(0)).dividedBy(wins.length)
      : new Decimal(0);
      
  const avgLoss = losses.length > 0
      ? losses.reduce((sum, t) => sum.plus(t.netPnl), new Decimal(0)).dividedBy(losses.length).abs()
      : new Decimal(0);

  const expectancy = winRate.times(avgWin).minus(new Decimal(1).minus(winRate).times(avgLoss));
  return expectancy.toDecimalPlaces(2).toNumber();
}
