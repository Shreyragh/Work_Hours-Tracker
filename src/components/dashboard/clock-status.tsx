"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCurrentClockStatus } from "@/actions/clock";
import { ClockButton } from "../clock-button";

export function ClockStatus() {
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const fetchUserProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchAndSetClockStatus = async () => {
      try {
        const status = await getCurrentClockStatus();
        setClockInTime(status.clockInTime || null);
      } catch (error) {
        console.error("Error fetching clock status:", error);
      }
    };

    fetchAndSetClockStatus();
  }, []);

  // Set up real-time subscription for clock status changes
  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    // Create a channel with a unique name
    const channel = supabase.channel(`clock_sessions_${userId}`);

    // Set up the subscription
    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "clock_sessions",
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          const status = await getCurrentClockStatus();
          setClockInTime(status.clockInTime || null);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "clock_sessions",
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          const status = await getCurrentClockStatus();
          setClockInTime(status.clockInTime || null);
        },
      )
      .subscribe();

    // For debugging
    console.log(
      "Dashboard: Subscribed to clock_sessions changes for user:",
      userId,
    );

    // Cleanup function
    return () => {
      console.log("Dashboard: Cleaning up subscription");
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <ClockButton
      isClocked={!!clockInTime}
      onClockChange={() =>
        getCurrentClockStatus().then((status) =>
          setClockInTime(status.clockInTime || null),
        )
      }
    />
  );
}
