import { describe, expect, test } from "vitest";
import { aggregateExecutions } from "../lib/aggregator";
import type { RawExecution } from "../lib/parsers";

describe("Aggregator Calculations", () => {
  test("aggregates a simple long trade", () => {
    const executions: RawExecution[] = [
      {
        id: "1",
        date: "2023-01-01",
        timestamp: 1672531200000,
        ticker: "AAPL",
        side: "Long",
        qty: 100,
        price: 150,
        commissions: 1,
        fees: 0,
      },
      {
        id: "2",
        date: "2023-01-01",
        timestamp: 1672534800000,
        ticker: "AAPL",
        side: "Short",
        qty: 100,
        price: 160,
        commissions: 1,
        fees: 0,
      },
    ];
    const trades = aggregateExecutions(executions);
    expect(trades.length).toBe(1);
    expect(trades[0].symbol).toBe("AAPL");
    expect(trades[0].side).toBe("Long");
    expect(trades[0].entry).toBe(150);
    expect(trades[0].exit).toBe(160);
    expect(trades[0].netPnl).toBe(998);
    expect(trades[0].status).toBe("Closed");
    expect(trades[0].duration).toBe(60); // 1 hour = 60 mins
  });

  test("handles scale in and scale out", () => {
    const executions: RawExecution[] = [
      {
        id: "1",
        date: "2023-01-01",
        timestamp: 1000000,
        ticker: "TSLA",
        side: "Long",
        qty: 50,
        price: 200,
        commissions: 0,
        fees: 0,
      },
      {
        id: "2",
        date: "2023-01-01",
        timestamp: 1100000,
        ticker: "TSLA",
        side: "Long",
        qty: 50,
        price: 210,
        commissions: 0,
        fees: 0,
      }, // Avg entry = 205
      {
        id: "3",
        date: "2023-01-01",
        timestamp: 1200000,
        ticker: "TSLA",
        side: "Short",
        qty: 50,
        price: 220,
        commissions: 0,
        fees: 0,
      },
      {
        id: "4",
        date: "2023-01-01",
        timestamp: 1300000,
        ticker: "TSLA",
        side: "Short",
        qty: 50,
        price: 230,
        commissions: 0,
        fees: 0,
      }, // Avg exit = 225
    ];
    const trades = aggregateExecutions(executions);
    expect(trades.length).toBe(1);
    expect(trades[0].entry).toBe(205);
    expect(trades[0].exit).toBe(225);
    expect(trades[0].status).toBe("Closed");
  });

  test("handles open positions", () => {
    const executions: RawExecution[] = [
      {
        id: "1",
        date: "2023-01-01",
        timestamp: 1000000,
        ticker: "NVDA",
        side: "Short",
        qty: 10,
        price: 400,
        commissions: 1,
        fees: 0,
      },
    ];
    const trades = aggregateExecutions(executions);
    expect(trades.length).toBe(1);
    expect(trades[0].side).toBe("Short");
    expect(trades[0].status).toBe("Open");
    expect(trades[0].exit).toBeNull();
  });
});
