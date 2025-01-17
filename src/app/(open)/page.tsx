import HomeHero from "@/components/ui/home-hero";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const HomePage = async () => {
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();

  if (data?.user) {
    redirect("/dashboard");
  }

  return <HomeHero />;
};

export default HomePage;
