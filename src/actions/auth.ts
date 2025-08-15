"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { data: loginData, error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    console.error('Login error:', error.message);
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  // Check if user needs to complete onboarding
  if (loginData.user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('onboarding_completed')
      .eq('user_id', loginData.user.id)
      .single();

    if (!profile?.onboarding_completed) {
      redirect("/account/onboarding");
    }
  }

  revalidatePath("/");
  revalidatePath("/", "layout");
  redirect("/time-tracker");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { data: signUpData, error } = await supabase.auth.signUp(data);

  if (error) {
    console.error('Signup error:', error.message);
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  // Check if email confirmation is required
  if (signUpData.user && !signUpData.user.email_confirmed_at) {
    redirect("/signup?message=Please check your email to confirm your account before signing in.");
  }

  revalidatePath("/");
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/");
  revalidatePath("/", "layout");
  redirect("/login");
}
