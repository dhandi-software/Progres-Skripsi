import React from "react";
import { Search, CalendarDays, ChevronsUpDown, Loader2, X, Inbox } from "lucide-react";
import { cn } from "~/lib/utils";
import { useLogActivity } from "./UseLogActivity";
import { format } from "date-fns";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

export function LogActivityDesktop() {
  const [expandedRowId, setExpandedRowId] = React.useState<string | null>(null);
  const [isDateOpen, setIsDateOpen] = React.useState(false);

  const toggleRow = (id: string) => {
    if (expandedRowId === id) {
      setExpandedRowId(null);
    } else {
      setExpandedRowId(id);
    }
  };

  const {
    activities,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    selectedRole,
    setSelectedRole,
    selectedActionType,
    setSelectedActionType,
    selectedDate,
    setSelectedDate,
    fetchActivities,
  } = useLogActivity();

  const handleSearch = () => {
    fetchActivities();
  };

  return (
    <div className="flex flex-col gap-8 p-10 bg-[#F9FAFB] min-h-screen relative">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-[#1F2937]">Log Activity</h1>
          <p className="text-gray-500">Manage editorial media content.</p>
        </div>

        {/* Search - Top Right */}
        <div className="relative group w-[22rem]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-brand-primary" />
          <input
            type="text"
            placeholder="Search activity"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-all placeholder:text-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-100 rounded-full"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Filters Section - Row below header */}
      <div className="flex items-center justify-end gap-[1rem]">
        {/* Date Filter */}
        <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
          <PopoverTrigger asChild>
            <div className="w-[15.5rem] px-[0.75rem] py-[0.5rem] bg-white border border-[#E5E5E5] rounded-lg text-sm text-[#262626] flex items-center justify-between cursor-pointer hover:bg-gray-50 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
              <span className="font-medium leading-[1.25rem]">
                {selectedDate ? format(selectedDate, "d MMMM yyyy") : "All Date"}
              </span>
              <CalendarDays className="w-6 h-6 text-[#262626]" />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date);
                setIsDateOpen(false);
              }}
              initialFocus
            />
            {selectedDate && (
              <div className="p-2 border-t">
                <Button
                  variant="ghost"
                  className="w-full text-sm"
                  onClick={() => {
                    setSelectedDate(undefined);
                    setIsDateOpen(false);
                  }}
                >
                  Clear Date
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Role Filter */}
        <div className="relative w-[13.4375rem]">
          <div className="w-full px-[0.75rem] py-[0.5rem] bg-white border border-[#E5E5E5] rounded-lg text-sm text-[#262626] flex items-center justify-between cursor-pointer hover:bg-gray-50 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
            <span className="font-medium leading-[1.25rem]">{selectedRole}</span>
            <ChevronsUpDown className="w-4 h-4 text-[#737373]" />
            <select
              className="absolute inset-0 opacity-0 cursor-pointer"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="All Role">All Role</option>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="writer">Writer</option>
            </select>
          </div>
        </div>

        {/* Action Type Filter */}
        <div className="relative w-[13.4375rem]">
          <div className="w-full px-[0.75rem] py-[0.5rem] bg-white border border-[#E5E5E5] rounded-lg text-sm text-[#262626] flex items-center justify-between cursor-pointer hover:bg-gray-50 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
            <span className="font-medium leading-[1.25rem]">{selectedActionType}</span>
            <ChevronsUpDown className="w-4 h-4 text-[#737373]" />
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

        {/* Search Button */}
        <Button
          onClick={handleSearch}
          className="w-[7.5rem] h-[2.625rem] bg-[#D25026] hover:bg-[#B84420] text-white text-xs font-medium rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
        >
          Search
        </Button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden shadow-sm min-h-[25rem] flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#D25026] animate-spin" />
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-gray-500">
            <p>{error}</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-gray-500">
            <Inbox className="w-[6rem] h-[4rem] text-gray-400" />
            No activities found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-[#374151]">Date</th>
                  <th className="px-6 py-4 text-sm font-semibold text-[#374151]">User</th>
                  <th className="px-6 py-4 text-sm font-semibold text-[#374151]">Role</th>
                  <th className="px-6 py-4 text-sm font-semibold text-[#374151]">Action Type</th>
                  <th className="px-6 py-4 text-sm font-semibold text-[#374151]">Description</th>
                  <th className="px-6 py-4 text-sm font-semibold text-[#374151]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {activities.map((item) => (
                  <React.Fragment key={item.id}>
                    <tr className={cn("hover:bg-gray-50 transition-colors", expandedRowId === item.id ? "bg-gray-50" : "")}>
                      <td className="px-6 py-4 text-sm text-[#374151]">
                        {format(new Date(item.date), "dd MMM yyyy, HH:mm")}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-[#1F2937]">
                        {item.user.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#374151]">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-semibold",
                          item.user.role === "Super Admin" ? "bg-purple-50 text-purple-700 border border-purple-100" :
                            item.user.role === "Editor" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                              "bg-gray-50 text-gray-700 border border-gray-100"
                        )}>
                          {item.user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#374151]">
                        {item.actionType}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.description}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#374151]">
                        <button
                          onClick={() => toggleRow(item.id)}
                          className={cn(
                            "px-2 py-1 rounded-md text-xs font-medium transition-colors border",
                            expandedRowId === item.id
                              ? "bg-[#FFB86A] text-white border-[#FFB86A]"
                              : "bg-white text-[#FFB86A] border-[#FFB86A] hover:bg-orange-50"
                          )}
                        >
                          {expandedRowId === item.id ? "Less Details" : "View Details"}
                        </button>
                      </td>
                    </tr>
                    {expandedRowId === item.id && (
                      <tr className="bg-[#F9FAFB]/50">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="bg-[#F9FAFB]/50 border border-[#E5E5E5] rounded-lg p-4 flex flex-col gap-2">
                            <div className="flex items-start gap-4">
                              <span className="font-bold text-sm text-[#262626] w-[6.25rem] shrink-0">IP Address:</span>
                              <span className="text-sm text-[#262626]">{item.ipAddress}</span>
                            </div>
                            <div className="flex items-start gap-4">
                              <span className="font-bold text-sm text-[#262626] w-[6.25rem] shrink-0">User Agent:</span>
                              <span className="text-sm text-[#262626] break-all">{item.userAgent}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Placeholder if needed */}
        {!isLoading && activities.length > 0 && (
          <div className="px-6 py-4 border-t border-[#E5E7EB] flex items-center justify-between text-sm text-gray-500">
            <span>Showing {activities.length} results</span>
          </div>
        )}
      </div>
    </div>
  );
}
