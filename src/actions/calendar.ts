"use server";

import { createClient } from "@/lib/supabase/server";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

export async function generateCalendarToken() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError) throw new Error("Authentication failed");
    if (!user) throw new Error("Not authenticated");

    const token = nanoid(32); // Generate a secure random token

    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({ calendar_token: token })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Failed to update calendar token:", updateError);
      throw new Error("Failed to generate calendar token");
    }

    revalidatePath("/account");
    return { success: true, token };
  } catch (error) {
    console.error("Calendar token generation failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function revokeCalendarToken() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError) throw new Error("Authentication failed");
    if (!user) throw new Error("Not authenticated");

    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({ calendar_token: null })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Failed to revoke calendar token:", updateError);
      throw new Error("Failed to revoke calendar token");
    }

    revalidatePath("/account");
    return { success: true };
  } catch (error) {
    console.error("Calendar token revocation failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
