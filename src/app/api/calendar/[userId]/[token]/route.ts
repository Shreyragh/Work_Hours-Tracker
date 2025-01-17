import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import ical from "ical-generator";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; token: string }> },
) {
  const supabase = await createClient();

  const { userId, token } = await params;

  // Verify the token
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("calendar_token")
    .eq("user_id", userId)
    .single();

  if (profile?.calendar_token !== token.substr(0, token.length - 4)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Fetch work logs
  const { data: logs } = await supabase
    .from("work_logs")
    .select("*")
    .eq("user_id", userId)
    .order("start_time", { ascending: true });

  if (!logs) {
    return new NextResponse("No logs found", { status: 404 });
  }

  // Create calendar
  const calendar = ical({
    name: "Work Hours",
    description: "Your logged work hours",
    timezone: "UTC",
  });

  // Add events for each work log
  logs.forEach((log) => {
    if (log.date && log.start_time && log.end_time) {
      // Parse the date and times
      const date = new Date(log.date);
      const [startHour, startMinute] = log.start_time.split(":").map(Number);
      const [endHour, endMinute] = log.end_time.split(":").map(Number);

      // Create start and end dates by combining date with times
      const startDate = new Date(date);
      startDate.setHours(startHour, startMinute, 0);

      const endDate = new Date(date);
      endDate.setHours(endHour, endMinute, 0);

      // Calculate hours
      const hours = Math.round(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60),
      );

      calendar.createEvent({
        start: startDate,
        end: endDate,
        summary: `Work: ${hours} hours`,
        description: log.notes || "No description provided",
      });
    }
  });

  // Generate iCal data
  const icalData = calendar.toString();

  // Return the calendar data with appropriate headers
  return new NextResponse(icalData, {
    headers: {
      "Content-Type": "text/calendar",
      "Content-Disposition": `attachment; filename="work-hours.ics"`,
    },
  });
}
