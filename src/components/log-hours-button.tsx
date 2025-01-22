"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { calculateHoursWorked, cn, formatTimeString } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { useState } from "react";
import { createWorkLog } from "@/actions/work-logs";
import { useToast } from "@/hooks/use-toast";

interface LogHoursButtonProps {
  defaultHourlyRate?: number | null;
  timeFormat: "12h" | "24h" | string;
  currencySymbol: string;
}

export const LogHoursButton = ({
  defaultHourlyRate,
  timeFormat,
  currencySymbol,
}: LogHoursButtonProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [useDefaultWage, setUseDefaultWage] = useState<boolean>(true);
  const [rate, setRate] = useState<number>(defaultHourlyRate!);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hoursWorked = calculateHoursWorked(startTime + ":00", endTime + ":00");
  const currentRate = useDefaultWage ? defaultHourlyRate : rate;
  const earnings = hoursWorked * currentRate!;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("date", date?.toISOString() ?? new Date().toISOString());
      formData.append("startTime", startTime);
      formData.append("endTime", endTime);
      formData.append("useDefaultWage", useDefaultWage.toString());
      if (!useDefaultWage) {
        formData.append("rate", rate.toString());
      }
      formData.append("notes", (e.target as HTMLFormElement).notes.value);

      const result = await createWorkLog(formData);

      if (result.success) {
        toast({
          title: "Success",
          description: "Work log created successfully",
        });
        setOpen(false);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: "Failed to create work log",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Log Hours
        </Button>
      </DialogTrigger>
      <DialogContent className="flex h-full flex-col p-0 sm:h-auto sm:max-w-[425px]">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Log Hours</DialogTitle>
          <DialogDescription>
            Log your work hours and earnings. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6">
          {/* Summary Card */}
          <Card className="border-none bg-muted p-4">
            <CardContent className="grid gap-2 p-0 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hours Worked:</span>
                <span className="font-medium">{hoursWorked.toFixed(2)}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate:</span>
                <span className="font-medium">
                  {currencySymbol}
                  {currentRate?.toFixed(2)}/h
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Total Earnings:</span>
                <span className="font-medium">
                  {currencySymbol}
                  {earnings?.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} id="work-log-form" className="grid gap-4 py-4">
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
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                {formatTimeString(startTime + ":00", timeFormat as "12h" | "24h")}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                {formatTimeString(endTime + ":00", timeFormat as "12h" | "24h")}
              </p>
            </div>
            <div className="grid gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="defaultWage"
                  checked={useDefaultWage}
                  onCheckedChange={(checked) => {
                    setUseDefaultWage(checked as boolean);
                    if (checked) {
                      setRate(defaultHourlyRate!);
                    }
                  }}
                />
                <Label htmlFor="defaultWage" className="font-normal">
                  Use My Default Wage
                </Label>
              </div>
              {!useDefaultWage && (
                <div className="grid gap-2">
                  <Label htmlFor="rate">
                    Custom Hourly Rate ({currencySymbol})
                  </Label>
                  <Input
                    id="rate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={rate}
                    onChange={(e) => setRate(parseFloat(e.target.value))}
                    placeholder="Enter custom hourly rate"
                  />
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                name="notes"
                placeholder="Add any notes about this work session"
              />
            </div>
          </form>
        </div>

        <div className="flex flex-col gap-4 border-t bg-background p-6 pt-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            form="work-log-form"
            type="submit" 
            className="w-full sm:w-auto" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
