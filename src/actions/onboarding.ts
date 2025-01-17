"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function submitOnboarding(formData: FormData) {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  // Extract form data
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const defaultWage = parseFloat(formData.get("defaultWage") as string);
  const workWeek = formData.get("workWeek") as string;
  const currency = formData.get("currency") as string;
  const monthlyEmail = formData.get("monthlyEmail") === "on";
  const weeklyEmail = formData.get("weeklyEmail") === "on";
  const reminders = formData.get("reminders") === "on";

  // Insert into user_profiles table
  const { error: profileError } = await supabase.from("user_profiles").insert({
    user_id: user.id,
    first_name: firstName,
    last_name: lastName,
    default_wage: defaultWage,
    work_week: workWeek,
    currency: currency,
    monthly_email: monthlyEmail,
    weekly_email: weeklyEmail,
    reminders: reminders,
    onboarding_completed: true,
  });

  if (profileError) {
    console.error("Error saving profile:", profileError);
    // You might want to handle this error differently
    throw new Error("Failed to save profile");
  }

  // Update user metadata to mark onboarding as complete
  const { error: updateError } = await supabase.auth.updateUser({
    data: {
      onboarding_completed: true,
      first_name: firstName,
      last_name: lastName,
    },
  });

  if (updateError) {
    console.error("Error updating user metadata:", updateError);
    throw new Error("Failed to update user metadata");
  }

  revalidatePath("/account");
  redirect("/dashboard");
}
