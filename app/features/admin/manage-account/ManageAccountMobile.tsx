import { Search, X, ChevronDown, ChevronRight, Menu } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useManageAccount, type UserAccount } from "./UseManageAccount";
import { cn } from "~/lib/utils";
import { useSidebar } from "~/components/ui/sidebar";
import { useNavigate, useLocation } from "react-router";
import { Toast } from "~/components/ui/toast";

export const ManageAccountMobile = () => {
  const navigate = useNavigate();
  const { setOpenMobile } = useSidebar();
  const location = useLocation();
  const [successToast, setSuccessToast] = useState<{ title: string; variant: "success" | "destructive" | "default" } | null>(null);

  useEffect(() => {
    if (location.state?.toast) {
      setSuccessToast(location.state.toast);
      // Clear location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const {
    searchQuery,
    roleFilter,
    filteredUsers,
    handleSearchChange,
    clearSearch,
    handleRoleFilterChange,
  } = useManageAccount();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const roles = ["admin", "writer", "editor"];

  const getRoleBadgeStyles = (role: UserAccount["role"]) => {
    switch (role) {
      case "admin":
        return "bg-[#71717A] text-white";
      case "writer":
        return "bg-[#18181B] text-white";
      case "editor":
        return "bg-[#F4F4F5] text-[#71717A]";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="w-full min-h-screen pt-4 pb-12 bg-white flex flex-col font-geist relative">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300 w-auto min-w-[18.75rem] flex justify-center">
          <Toast
            title={successToast.title}
            variant={successToast.variant}
            className="shadow-md border border-[#22C55E]/10 px-4 py-3 rounded-xl bg-white/95 backdrop-blur-sm"
            onClose={() => setSuccessToast(null)}
          />
        </div>
      )}

      {/* Header Section */}
      <div className="px-5 mb-8 flex flex-col gap-1">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setOpenMobile(true)}
            className="p-1 -ml-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-7 h-7 text-[#0F172A]" />
          </button>
          <h1 className="text-[1.25rem] font-semibold text-[#0F172A] leading-tight">
            Manage Account
          </h1>
        </div>
        <p className="text-[0.8125rem] text-[#71717A] pl-11 leading-normal font-normal">
          You can find account information for each role.
        </p>
      </div>

      {/* Filters Section - Combined into a row */}
      <div className="px-5 flex items-center gap-2 mb-8">
        {/* Role Filter */}
        <div className="relative flex-shrink-0" ref={filterRef}>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={cn(
              "flex items-center justify-between w-[7rem] h-[2.375rem] px-3 rounded-lg border border-[#E4E4E7] bg-white text-[0.8125rem] transition-all",
              isFilterOpen ? "ring-1 ring-[#D25026]/10 border-[#D25026]" : ""
            )}
          >
            <span className={cn("truncate capitalize", roleFilter ? "text-[#18181B]" : "text-[#71717A]")}>
              {roleFilter || "Role Filter"}
            </span>
            <ChevronDown className={cn("w-3.5 h-3.5 text-[#71717A] transition-transform flex-shrink-0 ml-1", isFilterOpen && "rotate-180")} />
          </button>

          {isFilterOpen && (
            <div className="absolute top-full left-0 mt-2 w-[7rem] bg-white border border-[#E4E4E7] rounded-lg shadow-xl z-20 py-1 overflow-hidden">
              <button
                onClick={() => {
                  handleRoleFilterChange(null);
                  setIsFilterOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-[0.75rem] hover:bg-[#F4F4F5] transition-colors border-b border-[#F4F4F5]"
              >
                All Roles
              </button>
              {roles.map((role, index) => (
                <button
                  key={role}
                  onClick={() => {
                    handleRoleFilterChange(role);
                    setIsFilterOpen(false);
                  }}
                  className={cn(
                    "w-full px-3 py-2 text-left text-[0.75rem] hover:bg-[#F4F4F5] transition-colors capitalize",
                    index !== roles.length - 1 && "border-bottom border-[#F4F4F5]",
                    roleFilter === role && "bg-[#F4F4F5] font-medium"
                  )}
                  style={{ borderBottom: index !== roles.length - 1 ? "0.0625rem solid #F4F4F5" : "none" }}
                >
                  {role}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#71717A]" />
          <input
            type="text"
            placeholder="Search user"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full h-[2.375rem] pl-8 pr-8 rounded-lg border border-[#E4E4E7] focus:outline-none focus:ring-1 focus:ring-[#D25026]/10 focus:border-[#D25026] text-[0.8125rem] transition-all bg-white placeholder-[#71717A]"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-3.5 h-3.5 text-[#71717A]" />
            </button>
          )}
        </div>
      </div>

      {/* User List - Container style */}
      <div className="px-5">
        <div className="bg-white border border-[#E4E4E7] rounded-xl overflow-hidden shadow-sm">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user, index) => (
              <div
                key={user.id}
                onClick={() => navigate(`/admin/account-detail/${user.id}`)}
                className={cn(
                  "flex items-center justify-between p-4 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer",
                  index !== filteredUsers.length - 1 ? "border-b border-[#F4F4F5]" : ""
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-[#E4E4E7] flex-shrink-0">
                    <img
                      src={user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=placeholder"}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-[0.9375rem] font-bold text-[#18181B] leading-tight">
                      {user.name}
                    </h3>
                    <p className="text-[0.6875rem] text-[#71717A] leading-tight mb-1">
                      {user.handle}
                    </p>
                    <div>
                      <span className={cn(
                        "px-2 py-0.5 rounded-md text-[0.5625rem] font-bold uppercase tracking-wider",
                        getRoleBadgeStyles(user.role)
                      )}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#A1A1AA]" />
              </div>
            ))
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 bg-[#F4F4F5] rounded-full flex items-center justify-center mb-4 ring-8 ring-[#F4F4F5]/50">
                <Search className="w-7 h-7 text-[#A1A1AA]" />
              </div>
              <h3 className="text-[1.0625rem] font-bold text-[#18181B] mb-1">No users found</h3>
              <p className="text-[#71717A] text-[0.8125rem] max-w-[12.5rem] leading-relaxed">
                We couldn't find any users matching your search or filters.
              </p>
              <button
                onClick={clearSearch}
                className="mt-6 px-4 py-2 bg-white border border-[#E4E4E7] rounded-full text-[0.8125rem] font-medium text-[#18181B] shadow-sm hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
