"use client";

import { ClockButton } from "./clock-button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useEffect, useState } from "react";
import { getCurrentClockStatus } from "@/actions/clock";
import { format, parseISO } from "date-fns";

export function ClockPage() {
  const [clockInTime, setClockInTime] = useState<string | null>(null);

  useEffect(() => {
    getCurrentClockStatus().then((status) => {
      setClockInTime(status.clockInTime || null);
    });
  }, []);

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Time Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-6 py-8">
            <div className="text-center">
              {clockInTime ? (
                <div className="mb-4 text-lg">
                  <p>Clocked in at</p>
                  <p className="font-mono text-2xl font-bold">
                    {format(parseISO(clockInTime), "h:mm a")}
                  </p>
                </div>
              ) : (
                <p className="mb-4 text-lg text-muted-foreground">
                  You are currently clocked out
                </p>
              )}
            </div>
            <ClockButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
