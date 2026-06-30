import { z } from "zod";
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

export interface ParseResult {
  executions: RawExecution[];
  errors: { row: number; error: string }[];
  totalRows: number;
}

// Zod schema to validate and transform the raw string map into a RawExecution
const executionSchema = z.object({
  broker: z.string(),
  ticker: z.string().min(1, "Ticker is required"),
  side: z.enum(["Long", "Short"]),
  qty: z.number().positive("Quantity must be positive"),
  price: z.number().positive("Price must be positive"),
  timestamp: z.number().int().positive("Invalid timestamp"),
  commissions: z.number().nonnegative(),
  fees: z.number().nonnegative(),
});

/**
 * Parses generic CSV data assuming standard columns.
 * Can be extended with specific mappings per broker.
 */
export function parseCSV(csvText: string, brokerType: string): ParseResult {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return { executions: [], errors: [], totalRows: 0 };

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const executions: RawExecution[] = [];
  const errors: { row: number; error: string }[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(",").map((cell) => cell.trim());
    if (row.length < headers.length) {
      errors.push({ row: i + 1, error: "Row has fewer columns than headers" });
      continue;
    }

    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = row[idx];
    });

    try {
      const rawExec = mapToExecution(rowObj, brokerType);
      const validatedExec = executionSchema.parse(rawExec) as RawExecution;
      executions.push(validatedExec);
    } catch (e: any) {
      if (e instanceof z.ZodError) {
        errors.push({ row: i + 1, error: e.errors.map((err: any) => err.message).join(", ") });
      } else {
        errors.push({ row: i + 1, error: e.message || String(e) });
      }
    }
  }

  return { executions, errors, totalRows: lines.length - 1 };
}

function mapToExecution(
  rowObj: Record<string, string>,
  brokerType: string,
): Partial<RawExecution> {
  const ticker = rowObj.symbol || rowObj.ticker || rowObj.contract || "";
  const sideRaw = (rowObj.side || rowObj.action || "").toUpperCase();
  const side = (sideRaw.includes("BUY") || sideRaw === "B" || sideRaw === "LONG") ? "Long" : (sideRaw.includes("SELL") || sideRaw === "S" || sideRaw === "SHORT" ? "Short" : undefined);
  
  const qty = parseFloat(rowObj.qty || rowObj.quantity || rowObj.volume || "");
  const price = parseFloat(rowObj.price || rowObj["fill price"] || "");
  
  const dateRaw = rowObj.date || rowObj.time || rowObj.timestamp || "";
  let timestamp = new Date(dateRaw).getTime();
  
  const commissions = parseFloat(rowObj.commissions || rowObj.commission || "0");
  const fees = parseFloat(rowObj.fees || rowObj.fee || "0");

  return {
    broker: brokerType,
    ticker: ticker.toUpperCase(),
    side: side as TradeSide,
    qty: Number.isNaN(qty) ? undefined : Math.abs(qty),
    price: Number.isNaN(price) ? undefined : price,
    timestamp: Number.isNaN(timestamp) ? undefined : timestamp,
    commissions: Number.isNaN(commissions) ? 0 : Math.abs(commissions),
    fees: Number.isNaN(fees) ? 0 : Math.abs(fees),
  };
}
