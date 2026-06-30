"use server";

import { createClient } from "@/utils/supabase/server";
import { z } from "zod";

const journalUpdateSchema = z.object({
  mood: z.string().optional(),
  sleep: z.number().min(0).max(24).optional(),
  stress: z.number().min(1).max(5).optional(),
  notes: z.string().optional(),
  checklist: z.record(z.string(), z.boolean()).optional(),
  screenshots: z.array(z.string()).optional(),
  preMarketNotes: z.string().optional(),
  postMarketNotes: z.string().optional(),
  confidence: z.number().min(1).max(5).optional(),
  discipline: z.number().min(1).max(5).optional(),
  rating: z.number().min(0).max(5).optional(),
  playbook: z.string().optional(),
});

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
  const parsed = journalUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(`Validation Error: ${parsed.error.issues.map(e => e.message).join(", ")}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const validatedData = parsed.data;

  // Map camelCase to snake_case for DB columns
  const dbPayload: Record<string, any> = {};
  if (validatedData.mood !== undefined) dbPayload.mood = validatedData.mood;
  if (validatedData.sleep !== undefined) dbPayload.sleep = validatedData.sleep;
  if (validatedData.stress !== undefined) dbPayload.stress = validatedData.stress;
  if (validatedData.notes !== undefined) dbPayload.notes = validatedData.notes;
  if (validatedData.checklist !== undefined) dbPayload.checklist = validatedData.checklist;
  if (validatedData.screenshots !== undefined) dbPayload.screenshots = validatedData.screenshots;
  if (validatedData.preMarketNotes !== undefined) dbPayload.pre_market_notes = validatedData.preMarketNotes;
  if (validatedData.postMarketNotes !== undefined) dbPayload.post_market_notes = validatedData.postMarketNotes;
  if (validatedData.confidence !== undefined) dbPayload.confidence = validatedData.confidence;
  if (validatedData.discipline !== undefined) dbPayload.discipline = validatedData.discipline;
  if (validatedData.rating !== undefined) dbPayload.rating = validatedData.rating;
  if (validatedData.playbook !== undefined) dbPayload.playbook = validatedData.playbook;

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
        mood: validatedData.mood ?? "",
        sleep: validatedData.sleep ?? 3,
        stress: validatedData.stress ?? 3,
        notes: validatedData.notes ?? "",
        checklist: validatedData.checklist ?? {},
        screenshots: validatedData.screenshots ?? [],
        pre_market_notes: validatedData.preMarketNotes ?? "",
        post_market_notes: validatedData.postMarketNotes ?? "",
        confidence: validatedData.confidence ?? 3,
        discipline: validatedData.discipline ?? 3,
        rating: validatedData.rating ?? 0,
        playbook: validatedData.playbook ?? "",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }
}
