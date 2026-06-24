"use server";

import type { Trade } from "@/lib/data";
import { createClient } from "@/utils/supabase/server";

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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("trades")
    .insert({
      user_id: user.id,
      date: tradeData.date,
      time: tradeData.time,
      symbol: tradeData.symbol,
      side: tradeData.side,
      qty: tradeData.qty,
      entry: tradeData.entry,
      exit: tradeData.exit,
      net_pnl: tradeData.netPnl,
      rr: tradeData.rr,
      duration: tradeData.duration,
      playbook_id: tradeData.playbookId,
      tags: tradeData.tags,
      has_note: tradeData.hasNote,
      status: tradeData.status,
      account_id: tradeData.accountId,
      stop_loss: tradeData.stopLoss,
      take_profit: tradeData.takeProfit,
      initial_rr: tradeData.initialRr,
      notes: tradeData.notes,
      screenshots: tradeData.screenshots,
      entry_time_frame: tradeData.entryTimeFrame,
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const updatePayload: any = {};
  if (tradeData.date !== undefined) updatePayload.date = tradeData.date;
  if (tradeData.time !== undefined) updatePayload.time = tradeData.time;
  if (tradeData.symbol !== undefined) updatePayload.symbol = tradeData.symbol;
  if (tradeData.side !== undefined) updatePayload.side = tradeData.side;
  if (tradeData.qty !== undefined) updatePayload.qty = tradeData.qty;
  if (tradeData.entry !== undefined) updatePayload.entry = tradeData.entry;
  if (tradeData.exit !== undefined) updatePayload.exit = tradeData.exit;
  if (tradeData.netPnl !== undefined) updatePayload.net_pnl = tradeData.netPnl;
  if (tradeData.rr !== undefined) updatePayload.rr = tradeData.rr;
  if (tradeData.duration !== undefined)
    updatePayload.duration = tradeData.duration;
  if (tradeData.playbookId !== undefined)
    updatePayload.playbook_id = tradeData.playbookId;
  if (tradeData.tags !== undefined) updatePayload.tags = tradeData.tags;
  if (tradeData.hasNote !== undefined)
    updatePayload.has_note = tradeData.hasNote;
  if (tradeData.status !== undefined) updatePayload.status = tradeData.status;
  if (tradeData.accountId !== undefined)
    updatePayload.account_id = tradeData.accountId;
  if (tradeData.stopLoss !== undefined) updatePayload.stop_loss = tradeData.stopLoss;
  if (tradeData.takeProfit !== undefined) updatePayload.take_profit = tradeData.takeProfit;
  if (tradeData.initialRr !== undefined) updatePayload.initial_rr = tradeData.initialRr;
  if (tradeData.notes !== undefined) updatePayload.notes = tradeData.notes;
  if (tradeData.screenshots !== undefined) updatePayload.screenshots = tradeData.screenshots;
  if (tradeData.entryTimeFrame !== undefined) updatePayload.entry_time_frame = tradeData.entryTimeFrame;

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

  const { error } = await supabase.from("trades").delete().eq("id", id);

  if (error) {
    console.error("Error deleting trade:", error);
    throw new Error(error.message);
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
