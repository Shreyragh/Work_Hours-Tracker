import { login } from "@/actions/auth";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { XCircleIcon } from "lucide-react";

const Login = async ({ searchParams }: { searchParams: { error: string } }) => {
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();

  if (data?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-background">
      <div className="w-full max-w-md rounded-lg bg-foreground p-10 shadow-md">
        <h1 className="mb-8 text-center text-2xl font-bold text-gray-800">
          Login
        </h1>
        <form action={login}>
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
          <div className="mb-4">
            <label
              className="mb-1 block text-sm font-medium text-gray-700"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="focus:shadow-outline mb-0 w-full appearance-none rounded-md border border-gray-300 px-4 py-2 leading-tight text-gray-700 focus:border-indigo-500 focus:outline-none"
              id="password"
              type="password"
              name="password"
              required
              placeholder="Enter your password"
            />
          </div>
          {searchParams.error && (
            <div className="mb-4 rounded-md bg-red-100 p-4">
              <div className="flex">
                <div className="shrink-0">
                  <XCircleIcon
                    aria-hidden="true"
                    className="size-5 text-red-400"
                  />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Login Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul role="list" className="list-disc space-y-1 pl-5">
                      <li>
                        Your email or password is incorrect. Please try again.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <button
              className="focus:shadow-outline w-full rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 focus:outline-none"
              type="submit"
            >
              Sign In
            </button>
          </div>
          <div className="mt-6 text-center">
            <a
              href="/signup"
              className="inline-block align-baseline text-sm text-indigo-600 hover:text-indigo-800"
            >
              Sign Up
            </a>
            <span className="mx-2 text-gray-500">|</span>
            <a
              href="/forgot-password"
              className="inline-block align-baseline text-sm text-indigo-600 hover:text-indigo-800"
            >
              Forgot Password?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
