import { useState, useEffect, useCallback } from "react";
import { logActivityApi } from "~/api/logActivityApi";
import type { LogActivityItem } from "~/api/types";

export interface LogActivity {
  id: string;
  user: {
    name: string;
    role: string;
    avatar?: string;
  };
  activity: string;
  description: string;
  actionType: string;
  action: string;
  date: string; // ISO string
  ipAddress: string;
  userAgent: string;
}

// Transform API response to frontend interface
function transformLogActivity(item: LogActivityItem): LogActivity {
  return {
    id: String(item.id),
    user: {
      name: item.user_name,
      role: item.role,
    },
    activity: item.action_type,
    description: item.description,
    actionType: item.action_type,
    action: item.action_type,
    date: item.created_at,
    ipAddress: item.ip_address,
    userAgent: item.user_agent,
  };
}

export function useLogActivity() {
  const [activities, setActivities] = useState<LogActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("All Role");
  const [selectedActionType, setSelectedActionType] = useState<string>("All Type");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const limit = 15;

  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Check if we need to use filter endpoint
      const hasFilters =
        selectedRole !== "All Role" ||
        selectedActionType !== "All Type" ||
        selectedDate !== undefined;

      let response;

      if (hasFilters) {
        // Use filter endpoint
        const params: {
          role?: string;
          action?: string;
          date?: number;
          page?: number;
          limit?: number;
        } = {
          page,
          limit,
        };

        if (selectedRole !== "All Role") {
          params.role = selectedRole.toLowerCase();
        }

        if (selectedActionType !== "All Type") {
          params.action = selectedActionType;
        }

        if (selectedDate) {
          // Convert to Unix timestamp (seconds)
          params.date = Math.floor(selectedDate.getTime() / 1000);
        }

        response = await logActivityApi.getFilteredLogs(params);
      } else {
        // Use normal logs endpoint
        response = await logActivityApi.getLogs({ page, limit });
      }

      const rows = response?.data?.rows || [];
      const transformedData = rows.map(transformLogActivity);
      setActivities(transformedData);
      setTotalPages(response?.data?.total_pages || 1);
      setTotalRows(response?.data?.total_rows || 0);
    } catch (err: any) {
      setError(err.message || "Failed to fetch activities");
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedRole, selectedActionType, selectedDate, page, limit]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedRole, selectedActionType, selectedDate]);

  // Client-side search filter (for user name and description)
  const filteredActivities = activities.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.user.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.actionType.toLowerCase().includes(query)
    );
  });

  return {
    activities: filteredActivities,
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
    // Pagination
    page,
    setPage,
    totalPages,
    totalRows,
  };
}

