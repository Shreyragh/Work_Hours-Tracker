import { ClockPageClient } from "@/components/clock-page-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";

const TimeTrackerPage = () => {
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Time Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense>
            <ClockPageClient />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeTrackerPage;
