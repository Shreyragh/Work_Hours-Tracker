import { ClockPageClient } from "@/components/clock-page-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TimeTrackerPage = () => {
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Time Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <ClockPageClient />
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeTrackerPage;
