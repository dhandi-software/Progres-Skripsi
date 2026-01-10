import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { ChevronDown, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

export function FilteringSectionMobile() {
  const [sortOption, setSortOption] = useState("Select");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold text-[#D94F24]">Topic</h2>
        <div className="h-[1px] w-full bg-gray-200 my-2" />
        <h1 className="text-2xl font-bold text-[#D94F24]">Halmahera Mining</h1>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-gray-700">Sort by</span>
        <div className="flex gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between font-normal text-muted-foreground bg-white border-gray-200">
                <span className={sortOption === "Select" ? "text-muted-foreground" : "text-foreground"}>
                  {sortOption}
                </span>
                <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-[200px]" align="start">
              <DropdownMenuItem onClick={() => setSortOption("Oldest news")}>
                Oldest news
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption("Latest news")}>
                Latest news
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button className="bg-[#D94F24] hover:bg-[#b93f1b] text-white px-8 shrink-0">
            Search
          </Button>
        </div>
      </div>
    </div>
  );
}
