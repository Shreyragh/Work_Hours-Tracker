import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogsClient from "./logs-client";

const WorkLogs = async () => {
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

  const { data: initialLogs } = await supabase
    .from("work_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  return (
    <LogsClient
      user={user}
      userProfile={
        userProfile as {
          default_wage: number | null;
          time_format: "12h" | "24h" | null;
          currency: string | null;
        } | null
      }
      initialLogs={initialLogs}
    />
  );
};

export default WorkLogs;
