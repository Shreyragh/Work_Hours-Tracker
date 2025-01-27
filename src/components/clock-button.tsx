"use client";

import { Button } from "@/components/ui/button";
import { clockIn, clockOut, getCurrentClockStatus } from "@/actions/clock";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function ClockButton() {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    getCurrentClockStatus().then((status) => {
      setIsClockedIn(status.isClockedIn);
    });
  }, []);

  const handleClockIn = async () => {
    try {
      await clockIn();
      const status = await getCurrentClockStatus();
      setIsClockedIn(status.isClockedIn);
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
    <Button
      className="w-full sm:w-auto"
      variant={isClockedIn ? "destructive" : "default"}
      onClick={isClockedIn ? handleClockOut : handleClockIn}
    >
      {isClockedIn ? "Clock Out" : "Clock In"}
    </Button>
  );
}
