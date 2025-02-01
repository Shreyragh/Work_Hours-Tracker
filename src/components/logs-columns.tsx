"use client";

import LogsTableActions from "@/components/logs-table-actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { calculateHoursWorked, formatTimeString } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowUpDown } from "lucide-react";
import { Database } from "@/types/database.types";

type WorkLog = Database["public"]["Tables"]["work_logs"]["Row"];

export const columns = (
  userProfile: {
    default_wage: number | null;
    time_format: "12h" | "24h" | null;
    currency: string | null;
  } | null,
  currencySymbol: string,
  selectedRows: string[],
  handleSelectLog: (id: string, checked: boolean) => void,
  handleSelectAll: (checked: boolean) => void,
): ColumnDef<WorkLog>[] => {
  const getCurrencySymbol = (currency: string | null) => {
    switch (currency?.toLowerCase()) {
      case "usd":
        return "$";
      case "eur":
        return "€";
      case "gbp":
        return "£";
      default:
        return "£";
    }
  };

  const symbol = getCurrencySymbol(userProfile?.currency ?? null);

  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            selectedRows.length === table.getFilteredRowModel().rows.length
          }
          onCheckedChange={(checked) => handleSelectAll(!!checked)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedRows.includes(String(row.original.id))}
          onCheckedChange={(checked) =>
            handleSelectLog(String(row.original.id), !!checked)
          }
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-nowrap">
          {format(
            row.original.date ? new Date(row.original.date) : new Date(),
            "EEE do MMM, yyyy",
          )}
        </div>
      ),
    },
    {
      accessorKey: "start_time",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Start Time
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-nowrap">
          {row.original.start_time
            ? formatTimeString(
                row.original.start_time,
                userProfile?.time_format ?? "12h",
              )
            : "-"}
        </div>
      ),
    },
    {
      accessorKey: "end_time",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            End Time
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-nowrap">
          {row.original.end_time
            ? formatTimeString(
                row.original.end_time,
                userProfile?.time_format ?? "12h",
              )
            : "-"}
        </div>
      ),
    },
    {
      id: "hours_worked",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Hours Worked
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const hours = calculateHoursWorked(
          row.original.start_time!,
          row.original.end_time!,
        );
        return <div className="text-nowrap">{hours.toFixed(2)}h</div>;
      },
      accessorFn: (row) => {
        if (!row.start_time || !row.end_time) return null;
        return calculateHoursWorked(row.start_time, row.end_time);
      },
    },
    {
      id: "rate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Rate {symbol}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const rate = row.original.default_rate
          ? userProfile?.default_wage
          : row.original.custom_rate;
        return (
          <div className="text-nowrap">
            {symbol}
            {rate?.toFixed(2)}
          </div>
        );
      },
      accessorFn: (row) => {
        const rate = row.default_rate
          ? (userProfile?.default_wage ?? 0)
          : (row.custom_rate ?? 0);
        return rate;
      },
    },
    {
      id: "earnings",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Earnings {symbol}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const rate = row.original.default_rate
          ? userProfile?.default_wage
          : row.original.custom_rate;
        const earnings =
          (row.original.start_time && row.original.end_time
            ? calculateHoursWorked(
                row.original.start_time,
                row.original.end_time,
              )
            : 0) * (rate ?? 0);
        return (
          <div className="text-nowrap">
            {symbol}
            {earnings.toFixed(2)}
          </div>
        );
      },
      accessorFn: (row) => {
        if (!row.start_time || !row.end_time) return null;
        const rate = row.default_rate
          ? (userProfile?.default_wage ?? 0)
          : (row.custom_rate ?? 0);
        return calculateHoursWorked(row.start_time, row.end_time) * rate;
      },
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate">{row.original.notes}</div>
      ),
    },
    {
      accessorKey: "paid",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-nowrap">
          {row.original.paid ? (
            <span className="font-bold text-green-600">Paid</span>
          ) : (
            <span className="font-bold text-yellow-600">Unpaid</span>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <LogsTableActions
          log={row.original}
          defaultHourlyRate={userProfile?.default_wage ?? 0}
          timeFormat={userProfile?.time_format ?? "12h"}
          currencySymbol={symbol}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
};
