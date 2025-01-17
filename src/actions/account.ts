"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface NotificationSettings {
  monthlyEmail: boolean;
  weeklyEmail: boolean;
  reminders: boolean;
}

export async function updateGeneralSettings(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Unauthorized");
  }

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const defaultWage = parseFloat(formData.get("defaultWage") as string);
  const workWeek = formData.get("workWeek") as string;
  const currency = formData.get("currency") as string;
  const timeFormat = formData.get("timeFormat") as "12h" | "24h";

  const { error: updateError } = await supabase
    .from("user_profiles")
    .update({
      first_name: firstName,
      last_name: lastName,
      default_wage: defaultWage,
      work_week: workWeek,
      currency,
      time_format: timeFormat,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (updateError) {
    console.error(updateError);
    throw new Error("Failed to update profile");
  }

  revalidatePath("/account");
  revalidatePath("/logs");
  revalidatePath("/dashboard");
}

export async function updateNotificationSettings(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Not authenticated");
  }

  const data: NotificationSettings = {
    monthlyEmail: formData.get("monthlyEmail") === "on",
    weeklyEmail: formData.get("weeklyEmail") === "on",
    reminders: formData.get("reminders") === "on",
  };

  const { error: updateError } = await supabase
    .from("user_profiles")
    .update({
      monthly_email: data.monthlyEmail,
      weekly_email: data.weeklyEmail,
      reminders: data.reminders,
    })
    .eq("user_id", user.id);

  if (updateError) {
    throw new Error("Failed to update notification settings");
  }

  revalidatePath("/account");
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Not authenticated");
  }

  const currentPassword = formData.get("current") as string;
  const newPassword = formData.get("new") as string;
  const confirmPassword = formData.get("confirm") as string;

  if (newPassword !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  // Verify current password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  });

  if (signInError) {
    throw new Error("Current password is incorrect");
  }

  // If current password is correct, update to new password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    throw new Error("Failed to update password");
  }

  revalidatePath("/account");
}
