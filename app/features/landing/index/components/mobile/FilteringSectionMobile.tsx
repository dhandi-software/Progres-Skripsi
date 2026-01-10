import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { ChevronsUpDown, CalendarIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { categoryApi } from "~/api/categoryApi";
import type { NewsCategoriesResponse } from "~/api/types";
import { cn } from "~/lib/utils";
import { format, getUnixTime } from "date-fns";

interface FilteringSectionMobileProps {
  onSearch?: (filters: { category?: number; date?: number }) => void;
}

export function FilteringSectionMobile({ onSearch }: FilteringSectionMobileProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string>("Category");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
  const [categories, setCategories] = useState<NewsCategoriesResponse[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getCategories();
        if (response.data && response.data.length > 0) {
          setCategories(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategorySelect = (cat: NewsCategoriesResponse) => {
    setSelectedCategory(cat.name);
    setSelectedCategoryId(cat.id);
  };

  const handleSearch = () => {
    console.log("Searching with:", {
      category: selectedCategoryId,
      date: date ? getUnixTime(date) : undefined
    });

    onSearch?.({
      category: selectedCategoryId,
      date: date ? getUnixTime(date) : undefined,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold text-[#D94F24]">News Index</h2>
        <div className="h-[1px] w-full bg-gray-200 my-2" />
      </div>

      <div className="flex flex-col gap-4">
        {/* Date Filter */}
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Filter by Date</span>
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
        </div>

        {/* Category Filter */}
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Filter by Category</span>
          <div className="flex gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex-1 justify-between font-normal text-muted-foreground bg-white border-gray-200 h-9">
                  <span className={selectedCategory === "Category" ? "text-muted-foreground" : "text-foreground"}>
                    {selectedCategory}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-[200px]" align="start">
                {categoriesLoading ? (
                  <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
                ) : categories.length === 0 ? (
                  <DropdownMenuItem disabled>No categories</DropdownMenuItem>
                ) : (
                  categories.map((cat) => (
                    <DropdownMenuItem
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat)}
                      className={cn(
                        selectedCategory === cat.name && "bg-accent"
                      )}
                    >
                      {cat.name}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={handleSearch} className="bg-[#D94F24] hover:bg-[#b93f1b] text-white px-8 shrink-0 h-9">
              Search
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
