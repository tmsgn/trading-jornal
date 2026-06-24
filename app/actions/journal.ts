"use server";

import { createClient } from "@/utils/supabase/server";

export interface DailyLog {
  id?: string;
  date: string;
  mood: string;
  sleep: number;
  stress: number;
  notes: string;
  checklist: Record<string, boolean>;
  screenshots: string[];
  // Enhanced fields
  preMarketNotes: string;
  postMarketNotes: string;
  confidence: number; // 1-5
  discipline: number; // 1-5
  rating: number; // 1-5 overall day rating
  playbook?: string;
}

export async function getDailyJournalsAction(): Promise<
  Record<string, DailyLog>
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  const { data, error } = await supabase
    .from("daily_journals")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching daily journals:", error);
    return {};
  }

  const map: Record<string, DailyLog> = {};
  for (const row of data) {
    map[row.date] = {
      id: row.id,
      date: row.date,
      mood: row.mood ?? "",
      sleep: row.sleep ?? 3,
      stress: row.stress ?? 3,
      notes: row.notes ?? "",
      checklist: row.checklist ?? {},
      screenshots: row.screenshots ?? [],
      preMarketNotes: row.pre_market_notes ?? "",
      postMarketNotes: row.post_market_notes ?? "",
      confidence: row.confidence ?? 3,
      discipline: row.discipline ?? 3,
      rating: row.rating ?? 0,
      playbook: row.playbook ?? "",
    };
  }
  return map;
}

export async function updateDailyJournalAction(
  date: string,
  payload: Partial<DailyLog>,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Map camelCase to snake_case for DB columns
  const dbPayload: Record<string, any> = {};
  if (payload.mood !== undefined) dbPayload.mood = payload.mood;
  if (payload.sleep !== undefined) dbPayload.sleep = payload.sleep;
  if (payload.stress !== undefined) dbPayload.stress = payload.stress;
  if (payload.notes !== undefined) dbPayload.notes = payload.notes;
  if (payload.checklist !== undefined) dbPayload.checklist = payload.checklist;
  if (payload.screenshots !== undefined) dbPayload.screenshots = payload.screenshots;
  if (payload.preMarketNotes !== undefined) dbPayload.pre_market_notes = payload.preMarketNotes;
  if (payload.postMarketNotes !== undefined) dbPayload.post_market_notes = payload.postMarketNotes;
  if (payload.confidence !== undefined) dbPayload.confidence = payload.confidence;
  if (payload.discipline !== undefined) dbPayload.discipline = payload.discipline;
  if (payload.rating !== undefined) dbPayload.rating = payload.rating;
  if (payload.playbook !== undefined) dbPayload.playbook = payload.playbook;

  // Upsert pattern
  const { data: existing } = await supabase
    .from("daily_journals")
    .select("id")
    .eq("user_id", user.id)
    .eq("date", date)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from("daily_journals")
      .update(dbPayload)
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  } else {
    const { data, error } = await supabase
      .from("daily_journals")
      .insert({
        user_id: user.id,
        date: date,
        mood: payload.mood ?? "",
        sleep: payload.sleep ?? 3,
        stress: payload.stress ?? 3,
        notes: payload.notes ?? "",
        checklist: payload.checklist ?? {},
        screenshots: payload.screenshots ?? [],
        pre_market_notes: payload.preMarketNotes ?? "",
        post_market_notes: payload.postMarketNotes ?? "",
        confidence: payload.confidence ?? 3,
        discipline: payload.discipline ?? 3,
        rating: payload.rating ?? 0,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }
}
