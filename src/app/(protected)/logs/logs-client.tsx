"use client";

import { LogHoursButton } from "@/components/log-hours-button";
import LogsTableActions from "@/components/logs-table-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Database } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";
import { calculateHoursWorked, formatTimeString } from "@/lib/utils";
import { User } from "@supabase/supabase-js";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { useEffect, useState, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2, DollarSign } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type WorkLog = Database["public"]["Tables"]["work_logs"]["Row"];

interface FiltersState {
  search: string;
  month: Date | undefined;
  hoursRange: string;
  startTime: string;
  endTime: string;
  rateType: string;
}

interface LogsClientProps {
  user: User;
  userProfile: {
    default_wage: number | null;
    time_format: "12h" | "24h" | null;
    currency: string | null;
  } | null;
  initialLogs: WorkLog[] | null;
}

const LogsClient = ({ user, userProfile, initialLogs }: LogsClientProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [filters, setFilters] = useState<FiltersState>({
    search: "",
    month: undefined,
    hoursRange: "",
    startTime: "",
    endTime: "",
    rateType: "",
  });

  const [logs, setLogs] = useState<WorkLog[] | null>(initialLogs);
  const [selectedLogs, setSelectedLogs] = useState<number[]>([]);

  const currencySymbol =
    userProfile?.currency === "usd"
      ? "$"
      : userProfile?.currency === "eur"
        ? "€"
        : "£";

  const fetchLogs = useCallback(async () => {
    const supabase = createClient();
    let query = supabase
      .from("work_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    // Apply search filter
    if (filters.search) {
      query = query.ilike("notes", `%${filters.search}%`);
    }

    // Apply month filter
    if (filters.month) {
      const start = startOfMonth(filters.month);
      const end = endOfMonth(filters.month);
      query = query
        .gte("date", start.toISOString())
        .lte("date", end.toISOString());
    }

    // Apply hours range filter
    if (filters.hoursRange) {
      const [min, max] = filters.hoursRange.split("-").map(Number);
      if (max) {
        query = query.gte("hours_worked", min).lte("hours_worked", max);
      } else {
        query = query.gte("hours_worked", min);
      }
    }

    // Apply start time filter
    if (filters.startTime) {
      const timeMap: { [key: string]: string } = {
        "early-morning-1": "00:00", // Before 6 AM
        "early-morning-2": "06:00", // 6 AM - 7 AM
        "early-morning-3": "07:00", // 7 AM - 8 AM
        "morning-1": "08:00", // 8 AM - 9 AM
        "morning-2": "09:00", // 9 AM - 10 AM
        "morning-3": "10:00", // 10 AM - 11 AM
        "morning-4": "11:00", // 11 AM - 12 PM
        "afternoon-1": "12:00", // 12 PM - 1 PM
        "afternoon-2": "13:00", // 1 PM - 2 PM
        "afternoon-3": "14:00", // 2 PM - 3 PM
        "afternoon-4": "15:00", // 3 PM - 4 PM
        "evening-1": "16:00", // 4 PM - 5 PM
        "evening-2": "17:00", // 5 PM - 6 PM
        "evening-3": "18:00", // After 6 PM
      };

      const nextTimeMap: { [key: string]: string } = {
        "early-morning-1": "06:00", // Before 6 AM
        "early-morning-2": "07:00", // 6 AM - 7 AM
        "early-morning-3": "08:00", // 7 AM - 8 AM
        "morning-1": "09:00", // 8 AM - 9 AM
        "morning-2": "10:00", // 9 AM - 10 AM
        "morning-3": "11:00", // 10 AM - 11 AM
        "morning-4": "12:00", // 11 AM - 12 PM
        "afternoon-1": "13:00", // 12 PM - 1 PM
        "afternoon-2": "14:00", // 1 PM - 2 PM
        "afternoon-3": "15:00", // 2 PM - 3 PM
        "afternoon-4": "16:00", // 3 PM - 4 PM
        "evening-1": "17:00", // 4 PM - 5 PM
        "evening-2": "18:00", // 5 PM - 6 PM
        "evening-3": "23:59", // After 6 PM
      };

      if (filters.startTime === "early-morning-1") {
        // Before 6 AM
        query = query.lt("start_time", nextTimeMap[filters.startTime]);
      } else if (filters.startTime === "evening-3") {
        // After 6 PM
        query = query.gte("start_time", timeMap[filters.startTime]);
      } else {
        // Between times
        query = query
          .gte("start_time", timeMap[filters.startTime])
          .lt("start_time", nextTimeMap[filters.startTime]);
      }
    }

    // Apply end time filter
    if (filters.endTime) {
      const timeMap: { [key: string]: string } = {
        "morning-1": "00:00", // Before 10 AM
        "morning-2": "10:00", // 10 AM - 11 AM
        "morning-3": "11:00", // 11 AM - 12 PM
        "afternoon-1": "12:00", // 12 PM - 1 PM
        "afternoon-2": "13:00", // 1 PM - 2 PM
        "afternoon-3": "14:00", // 2 PM - 3 PM
        "afternoon-4": "15:00", // 3 PM - 4 PM
        "evening-1": "16:00", // 4 PM - 5 PM
        "evening-2": "17:00", // 5 PM - 6 PM
        "evening-3": "18:00", // 6 PM - 7 PM
        "evening-4": "19:00", // 7 PM - 8 PM
        "late-evening-1": "20:00", // 8 PM - 9 PM
        "late-evening-2": "21:00", // 9 PM - 10 PM
        "late-evening-3": "22:00", // After 10 PM
      };

      const nextTimeMap: { [key: string]: string } = {
        "morning-1": "10:00", // Before 10 AM
        "morning-2": "11:00", // 10 AM - 11 AM
        "morning-3": "12:00", // 11 AM - 12 PM
        "afternoon-1": "13:00", // 12 PM - 1 PM
        "afternoon-2": "14:00", // 1 PM - 2 PM
        "afternoon-3": "15:00", // 2 PM - 3 PM
        "afternoon-4": "16:00", // 3 PM - 4 PM
        "evening-1": "17:00", // 4 PM - 5 PM
        "evening-2": "18:00", // 5 PM - 6 PM
        "evening-3": "19:00", // 6 PM - 7 PM
        "evening-4": "20:00", // 7 PM - 8 PM
        "late-evening-1": "21:00", // 8 PM - 9 PM
        "late-evening-2": "22:00", // 9 PM - 10 PM
        "late-evening-3": "23:59", // After 10 PM
      };

      if (filters.endTime === "morning-1") {
        // Before 10 AM
        query = query.lt("end_time", nextTimeMap[filters.endTime]);
      } else if (filters.endTime === "late-evening-3") {
        // After 10 PM
        query = query.gte("end_time", timeMap[filters.endTime]);
      } else {
        // Between times
        query = query
          .gte("end_time", timeMap[filters.endTime])
          .lt("end_time", nextTimeMap[filters.endTime]);
      }
    }

    // Apply rate type filter
    if (filters.rateType) {
      query = query.eq("default_rate", filters.rateType === "default");
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
    } else {
      setLogs(data);
    }
  }, [filters, user.id]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLogs(logs?.map((log) => log.id) ?? []);
    } else {
      setSelectedLogs([]);
    }
  };

  const handleSelectLog = (logId: number, checked: boolean) => {
    if (checked) {
      setSelectedLogs((prev) => [...prev, logId]);
    } else {
      setSelectedLogs((prev) => prev.filter((id) => id !== logId));
    }
  };

  const handleDeleteSelected = async () => {
    const supabase = createClient();
    const { error } = await supabase
      .from("work_logs")
      .delete()
      .in("id", selectedLogs)
      .eq("user_id", user.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete selected logs",
      });
      console.error(error);
    } else {
      toast({
        description: "Successfully deleted selected logs",
      });
      setSelectedLogs([]);
      fetchLogs();
    }
  };

  const handleMarkAsPaid = async () => {
    const supabase = createClient();
    const { error } = await supabase
      .from("work_logs")
      .update({ paid: true })
      .in("id", selectedLogs)
      .eq("user_id", user.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark logs as paid",
      });
      console.error(error);
    } else {
      toast({
        description: "Successfully marked logs as paid",
      });
      setSelectedLogs([]);
      fetchLogs();
    }
  };

  // Fetch logs when filters change
  useEffect(() => {
    fetchLogs();
  }, [filters, fetchLogs]);

  return (
    <div className="flex-1 space-y-4 pb-8 pt-6">
      <div className="container flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Work Logs</h2>
        <div className="flex items-center gap-2">
          {selectedLogs.length > 0 && (
            <>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected ({selectedLogs.length})
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleMarkAsPaid}
                className="gap-2"
              >
                <DollarSign className="h-4 w-4" />
                Mark as Paid ({selectedLogs.length})
              </Button>
            </>
          )}
          <LogHoursButton
            defaultHourlyRate={userProfile?.default_wage}
            timeFormat={userProfile?.time_format ?? "12h"}
            currencySymbol={currencySymbol}
          />
        </div>
      </div>

      <div className="container space-y-4">
        {/* Data Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={
                      selectedLogs.length === (logs?.length ?? 0) &&
                      logs!.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-nowrap">Start Time</TableHead>
                <TableHead className="text-nowrap">End Time</TableHead>
                <TableHead className="text-nowrap">Hours Worked</TableHead>
                <TableHead className="text-nowrap">
                  Rate ({currencySymbol})
                </TableHead>
                <TableHead className="text-nowrap">
                  Earnings ({currencySymbol})
                </TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-nowrap">Status</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs?.map((log) => {
                const rate = log.default_rate
                  ? userProfile?.default_wage
                  : log.custom_rate;
                return (
                  <TableRow
                    key={log.id}
                    className={log.paid ? "bg-muted/50" : undefined}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedLogs.includes(log.id)}
                        onCheckedChange={(checked) =>
                          handleSelectLog(log.id, !!checked)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-nowrap">
                      {format(new Date(log.date!), "PPP")}
                    </TableCell>
                    <TableCell className="text-nowrap">
                      {formatTimeString(
                        log.start_time!,
                        userProfile?.time_format ?? "12h",
                      )}
                    </TableCell>
                    <TableCell className="text-nowrap">
                      {formatTimeString(
                        log.end_time!,
                        userProfile?.time_format ?? "12h",
                      )}
                    </TableCell>
                    <TableCell>
                      {calculateHoursWorked(
                        log.start_time!,
                        log.end_time!,
                      ).toFixed(2)}
                      h
                    </TableCell>
                    <TableCell>
                      {currencySymbol}
                      {rate?.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {currencySymbol}
                      {(
                        calculateHoursWorked(log.start_time!, log.end_time!) *
                        (rate ?? 0)
                      ).toFixed(2)}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {log.notes}
                    </TableCell>
                    <TableCell className="text-nowrap">
                      {log.paid ? (
                        <span className="font-bold text-green-600">Paid</span>
                      ) : (
                        <span className="font-bold text-yellow-600">
                          Unpaid
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <LogsTableActions
                        log={log}
                        defaultHourlyRate={userProfile?.default_wage ?? 0}
                        timeFormat={userProfile?.time_format ?? "12h"}
                        currencySymbol={currencySymbol}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default LogsClient;
