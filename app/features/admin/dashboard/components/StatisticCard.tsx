import type { LucideIcon } from "lucide-react";
import { cn } from "~/lib/utils";

interface StatisticCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export function StatisticCard({
  title,
  value,
  icon: Icon,
  trend,
  className = "",
}: StatisticCardProps) {
  return (
    <div
      className={cn(
        "bg-white border border-[#E5E5E5] rounded-2xl p-5 flex flex-col gap-4 shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[0.875rem] font-medium text-[#71717A]">{title}</span>
        <Icon className="w-5 h-5 text-[#71717A]" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-[1.25rem] font-bold text-[#0D0D12]">
          {value}
        </h3>
        {trend && (
          <p
            className={cn(
              "text-[0.75rem] font-medium",
              trend.isPositive ? "text-[#12B76A]" : "text-[#F04438]"
            )}
          >
            {trend.value}
          </p>
        )}
      </div>
    </div>
  );
}
