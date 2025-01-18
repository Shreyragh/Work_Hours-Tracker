import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SignupClient from "./signup-client";

const Signup = async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (data?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="container relative flex min-h-[calc(100vh-57px)] items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <SignupClient />
      </div>
    </div>
  );
};

export default Signup;
