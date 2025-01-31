"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface FiltersState {
  search: string;
  month: Date | undefined;
  hoursRange: string;
  startTime: string;
  endTime: string;
  rateType: string;
}

interface LogsFiltersProps {
  filters: FiltersState;
  setFilters: Dispatch<SetStateAction<FiltersState>>;
}

const LogsFilters = ({ filters, setFilters }: LogsFiltersProps) => {
  return (
    <div className="space-y-4">
      <Input
        placeholder="Search logs..."
        value={filters.search}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, search: e.target.value }))
        }
      />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !filters.month && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.month
              ? format(filters.month, "MMMM yyyy")
              : "Filter by month"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={filters.month}
            onSelect={(date) =>
              setFilters((prev) => ({ ...prev, month: date }))
            }
          />
        </PopoverContent>
      </Popover>
      <Select
        value={filters.hoursRange}
        onValueChange={(value) =>
          setFilters((prev) => ({ ...prev, hoursRange: value }))
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Hours range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0-4">0-4 hours</SelectItem>
          <SelectItem value="4-8">4-8 hours</SelectItem>
          <SelectItem value="8+">8+ hours</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.startTime}
        onValueChange={(value) =>
          setFilters((prev) => ({ ...prev, startTime: value }))
        }
      >
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
      <Select
        value={filters.endTime}
        onValueChange={(value) =>
          setFilters((prev) => ({ ...prev, endTime: value }))
        }
      >
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
      <Select
        value={filters.rateType}
        onValueChange={(value) =>
          setFilters((prev) => ({ ...prev, rateType: value }))
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Rate type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">Default Rate</SelectItem>
          <SelectItem value="custom">Custom Rate</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LogsFilters;
