import React from "react";
import { User, Eye } from "lucide-react";

interface Activity {
  id: number;
  title: string;
  category: string[];
  topics: string[];
  author: string;
  status: "Published" | "Edited by editor";
  views: number;
  timestamp: string;
}

interface LatestActivityCardProps {
  activity: Activity;
}

export function LatestActivityCard({ activity }: LatestActivityCardProps) {
  const isPublished = activity.status === "Published";

  return (
    <div className="bg-white rounded-2xl border border-[#E5E5E5] p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Status Tag */}
      <div className="flex">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${isPublished
          ? "bg-[#F0F9FF] border-[#B9E6FE] text-[#0086C9]"
          : "bg-[#FFF4ED] border-[#FDCCAB] text-[#D25026]"
          }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isPublished ? "bg-[#0086C9]" : "bg-[#D25026]"}`} />
          <span className="text-[0.75rem] font-medium">{activity.status}</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-[1.0625rem] font-bold text-[#0D0D12] leading-tight line-clamp-3">
        {activity.title}
      </h3>

      {/* Categories & Topics */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {activity.category.map((cat, index) => (
            <span key={index} className="bg-[#F2F4F7] text-[#344054] px-2.5 py-1 rounded-md text-[0.8125rem] font-medium">
              {cat}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {activity.topics.map((topic, index) => (
            <span key={index} className="text-[#D25026] text-[0.8125rem] font-medium">
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#F2F4F7] w-full" />

      {/* Metadata */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-[#71717A]">
          <div className="flex items-center gap-2">
            <div className="bg-[#F2F4F7] p-1.5 rounded-full">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="text-[0.8125rem] font-medium">{activity.author}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            <span className="text-[0.8125rem] font-medium">{activity.views}</span>
          </div>
        </div>
        <div className="text-[0.8125rem] text-[#71717A] leading-none">
          Published on {activity.timestamp}
        </div>
      </div>
    </div>
  );
}
