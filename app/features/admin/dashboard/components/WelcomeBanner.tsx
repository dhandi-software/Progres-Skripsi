import { X, CheckSquare } from "lucide-react";

interface WelcomeBannerProps {
  userName: string;
  onClose?: () => void;
}

export function WelcomeBanner({
  userName,
  onClose,
}: WelcomeBannerProps) {
  return (
    <div className="bg-white border border-[#E9E9E9] rounded-2xl p-2 pr-4 shadow-sm inline-flex items-center gap-3">
      <div className="flex items-center gap-2 bg-[#ECFDF3] border border-[#ABEFC6] rounded-xl px-3 py-1.5">
        <CheckSquare className="w-4 h-4 text-[#12B76A]" />
        <span className="text-[0.8125rem] font-medium text-[#027A48] whitespace-nowrap">
          Welcome back, {userName}!
        </span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
