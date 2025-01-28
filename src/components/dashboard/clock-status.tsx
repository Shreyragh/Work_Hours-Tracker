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

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    // Create a channel with a unique name
    const channel = supabase.channel(`clock_sessions_${userId}`);

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

    return () => {
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
