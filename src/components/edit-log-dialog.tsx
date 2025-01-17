"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

interface EditLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: any; // Replace with proper type
}

const EditLogDialog = ({ open, onOpenChange, log }: EditLogDialogProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date(log.date));
  const [useDefaultWage, setUseDefaultWage] = useState(true);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Add submission logic here
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Work Log</DialogTitle>
          <DialogDescription>
            Update the details of your work session.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                step="300"
                defaultValue={log.startTime}
                className="col-span-1"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                step="300"
                defaultValue={log.endTime}
                className="col-span-1"
              />
            </div>
          </div>
          <div className="grid gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="defaultWage"
                checked={useDefaultWage}
                onCheckedChange={(checked) =>
                  setUseDefaultWage(checked as boolean)
                }
              />
              <Label htmlFor="defaultWage" className="font-normal">
                Use Default Wage
              </Label>
            </div>
            {!useDefaultWage && (
              <div className="grid gap-2">
                <Label htmlFor="rate">Custom Hourly Rate (£)</Label>
                <Input
                  id="rate"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={log.rate}
                  placeholder="Enter custom hourly rate"
                />
              </div>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              defaultValue={log.notes}
              placeholder="Add any notes about this work session"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditLogDialog;
