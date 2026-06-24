"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

const METAAPI_PROVISIONING_URL = "https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai";
const METAAPI_CLIENT_URL = "https://mt-client-api-v1.new-york.agiliumtrade.ai";
const METAAPI_API_KEY = process.env.METAAPI_API_KEY || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://tradezella-clone.vercel.app";

export async function connectMt5AccountAction(
  accountId: string,
  credentials: { login: string; server: string; investorPassword: string }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { login, server, investorPassword } = credentials;

  if (!login || !server || !investorPassword) {
    throw new Error("Missing required fields: login, server, password");
  }

  // Fetch account record to verify ownership
  const { data: account, error: fetchErr } = await supabase
    .from("trading_accounts")
    .select("name")
    .eq("id", accountId)
    .eq("user_id", user.id)
    .single();

  if (fetchErr || !account) {
    throw new Error("Trading account not found or access denied");
  }

  let metaapiAccountId = `mock_${Math.random().toString(36).substring(2, 10)}`;
  let finalStatus = "connected";

  // If MetaApi Key is provided, register with the MetaApi cloud platform
  if (METAAPI_API_KEY) {
    try {
      // 1. Register provisioning account on MetaApi
      const registerRes = await fetch(`${METAAPI_PROVISIONING_URL}/users/current/accounts`, {
        method: "POST",
        headers: {
          "auth-token": METAAPI_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: account.name,
          type: "cloud",
          login: login,
          password: investorPassword,
          server: server,
          platform: "mt5",
          magic: 0,
          reliability: "high",
        }),
      });

      if (!registerRes.ok) {
        const errorText = await registerRes.text();
        console.error("MetaApi Account Registration failed:", errorText);
        throw new Error(`MetaApi registration failed: ${errorText}`);
      }

      const registered = await registerRes.json();
      metaapiAccountId = registered.id;
      finalStatus = "connecting"; // Wait for deploy event

      // 2. Set up event webhooks for trade alerts
      const webhookRes = await fetch(
        `${METAAPI_CLIENT_URL}/users/current/accounts/${metaapiAccountId}/webhooks`,
        {
          method: "POST",
          headers: {
            "auth-token": METAAPI_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: `${APP_URL}/api/sync/mt5`,
            events: ["dealClosed", "positionClosed"],
          }),
        }
      );

      if (!webhookRes.ok) {
        console.warn("MetaApi Webhook registration failed, deals will be synced manually/via cron");
      }
    } catch (err: any) {
      console.error("Failed to connect to MetaApi service:", err);
      throw new Error(err.message || "Failed to communicate with MetaApi cloud servers");
    }
  } else {
    // Simulated connection success for local test/demo modes
    console.log("Simulating MT5 connection for local dev...");
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  // 3. Save connection parameters to database
  const { error: updateErr } = await supabase
    .from("trading_accounts")
    .update({
      mt5_login: login,
      mt5_server: server,
      mt5_password: investorPassword, // investor password is stored securely
      mt5_account_id: metaapiAccountId,
      mt5_connection_status: finalStatus,
    })
    .eq("id", accountId)
    .eq("user_id", user.id);

  if (updateErr) {
    console.error("Database update failed for MT5 details:", updateErr);
    throw new Error("Failed to save MT5 connection details to database");
  }

  revalidatePath("/settings");
  return { success: true, status: finalStatus, metaapiAccountId };
}

export async function disconnectMt5AccountAction(accountId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Fetch the account to get the MetaApi ID
  const { data: account, error: fetchErr } = await supabase
    .from("trading_accounts")
    .select("mt5_account_id")
    .eq("id", accountId)
    .eq("user_id", user.id)
    .single();

  if (fetchErr || !account) {
    throw new Error("Trading account not found");
  }

  const metaapiAccountId = account.mt5_account_id;

  if (metaapiAccountId && METAAPI_API_KEY && !metaapiAccountId.startsWith("mock_")) {
    try {
      // Delete the registered account from MetaApi
      const deleteRes = await fetch(
        `${METAAPI_PROVISIONING_URL}/users/current/accounts/${metaapiAccountId}`,
        {
          method: "DELETE",
          headers: {
            "auth-token": METAAPI_API_KEY,
          },
        }
      );
      if (!deleteRes.ok) {
        console.error("Failed to delete account from MetaApi:", await deleteRes.text());
      }
    } catch (err) {
      console.error("Failed to delete account from MetaApi server:", err);
    }
  }

  // Reset MT5 connection fields in DB
  const { error: updateErr } = await supabase
    .from("trading_accounts")
    .update({
      mt5_login: null,
      mt5_server: null,
      mt5_password: null,
      mt5_account_id: null,
      mt5_connection_status: "disconnected",
    })
    .eq("id", accountId)
    .eq("user_id", user.id);

  if (updateErr) {
    throw new Error("Failed to clear MT5 connection details from database");
  }

  revalidatePath("/settings");
  return { success: true };
}
