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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { submitOnboarding } from "@/actions/onboarding";

const OnboardingPage = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/login");
  }

  // Check if user has already completed onboarding
  if (data.user.user_metadata?.onboarding_completed) {
    redirect("/dashboard");
  }

  return (
    <div className="container relative flex min-h-[calc(100vh-57px)] items-center justify-center py-10">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[550px]">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Welcome to Work Hours Tracker
            </CardTitle>
            <CardDescription>
              Let&apos;s set up your account with some basic information to get
              you started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={submitOnboarding} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="Enter your first name"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Enter your last name"
                      required
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Work Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Work Preferences</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="defaultWage">Default Hourly Wage (₹)</Label>
                    <Input
                      id="defaultWage"
                      name="defaultWage"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter your default hourly rate"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="workWeek">Typical Work Week</Label>
                    <Select name="workWeek">
                      <SelectTrigger>
                        <SelectValue placeholder="Select your typical work days" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mon-fri">
                          Monday to Friday
                        </SelectItem>
                        <SelectItem value="mon-sat">
                          Monday to Saturday
                        </SelectItem>
                        <SelectItem value="custom">Custom/Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="currency">Preferred Currency</Label>
                    <Select name="currency" defaultValue="inr">
                      <SelectTrigger>
                        <SelectValue placeholder="Select your currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gbp">British Pound (£)</SelectItem>
                        <SelectItem value="usd">US Dollar ($)</SelectItem>
                        <SelectItem value="eur">Euro (€)</SelectItem>
                        <SelectItem value="inr">Indian Rupee (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Notification Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  Notification Preferences
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Monthly Summary Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive a monthly summary of your work hours and
                        earnings
                      </p>
                    </div>
                    <Switch name="monthlyEmail" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekly Report</Label>
                      <p className="text-sm text-muted-foreground">
                        Get weekly insights about your work patterns
                      </p>
                    </div>
                    <Switch name="weeklyEmail" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Reminder Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive reminders to log your work hours
                      </p>
                    </div>
                    <Switch name="reminders" defaultChecked />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full">
                  Complete Setup
                </Button>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  You can always update these preferences later in your account
                  settings.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingPage;
