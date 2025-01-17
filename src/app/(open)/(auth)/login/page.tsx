import { login } from "@/actions/auth";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

const Login = async ({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) => {
  const { error: searchParamsError } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (data?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="container relative flex min-h-[calc(100vh-57px)] items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <Card className="border-none">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Welcome back
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your credentials to sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={login} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  required
                  className="w-full"
                />
              </div>

              {searchParamsError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Your email or password is incorrect. Please try again.
                  </AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full">
                Sign In
              </Button>

              <div className="text-center text-sm">
                <Link
                  href="/signup"
                  className="text-primary hover:text-primary/80"
                >
                  Don&apos;t have an account? Sign Up
                </Link>
                <div className="mt-2">
                  <Link
                    href="/forgot-password"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
