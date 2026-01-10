import { useState } from "react";
import { Search, ChevronsUpDown, Inbox, Menu } from "lucide-react";
import { format } from "date-fns";
import { useLogActivity, type LogActivity } from "./UseLogActivity";
import { cn } from "~/lib/utils";
import { useNavigate } from "react-router";
import { useSidebar } from "~/components/ui/sidebar";
import { LogActivityDetailMobile } from "./components/LogActivityDetailMobile";
import { Button } from "~/components/ui/button";

export function LogActivityMobile() {
  const navigate = useNavigate();
  const { setOpenMobile } = useSidebar();
  const [selectedActivity, setSelectedActivity] = useState<LogActivity | null>(null);

  // Local date filter state
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");

  const {
    activities,
    isLoading,
    // error,
    searchQuery,
    setSearchQuery,
    selectedRole,
    setSelectedRole,
    selectedActionType,
    setSelectedActionType,
    selectedDate,
    setSelectedDate
  } = useLogActivity();

  // Generate options for day/month/year dropdowns
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());

  const handleSearch = () => {
    if (selectedDay && selectedMonth && selectedYear) {
      const date = new Date(`${selectedYear}-${selectedMonth}-${selectedDay}`);
      setSelectedDate(date);
    } else {
      setSelectedDate(undefined);
    }
  };

  if (selectedActivity) {
    return (
      <LogActivityDetailMobile
        activity={selectedActivity}
        onBack={() => setSelectedActivity(null)}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpenMobile(true)}
            className="p-1 -ml-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-900" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Log Activity</h1>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search activity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary placeholder:text-gray-400"
          />
        </div>

        {/* Filters - Row 1 */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            {/* Role Filter */}
            <div className="flex items-center justify-between px-4 py-2 bg-white border border-[#E5E5E5] rounded-lg flex-1 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] relative">
              <span className={cn(
                "text-sm font-medium truncate leading-[1.25rem]",
                selectedRole !== "All Role" ? "text-[#0A0A0A]" : "text-[#737373]"
              )}>
                {selectedRole !== "All Role" ? selectedRole : "Role Filter"}
              </span>
              <ChevronsUpDown className="w-4 h-4 text-[#737373] shrink-0" />
              <select
                className="absolute inset-0 opacity-0 cursor-pointer"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="All Role">All Role</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Editor">Editor</option>
                <option value="Author">Author</option>
              </select>
            </div>

            {/* Action Type Filter */}
            <div className="flex items-center justify-between px-4 py-2 bg-white border border-[#E5E5E5] rounded-lg flex-1 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] relative">
              <span className={cn(
                "text-sm font-medium truncate leading-[1.25rem]",
                selectedActionType !== "All Type" ? "text-[#0A0A0A]" : "text-[#737373]"
              )}>
                {selectedActionType !== "All Type" ? selectedActionType : "Action Type Filter"}
              </span>
              <ChevronsUpDown className="w-4 h-4 text-[#737373] shrink-0" />
              <select
                className="absolute inset-0 opacity-0 cursor-pointer"
                value={selectedActionType}
                onChange={(e) => setSelectedActionType(e.target.value)}
              >
                <option value="All Type">All Type</option>
                <option value="Create">Create</option>
                <option value="Update">Update</option>
                <option value="Delete">Delete</option>
                <option value="Login">Login</option>
              </select>
            </div>
          </div>

          {/* Filters - Row 2 */}
          <div className="flex gap-3 items-center">
            {/* Day Filter */}
            <div className="flex items-center justify-between px-4 py-2 bg-white border border-[#E5E5E5] rounded-lg flex-1 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] relative">
              <span className={cn(
                "text-sm font-medium truncate leading-[1.25rem]",
                selectedDay ? "text-[#0A0A0A]" : "text-[#737373]"
              )}>
                {selectedDay || "Day"}
              </span>
              <ChevronsUpDown className="w-4 h-4 text-[#737373] shrink-0" />
              <select
                className="absolute inset-0 opacity-0 cursor-pointer"
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
              >
                <option value="">Day</option>
                {days.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            {/* Month Filter */}
            <div className="flex items-center justify-between px-4 py-2 bg-white border border-[#E5E5E5] rounded-lg flex-1 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] relative">
              <span className={cn(
                "text-sm font-medium truncate leading-[1.25rem]",
                selectedMonth ? "text-[#0A0A0A]" : "text-[#737373]"
              )}>
                {selectedMonth ? months.find(m => m.value === selectedMonth)?.label : "Month"}
              </span>
              <ChevronsUpDown className="w-4 h-4 text-[#737373] shrink-0" />
              <select
                className="absolute inset-0 opacity-0 cursor-pointer"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="">Month</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div className="flex items-center justify-between px-4 py-2 bg-white border border-[#E5E5E5] rounded-lg flex-1 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] relative">
              <span className={cn(
                "text-sm font-medium truncate leading-[1.25rem]",
                selectedYear ? "text-[#0A0A0A]" : "text-[#737373]"
              )}>
                {selectedYear || "Year"}
              </span>
              <ChevronsUpDown className="w-4 h-4 text-[#737373] shrink-0" />
              <select
                className="absolute inset-0 opacity-0 cursor-pointer"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="">Year</option>
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              className="shrink-0 px-4"
            >
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 bg-[#FAFAFA]">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">Loading...</div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <div className="p-3 bg-gray-100 rounded-full">
              <Inbox className="w-[6rem] h-[4rem] text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">No activity found.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {activities.map((item) => (
              <div key={item.id} className="bg-white border border-[#E5E5E5] rounded-lg p-4 flex flex-col gap-4 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
                {/* Card Header */}
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-base font-medium text-[#0A0A0A] leading-[1.25rem]">{item.user.name}</h3>
                    <span className="text-xs font-normal text-[#737373] leading-[1rem]">{format(new Date(item.date), "d MMMM yyyy 'at' HH:mm")}</span>
                  </div>

                  <div className="bg-[#FAFAFA] border border-black/10 px-2 py-0.5 rounded-[0.25rem] flex items-center justify-center">
                    <span className="text-xs text-[#737373] font-medium leading-[1rem]">{item.user.role}</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-base font-medium text-[#0A0A0A] leading-[1.25rem]">Action Type</h3>
                    <span className="text-xs font-normal text-[#737373] leading-[1rem]">{item.actionType}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-base font-medium text-[#0A0A0A] leading-[1.25rem]">Description</h3>
                    <p className="text-xs font-normal text-[#737373] leading-[1rem] line-clamp-2">{item.description}</p>
                  </div>
                </div>

                {/* Footer Button */}
                <Button
                  onClick={() => setSelectedActivity(item)}
                  className="w-full transition-colors"
                >
                  View Details
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
