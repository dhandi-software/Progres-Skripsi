import { Search, X, ChevronDown, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useManageAccount, type UserAccount } from "./UseManageAccount";
import { cn } from "~/lib/utils";
import { useNavigate, useLocation } from "react-router";
import { Toast } from "~/components/ui/toast";
import { Button } from "~/components/ui/button";

export const ManageAccountDesktop = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [successToast, setSuccessToast] = useState<{ title: string; variant: "success" | "destructive" | "default" } | null>(null);

  useEffect(() => {
    if (location.state?.toast) {
      setSuccessToast(location.state.toast);
      // Clear location state to prevent toast from reappearing on refresh
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
    <div className="p-10 w-full font-geist relative">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-10 right-10 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
          <Toast
            title={successToast.title}
            variant={successToast.variant}
            onClose={() => setSuccessToast(null)}
          />
        </div>
      )}
      {/* Header Section */}
      <div className="mb-10">
        <h1 className="text-[2rem] font-semibold text-[#18181B] leading-tight mb-2">
          Manage Account
        </h1>
        <p className="text-[#71717A] text-[0.875rem]">
          You can find account information for each role.
        </p>
      </div>

      {/* Filters Section */}
      <div className="flex justify-end items-center gap-3 mb-6">
        {/* Role Filter */}
        <div className="relative" ref={filterRef}>
          <Button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={cn(
              "flex items-center justify-between w-[12.5rem] px-4 py-2.5 rounded-lg border border-[#E4E4E7] bg-white text-[0.875rem] transition-all",
              isFilterOpen ? "ring-2 ring-[#D25026]/10 border-[#D25026]" : "hover:border-gray-300"
            )}
          >
            <span className={cn(roleFilter ? "text-[#18181B]" : "text-[#71717A]")}>
              {roleFilter || "Role Filter"}
            </span>
            <ChevronDown className={cn("w-4 h-4 text-[#71717A] transition-transform", isFilterOpen && "rotate-180")} />
          </Button>

          {isFilterOpen && (
            <div className="absolute top-full left-0 mt-2 w-full bg-white border border-[#E4E4E7] rounded-lg shadow-lg z-20 py-1 animate-in fade-in slide-in-from-top-1 duration-200">
              <button
                onClick={() => {
                  handleRoleFilterChange(null);
                  setIsFilterOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-[0.875rem] hover:bg-[#F4F4F5] transition-colors"
              >
                All Roles
              </button>
              {roles.map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    handleRoleFilterChange(role);
                    setIsFilterOpen(false);
                  }}
                  className={cn(
                    "w-full px-4 py-2 text-left text-[0.875rem] hover:bg-[#F4F4F5] transition-colors capitalize",
                    roleFilter === role && "bg-[#F4F4F5] font-medium"
                  )}
                >
                  {role}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="relative w-[21.25rem]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
          <input
            type="text"
            placeholder="Search user"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-[#E4E4E7] focus:outline-none focus:ring-2 focus:ring-[#D25026]/10 focus:border-[#D25026] text-[0.875rem] transition-all"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-3.5 h-3.5 text-[#A1A1AA]" />
            </button>
          )}
        </div>
      </div>

      {/* User List Table */}
      <div className="bg-white border border-[#E4E4E7] rounded-xl overflow-hidden shadow-sm">
        {filteredUsers.length > 0 ? (
          <div className="flex flex-col">
            {filteredUsers.map((user, index) => (
              <div
                key={user.id}
                onClick={() => navigate(`/admin/account-detail/${user.id}`)}
                className={cn(
                  "flex items-center justify-between p-4 hover:bg-[#FAFAFA] transition-colors group cursor-pointer",
                  index !== filteredUsers.length - 1 && "border-bottom border-[#F4F4F5]"
                )}
                style={{ borderBottom: index !== filteredUsers.length - 1 ? "0.0625rem solid #F4F4F5" : "none" }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-[#E4E4E7]">
                    <img
                      src={user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=placeholder"}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-[1rem] font-semibold text-[#18181B] leading-tight">
                      {user.name}
                    </h3>
                    <p className="text-[0.75rem] text-[#A1A1AA]">
                      {user.handle}
                    </p>
                    <div className="mt-1">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-md text-[0.625rem] font-bold uppercase tracking-wider",
                        getRoleBadgeStyles(user.role)
                      )}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#A1A1AA] group-hover:text-[#18181B] transition-all group-hover:translate-x-1" />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-[#F4F4F5] rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-[#A1A1AA]" />
            </div>
            <h3 className="text-[1.125rem] font-semibold text-[#18181B] mb-1">No users found</h3>
            <p className="text-[#A1A1AA] text-[0.875rem]">
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
