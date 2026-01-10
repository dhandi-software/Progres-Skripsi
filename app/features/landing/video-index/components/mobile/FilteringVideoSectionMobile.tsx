import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { format, getUnixTime } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

interface FilteringVideoSectionMobileProps {
  onSearch?: (filters: { date?: number }) => void;
}

export function FilteringVideoSectionMobile({ onSearch }: FilteringVideoSectionMobileProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);

  const handleSearch = () => {
    onSearch?.({
      date: date ? getUnixTime(date) : undefined,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold text-[#D94F24]">Video News Index</h2>
        <div className="h-[1px] w-full bg-gray-200 my-2" />
      </div>

      <div className="flex flex-col gap-3">
        {/* Date Filter */}
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Filter by Date</span>
          <div className="flex gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <div className="flex items-center gap-2 justify-start cursor-pointer">
                  <div className="w-[2.06rem] h-[2.25rem] flex items-center justify-center rounded-sm border border-border-subtle bg-background px-[0.25rem] text-sm">
                    {date ? format(date, "dd") : "DD"}
                  </div>
                  <div className="w-[7.81rem] h-[2.25rem] flex items-center justify-center rounded-sm border border-border-subtle bg-background px-[0.25rem] text-label">
                    {date ? format(date, "MMMM") : "Month"}
                  </div>
                  <div className="w-[2.75rem] h-[2.25rem] flex items-center justify-center rounded-sm border border-border-subtle bg-background px-[0.25rem] text-sm ring-offset-background">
                    {date ? format(date, "yyyy") : "YYYY"}
                  </div>
                  <CalendarIcon className="w-4 h-4 text-gray-500" />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button onClick={handleSearch} className="bg-[#D94F24] hover:bg-[#b93f1b] text-white px-8 shrink-0 h-9">
              Search
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
