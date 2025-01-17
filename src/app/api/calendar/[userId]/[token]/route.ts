import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import ical from "ical-generator";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string; token: string } },
) {
  const supabase = await createClient();

  // Verify the token
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("calendar_token")
    .eq("user_id", params.userId)
    .single();

  if (!profile || profile.calendar_token !== params.token) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Fetch work logs
  const { data: logs } = await supabase
    .from("work_logs")
    .select("*")
    .eq("user_id", params.userId)
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
    if (log.start_time && log.end_time) {
      const hours = Math.round(
        (new Date(log.end_time).getTime() -
          new Date(log.start_time).getTime()) /
          (1000 * 60 * 60),
      );
      calendar.createEvent({
        start: new Date(log.start_time),
        end: new Date(log.end_time),
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
