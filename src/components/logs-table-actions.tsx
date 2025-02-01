"use client";

import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import EditLogDialog from "./edit-log-dialog";
import DeleteLogDialog from "./delete-log-dialog";
import { format } from "date-fns";
import { Database } from "@/types/database.types";

type WorkLog = Database["public"]["Tables"]["work_logs"]["Row"];

interface LogsTableActionsProps {
  log: WorkLog;
  defaultHourlyRate: number;
  timeFormat: "12h" | "24h";
  currencySymbol: string;
}

const LogsTableActions = ({
  log,
  defaultHourlyRate,
  timeFormat,
  currencySymbol,
}: LogsTableActionsProps) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <div className="flex gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setEditDialogOpen(true)}
        className="h-8 w-8"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setDeleteDialogOpen(true)}
        className="h-8 w-8 text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <EditLogDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        log={log}
        defaultHourlyRate={defaultHourlyRate}
        timeFormat={timeFormat}
        currencySymbol={currencySymbol}
      />
      <DeleteLogDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        logId={Number(log.id)}
        date={format(new Date(log.date!), "PPP")}
      />
    </div>
  );
};

export default LogsTableActions;
