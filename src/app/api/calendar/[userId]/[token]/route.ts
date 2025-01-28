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
    .from("calendar_tokens")
    .select("calendar_token")
    .eq("user_id", userId)
    .single();

  console.log(profile);

  console.log("Debug token verification:", {
    storedToken: profile?.calendar_token,
    receivedToken: token,
    slicedToken: token.slice(0, -4),
    match: profile?.calendar_token === token.slice(0, -4),
  });

  if (profile?.calendar_token !== token.slice(0, -4)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Fetch work logs
  const { data: logs } = await supabase
    .from("calendar_work_logs")
    .select("*")
    .eq("user_id", userId)
    .order("start_time", { ascending: true });

  console.log("Work logs:", logs);

  if (!logs) {
    return new NextResponse("No logs found", { status: 404 });
  }

  // Create calendar with more detailed configuration
  const calendar = ical({
    name: "Work Hours",
    description: "Your logged work hours",
    timezone: "UTC",
    url: request.url,
    ttl: 60,
  });

  // Add some debug logging in the forEach
  logs.forEach((log) => {
    console.log("Processing log:", {
      hasRequiredFields: !!(log.date && log.start_time && log.end_time),
      date: log.date,
      start_time: log.start_time,
      end_time: log.end_time,
    });

    if (log.date && log.start_time && log.end_time) {
      // Parse the date and times
      const date = new Date(log.date);
      const [startHour, startMinute] = log.start_time.split(":").map(Number);
      const [endHour, endMinute] = log.end_time.split(":").map(Number);

      // Create start and end dates by combining date with times
      const startDate = new Date(date);
      startDate.setUTCHours(startHour, startMinute, 0);

      const endDate = new Date(date);
      endDate.setUTCHours(endHour, endMinute, 0);

      // Calculate duration in hours and minutes
      const durationMs = endDate.getTime() - startDate.getTime();
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.round((durationMs % (1000 * 60 * 60)) / (1000 * 60));

      calendar.createEvent({
        start: startDate,
        end: endDate,
        summary: `Work: ${hours}h${minutes > 0 ? ` ${minutes}m` : ""}`,
        description: log.notes || "No description provided",
        created: new Date(log.created_at || Date.now()),
        lastModified: new Date(log.updated_at || Date.now()),
      });
    }
  });

  // Generate iCal data
  const icalData = calendar.toString();

  // Return the calendar data with appropriate headers
  return new NextResponse(icalData, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="work-hours.ics"`,
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
