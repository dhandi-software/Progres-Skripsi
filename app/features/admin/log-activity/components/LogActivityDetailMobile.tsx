import React from "react";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import type { LogActivity } from "../UseLogActivity";

interface LogActivityDetailMobileProps {
  activity: LogActivity;
  onBack: () => void;
}

export function LogActivityDetailMobile({ activity, onBack }: LogActivityDetailMobileProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white px-[1rem] py-[0.75rem] flex items-center gap-[0.75rem]">
        <button
          onClick={onBack}
          className="p-[0.5rem] hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-[1.5rem] h-[1.5rem] text-[#0D0D12]" />
        </button>
        <h1 className="text-[1.125rem] font-semibold text-[#0D0D12] leading-[1.75rem]">Activity Details</h1>
      </div>

      {/* Content */}
      <div className="flex-1 p-[1rem] flex flex-col gap-[1rem]">
        {/* Card */}
        <div className="bg-white rounded-lg p-[1rem] flex flex-col">
          {/* Title & Time Section */}
          <div className="flex flex-col gap-[0.25rem] pb-[1rem]">
            <p className="text-[1.125rem] font-semibold text-[#0A0A0A] leading-[1.75rem]">
              {activity.actionType}
            </p>
            <p className="text-[0.75rem] font-normal text-[#737373] leading-[1rem]">
              {format(new Date(activity.date), "d MMMM yyyy 'at' HH:mm")}
            </p>
          </div>

          {/* User Row */}
          <div className="flex gap-[1.5rem] items-start py-[1rem] border-t border-b border-[#E5E5E5]">
            <p className="w-[5rem] shrink-0 text-[0.875rem] font-medium text-[#737373] leading-[1.25rem]">
              User
            </p>
            <p className="text-[0.875rem] font-medium text-[#0A0A0A] leading-[1.25rem] whitespace-nowrap">
              {activity.user.name}
            </p>
          </div>

          {/* Role Row */}
          <div className="flex gap-[1.5rem] items-start py-[1rem] border-b border-[#E5E5E5]">
            <p className="w-[5rem] shrink-0 text-[0.875rem] font-medium text-[#737373] leading-[1.25rem]">
              Role
            </p>
            <p className="text-[0.875rem] font-medium text-[#0A0A0A] leading-[1.25rem] whitespace-nowrap">
              {activity.user.role}
            </p>
          </div>

          {/* Log ID Row */}
          <div className="flex gap-[1.5rem] items-start py-[1rem] border-b border-[#E5E5E5]">
            <p className="w-[5rem] shrink-0 text-[0.875rem] font-medium text-[#737373] leading-[1.25rem]">
              Log ID
            </p>
            <p className="text-[0.875rem] font-medium text-[#0A0A0A] leading-[1.25rem] whitespace-nowrap">
              {activity.id}
            </p>
          </div>

          {/* Description Section */}
          <div className="flex flex-col gap-[0.5rem] pt-[1rem]">
            <p className="text-[1rem] font-bold text-[#0A0A0A] leading-[1.5rem]">
              Description
            </p>
            <p className="text-[0.875rem] font-normal text-black leading-[1.25rem]">
              {activity.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
