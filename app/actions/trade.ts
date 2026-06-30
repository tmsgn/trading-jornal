"use server";

import type { Trade } from "@/lib/data";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";

const tradeSchema = z.object({
  date: z.string().min(1),
  time: z.string().min(1),
  symbol: z.string().min(1),
  side: z.enum(["Long", "Short"]),
  qty: z.number().positive(),
  entry: z.number().positive(),
  exit: z.number().nullable(),
  netPnl: z.number(),
  rr: z.number(),
  duration: z.number().nonnegative(),
  playbookId: z.string().nullable().optional(),
  tags: z.array(z.string()),
  hasNote: z.boolean(),
  status: z.enum(["Open", "Closed"]),
  accountId: z.string().optional(),
  stopLoss: z.number().optional(),
  takeProfit: z.number().optional(),
  initialRr: z.number().optional(),
  notes: z.string().optional(),
  screenshots: z.array(z.string()).optional(),
  entryTimeFrame: z.string().optional(),
  outcome: z.enum(["Win", "Loss", "BE"]).nullable().optional(),
});

const updateTradeSchema = tradeSchema.partial();

// Map database row to Trade interface
function mapRowToTrade(row: any): Trade {
  return {
    id: row.id,
    date: row.date,
    time: row.time,
    symbol: row.symbol,
    side: row.side as "Long" | "Short",
    qty: row.qty,
    entry: Number(row.entry),
    exit: Number(row.exit),
    netPnl: Number(row.net_pnl),
    rr: row.rr ? Number(row.rr) : 0,
    duration: row.duration,
    playbook: row.playbooks?.name || "None",
    playbookId: row.playbook_id,
    tags: row.tags || [],
    hasNote: row.has_note || false,
    status: row.status as "Open" | "Closed",
    accountId: row.account_id,
    notes: row.notes,
    screenshots: row.screenshots || [],
    stopLoss: row.stop_loss ? Number(row.stop_loss) : undefined,
    takeProfit: row.take_profit ? Number(row.take_profit) : undefined,
    initialRr: row.initial_rr ? Number(row.initial_rr) : undefined,
    entryTimeFrame: row.entry_time_frame || undefined,
    outcome: row.outcome as "Win" | "Loss" | "BE" | null,
  };
}

export async function getPlaybooksAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("playbooks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching playbooks:", error);
    return [];
  }
  return data;
}

export async function getTradesAction(): Promise<Trade[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("trades")
    .select("*, playbooks(name)")
    .order("date", { ascending: false })
    .order("time", { ascending: false });

  if (error) {
    console.error("Error fetching trades:", error);
    return [];
  }

  return data.map(mapRowToTrade);
}

export async function addTradeAction(tradeData: Omit<Trade, "id">) {
  const parsed = tradeSchema.safeParse(tradeData);
  if (!parsed.success) {
    throw new Error(`Validation Error: ${parsed.error.errors.map(e => e.message).join(", ")}`);
  }
  
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const validatedData = parsed.data;

  const { data, error } = await supabase
    .from("trades")
    .insert({
      user_id: user.id,
      date: validatedData.date,
      time: validatedData.time,
      symbol: validatedData.symbol,
      side: validatedData.side,
      qty: validatedData.qty,
      entry: validatedData.entry,
      exit: validatedData.exit,
      net_pnl: validatedData.netPnl,
      rr: validatedData.rr,
      duration: validatedData.duration,
      playbook_id: validatedData.playbookId,
      tags: validatedData.tags,
      has_note: validatedData.hasNote,
      status: validatedData.status,
      account_id: validatedData.accountId,
      stop_loss: validatedData.stopLoss,
      take_profit: validatedData.takeProfit,
      initial_rr: validatedData.initialRr,
      notes: validatedData.notes,
      screenshots: validatedData.screenshots,
      entry_time_frame: validatedData.entryTimeFrame,
      outcome: validatedData.outcome,
    })
    .select("*, playbooks(name)")
    .single();

  if (error) {
    console.error("Error adding trade:", error);
    throw new Error(error.message);
  }

  return mapRowToTrade(data);
}

export async function updateTradeAction(
  id: string | number,
  tradeData: Partial<Trade>,
) {
  const parsed = updateTradeSchema.safeParse(tradeData);
  if (!parsed.success) {
    throw new Error(`Validation Error: ${parsed.error.errors.map(e => e.message).join(", ")}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  
  const validatedData = parsed.data;

  const updatePayload: any = {};
  if (validatedData.date !== undefined) updatePayload.date = validatedData.date;
  if (validatedData.time !== undefined) updatePayload.time = validatedData.time;
  if (validatedData.symbol !== undefined) updatePayload.symbol = validatedData.symbol;
  if (validatedData.side !== undefined) updatePayload.side = validatedData.side;
  if (validatedData.qty !== undefined) updatePayload.qty = validatedData.qty;
  if (validatedData.entry !== undefined) updatePayload.entry = validatedData.entry;
  if (validatedData.exit !== undefined) updatePayload.exit = validatedData.exit;
  if (validatedData.netPnl !== undefined) updatePayload.net_pnl = validatedData.netPnl;
  if (validatedData.rr !== undefined) updatePayload.rr = validatedData.rr;
  if (validatedData.duration !== undefined)
    updatePayload.duration = validatedData.duration;
  if (validatedData.playbookId !== undefined)
    updatePayload.playbook_id = validatedData.playbookId;
  if (validatedData.tags !== undefined) updatePayload.tags = validatedData.tags;
  if (validatedData.hasNote !== undefined)
    updatePayload.has_note = validatedData.hasNote;
  if (validatedData.status !== undefined) updatePayload.status = validatedData.status;
  if (validatedData.accountId !== undefined)
    updatePayload.account_id = validatedData.accountId;
  if (validatedData.stopLoss !== undefined) updatePayload.stop_loss = validatedData.stopLoss;
  if (validatedData.takeProfit !== undefined) updatePayload.take_profit = validatedData.takeProfit;
  if (validatedData.initialRr !== undefined) updatePayload.initial_rr = validatedData.initialRr;
  if (validatedData.notes !== undefined) updatePayload.notes = validatedData.notes;
  if (validatedData.screenshots !== undefined) updatePayload.screenshots = validatedData.screenshots;
  if (validatedData.entryTimeFrame !== undefined) updatePayload.entry_time_frame = validatedData.entryTimeFrame;
  if (validatedData.outcome !== undefined) updatePayload.outcome = validatedData.outcome;

  const { data, error } = await supabase
    .from("trades")
    .update(updatePayload)
    .eq("id", id)
    .select("*, playbooks(name)")
    .single();

  if (error) {
    console.error("Error updating trade:", error);
    throw new Error(error.message);
  }

  return mapRowToTrade(data);
}

export async function deleteTradeAction(id: string | number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase.rpc("delete_trade_atomic", {
    p_trade_id: id,
    p_user_id: user.id
  });

  if (error) {
    console.error("Error deleting trade via atomic RPC:", error);
    throw new Error(error.message);
  }

  if (data === false) {
    throw new Error("Trade not found or unauthorized");
  }

  return true;
}

export async function getProfileAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return {
      firstName: "Trader",
      lastName: "",
      email: user.email,
      username: "",
      timezone: "America/New_York",
      experience: "Intermediate",
    };
  }

  return {
    firstName: data.first_name || "",
    lastName: data.last_name || "",
    email: data.email || "",
    username: data.username || "",
    timezone: data.timezone || "America/New_York",
    experience: data.trading_style || "Intermediate",
  };
}

export async function updateProfileAction(profileData: {
  firstName?: string;
  lastName?: string;
  username?: string;
  timezone?: string;
  experience?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const updatePayload: any = {};
  if (profileData.firstName !== undefined)
    updatePayload.first_name = profileData.firstName;
  if (profileData.lastName !== undefined)
    updatePayload.last_name = profileData.lastName;
  if (profileData.username !== undefined)
    updatePayload.username = profileData.username;
  if (profileData.timezone !== undefined)
    updatePayload.timezone = profileData.timezone;
  if (profileData.experience !== undefined)
    updatePayload.trading_style = profileData.experience;

  const { error } = await supabase
    .from("profiles")
    .update(updatePayload)
    .eq("id", user.id);

  if (error) {
    console.error("Error updating profile:", error);
    throw new Error(error.message);
  }

  return true;
}
