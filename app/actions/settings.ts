"use server";

import { createClient } from "@/utils/supabase/server";

export async function getPreferencesAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  const { data, error } = await supabase
    .from("profiles")
    .select("preferences")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching preferences:", error);
    return {};
  }

  return data.preferences || {};
}

export async function updatePreferencesAction(
  newPreferences: Record<string, any>,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // First fetch existing preferences to merge
  const { data: existing, error: fetchError } = await supabase
    .from("profiles")
    .select("preferences")
    .eq("id", user.id)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  const mergedPreferences = {
    ...(existing.preferences || {}),
    ...newPreferences,
  };

  const { error } = await supabase
    .from("profiles")
    .update({ preferences: mergedPreferences })
    .eq("id", user.id);

  if (error) throw new Error(error.message);

  return mergedPreferences;
}
