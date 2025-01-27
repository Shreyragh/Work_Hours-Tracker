"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function clockIn() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Unauthorized");
  }

  // Check if user already has an active session
  const { data: existingSession } = await supabase
    .from("clock_sessions")
    .select()
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (existingSession) {
    throw new Error("You are already clocked in");
  }

  const now = new Date().toISOString();

  const { error: insertError } = await supabase.from("clock_sessions").insert({
    user_id: user.id,
    clock_in_time: now,
    is_active: true,
  });

  if (insertError) {
    throw new Error("Failed to clock in");
  }

  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function clockOut() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Unauthorized");
  }

  // Get active session
  const { data: activeSession } = await supabase
    .from("clock_sessions")
    .select()
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (!activeSession) {
    throw new Error("No active clock-in session found");
  }

  const now = new Date().toISOString();

  // Update clock session
  const { error: updateError } = await supabase
    .from("clock_sessions")
    .update({
      clock_out_time: now,
      is_active: false,
    })
    .eq("id", activeSession.id);

  if (updateError) {
    throw new Error("Failed to clock out");
  }

  // Create work log
  const { error: workLogError, data: workLogData } = await supabase
    .from("work_logs")
    .insert({
      user_id: user.id,
      date: now.split("T")[0],
      start_time: activeSession.clock_in_time.split("T")[1].split(".")[0],
      end_time: now.split("T")[1].split(".")[0],
      default_rate: true,
    });

  if (workLogError) {
    throw new Error("Failed to create work log");
  }

  console.log(workLogData);

  revalidatePath("/logs");
  revalidatePath("/reports");
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getCurrentClockStatus() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Unauthorized");
  }

  const { data: activeSession } = await supabase
    .from("clock_sessions")
    .select()
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  return {
    isClockedIn: !!activeSession,
    clockInTime: activeSession?.clock_in_time,
  };
}
