import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Base URL for MetaApi
const METAAPI_BASE_URL = "https://mt-client-api-v1.new-york.agiliumtrade.ai";
const METAAPI_API_KEY = process.env.METAAPI_API_KEY || "";

interface MetaApiDeal {
  id: string;
  type: string;
  entry: string;
  symbol: string;
  volume: number;
  price: number;
  commission?: number;
  swap?: number;
  profit?: number;
  time: string;
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    console.log("MT5 Webhook payload received:", payload);

    // MetaApi sends events like dealClosed or positionClosed
    const eventType = payload.type;
    const metaapiAccountId = payload.accountId;
    const positionId = payload.positionId || payload.position?.id || (payload.deal && payload.deal.positionId);

    if (!metaapiAccountId || !positionId) {
      return NextResponse.json(
        { error: "Missing accountId or positionId in webhook payload" },
        { status: 400 }
      );
    }

    // 1. Find matching trading account in Supabase
    const supabase = await createClient();
    const { data: account, error: accError } = await supabase
      .from("trading_accounts")
      .select("id, user_id")
      .eq("mt5_account_id", metaapiAccountId)
      .maybeSingle();

    if (accError || !account) {
      console.error("Account not found for MetaApi ID:", metaapiAccountId, accError);
      return NextResponse.json(
        { error: "Trading account not registered in journal" },
        { status: 404 }
      );
    }

    // 2. Fetch history deals for this position from MetaApi (or use mock/simulated deals if no key is set)
    let deals: MetaApiDeal[] = [];

    if (METAAPI_API_KEY) {
      const dealsRes = await fetch(
        `${METAAPI_BASE_URL}/users/current/accounts/${metaapiAccountId}/history-deals/position/${positionId}`,
        {
          headers: {
            "auth-token": METAAPI_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      if (dealsRes.ok) {
        deals = await dealsRes.json();
      } else {
        console.error("Failed to fetch deals from MetaApi:", await dealsRes.text());
        return NextResponse.json(
          { error: "Failed to fetch deals from MetaApi" },
          { status: 502 }
        );
      }
    } else {
      // Mock Fallback for Local Development / Testing
      console.log("No METAAPI_API_KEY set. Reconstructing from mock deals.");
      const mockSymbol = payload.symbol || "EURUSD";
      const mockProfit = payload.profit !== undefined ? Number(payload.profit) : 150.00;
      const entryTime = new Date(Date.now() - 30 * 60 * 1000).toISOString(); // 30 mins ago
      const exitTime = new Date().toISOString();

      deals = [
        {
          id: `deal_in_${positionId}`,
          type: "DEAL_TYPE_BUY",
          entry: "DEAL_ENTRY_IN",
          symbol: mockSymbol,
          volume: 0.5,
          price: 1.0850,
          commission: -2.00,
          swap: 0.00,
          profit: 0.00,
          time: entryTime,
        },
        {
          id: `deal_out_${positionId}`,
          type: "DEAL_TYPE_SELL",
          entry: "DEAL_ENTRY_OUT",
          symbol: mockSymbol,
          volume: 0.5,
          price: 1.0880,
          commission: -2.00,
          swap: 0.00,
          profit: mockProfit,
          time: exitTime,
        },
      ];
    }

    if (deals.length === 0) {
      return NextResponse.json({ message: "No deals found for position" }, { status: 200 });
    }

    // 3. Reconstruct closed position roundtrip trade
    const entryDeals = deals.filter(d => d.entry === "DEAL_ENTRY_IN");
    const exitDeals = deals.filter(d => d.entry === "DEAL_ENTRY_OUT");

    // Fallbacks if entry/exit properties aren't explicitly matching
    const baseDeals = entryDeals.length > 0 ? entryDeals : [deals[0]];
    const closeDeals = exitDeals.length > 0 ? exitDeals : deals.slice(1);

    const firstEntry = baseDeals[0];
    const lastExit = closeDeals[closeDeals.length - 1] || firstEntry;

    // Side badge calculation
    const isLong = firstEntry.type === "DEAL_TYPE_BUY" || firstEntry.type.includes("BUY");
    const side = isLong ? "Long" : "Short";

    // Weighted calculations
    let totalEntryVol = 0;
    let entrySum = 0;
    for (const d of baseDeals) {
      totalEntryVol += d.volume;
      entrySum += d.volume * d.price;
    }
    const entryPrice = totalEntryVol > 0 ? entrySum / totalEntryVol : firstEntry.price;

    let totalExitVol = 0;
    let exitSum = 0;
    for (const d of closeDeals) {
      totalExitVol += d.volume;
      exitSum += d.volume * d.price;
    }
    const exitPrice = totalExitVol > 0 ? exitSum / totalExitVol : lastExit.price;

    // Accumulate PnL, commission, swap
    let totalComm = 0;
    let totalSwap = 0;
    let totalProfit = 0;
    for (const d of deals) {
      totalComm += d.commission || 0;
      totalSwap += d.swap || 0;
      totalProfit += d.profit || 0;
    }
    const netPnl = totalProfit + totalComm + totalSwap;

    // Date & Time strings
    const entryDateObj = new Date(firstEntry.time);
    const dateStr = entryDateObj.toISOString().split("T")[0]; // YYYY-MM-DD
    const timeStr = entryDateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    // Duration calculation in minutes
    const exitDateObj = new Date(lastExit.time);
    const durationMin = Math.max(
      1,
      Math.round((exitDateObj.getTime() - entryDateObj.getTime()) / (1000 * 60))
    );

    // Upsert into Supabase trades table
    const { data: upserted, error: upsertError } = await supabase
      .from("trades")
      .upsert(
        {
          user_id: account.user_id,
          account_id: account.id,
          date: dateStr,
          time: timeStr,
          symbol: firstEntry.symbol.toUpperCase(),
          side: side,
          qty: totalEntryVol,
          entry: entryPrice,
          exit: exitPrice,
          net_pnl: netPnl,
          duration: durationMin,
          status: "Closed",
          external_id: positionId,
          sync_source: "MT5",
          has_note: false,
          tags: ["MT5 Sync"],
        },
        { onConflict: "external_id" }
      )
      .select()
      .single();

    if (upsertError) {
      console.error("Failed to upsert trade:", upsertError);
      return NextResponse.json(
        { error: "Database upsert failure", details: upsertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tradeId: upserted.id,
      netPnl,
      symbol: upserted.symbol,
      status: "Synced",
    });
  } catch (error: any) {
    console.error("MT5 Webhook Handler crashed:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
