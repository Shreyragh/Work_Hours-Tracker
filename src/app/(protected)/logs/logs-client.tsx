"use client";

import { LogHoursButton } from "@/components/log-hours-button";
import { columns } from "@/components/logs-columns";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Database } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { DollarSign, Filter, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type WorkLog = Database["public"]["Tables"]["work_logs"]["Row"];

interface FiltersState {
  status: "all" | "paid" | "unpaid";
  rateType: "all" | "default" | "custom";
  startTime: string;
  endTime: string;
}

interface LogsClientProps {
  user: User;
  userProfile: {
    default_wage: number | null;
    time_format: "12h" | "24h" | null;
    currency: string | null;
  } | null;
  initialLogs: Database["public"]["Tables"]["work_logs"]["Row"][] | null;
}

export default function LogsClient({
  user,
  userProfile,
  initialLogs,
}: LogsClientProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<WorkLog[] | null>(
    initialLogs as WorkLog[] | null,
  );
  const [filters, setFilters] = useState<FiltersState>({
    status: "all",
    rateType: "all",
    startTime: "",
    endTime: "",
  });

  const currencySymbol =
    userProfile?.currency === "usd"
      ? "$"
      : userProfile?.currency === "eur"
        ? "€"
        : "£";

  const fetchLogs = useCallback(async () => {
    const supabase = createClient();
    const query = supabase
      .from("work_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error(error);
    } else {
      setFilteredLogs(data);
    }
  }, [user.id]);

  const handleSelectLog = useCallback((id: string, checked: boolean) => {
    setSelectedRows((prev) =>
      checked ? [...prev, id] : prev.filter((rowId) => rowId !== id),
    );
  }, []);

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked && filteredLogs) {
        setSelectedRows(filteredLogs.map((log) => log.id.toString()));
      } else {
        setSelectedRows([]);
      }
    },
    [filteredLogs],
  );

  const handleDeleteSelected = async () => {
    const supabase = createClient();
    const { error } = await supabase
      .from("work_logs")
      .delete()
      .in("id", selectedRows.map(Number))
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
      setSelectedRows([]);
      fetchLogs();
    }
  };

  const handleMarkAsPaid = async () => {
    const supabase = createClient();
    const { error } = await supabase
      .from("work_logs")
      .update({ paid: true })
      .in("id", selectedRows.map(Number))
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
      setSelectedRows([]);
      fetchLogs();
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="flex-1 space-y-4 pb-8 pt-6">
      <div className="container flex flex-col gap-4 space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Work Logs</h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full border-dashed sm:w-auto"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[calc(100vw-2rem)] sm:w-80"
              align="end"
            >
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Status</h4>
                  <Select
                    value={filters.status}
                    onValueChange={(value: "all" | "paid" | "unpaid") =>
                      setFilters((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Rate Type</h4>
                  <Select
                    value={filters.rateType}
                    onValueChange={(value: "all" | "default" | "custom") =>
                      setFilters((prev) => ({ ...prev, rateType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select rate type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="default">Default Rate</SelectItem>
                      <SelectItem value="custom">Custom Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Start Time After</h4>
                  <input
                    type="time"
                    value={filters.startTime}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        startTime: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-1"
                  />
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">End Time Before</h4>
                  <input
                    type="time"
                    value={filters.endTime}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        endTime: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-1"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <LogHoursButton
            defaultHourlyRate={userProfile?.default_wage}
            timeFormat={userProfile?.time_format ?? "12h"}
            currencySymbol={currencySymbol}
          />
        </div>
      </div>

      <div className="container">
        <DataTable
          columns={columns(
            userProfile,
            currencySymbol,
            selectedRows,
            handleSelectLog,
            handleSelectAll,
          )}
          data={filteredLogs ?? []}
        />
        {selectedRows.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected ({selectedRows.length})
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleMarkAsPaid}
              className="gap-2"
            >
              <DollarSign className="h-4 w-4" />
              Mark as Paid ({selectedRows.length})
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
