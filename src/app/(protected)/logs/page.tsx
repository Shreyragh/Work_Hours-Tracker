import { LogHoursButton } from "@/components/log-hours-button";
import LogsTableActions from "@/components/logs-table-actions";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, FilterIcon } from "lucide-react";
import { redirect } from "next/navigation";

const Filters = () => {
  return (
    <div className="flex flex-col space-y-4">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Search</Label>
          <Input placeholder="Search logs..." />
        </div>
        <div className="grid gap-2">
          <Label>Month</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                Filter by month
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" initialFocus />
            </PopoverContent>
          </Popover>
        </div>
        <div className="grid gap-2">
          <Label>Hours Range</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Hours range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0-4">0-4 hours</SelectItem>
              <SelectItem value="4-8">4-8 hours</SelectItem>
              <SelectItem value="8+">8+ hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Start Time</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Start time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="early-morning-1">Before 6 AM</SelectItem>
              <SelectItem value="early-morning-2">6 AM - 7 AM</SelectItem>
              <SelectItem value="early-morning-3">7 AM - 8 AM</SelectItem>
              <SelectItem value="morning-1">8 AM - 9 AM</SelectItem>
              <SelectItem value="morning-2">9 AM - 10 AM</SelectItem>
              <SelectItem value="morning-3">10 AM - 11 AM</SelectItem>
              <SelectItem value="morning-4">11 AM - 12 PM</SelectItem>
              <SelectItem value="afternoon-1">12 PM - 1 PM</SelectItem>
              <SelectItem value="afternoon-2">1 PM - 2 PM</SelectItem>
              <SelectItem value="afternoon-3">2 PM - 3 PM</SelectItem>
              <SelectItem value="afternoon-4">3 PM - 4 PM</SelectItem>
              <SelectItem value="evening-1">4 PM - 5 PM</SelectItem>
              <SelectItem value="evening-2">5 PM - 6 PM</SelectItem>
              <SelectItem value="evening-3">After 6 PM</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>End Time</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="End time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="morning-1">Before 10 AM</SelectItem>
              <SelectItem value="morning-2">10 AM - 11 AM</SelectItem>
              <SelectItem value="morning-3">11 AM - 12 PM</SelectItem>
              <SelectItem value="afternoon-1">12 PM - 1 PM</SelectItem>
              <SelectItem value="afternoon-2">1 PM - 2 PM</SelectItem>
              <SelectItem value="afternoon-3">2 PM - 3 PM</SelectItem>
              <SelectItem value="afternoon-4">3 PM - 4 PM</SelectItem>
              <SelectItem value="evening-1">4 PM - 5 PM</SelectItem>
              <SelectItem value="evening-2">5 PM - 6 PM</SelectItem>
              <SelectItem value="evening-3">6 PM - 7 PM</SelectItem>
              <SelectItem value="evening-4">7 PM - 8 PM</SelectItem>
              <SelectItem value="late-evening-1">8 PM - 9 PM</SelectItem>
              <SelectItem value="late-evening-2">9 PM - 10 PM</SelectItem>
              <SelectItem value="late-evening-3">After 10 PM</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Rate Type</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Rate type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default Rate</SelectItem>
              <SelectItem value="custom">Custom Rate</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button className="w-full">Apply Filters</Button>
    </div>
  );
};

const WorkLogs = async () => {
  const supabase = await createClient();
  const { data: user, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  // Temporary data for demonstration
  const logs = [
    {
      id: 1,
      date: new Date(),
      startTime: "09:00",
      endTime: "17:00",
      hoursWorked: 8,
      rate: 25,
      earnings: 200,
      notes: "Regular work day",
    },
  ];

  return (
    <div className="flex-1 space-y-4 pt-6">
      <div className="container flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Work Logs</h2>
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <FilterIcon className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <Filters />
              </div>
            </SheetContent>
          </Sheet>
          <LogHoursButton />
        </div>
      </div>

      <div className="container space-y-4">
        {/* Desktop Filters */}
        <div className="hidden md:block">
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <Input placeholder="Search logs..." className="max-w-[250px]" />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[200px] justify-start text-left font-normal",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Filter by month
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" initialFocus />
                </PopoverContent>
              </Popover>
              <Select>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Hours range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-4">0-4 hours</SelectItem>
                  <SelectItem value="4-8">4-8 hours</SelectItem>
                  <SelectItem value="8+">8+ hours</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Start time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="early-morning-1">Before 6 AM</SelectItem>
                  <SelectItem value="early-morning-2">6 AM - 7 AM</SelectItem>
                  <SelectItem value="early-morning-3">7 AM - 8 AM</SelectItem>
                  <SelectItem value="morning-1">8 AM - 9 AM</SelectItem>
                  <SelectItem value="morning-2">9 AM - 10 AM</SelectItem>
                  <SelectItem value="morning-3">10 AM - 11 AM</SelectItem>
                  <SelectItem value="morning-4">11 AM - 12 PM</SelectItem>
                  <SelectItem value="afternoon-1">12 PM - 1 PM</SelectItem>
                  <SelectItem value="afternoon-2">1 PM - 2 PM</SelectItem>
                  <SelectItem value="afternoon-3">2 PM - 3 PM</SelectItem>
                  <SelectItem value="afternoon-4">3 PM - 4 PM</SelectItem>
                  <SelectItem value="evening-1">4 PM - 5 PM</SelectItem>
                  <SelectItem value="evening-2">5 PM - 6 PM</SelectItem>
                  <SelectItem value="evening-3">After 6 PM</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="End time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning-1">Before 10 AM</SelectItem>
                  <SelectItem value="morning-2">10 AM - 11 AM</SelectItem>
                  <SelectItem value="morning-3">11 AM - 12 PM</SelectItem>
                  <SelectItem value="afternoon-1">12 PM - 1 PM</SelectItem>
                  <SelectItem value="afternoon-2">1 PM - 2 PM</SelectItem>
                  <SelectItem value="afternoon-3">2 PM - 3 PM</SelectItem>
                  <SelectItem value="afternoon-4">3 PM - 4 PM</SelectItem>
                  <SelectItem value="evening-1">4 PM - 5 PM</SelectItem>
                  <SelectItem value="evening-2">5 PM - 6 PM</SelectItem>
                  <SelectItem value="evening-3">6 PM - 7 PM</SelectItem>
                  <SelectItem value="evening-4">7 PM - 8 PM</SelectItem>
                  <SelectItem value="late-evening-1">8 PM - 9 PM</SelectItem>
                  <SelectItem value="late-evening-2">9 PM - 10 PM</SelectItem>
                  <SelectItem value="late-evening-3">After 10 PM</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Rate type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default Rate</SelectItem>
                  <SelectItem value="custom">Custom Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Hours Worked</TableHead>
                <TableHead>Rate (£)</TableHead>
                <TableHead>Earnings (£)</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{format(log.date, "PPP")}</TableCell>
                  <TableCell>{log.startTime}</TableCell>
                  <TableCell>{log.endTime}</TableCell>
                  <TableCell>{log.hoursWorked}</TableCell>
                  <TableCell>{log.rate}</TableCell>
                  <TableCell>{log.earnings}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {log.notes}
                  </TableCell>
                  <TableCell>
                    <LogsTableActions log={log} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default WorkLogs;
