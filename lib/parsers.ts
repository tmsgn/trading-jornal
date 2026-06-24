import type { TradeSide } from "./data";

export interface RawExecution {
  broker: string;
  ticker: string;
  side: TradeSide;
  qty: number;
  price: number;
  timestamp: number; // epoch ms
  commissions: number;
  fees: number;
}

/**
 * Parses generic CSV data assuming standard columns.
 * Can be extended with specific mappings per broker.
 */
export function parseCSV(csvText: string, brokerType: string): RawExecution[] {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const executions: RawExecution[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(",").map((cell) => cell.trim());
    if (row.length < headers.length) continue;

    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = row[idx];
    });

    try {
      executions.push(mapToExecution(rowObj, brokerType));
    } catch (e) {
      console.warn(`Failed to parse row ${i}:`, e);
    }
  }

  return executions;
}

function mapToExecution(
  rowObj: Record<string, string>,
  brokerType: string,
): RawExecution {
  // A robust production implementation would have strategy/broker-specific logic here.
  // For the scope of this clone, we support a generalized structure that handles Apex/Tradovate-like exports.

  const ticker = rowObj.symbol || rowObj.ticker || rowObj.contract || "UNKNOWN";

  const sideRaw = (rowObj.side || rowObj.action || "").toUpperCase();
  const side: TradeSide =
    sideRaw.includes("BUY") || sideRaw === "B" || sideRaw === "LONG"
      ? "Long"
      : "Short";

  const qty = parseFloat(rowObj.qty || rowObj.quantity || rowObj.volume || "0");
  const price = parseFloat(rowObj.price || rowObj["fill price"] || "0");

  const dateRaw =
    rowObj.date || rowObj.time || rowObj.timestamp || new Date().toISOString();
  let timestamp = new Date(dateRaw).getTime();
  if (Number.isNaN(timestamp)) timestamp = Date.now();

  const commissions = parseFloat(
    rowObj.commissions || rowObj.commission || "0",
  );
  const fees = parseFloat(rowObj.fees || rowObj.fee || "0");

  return {
    broker: brokerType,
    ticker: ticker.toUpperCase(),
    side,
    qty: Math.abs(qty),
    price,
    timestamp,
    commissions: Number.isNaN(commissions) ? 0 : Math.abs(commissions),
    fees: Number.isNaN(fees) ? 0 : Math.abs(fees),
  };
}
