"use client";

import { useRouter } from "next/navigation";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import {
  addAccountAction,
  deleteAccountAction,
  getTradingAccounts,
} from "@/app/actions/onboarding";
import {
  addTradeAction,
  deleteTradeAction,
  getTradesAction,
  updateTradeAction,
  getProfileAction,
} from "@/app/actions/trade";
import type { Trade, TradingAccount, Profile } from "@/lib/data";

interface TradeContextType {
  trades: Trade[];
  accounts: TradingAccount[];
  activeAccountId: string | null;
  setActiveAccountId: (id: string) => void;
  isLoading: boolean;
  addTrade: (trade: Omit<Trade, "id">) => Promise<Trade | null>;
  updateTrade: (id: string | number, trade: Partial<Trade>) => Promise<void>;
  deleteTrade: (id: string | number) => Promise<void>;
  addAccount: (name: string, balance: number) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  profile: Profile | null;
  setProfile: (profile: Profile | null) => void;
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export function TradeProvider({ children }: { children: React.ReactNode }) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch accounts and trades on mount
  useEffect(() => {
    async function loadData() {
      try {
        const fetchedAccounts = await getTradingAccounts();
        setAccounts(fetchedAccounts);

        if (fetchedAccounts.length > 0) {
          // Default to the first account
          setActiveAccountId(fetchedAccounts[0].id);
        }

        const fetchedTrades = await getTradesAction();
        setTrades(fetchedTrades);

        const fetchedProfile = await getProfileAction();
        setProfile(fetchedProfile as Profile | null);
      } catch (error) {
        console.error("Failed to load global data", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter trades by active account
  const activeTrades = trades.filter(
    (t) => !activeAccountId || t.accountId === activeAccountId,
  );

  const addTrade = async (trade: Omit<Trade, "id">) => {
    // Inject active account ID if not provided
    const payload = {
      ...trade,
      accountId: trade.accountId || activeAccountId || undefined,
    };

    const newTrade = await addTradeAction(payload);
    if (newTrade) {
      setTrades((prev) => [newTrade, ...prev]);
    }
    return newTrade;
  };

  const updateTrade = async (
    id: string | number,
    updatedFields: Partial<Trade>,
  ) => {
    const updatedTrade = await updateTradeAction(String(id), updatedFields);
    setTrades((prev) =>
      prev.map((t) => (t.id === id ? updatedTrade : t)),
    );
  };

  const deleteTrade = async (id: string | number) => {
    await deleteTradeAction(String(id));
    setTrades((prev) => prev.filter((t) => t.id !== id));
  };

  const addAccount = async (name: string, balance: number) => {
    const newAccount = await addAccountAction(name, balance);
    setAccounts((prev) => [...prev, newAccount]);
    setActiveAccountId(newAccount.id);
  };

  const deleteAccount = async (id: string) => {
    const result = await deleteAccountAction(id);
    setAccounts((prev) => prev.filter((a) => a.id !== id));

    if (result.redirected) {
      router.push("/onboarding");
    } else if (activeAccountId === id) {
      // Find another account to switch to
      setAccounts((prev) => {
        const remaining = prev.filter((a) => a.id !== id);
        if (remaining.length > 0) setActiveAccountId(remaining[0].id);
        return remaining;
      });
    }
  };

  return (
    <TradeContext.Provider
      value={{
        trades: activeTrades, // We only expose trades for the active account
        accounts,
        activeAccountId,
        setActiveAccountId,
        isLoading,
        addTrade,
        updateTrade,
        deleteTrade,
        addAccount,
        deleteAccount,
        profile,
        setProfile,
      }}
    >
      {children}
    </TradeContext.Provider>
  );
}

export function useTrades() {
  const context = useContext(TradeContext);
  if (context === undefined) {
    throw new Error("useTrades must be used within a TradeProvider");
  }
  return context;
}
