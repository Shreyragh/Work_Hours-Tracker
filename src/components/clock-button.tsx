"use client";

import { Button } from "@/components/ui/button";
import { clockIn, clockOut, getCurrentClockStatus } from "@/actions/clock";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ClockButtonProps {
  onClockChange?: () => void;
  isClocked?: boolean;
}

export function ClockButton({ onClockChange, isClocked }: ClockButtonProps) {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Update local state when prop changes
  useEffect(() => {
    if (isClocked !== undefined) {
      setIsClockedIn(isClocked);
    }
  }, [isClocked]);

  // Only fetch initial state if isClocked prop is not provided
  useEffect(() => {
    if (isClocked === undefined) {
      getCurrentClockStatus().then((status) => {
        setIsClockedIn(!!status.clockInTime);
      });
    }
  }, [isClocked]);

  const handleClockIn = async () => {
    setIsLoading(true);
    try {
      await clockIn();
      const status = await getCurrentClockStatus();
      setIsClockedIn(status.isClockedIn);
      onClockChange?.();
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleClockOut = async () => {
    setIsLoading(true);
    try {
      await clockOut();
      setIsClockedIn(false);
      onClockChange?.();
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      className="w-full sm:w-auto"
      variant={isClockedIn ? "destructive" : "default"}
      onClick={isClockedIn ? handleClockOut : handleClockIn}
      disabled={isLoading}
    >
      {isLoading ? "Loading..." : isClockedIn ? "Clock Out" : "Clock In"}
    </Button>
  );
}
