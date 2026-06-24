"use server";

import { createClient } from "@/utils/supabase/server";

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

  // Transform to match frontend interface
  return data.map((pb: any) => ({
    id: pb.id,
    name: pb.name,
    description: pb.description || "",
    color: pb.color || "#6366f1",
    active: pb.active,
    winRate: 0, // In a real app, calculate this dynamically from joined trades
    totalPnl: 0, // In a real app, calculate this dynamically from joined trades
    trades: 0, // In a real app, calculate this dynamically from joined trades
    avgRR: 0, // In a real app, calculate this dynamically from joined trades
    equity: [0], // In a real app, calculate this dynamically from joined trades
  }));
}

export async function createPlaybookAction(payload: {
  name: string;
  description: string;
  color: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("playbooks")
    .insert({
      user_id: user.id,
      name: payload.name,
      description: payload.description,
      color: payload.color,
      active: true,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return {
    ...data,
    winRate: 0,
    totalPnl: 0,
    trades: 0,
    avgRR: 0,
    equity: [0],
  };
}

export async function updatePlaybookAction(
  id: string,
  payload: {
    name?: string;
    description?: string;
    color?: string;
    active?: boolean;
  },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("playbooks")
    .update(payload)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
