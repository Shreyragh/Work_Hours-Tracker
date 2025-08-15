import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  updateGeneralSettings,
  updateNotificationSettings,
  updatePassword,
} from "@/actions/account";
import { CalendarSettings } from "@/components/calendar-settings";

const Account = async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  if (!user.user_metadata?.onboarding_completed) {
    redirect("/account/onboarding");
  }

  // Fetch user profile data
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="space-y-6 pb-16">
      <div className="container space-y-0.5 pt-6">
        <h2 className="text-2xl font-bold tracking-tight">Account</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      <Separator className="my-6" />
      <div className="container flex flex-col space-y-8 lg:flex-row lg:space-y-0">
        <Tabs defaultValue="general" className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="inline-flex w-full min-w-max">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal information and preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form action={updateGeneralSettings} className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          placeholder="Enter your first name"
                          defaultValue={profile?.first_name ?? ""}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          placeholder="Enter your last name"
                          defaultValue={profile?.last_name ?? ""}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        disabled
                        defaultValue={user.email}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Work Preferences</h3>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="defaultWage">
                          Default Hourly Rate (₹)
                        </Label>
                        <Input
                          id="defaultWage"
                          name="defaultWage"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Enter your default hourly rate"
                          defaultValue={profile?.default_wage ?? ""}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label>Time Format</Label>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="12h"
                              name="timeFormat"
                              value="12h"
                              defaultChecked={profile?.time_format === "12h"}
                              className="h-4 w-4"
                            />
                            <Label htmlFor="12h" className="font-normal">
                              12-hour (1:00 PM)
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="24h"
                              name="timeFormat"
                              value="24h"
                              defaultChecked={profile?.time_format === "24h"}
                              className="h-4 w-4"
                            />
                            <Label htmlFor="24h" className="font-normal">
                              24-hour (13:00)
                            </Label>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="workWeek">Typical Work Week</Label>
                        <Select
                          name="workWeek"
                          defaultValue={profile?.work_week ?? ""}
                        >
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
                            <SelectItem value="custom">
                              Custom/Flexible
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="currency">Preferred Currency</Label>
                        <Select
                          name="currency"
                          defaultValue={profile?.currency ?? ""}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gbp">
                              British Pound (£)
                            </SelectItem>
                            <SelectItem value="usd">US Dollar ($)</SelectItem>
                            <SelectItem value="eur">Euro (€)</SelectItem>
                            <SelectItem value="inr">Indian Rupee (₹)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <Button type="submit" className="mt-4">
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Manage your email notifications and reminders.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form action={updateNotificationSettings}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Monthly Summary Email</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive a monthly summary of your work hours and
                          earnings
                        </p>
                      </div>
                      <Switch
                        name="monthlyEmail"
                        defaultChecked={profile?.monthly_email ?? false}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Weekly Report</Label>
                        <p className="text-sm text-muted-foreground">
                          Get weekly insights about your work patterns
                        </p>
                      </div>
                      <Switch
                        name="weeklyEmail"
                        defaultChecked={profile?.weekly_email ?? false}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Reminder Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive reminders to log your work hours
                        </p>
                      </div>
                      <Switch
                        name="reminders"
                        defaultChecked={profile?.reminders ?? false}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="mt-4">
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Calendar Integration</CardTitle>
                <CardDescription>
                  Sync your work hours with your favorite calendar app
                </CardDescription>
              </CardHeader>
              <CalendarSettings
                userId={user.id}
                initialToken={profile?.calendar_token ?? null}
              />
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                  Change your password here. After saving, you&apos;ll be logged
                  out.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form action={updatePassword}>
                  <div className="space-y-2">
                    <Label htmlFor="current">Current Password</Label>
                    <Input
                      id="current"
                      name="current"
                      type="password"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new">New Password</Label>
                    <Input id="new" name="new" type="password" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm">Confirm New Password</Label>
                    <Input
                      id="confirm"
                      name="confirm"
                      type="password"
                      required
                    />
                  </div>
                  <Button type="submit" className="mt-4">
                    Change Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Account;
