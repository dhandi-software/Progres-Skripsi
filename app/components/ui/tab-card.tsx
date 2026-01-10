import React, { useState } from "react";

interface Tab {
    id: string;
    label: string;
    count?: number;
}

interface TabsCardProps {
    tabs?: Tab[];
    defaultActiveTab?: string;
    onTabChange?: (tabId: string) => void;
    variant?: "default" | "withCount";
    className?: string;
}

const TabsCard: React.FC<TabsCardProps> = ({
    tabs = [
        { id: "all", label: "All", count: 12 },
        { id: "published", label: "Published", count: 8 },
        { id: "pending", label: "Pending", count: 3 },
        { id: "revision", label: "Revision", count: 1 },
    ],
    defaultActiveTab = "all",
    onTabChange,
    variant = "default",
    className = "",
}) => {
    const [activeTab, setActiveTab] = useState(defaultActiveTab);

    const handleTabClick = (tabId: string) => {
        setActiveTab(tabId);
        onTabChange?.(tabId);
    };

    return (
        <div
            className={`w-[37.25rem] h-fit px-[0.25rem] py-[0.25rem] rounded-[0.625rem] bg-[#F5F5F5] ${className}`}
        >
            <div className="flex items-center gap-[0.25rem]">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className={`flex items-center justify-center w-full h-fit px-[1.125rem] py-[0.5rem] rounded-[0.375rem] shadow-xs transition-all duration-200 ${
                            activeTab === tab.id
                                ? "bg-background text-foreground font-medium"
                                : "bg-transparent text-foreground/80 hover:bg-white/50"
                        }`}
                    >
                        {variant === "withCount" && tab.count !== undefined ? (
                            <div className="flex items-center gap-[0.5rem]">
                                <span className="text-label text-inherit">
                                    {tab.label}
                                </span>
                                <span
                                    className={`px-[0.375rem] py-[0.125rem] rounded-full text-label-sm ${
                                        activeTab === tab.id
                                            ? "bg-foreground/10 text-foreground"
                                            : "bg-foreground/5 text-foreground/60"
                                    }`}
                                >
                                    {tab.count}
                                </span>
                            </div>
                        ) : (
                            <span className="text-label text-inherit">
                                {tab.label}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TabsCard;
