import { describe, expect, test } from "vitest";
import type { Trade } from "../lib/data";
import {
  calculateAverageRMultiple,
  calculateExpectancy,
  calculateMaxDrawdown,
  calculateProfitFactor,
  calculateWinRate,
} from "../lib/metrics";

describe("Metrics Calculations", () => {
  const mockTrades: Trade[] = [
    {
      id: 1,
      date: "2023-01-01",
      time: "09:30",
      symbol: "AAPL",
      side: "Long",
      qty: 100,
      entry: 150,
      exit: 160,
      netPnl: 1000,
      rr: 2,
      duration: 60,
      playbook: null,
      tags: [],
      hasNote: false,
      status: "Closed",
      initialRisk: 500,
    },
    {
      id: 2,
      date: "2023-01-02",
      time: "09:30",
      symbol: "AAPL",
      side: "Long",
      qty: 100,
      entry: 160,
      exit: 155,
      netPnl: -500,
      rr: -1,
      duration: 60,
      playbook: null,
      tags: [],
      hasNote: false,
      status: "Closed",
      initialRisk: 500,
    },
    {
      id: 3,
      date: "2023-01-03",
      time: "09:30",
      symbol: "TSLA",
      side: "Short",
      qty: 50,
      entry: 200,
      exit: 190,
      netPnl: 500,
      rr: 1,
      duration: 30,
      playbook: null,
      tags: [],
      hasNote: false,
      status: "Closed",
      initialRisk: 500,
    },
    {
      id: 4,
      date: "2023-01-04",
      time: "09:30",
      symbol: "SPY",
      side: "Long",
      qty: 10,
      entry: 400,
      exit: null,
      netPnl: 0,
      rr: 0,
      duration: 0,
      playbook: null,
      tags: [],
      hasNote: false,
      status: "Open",
    },
  ];

  test("calculateWinRate computes correct percentage", () => {
    // 3 closed trades, 2 winners -> 66.67%
    expect(calculateWinRate(mockTrades)).toBe(66.67);
  });

  test("calculateProfitFactor computes correctly", () => {
    // grossProfit = 1500, grossLoss = 500 -> 3.0
    expect(calculateProfitFactor(mockTrades)).toBe(3);
  });

  test("calculateAverageRMultiple computes correctly", () => {
    // Trade 1 R = 1000/500 = 2
    // Trade 2 R = -500/500 = -1
    // Trade 3 R = 500/500 = 1
    // Total R = 2, Count = 3 -> Avg R = 0.67
    expect(calculateAverageRMultiple(mockTrades)).toBe(0.67);
  });

  test("calculateMaxDrawdown computes correctly", () => {
    // Trade 1: netPnl 1000, equity 1000, peak 1000
    // Trade 2: netPnl -500, equity 500, peak 1000, drawdown 500 (50%)
    // Trade 3: netPnl 500, equity 1000, peak 1000, drawdown 500
    const dd = calculateMaxDrawdown(mockTrades);
    expect(dd.amount).toBe(500);
    expect(dd.percentage).toBe(50);
  });

  test("calculateExpectancy computes correctly", () => {
    // Win rate = 2/3 (0.6667)
    // Avg Win = 1500/2 = 750
    // Avg Loss = 500/1 = 500
    // Exp = (0.6667 * 750) - (0.3333 * 500) = 500 - 166.67 = 333.33
    expect(calculateExpectancy(mockTrades)).toBeCloseTo(333.33, 1);
  });
});
