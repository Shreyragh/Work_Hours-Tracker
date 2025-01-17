import { signup } from "@/actions/auth";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const Signup = async () => {
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();

  if (data?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-background">
      <div className="w-full max-w-md rounded-lg bg-foreground p-10 shadow-md">
        <h1 className="mb-8 text-center text-2xl font-bold text-gray-800">
          Sign Up
        </h1>
        <form action={signup}>
          <div className="mb-5">
            <label
              className="mb-1 block text-sm font-medium text-gray-700"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="focus:shadow-outline w-full appearance-none rounded-md border border-gray-300 px-4 py-2 leading-tight text-gray-700 focus:border-indigo-500 focus:outline-none"
              id="email"
              type="email"
              name="email"
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-6">
            <label
              className="mb-1 block text-sm font-medium text-gray-700"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="focus:shadow-outline mb-3 w-full appearance-none rounded-md border border-gray-300 px-4 py-2 leading-tight text-gray-700 focus:border-indigo-500 focus:outline-none"
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="focus:shadow-outline w-full rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 focus:outline-none"
              type="submit"
            >
              Sign Up
            </button>
          </div>
          <div className="mt-6 text-center">
            <a
              href="/login"
              className="inline-block align-baseline text-sm text-indigo-600 hover:text-indigo-800"
            >
              Already have an account? Log In
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
