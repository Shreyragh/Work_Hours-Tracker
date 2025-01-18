"use client";

import { login } from "@/actions/auth";
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
import Link from "next/link";
import { useState } from "react";

const LoginClient = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    try {
      await login(formData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="name@example.com"
              required
              className="w-full"
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>

          <div className="text-center text-sm">
            <Link href="/signup" className="text-primary hover:text-primary/80">
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
  );
};

export default LoginClient;
