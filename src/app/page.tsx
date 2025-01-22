import HomeHero from "@/components/ui/home-hero";
import { ClockPage } from "@/components/clock-page";
import { createClient } from "@/lib/supabase/server";

const HomePage = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return !user?.id ? <HomeHero /> : <ClockPage />;
};

export default HomePage;
