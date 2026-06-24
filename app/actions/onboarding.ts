"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function checkOnboardingStatus() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("profiles")
    .select("onboarding_complete")
    .eq("id", user.id)
    .single();

  return data?.onboarding_complete || false;
}

export async function getTradingAccounts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trading_accounts")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching accounts:", error);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    startingBalance: Number(row.starting_balance),
    currentBalance: Number(row.current_balance),
    mt5Login: row.mt5_login,
    mt5Server: row.mt5_server,
    mt5Password: row.mt5_password,
    mt5AccountId: row.mt5_account_id,
    mt5ConnectionStatus: row.mt5_connection_status || "disconnected",
  }));
}

export async function completeOnboardingAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const accountName = formData.get("accountName") as string;
  const startingBalance = Number(formData.get("startingBalance"));
  const tradingStyle = formData.get("tradingStyle") as string;

  // 1. Create trading account
  const { error: accountError } = await supabase
    .from("trading_accounts")
    .insert({
      user_id: user.id,
      name: accountName,
      starting_balance: startingBalance,
      current_balance: startingBalance,
    });

  if (accountError) throw new Error(accountError.message);

  // 2. Update Profile
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      trading_style: tradingStyle,
      onboarding_complete: true,
    })
    .eq("id", user.id);

  if (profileError) throw new Error(profileError.message);

  revalidatePath("/", "layout");
  redirect("/");
}

export async function addAccountAction(name: string, startingBalance: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("trading_accounts")
    .insert({
      user_id: user.id,
      name,
      starting_balance: startingBalance,
      current_balance: startingBalance,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    name: data.name,
    startingBalance: Number(data.starting_balance),
    currentBalance: Number(data.current_balance),
  };
}

export async function deleteAccountAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("trading_accounts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);

  // Check if they have any accounts left. If 0, force them back to onboarding
  const { count } = await supabase
    .from("trading_accounts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (count === 0) {
    await supabase
      .from("profiles")
      .update({ onboarding_complete: false })
      .eq("id", user.id);
    return { redirected: true };
  }

  return { redirected: false };
}
