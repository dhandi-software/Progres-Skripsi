import * as React from "react";
import { useState, useEffect } from "react";
import {
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker";
import { format, addMonths } from "date-fns";

import { cn } from "~/lib/utils";
import { Button, buttonVariants } from "~/components/ui/button";
import { Popover, PopoverContent, PopoverAnchor } from "~/components/ui/popover";

/* =========================
   STANDARD CALENDAR
========================= */
function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    captionLayout = "label",
    buttonVariant = "outline",
    formatters,
    components,
    ...props
}: React.ComponentProps<typeof DayPicker> & {
    buttonVariant?: React.ComponentProps<typeof Button>["variant"];
}) {
    const defaultClassNames = getDefaultClassNames();

    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            captionLayout={captionLayout}
            formatters={{
                formatMonthDropdown: (date) =>
                    date.toLocaleString("default", { month: "short" }),
                ...formatters,
            }}
            className={cn(
                "bg-white z-50 w-64 p-3 rounded-lg shadow-md outline outline-offset-[-1px] outline-Border-subtle",
                String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
                String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
                className,
            )}
            classNames={{
                root: cn("w-full", defaultClassNames.root),
                months: cn("flex flex-col gap-4", defaultClassNames.months),
                month: cn(
                    "flex flex-col gap-3 relative",
                    defaultClassNames.month,
                ),

                /* ===== NAV ===== */
                nav: cn(
                    "absolute right-0 top-0 h-9 flex items-center gap-1.5 z-10",
                    defaultClassNames.nav,
                ),

                /* ===== CHEVRON BUTTON ===== */
                button_previous: cn(
                    buttonVariants({ variant: buttonVariant }),
                    "aria-disabled:opacity-50 aria-disabled:pointer-events-none h-9 w-9 p-0 flex items-center justify-center rounded-md outline outline-1 outline-offset-[-1px] outline-Border-subtle cursor-pointer",
                    "text-black hover:bg-gray-100 bg-white",
                    "focus-visible:ring-2 focus-visible:ring-[#FF6900]",
                    defaultClassNames.button_previous,
                ),
                button_next: cn(
                    buttonVariants({ variant: buttonVariant }),
                    "aria-disabled:opacity-50 aria-disabled:pointer-events-none h-9 w-9 p-0 flex items-center justify-center rounded-md outline outline-1 outline-offset-[-1px] outline-Border-subtle cursor-pointer",
                    "text-black hover:bg-gray-100 bg-white",
                    "focus-visible:ring-2 focus-visible:ring-[#FF6900]",
                    defaultClassNames.button_next,
                ),

                /* ===== CAPTION ===== */
                month_caption: cn(
                    "relative flex items-center justify-start text-sm font-medium border-b border-Border-subtle pb-4 mb-4",
                    defaultClassNames.month_caption,
                ),

                caption_label: cn(
                    "flex gap-2 items-center select-none font-medium text-sm text-foreground pr-[80px]",
                    defaultClassNames.caption_label,
                ),

                /* ===== TABLE ===== */
                table: "w-full border-collapse",
                weekdays: cn(
                    "flex w-full justify-between mb-2",
                    defaultClassNames.weekdays,
                ),
                weekday: cn(
                    "w-8 text-center text-sm font-medium text-black",
                    defaultClassNames.weekday,
                ),
                week: cn("flex w-full justify-between mt-1", defaultClassNames.week),

                day: cn(
                    "relative aspect-square w-8 p-0 text-center select-none text-sm text-black rounded transition-colors",
                    defaultClassNames.day,
                ),

                /* ===== STATES ===== */
                selected: cn(
                    "!bg-[#FF6900] !text-white rounded-sm hover:!text-white",
                    defaultClassNames.selected,
                ),
                today: cn(
                    "border border-border rounded-sm",
                    defaultClassNames.today,
                ),
                outside: cn(
                    "text-muted-foreground opacity-70",
                    defaultClassNames.outside,
                ),
                disabled: cn(
                    "text-muted-foreground opacity-50",
                    defaultClassNames.disabled,
                ),

                ...classNames,
            }}
            components={{
                Chevron: ({ orientation, className }) => {
                    const iconClass = cn("w-5 h-5 shrink-0 text-current", className);
                    if (orientation === "left") {
                        return <ChevronLeftIcon className={iconClass} />;
                    }
                    if (orientation === "right") {
                        return <ChevronRightIcon className={iconClass} />;
                    }
                    return <ChevronDownIcon className={cn("w-4 h-4 shrink-0 text-current", className)} />;
                },

                DayButton: CalendarDayButton,
                ...components,
            }}
            {...props}
        />
    );
}

/* =========================
   DAY BUTTON
========================= */
function CalendarDayButton({
    className,
    day,
    modifiers,
    ...props
}: React.ComponentProps<typeof DayButton>) {
    const defaultClassNames = getDefaultClassNames();
    const ref = React.useRef<HTMLButtonElement>(null);

    React.useEffect(() => {
        if (modifiers.focused) ref.current?.focus();
    }, [modifiers.focused]);

    return (
        <Button
            ref={ref}
            variant="ghost"
            size="icon"
            data-day={day.date.toLocaleDateString()}
            className={cn(
                "flex aspect-square w-8 h-8 p-0 text-sm font-normal items-center justify-center rounded",

                modifiers.outside && "text-muted-foreground opacity-70",

                "data-[selected-single=true]:bg-[#FF6900] data-[selected-single=true]:text-white",
                "data-[range-start=true]:bg-[#FF6900] data-[range-start=true]:text-white",
                "data-[range-end=true]:bg-[#FF6900] data-[range-end=true]:text-white",
                "data-[range-middle=true]:bg-[#FF6900]/10",

                !modifiers.selected &&
                !modifiers.outside &&
                "hover:bg-[#FF6900]/10 hover:text-[#FF6900]",

                modifiers.today &&
                !modifiers.selected &&
                "border border-border rounded-sm",

                defaultClassNames.day,
                className,
            )}
            {...props}
        />
    );
}


/* =========================
   MONTH SELECTOR
========================= */
const monthsList = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

function MonthSelector({ selectedMonth, onSelectMonth, onBack }: { selectedMonth: number | undefined, onSelectMonth: (m: number) => void, onBack?: () => void }) {
    return (
        <div className="w-64 p-3 bg-white z-50 rounded-lg shadow-md shadow-[0px_2px_4px_-2px_rgba(0,0,0,0.10)] outline outline-1 outline-offset-[-1px] outline-Border-subtle inline-flex flex-col justify-start items-start gap-3">
            <div className="self-stretch pb-2 border-b border-Border-subtle inline-flex justify-start items-center gap-2">
                {onBack ? (
                    <button type="button" onClick={onBack} aria-label="Back" className="p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer flex justify-center items-center">
                        <ChevronLeft className="w-5 h-5 text-black" />
                    </button>
                ) : (
                    <div className="w-3 h-3 relative origin-top-left rotate-180 overflow-hidden">
                        <div className="w-2 h-px left-[2px] top-[5.50px] absolute bg-Base-foreground" />
                        <div className="w-1 h-2 left-[2px] top-[2px] absolute bg-Base-foreground" />
                    </div>
                )}
                <div className="py-1 rounded flex justify-center items-center gap-2.5">
                    <div className="text-center justify-center text-black text-sm font-medium font-['Geist'] leading-5">Select Month</div>
                </div>
            </div>
            <div className="self-stretch flex-1 inline-flex justify-between items-start gap-2">
                <div className="flex-1 self-stretch inline-flex flex-col justify-between items-start gap-2">
                    {[0, 3, 6, 9].map((mIndex) => (
                        <button
                            key={mIndex}
                            onClick={() => onSelectMonth(mIndex)}
                            className={cn(
                                "self-stretch p-1 rounded inline-flex justify-center items-center gap-2.5 hover:bg-gray-100 transition-colors w-full",
                                selectedMonth === mIndex ? "bg-[#FF6900] text-white" : "bg-white text-black"
                            )}
                        >
                            <div className={cn("flex-1 text-center justify-center text-xs font-normal font-['Geist'] leading-4", selectedMonth === mIndex ? "text-white" : "text-black")}>
                                {monthsList[mIndex]}
                            </div>
                        </button>
                    ))}
                </div>
                <div className="flex-1 self-stretch inline-flex flex-col justify-between items-start gap-2">
                    {[1, 4, 7, 10].map((mIndex) => (
                        <button
                            key={mIndex}
                            onClick={() => onSelectMonth(mIndex)}
                            className={cn(
                                "self-stretch p-1 rounded inline-flex justify-center items-center gap-2.5 hover:bg-gray-100 transition-colors w-full",
                                selectedMonth === mIndex ? "bg-[#FF6900] text-white" : "bg-white text-black"
                            )}
                        >
                            <div className={cn("flex-1 text-center justify-center text-xs font-normal font-['Geist'] leading-4", selectedMonth === mIndex ? "text-white" : "text-black")}>
                                {monthsList[mIndex]}
                            </div>
                        </button>
                    ))}
                </div>
                <div className="flex-1 self-stretch inline-flex flex-col justify-between items-start gap-2">
                    {[2, 5, 8, 11].map((mIndex) => (
                        <button
                            key={mIndex}
                            onClick={() => onSelectMonth(mIndex)}
                            className={cn(
                                "self-stretch p-1 rounded inline-flex justify-center items-center gap-2.5 hover:bg-gray-100 transition-colors w-full",
                                selectedMonth === mIndex ? "bg-[#FF6900] text-white" : "bg-white text-black"
                            )}
                        >
                            <div className={cn("flex-1 text-center justify-center text-xs font-normal font-['Geist'] leading-4", selectedMonth === mIndex ? "text-white" : "text-black")}>
                                {monthsList[mIndex]}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* =========================
   YEAR SELECTOR
========================= */
function YearSelector({ selectedYear, onSelectYear, onBack }: { selectedYear: number | undefined, onSelectYear: (y: number) => void, onBack?: () => void }) {
    const [yearPage, setYearPage] = useState(0); 
    const startYear = 2016 + (yearPage * 16);
    const years = Array.from({ length: 16 }, (_, i) => startYear + i);

    const handlePrev = () => setYearPage(p => p - 1);
    const handleNext = () => setYearPage(p => p + 1);

    return (
        <div className="w-64 p-3 bg-white z-50 rounded-lg shadow-md shadow-[0px_2px_4px_-2px_rgba(0,0,0,0.10)] outline outline-1 outline-offset-[-1px] outline-Border-subtle inline-flex flex-col justify-start items-start gap-3">
            <div className="self-stretch pb-2 border-b border-Border-subtle inline-flex justify-between items-center">
                <div className="flex justify-start items-center gap-2">
                    {onBack ? (
                        <button type="button" onClick={onBack} aria-label="Back" className="p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer flex justify-center items-center">
                            <ChevronLeft className="w-5 h-5 text-black" />
                        </button>
                    ) : (
                        <div className="w-3 h-3 relative origin-top-left rotate-180 overflow-hidden">
                            <div className="w-2 h-px left-[2px] top-[5.50px] absolute bg-Base-foreground" />
                            <div className="w-1 h-2 left-[2px] top-[2px] absolute bg-Base-foreground" />
                        </div>
                    )}
                    <div className="py-1 rounded flex justify-center items-center gap-2.5">
                        <div className="text-center justify-center text-black text-sm font-medium font-['Geist'] leading-5">Select Year</div>
                    </div>
                </div>
                <div className="flex justify-start items-center gap-1.5">
                    <button onClick={handlePrev} type="button" className="w-6 h-6 rounded-lg outline outline-1 outline-offset-[-1px] outline-Border-subtle inline-flex flex-col justify-center items-center hover:bg-gray-100">
                        <ChevronLeft className="w-4 h-4 text-black" />
                    </button>
                    <button onClick={handleNext} type="button" className="w-6 h-6 rounded-lg outline outline-1 outline-offset-[-1px] outline-Border-subtle inline-flex flex-col justify-center items-center hover:bg-gray-100">
                        <ChevronRight className="w-4 h-4 text-black" />
                    </button>
                </div>
            </div>
            <div className="self-stretch flex-1 inline-flex justify-between items-start gap-2">
                {[0, 1, 2, 3].map(colIndex => (
                    <div key={colIndex} className="flex-1 self-stretch inline-flex flex-col justify-between items-start gap-1">
                        {[0, 1, 2, 3].map(rowIndex => {
                            const actualYear = years[colIndex + (rowIndex * 4)];
                            return (
                                <button
                                    key={actualYear}
                                    onClick={() => onSelectYear(actualYear)}
                                    className={cn(
                                        "w-full p-1 rounded inline-flex justify-center items-center gap-2.5 hover:bg-gray-100 transition-colors",
                                        selectedYear === actualYear ? "bg-[#FF6900] text-white" : "bg-white text-black"
                                    )}
                                >
                                    <div className={cn("text-center justify-center text-xs font-normal font-['Geist'] leading-4", selectedYear === actualYear ? "text-white" : "text-black")}>
                                        {actualYear}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}

/* =========================
   MONTH YEAR FILTER (MAIN ENTRY POINT)
========================= */
interface MonthYearFilterProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  showLabel?: boolean;
  className?: string;
  compact?: boolean;
}

function MonthYearFilter({ date, setDate, showLabel = true, className, compact = false }: MonthYearFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'days' | 'months' | 'years'>('days');
  const [browsingDate, setBrowsingDate] = useState<Date>(date || new Date());

  useEffect(() => {
    if (date) setBrowsingDate(date);
  }, [date, isOpen]);

  const toggleOpen = (v: 'days' | 'months' | 'years') => {
      if (isOpen && view === v) {
          setIsOpen(false);
      } else {
          setView(v);
          setIsOpen(true);
      }
  };

  const isValidDate = date && !isNaN(date.getTime());
  const currentMonth = isValidDate ? date.getMonth() : undefined;
  const currentYear = isValidDate ? date.getFullYear() : undefined;

  const displayDate = isValidDate ? date : new Date();

  return (
    <div className={cn("w-auto inline-flex flex-col justify-start items-start gap-1", className)}>
      {showLabel && (
        <div className="flex flex-row items-center gap-2 mb-1 w-full">
          <span className="text-sm font-medium text-foreground leading-none">Filter by Date</span>
          {date && (
              <Button 
                  variant="outline"
                  onClick={() => setDate(undefined)} 
                  className="h-auto p-0 m-0 text-xs text-[#D25026] hover:text-orange-700 font-medium decoration-1 underline-offset-2 transition-colors leading-none"
                  title="Clear date filter"
              >
                  Clear
              </Button>
          )}
        </div>
      )}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverAnchor asChild>
            <div className={cn(
                "min-h-[32px] flex flex-row flex-wrap justify-start items-center select-none border border-transparent shrink-0 w-full",
                compact ? "gap-1" : "gap-2"
            )}>
                
                <div 
                    onClick={() => toggleOpen('days')} 
                    className={cn(
                        "rounded outline outline-offset-[-1px] outline-Border-subtle inline-flex justify-center items-center cursor-pointer hover:bg-gray-50 bg-white min-w-[35px]",
                        compact ? "px-1 h-8 flex-1" : "px-3 self-stretch"
                    )}
                >
                    <div className="flex justify-center items-center overflow-hidden">
                        <div className={cn("text-center justify-center text-black font-normal font-['Geist'] leading-tight", compact ? "text-[11px]" : "text-sm")}>
                            {isValidDate ? format(date, "dd") : "DD"}
                        </div>
                    </div>
                </div>

                <div 
                    onClick={() => toggleOpen('days')} 
                    className={cn(
                        "bg-white rounded shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-Border-subtle inline-flex justify-center items-center cursor-pointer hover:bg-gray-50",
                        compact ? "px-2 h-8 flex-[2]" : "flex-1 self-stretch px-4 py-2 min-w-[120px]"
                    )}
                >
                    <div className="flex-1 inline-flex flex-col justify-center items-center gap-0.5">
                        <div className={cn("self-stretch text-center justify-center text-Base-elevated-foreground font-medium font-['Geist'] leading-tight", compact ? "text-[11px]" : "text-sm")}>
                            {currentMonth !== undefined ? format(new Date(2000, currentMonth, 1), "MMM") : "Month"}
                        </div>
                    </div>
                </div>

                <div 
                    onClick={() => toggleOpen('days')} 
                    className={cn(
                        "bg-white rounded outline outline-1 outline-offset-[-1px] outline-Border-subtle inline-flex justify-center items-center cursor-pointer hover:bg-gray-50",
                        compact ? "px-2 h-8 flex-1.5 min-w-[50px]" : "self-stretch px-4 min-w-[70px]"
                    )}
                >
                    <div className={cn("flex-1 text-center justify-center flex flex-col text-black font-normal font-['Geist'] leading-tight", compact ? "text-[11px]" : "text-sm")}>
                        {currentYear !== undefined ? currentYear : "YYYY"}
                    </div>
                </div>

                {!compact && <CalendarDays onClick={() => toggleOpen('days')} className="w-6 h-6 text-black/80 shrink-0 cursor-pointer hover:opacity-80 ml-1" />}
            
            </div>
        </PopoverAnchor>
        <PopoverContent align="start" className="w-auto p-0 border-none bg-transparent shadow-none z-[1000]" sideOffset={8}>
            {view === 'days' && (
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => {
                        setDate(d);
                        setIsOpen(false);
                    }}
                    month={browsingDate}
                    onMonthChange={setBrowsingDate}
                    initialFocus
                    className="bg-white z-50 w-[276px] p-4 rounded-lg shadow-md outline outline-offset-[-1px] outline-Border-subtle"
                    classNames={{ nav: "hidden" }}
                    components={{
                        CaptionLabel: () => (
                            <div className="flex justify-start items-center gap-2">
                                <div
                                    role="button"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setView('months'); }}
                                    className="h-9 px-4 border border-Border-subtle rounded-md cursor-pointer hover:bg-gray-100 text-sm font-medium text-black bg-white shadow-sm transition-colors select-none flex items-center justify-center"
                                >
                                    {format(browsingDate, "MMMM")}
                                </div>
                                <div
                                    role="button"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setView('years'); }}
                                    className="h-9 px-4 border border-Border-subtle rounded-md cursor-pointer hover:bg-gray-100 text-sm font-medium text-black bg-white shadow-sm transition-colors select-none flex items-center justify-center"
                                >
                                    {format(browsingDate, "yyyy")}
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    <button
                                        type="button"
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setBrowsingDate(addMonths(browsingDate, -1)); }}
                                        className="h-9 w-9 border border-Border-subtle rounded-md cursor-pointer hover:bg-gray-100 flex items-center justify-center text-black bg-white shadow-sm transition-colors outline-none"
                                    >
                                        <ChevronLeft className="w-4 h-4 text-black" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setBrowsingDate(addMonths(browsingDate, 1)); }}
                                        className="h-9 w-9 border border-Border-subtle rounded-md cursor-pointer hover:bg-gray-100 flex items-center justify-center text-black bg-white shadow-sm transition-colors outline-none"
                                    >
                                        <ChevronRight className="w-4 h-4 text-black" />
                                    </button>
                                </div>
                            </div>
                        )
                    }}
                />
            )}
            {view === 'months' && (
                <MonthSelector 
                    selectedMonth={browsingDate.getMonth()} 
                    onSelectMonth={(m) => {
                        setBrowsingDate(new Date(browsingDate.getFullYear(), m, 1));
                        setView('days');
                    }} 
                    onBack={() => setView('days')}
                />
            )}
            {view === 'years' && (
                <YearSelector 
                    selectedYear={browsingDate.getFullYear()} 
                    onSelectYear={(y) => {
                        setBrowsingDate(new Date(y, browsingDate.getMonth(), 1));
                        setView('days');
                    }}
                    onBack={() => setView('days')}
                />
            )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

export { Calendar, CalendarDayButton, MonthYearFilter, MonthSelector, YearSelector };