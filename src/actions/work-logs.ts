"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createWorkLog(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Unauthorised");
  }

  const date = formData.get("date") as string;
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;
  const useDefaultWage = formData.get("useDefaultWage") === "true";
  const rate = useDefaultWage
    ? null
    : parseFloat(formData.get("rate") as string);
  const notes = formData.get("notes") as string;

  const { error: insertError } = await supabase.from("work_logs").insert({
    user_id: user.id,
    date,
    start_time: `${startTime}:00`,
    end_time: `${endTime}:00`,
    default_rate: useDefaultWage,
    custom_rate: rate,
    notes,
  });

  if (insertError) {
    throw new Error("Failed to create work log");
  }

  revalidatePath("/logs");
  revalidatePath("/reports");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateWorkLog(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Unauthorised");
  }

  const id = Number(formData.get("id") as string);
  const date = formData.get("date") as string;
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;
  const useDefaultWage = formData.get("useDefaultWage") === "true";
  const rate = useDefaultWage
    ? null
    : parseFloat(formData.get("rate") as string);
  const notes = formData.get("notes") as string;

  const { error: updateError } = await supabase
    .from("work_logs")
    .update({
      date,
      start_time: `${startTime}:00`,
      end_time: `${endTime}:00`,
      default_rate: useDefaultWage,
      custom_rate: rate,
      notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) {
    throw new Error("Failed to update work log");
  }

  revalidatePath("/logs");
  revalidatePath("/reports");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteWorkLog(id: number) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Unauthorised");
    }

    const { error } = await supabase
      .from("work_logs")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    revalidatePath("/logs");
    revalidatePath("/reports");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error deleting work log:", error);
    return { success: false, error };
  }
}
