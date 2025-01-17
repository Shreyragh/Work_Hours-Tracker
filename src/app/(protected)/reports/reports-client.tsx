"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, calculateHoursWorked } from "@/lib/utils";
import { Database } from "@/lib/database.types";
import { User } from "@supabase/supabase-js";
import { useState } from "react";
import {
  CalendarIcon,
  Download,
  Clock,
  DollarSign,
  Users,
  TrendingUp,
} from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  LineChart,
} from "recharts";
import { DateRange } from "react-day-picker";

type WorkLog = Database["public"]["Tables"]["work_logs"]["Row"];

interface ReportsClientProps {
  user: User;
  userProfile: {
    default_wage: number;
    time_format: "12h" | "24h";
    currency: string;
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
    <div className="flex-1 space-y-4 pt-6">
      <div className="container flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
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
                    // If only start date is selected, keep the existing end date
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
                numberOfMonths={2}
                disabled={(date) =>
                  date > new Date() || date < new Date("2000-01-01")
                }
              />
            </PopoverContent>
          </Popover>
          <Button onClick={exportToCSV}>
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
                {totalHours?.toFixed(1)}h
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Earnings
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currencySymbol}
                {totalEarnings?.toFixed(2)}
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
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currencySymbol}
                {(totalEarnings! / (dailyData?.length || 1)).toFixed(2)}
              </div>
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
                    <Tooltip />
                    <Bar
                      dataKey="hours"
                      fill="currentColor"
                      radius={[4, 4, 0, 0]}
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
                    <Tooltip />
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
