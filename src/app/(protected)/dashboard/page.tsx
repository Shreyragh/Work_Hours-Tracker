import { LogHoursButton } from "@/components/log-hours-button";
import { ClockStatus } from "@/components/dashboard/clock-status";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Database } from "@/types/database.types";
import { createClient } from "@/lib/supabase/server";
import { calculateHoursWorked, formatTimeString } from "@/lib/utils";
import {
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subMonths,
  addMonths,
  subWeeks,
} from "date-fns";
import {
  CalendarDays,
  Clock,
  DollarSign,
  EuroIcon,
  LineChart,
  PoundSterling,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

type WorkLog = Database["public"]["Tables"]["work_logs"]["Row"];

export const revalidate = 3600;

const Dashboard = async ({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) return redirect("/login");

  if (!data.user.user_metadata?.onboarding_completed)
    return redirect("/account/onboarding");

  const { data: default_hourly_rate } = await supabase
    .from("user_profiles")
    .select("default_wage")
    .eq("user_id", data.user.id)
    .single();

  // Handle month navigation
  const today = new Date();
  const { month } = await searchParams;
  const selectedMonth = month ? new Date(month) : today;
  const prevMonth = format(subMonths(selectedMonth, 1), "yyyy-MM");
  const nextMonth = format(addMonths(selectedMonth, 1), "yyyy-MM");

  // Current week data
  const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const { data: currentWeekLogs } = await supabase
    .from("work_logs")
    .select("*")
    .eq("user_id", data.user.id)
    .gte("date", currentWeekStart.toISOString())
    .lte("date", currentWeekEnd.toISOString())
    .order("date", { ascending: true });

  const lastWeekStart = startOfWeek(subWeeks(new Date(), 1), {
    weekStartsOn: 1,
  });
  const lastWeekEnd = endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });
  const { data: lastWeekLogs } = await supabase
    .from("work_logs")
    .select("*")
    .eq("user_id", data.user.id)
    .gte("date", lastWeekStart.toISOString())
    .lte("date", lastWeekEnd.toISOString());

  // Selected month data
  const selectedMonthStart = startOfMonth(selectedMonth);
  const selectedMonthEnd = endOfMonth(selectedMonth);
  const { data: selectedMonthLogs } = await supabase
    .from("work_logs")
    .select("*")
    .eq("user_id", data.user.id)
    .gte("date", selectedMonthStart.toISOString())
    .lte("date", selectedMonthEnd.toISOString());

  const prevMonthStart = startOfMonth(subMonths(selectedMonth, 1));
  const prevMonthEnd = endOfMonth(subMonths(selectedMonth, 1));
  const { data: prevMonthLogs } = await supabase
    .from("work_logs")
    .select("*")
    .eq("user_id", data.user.id)
    .gte("date", prevMonthStart.toISOString())
    .lte("date", prevMonthEnd.toISOString());

  // Get recent logs for the list
  const { data: recentLogs } = await supabase
    .from("work_logs")
    .select("*")
    .eq("user_id", data.user.id)
    .order("date", { ascending: false })
    .order("start_time", { ascending: false })
    .limit(5);

  const calculateTotalHours = (logs: WorkLog[]) => {
    return (
      logs?.reduce((total, log) => {
        return total + calculateHoursWorked(log.start_time!, log.end_time!);
      }, 0) || 0
    );
  };

  const calculateTotalEarnings = (logs: WorkLog[]) => {
    return (
      logs?.reduce((total, log) => {
        const rate = log.default_rate
          ? default_hourly_rate?.default_wage
          : log.custom_rate;
        return (
          total + calculateHoursWorked(log.start_time!, log.end_time!) * rate!
        );
      }, 0) || 0
    );
  };

  const currentWeekHours = calculateTotalHours(currentWeekLogs || []);
  const lastWeekHours = calculateTotalHours(lastWeekLogs || []);
  const hoursChange = currentWeekHours - lastWeekHours;

  const selectedMonthEarnings = calculateTotalEarnings(selectedMonthLogs || []);
  const prevMonthEarnings = calculateTotalEarnings(prevMonthLogs || []);
  const earningsChange = selectedMonthEarnings - prevMonthEarnings;

  const daysWorkedThisMonth = new Set(selectedMonthLogs?.map((log) => log.date))
    .size;

  const averageDailyHours = daysWorkedThisMonth
    ? calculateTotalHours(selectedMonthLogs || []) / daysWorkedThisMonth
    : 0;

  const prevMonthDaysWorked = new Set(prevMonthLogs?.map((log) => log.date))
    .size;
  const prevMonthAverageDailyHours = prevMonthDaysWorked
    ? calculateTotalHours(prevMonthLogs || []) / prevMonthDaysWorked
    : 0;
  const averageHoursChange = averageDailyHours - prevMonthAverageDailyHours;

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeklyData = weekDays.map((day, index) => {
    const dayLogs =
      currentWeekLogs?.filter((log) => {
        const logDate = new Date(log.date!);
        return logDate.getDay() === (index + 1) % 7;
      }) || [];
    return {
      day,
      hours: calculateTotalHours(dayLogs),
    };
  });

  const maxHours = Math.max(...weeklyData.map((d) => d.hours), 8);

  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("default_wage, time_format, currency")
    .eq("user_id", data.user.id)
    .single();

  // Get all paid and unpaid logs for the selected month
  const { data: paidLogs } = await supabase
    .from("work_logs")
    .select("*")
    .eq("user_id", data.user.id)
    .eq("paid", true)
    .gte("date", selectedMonthStart.toISOString())
    .lte("date", selectedMonthEnd.toISOString());

  const { data: unpaidLogs } = await supabase
    .from("work_logs")
    .select("*")
    .eq("user_id", data.user.id)
    .eq("paid", false)
    .gte("date", selectedMonthStart.toISOString())
    .lte("date", selectedMonthEnd.toISOString());

  const totalPaidEarnings = calculateTotalEarnings(paidLogs || []);
  const totalUnpaidEarnings = calculateTotalEarnings(unpaidLogs || []);
  const percentagePaid =
    totalPaidEarnings + totalUnpaidEarnings > 0
      ? (totalPaidEarnings / (totalPaidEarnings + totalUnpaidEarnings)) * 100
      : 0;

  const currencySymbol =
    userProfile?.currency === "usd"
      ? "$"
      : userProfile?.currency === "eur"
        ? "€"
        : "£";

  const CurrencyIcon =
    userProfile?.currency === "usd"
      ? DollarSign
      : userProfile?.currency === "eur"
        ? EuroIcon
        : PoundSterling;

  return (
    <div className="flex-1 space-y-4 pb-8 pt-6">
      <div className="container flex flex-col gap-4 space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex w-full sm:w-auto">
          <div className="flex items-center gap-4">
            <ClockStatus />
            <LogHoursButton
              defaultHourlyRate={default_hourly_rate?.default_wage}
              timeFormat={userProfile?.time_format ?? "12h"}
              currencySymbol={currencySymbol}
            />
          </div>
        </div>
      </div>

      <div className="container space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Monthly Overview</h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild className="h-8 w-8">
              <a href={`?month=${prevMonth}`}>
                <ChevronLeft className="h-4 w-4" />
              </a>
            </Button>
            <span className="text-sm">
              {format(selectedMonth, "MMMM yyyy")}
            </span>
            <Button variant="outline" size="icon" asChild className="h-8 w-8">
              <a href={`?month=${nextMonth}`}>
                <ChevronRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Month&apos;s Paid Earnings
              </CardTitle>
              <CurrencyIcon className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {currencySymbol}
                {totalPaidEarnings.toFixed(2)}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  {percentagePaid.toFixed(0)}% of total paid
                </p>
                {totalUnpaidEarnings > 0 && (
                  <p className="text-xs text-yellow-500">
                    ({currencySymbol}
                    {totalUnpaidEarnings.toFixed(2)} unpaid)
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                This Month&apos;s Earnings
              </CardTitle>
              <CurrencyIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currencySymbol}
                {selectedMonthEarnings.toFixed(2)}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  {earningsChange >= 0 ? "+" : ""}
                  {currencySymbol}
                  {earningsChange.toFixed(2)} from last month
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Days Worked</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{daysWorkedThisMonth}</div>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-xs text-muted-foreground">This month</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Daily Hours
              </CardTitle>
              <LineChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {averageDailyHours.toFixed(1)}h
              </div>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  {averageHoursChange >= 0 ? "+" : ""}
                  {averageHoursChange.toFixed(1)}h from last month
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Weekly Overview</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Hours This Week
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentWeekHours.toFixed(1)}h
              </div>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  {hoursChange >= 0 ? "+" : ""}
                  {hoursChange.toFixed(1)}h from last week
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Work Logs</CardTitle>
              <CardDescription>Your recent work activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {recentLogs?.map((log) => {
                  const hours = calculateHoursWorked(
                    log.start_time!,
                    log.end_time!,
                  );
                  return (
                    <div key={log.id} className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {format(new Date(log.date!), "EEEE, MMMM d")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatTimeString(
                            log.start_time!,
                            userProfile?.time_format as "12h" | "24h",
                          )}{" "}
                          -{" "}
                          {formatTimeString(
                            log.end_time!,
                            userProfile?.time_format as "12h" | "24h",
                          )}
                        </p>
                      </div>
                      <div className="ml-auto font-medium">
                        {hours.toFixed(1)} hours • {currencySymbol}
                        {(
                          hours *
                          (log.default_rate
                            ? (default_hourly_rate?.default_wage ?? 0)
                            : (log.custom_rate ?? 0))
                        ).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-4 lg:col-span-3">
            <CardHeader>
              <CardTitle>Weekly Overview</CardTitle>
              <CardDescription>Hours worked per day this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {weeklyData.map(({ day, hours }) => (
                  <div key={day} className="flex items-center">
                    <div className="min-w-[4rem] font-medium">{day}</div>
                    <div className="flex flex-1 items-center gap-2">
                      <div
                        className="h-2 bg-primary"
                        style={{
                          width: `${(hours / maxHours) * 100}%`,
                        }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {hours.toFixed(1)}h
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
