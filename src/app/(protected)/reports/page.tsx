import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReportsClient from "./reports-client";

const Reports = async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  if (!user.user_metadata?.onboarding_completed) {
    redirect("/account/onboarding");
  }

  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("default_wage, time_format, currency")
    .eq("user_id", user.id)
    .single();

  // Fetch all work logs for the user
  const { data: workLogs } = await supabase
    .from("work_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  return (
    <ReportsClient
      user={user}
      userProfile={userProfile}
      initialLogs={workLogs}
    />
  );
};

export default Reports;
