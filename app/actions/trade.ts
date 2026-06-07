'use server'

import { createClient } from '@/utils/supabase/server'
import { Trade } from '@/lib/data'

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
    grossPnl: Number(row.net_pnl) + (row.status === "Closed" ? 2.5 : 0),
    commissions: row.status === "Closed" ? 2.5 : 0,
    rr: row.rr ? Number(row.rr) : 0,
    duration: row.duration,
    playbook: row.playbook || "None",
    tags: row.tags || [],
    hasNote: row.has_note || false,
    status: row.status as "Open" | "Closed",
    accountId: row.account_id,
  }
}

export async function getPlaybooksAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
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
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .order('date', { ascending: false })
    .order('time', { ascending: false })

  if (error) {
    console.error("Error fetching trades:", error)
    return []
  }

  return data.map(mapRowToTrade)
}

export async function addTradeAction(tradeData: Omit<Trade, 'id'>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from('trades')
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
      playbook: tradeData.playbook,
      tags: tradeData.tags,
      has_note: tradeData.hasNote,
      status: tradeData.status,
      account_id: tradeData.accountId,
    })
    .select()
    .single()

  if (error) {
    console.error("Error adding trade:", error)
    throw new Error(error.message)
  }

  return mapRowToTrade(data)
}

export async function updateTradeAction(id: string | number, tradeData: Partial<Trade>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const updatePayload: any = {}
  if (tradeData.date !== undefined) updatePayload.date = tradeData.date
  if (tradeData.time !== undefined) updatePayload.time = tradeData.time
  if (tradeData.symbol !== undefined) updatePayload.symbol = tradeData.symbol
  if (tradeData.side !== undefined) updatePayload.side = tradeData.side
  if (tradeData.qty !== undefined) updatePayload.qty = tradeData.qty
  if (tradeData.entry !== undefined) updatePayload.entry = tradeData.entry
  if (tradeData.exit !== undefined) updatePayload.exit = tradeData.exit
  if (tradeData.netPnl !== undefined) updatePayload.net_pnl = tradeData.netPnl
  if (tradeData.rr !== undefined) updatePayload.rr = tradeData.rr
  if (tradeData.duration !== undefined) updatePayload.duration = tradeData.duration
  if (tradeData.playbook !== undefined) updatePayload.playbook = tradeData.playbook
  if (tradeData.tags !== undefined) updatePayload.tags = tradeData.tags
  if (tradeData.hasNote !== undefined) updatePayload.has_note = tradeData.hasNote
  if (tradeData.status !== undefined) updatePayload.status = tradeData.status
  if (tradeData.accountId !== undefined) updatePayload.account_id = tradeData.accountId

  const { data, error } = await supabase
    .from('trades')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error("Error updating trade:", error)
    throw new Error(error.message)
  }

  return mapRowToTrade(data)
}

export async function deleteTradeAction(id: string | number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from('trades')
    .delete()
    .eq('id', id)

  if (error) {
    console.error("Error deleting trade:", error)
    throw new Error(error.message)
  }

  return true
}

export async function getProfileAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error("Error fetching profile:", error)
    return { firstName: "Trader", lastName: "", email: user.email }
  }

  return {
    firstName: data.first_name,
    lastName: data.last_name,
    email: data.email
  }
}

export async function updateProfileAction(profileData: { firstName: string; lastName: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from('profiles')
    .update({
      first_name: profileData.firstName,
      last_name: profileData.lastName,
    })
    .eq('id', user.id)

  if (error) {
    console.error("Error updating profile:", error)
    throw new Error(error.message)
  }

  return true
}
