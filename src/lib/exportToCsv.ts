import { calculateHoursWorked } from "@/lib/utils";
import { format } from "date-fns";
import { Database } from "./database.types";
import { DateRange } from "react-day-picker";

type WorkLog = Database["public"]["Tables"]["work_logs"]["Row"];
type UserProfile = {
  default_wage: number | null;
  time_format: "12h" | "24h" | null;
  currency: string | null;
} | null;

// Export data to CSV
export const exportToCSV = (
  filteredLogs: WorkLog[] | undefined,
  userProfile: UserProfile | null,
  currencySymbol: string,
  dateRange: DateRange | undefined,
) => {
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
    const rate = log.default_rate ? userProfile?.default_wage : log.custom_rate;
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
