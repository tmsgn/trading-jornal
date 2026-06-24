import type { Trade, TradeSide } from "./data";
import type { RawExecution } from "./parsers";

/**
 * Aggregates raw executions into cohesive Trade entities.
 * Handles scaling in and scaling out by tracking position sizes.
 */
export function aggregateExecutions(
  executions: RawExecution[],
): Omit<Trade, "id">[] {
  // Sort executions by time
  const sorted = [...executions].sort((a, b) => a.timestamp - b.timestamp);

  const trades: Omit<Trade, "id">[] = [];

  // Track open positions by ticker
  const openPositions: Record<
    string,
    {
      ticker: string;
      side: TradeSide;
      qty: number;
      totalCost: number;
      commissions: number;
      fees: number;
      entries: RawExecution[];
      exits: RawExecution[];
      startTime: number;
    }
  > = {};

  for (const exec of sorted) {
    const pos = openPositions[exec.ticker];

    if (!pos) {
      // Open new position
      openPositions[exec.ticker] = {
        ticker: exec.ticker,
        side: exec.side,
        qty: exec.qty,
        totalCost: exec.price * exec.qty,
        commissions: exec.commissions,
        fees: exec.fees,
        entries: [exec],
        exits: [],
        startTime: exec.timestamp,
      };
    } else {
      // Add to existing position
      if (pos.side === exec.side) {
        // Scaling in
        pos.qty += exec.qty;
        pos.totalCost += exec.price * exec.qty;
        pos.commissions += exec.commissions;
        pos.fees += exec.fees;
        pos.entries.push(exec);
      } else {
        // Scaling out (or full exit)
        const exitQty = Math.min(exec.qty, pos.qty);
        pos.qty -= exitQty;
        pos.commissions += exec.commissions;
        pos.fees += exec.fees;
        pos.exits.push({ ...exec, qty: exitQty });

        if (pos.qty <= 0) {
          // Position fully closed
          trades.push(buildTradeFromPosition(pos));
          delete openPositions[exec.ticker];

          // If reversed position (qty > open qty), open a new one in opposite direction
          const remainingQty = exec.qty - exitQty;
          if (remainingQty > 0) {
            openPositions[exec.ticker] = {
              ticker: exec.ticker,
              side: exec.side,
              qty: remainingQty,
              totalCost: exec.price * remainingQty,
              commissions: 0, // already charged above
              fees: 0,
              entries: [{ ...exec, qty: remainingQty }],
              exits: [],
              startTime: exec.timestamp,
            };
          }
        }
      }
    }
  }

  // Any remaining are Open Trades
  for (const ticker in openPositions) {
    trades.push(buildTradeFromPosition(openPositions[ticker]));
  }

  return trades;
}

function buildTradeFromPosition(pos: any): Omit<Trade, "id"> {
  const totalEntryQty = pos.entries.reduce(
    (sum: number, e: any) => sum + e.qty,
    0,
  );
  const avgEntry =
    totalEntryQty > 0
      ? pos.entries.reduce((sum: number, e: any) => sum + e.price * e.qty, 0) /
        totalEntryQty
      : 0;

  const totalExitQty = pos.exits.reduce(
    (sum: number, e: any) => sum + e.qty,
    0,
  );
  const avgExit =
    totalExitQty > 0
      ? pos.exits.reduce((sum: number, e: any) => sum + e.price * e.qty, 0) /
        totalExitQty
      : null;

  const startDate = new Date(pos.startTime);
  const endDate =
    pos.exits.length > 0
      ? new Date(pos.exits[pos.exits.length - 1].timestamp)
      : startDate;
  const durationMinutes = Math.round(
    (endDate.getTime() - startDate.getTime()) / 60000,
  );

  // Gross P&L
  let grossPnl = 0;
  if (avgExit !== null) {
    const diff = pos.side === "Long" ? avgExit - avgEntry : avgEntry - avgExit;
    grossPnl = diff * totalExitQty; // Simplified. Doesn't account for contract multipliers yet (e.g. NQ = 20)
  }

  const netPnl = grossPnl - pos.commissions - pos.fees;

  return {
    date: startDate.toISOString().split("T")[0],
    time: startDate.toTimeString().substring(0, 5),
    symbol: pos.ticker,
    side: pos.side,
    qty: totalEntryQty,
    entry: avgEntry,
    exit: avgExit,
    netPnl,
    rr: 0, // Will be computed by metrics engine if initialRisk is provided
    duration: durationMinutes,
    playbook: null,
    tags: ["Imported"],
    hasNote: false,
    status: pos.qty > 0 ? "Open" : "Closed",
    screenshots: [],
    playbookId: null,
    stopLoss: undefined,
    takeProfit: undefined,
    initialRr: undefined,
    notes: "",
  };
}
