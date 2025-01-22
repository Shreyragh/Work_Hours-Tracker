"use client";

import { Button } from "@/components/ui/button";
import { clockIn, clockOut, getCurrentClockStatus } from "@/actions/clock";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export function ClockButton() {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [duration, setDuration] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    getCurrentClockStatus().then((status) => {
      setIsClockedIn(status.isClockedIn);
      setClockInTime(status.clockInTime || null);
    });
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isClockedIn && clockInTime) {
      const updateDuration = () => {
        setDuration(
          formatDistanceToNow(new Date(clockInTime), { addSuffix: false }),
        );
      };
      updateDuration();
      interval = setInterval(updateDuration, 60000); // Update every minute
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isClockedIn, clockInTime]);

  const handleClockIn = async () => {
    try {
      await clockIn();
      const status = await getCurrentClockStatus();
      setIsClockedIn(status.isClockedIn);
      setClockInTime(status.clockInTime || null);
      toast({
        title: "Clocked In",
        description: "You have successfully clocked in.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to clock in",
        variant: "destructive",
      });
    }
  };

  const handleClockOut = async () => {
    try {
      await clockOut();
      setIsClockedIn(false);
      setClockInTime(null);
      toast({
        title: "Clocked Out",
        description: "You have successfully clocked out and work log saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to clock out",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        size="lg"
        variant={isClockedIn ? "destructive" : "default"}
        onClick={isClockedIn ? handleClockOut : handleClockIn}
      >
        {isClockedIn ? "Clock Out" : "Clock In"}
      </Button>
      {isClockedIn && duration && (
        <p className="text-sm text-muted-foreground">
          Time elapsed: {duration}
        </p>
      )}
    </div>
  );
}
