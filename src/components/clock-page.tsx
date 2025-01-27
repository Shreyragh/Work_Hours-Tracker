import { createClient } from "@/lib/supabase/server";
import { ClockPageClient } from "./clock-page-client";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export async function ClockPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Unauthorized");
  }

  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("default_wage, currency")
    .eq("user_id", user.id)
    .single();

  const hourlyRate = userProfile?.default_wage || 15;
  const currency = userProfile?.currency || "USD";

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Time Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <ClockPageClient hourlyRate={hourlyRate} currency={currency} />
        </CardContent>
      </Card>
    </div>
  );
}
