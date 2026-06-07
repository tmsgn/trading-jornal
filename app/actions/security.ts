"use server";

import { createClient } from "@/utils/supabase/server";

export async function updatePasswordAction(newPassword: string) {
  const supabase = await createClient();
  
  const { error } = await supabase.auth.updateUser({ 
    password: newPassword 
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return { success: true };
}
