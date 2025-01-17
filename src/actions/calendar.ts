import { createClient } from "@/lib/supabase/server";
import { nanoid } from "nanoid";

export async function generateCalendarToken() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const token = nanoid(32); // Generate a secure random token

  const { error } = await supabase
    .from("user_profiles")
    .update({ calendar_token: token })
    .eq("user_id", user.id);

  if (error) throw error;
  return token;
}

export async function revokeCalendarToken() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("user_profiles")
    .update({ calendar_token: null })
    .eq("user_id", user.id);

  if (error) throw error;
  return true;
}
