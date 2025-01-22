"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Database } from "@/lib/database.types";
import { calculateHoursWorked, cn } from "@/lib/utils";
import { User } from "@supabase/supabase-js";
import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import {
  CalendarIcon,
  Clock,
  DollarSign,
  Download,
  EuroIcon,
  PoundSterling,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type WorkLog = Database["public"]["Tables"]["work_logs"]["Row"];

interface ReportsClientProps {
  user: User;
  userProfile: {
    default_wage: number | null;
    time_format: "12h" | "24h" | null;
    currency: string | null;
  } | null;
  initialLogs: WorkLog[] | null;
}

interface DailyData {
  date: string;
  hours: number;
  earnings: number;
}

const ReportsClient = ({ userProfile, initialLogs }: ReportsClientProps) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(subMonths(new Date(), 1)),
    to: endOfMonth(new Date()),
  });

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

  // Filter logs based on date range
  const filteredLogs = initialLogs?.filter((log) => {
    const logDate = new Date(log.date!);
    return (
      dateRange?.from &&
      dateRange?.to &&
      logDate >= dateRange.from &&
      logDate <= dateRange.to
    );
  });

  // Calculate total hours and earnings
  const totalHours = filteredLogs?.reduce((total, log) => {
    return total + calculateHoursWorked(log.start_time!, log.end_time!);
  }, 0);

  const totalEarnings = filteredLogs?.reduce((total, log) => {
    const rate = log.default_rate ? userProfile?.default_wage : log.custom_rate;
    return (
      total + calculateHoursWorked(log.start_time!, log.end_time!) * (rate ?? 0)
    );
  }, 0);

  // Calculate projected earnings
  const daysInCurrentPeriod = filteredLogs?.length || 1;
  const averageDailyEarnings = (totalEarnings || 0) / daysInCurrentPeriod;

  const projectedMonthlyEarnings = averageDailyEarnings * 21; // Assuming 21 working days per month
  const projectedYearlyEarnings = projectedMonthlyEarnings * 12;

  // Prepare data for charts
  const dailyData = filteredLogs?.reduce((acc: DailyData[], log) => {
    const date = format(new Date(log.date!), "MMM d");
    const hours = calculateHoursWorked(log.start_time!, log.end_time!);
    const rate = log.default_rate ? userProfile?.default_wage : log.custom_rate;
    const earnings = hours * (rate ?? 0);

    const existingDay = acc.find((d) => d.date === date);
    if (existingDay) {
      existingDay.hours += hours;
      existingDay.earnings += earnings;
    } else {
      acc.push({ date, hours, earnings });
    }
    return acc;
  }, []);

  // Export data to CSV
  const exportToCSV = () => {
    if (!filteredLogs) return;

    const headers = [
      "Date",
      "Start Time",
      "End Time",
      "Hours Worked",
      "Rate",
      "Earnings",
      "Notes",
    ];

    const rows = filteredLogs.map((log) => {
      const hours = calculateHoursWorked(log.start_time!, log.end_time!);
      const rate = log.default_rate
        ? userProfile?.default_wage
        : log.custom_rate;
      const earnings = hours * (rate ?? 0);

      return [
        format(new Date(log.date!), "yyyy-MM-dd"),
        log.start_time,
        log.end_time,
        hours.toFixed(2),
        `${currencySymbol}${rate?.toFixed(2)}`,
        `${currencySymbol}${earnings.toFixed(2)}`,
        log.notes || "",
      ];
    });

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute(
      "download",
      `work-report-${format(dateRange?.from ?? new Date(), "yyyy-MM-dd")}-to-${format(
        dateRange?.to ?? new Date(),
        "yyyy-MM-dd",
      )}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 space-y-4 pb-8 pt-6">
      <div className="container flex flex-col gap-4 space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal sm:w-[300px]",
                  !dateRange && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {dateRange.to ? format(dateRange.to, "LLL dd, y") : null}
                  </>
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(newDateRange) => {
                  if (newDateRange?.from) {
                    if (!newDateRange.to && dateRange?.to) {
                      setDateRange({
                        from: newDateRange.from,
                        to: dateRange.to,
                      });
                    } else {
                      setDateRange(newDateRange);
                    }
                  } else {
                    setDateRange(undefined);
                  }
                }}
                numberOfMonths={1}
                disabled={(date) =>
                  date > new Date() || date < new Date("2000-01-01")
                }
              />
            </PopoverContent>
          </Popover>
          <Button onClick={exportToCSV} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="container space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalHours?.toFixed(1) ?? 0}h
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Earnings
              </CardTitle>
              <CurrencyIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currencySymbol}
                {totalEarnings?.toFixed(2) ?? 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Daily Hours
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(totalHours! / (dailyData?.length || 1)).toFixed(1)}h
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Daily Earnings
              </CardTitle>
              <CurrencyIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currencySymbol}
                {(totalEarnings! / (dailyData?.length || 1)).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Projected Monthly
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currencySymbol}
                {projectedMonthlyEarnings.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Based on current pace (21 working days)
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Projected Yearly
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currencySymbol}
                {projectedYearlyEarnings.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Based on current pace (252 working days)
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Hours by Day</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData}>
                    <XAxis
                      dataKey="date"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value: number) => `${value}h`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.5rem",
                      }}
                      labelStyle={{
                        color: "hsl(var(--popover-foreground))",
                      }}
                      itemStyle={{
                        color: "hsl(var(--popover-foreground))",
                      }}
                    />
                    <Bar
                      dataKey="hours"
                      fill="currentColor"
                      radius={[6, 6, 0, 0]}
                      className="fill-primary"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Earnings by Day</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData}>
                    <XAxis
                      dataKey="date"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value: number) =>
                        `${currencySymbol}${value.toFixed(0)}`
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.5rem",
                      }}
                      labelStyle={{
                        color: "hsl(var(--popover-foreground))",
                      }}
                      itemStyle={{
                        color: "hsl(var(--popover-foreground))",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="earnings"
                      strokeWidth={2}
                      className="stroke-primary"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReportsClient;
