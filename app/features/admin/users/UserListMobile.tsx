import { useState, useEffect } from "react";
import { Plus, Search, Filter, Monitor } from "lucide-react";
import { adminApi } from "~/api/admin";
import { cn } from "~/lib/utils";
import { CreateAccountMobile } from "../create-account/CreateAccountMobile"; // Leveraging existing mobile form
import {
    Drawer,
    DrawerContent,
    DrawerTrigger,
} from "~/components/ui/drawer";
import { useSidebar } from "~/components/ui/sidebar"; // Assuming we need this for menu trigger or similar

export default function UserListMobile() {
    const [activeTab, setActiveTab] = useState<"mahasiswa" | "dosen">("mahasiswa");
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Fetch logic would go here similar to Desktop

    return (
        <div className="w-full min-h-screen bg-gray-50 pb-20 font-geist">
             <div className="bg-white px-6 py-6 sticky top-0 z-10 border-b border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold text-gray-900">User Management</h1>
                    <Drawer open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DrawerTrigger asChild>
                             <button className="w-10 h-10 bg-[#D25026] text-white rounded-full flex items-center justify-center shadow-md">
                                <Plus size={20} />
                            </button>
                        </DrawerTrigger>
                        <DrawerContent className="h-[90vh]">
                             <div className="h-full overflow-y-auto">
                                <CreateAccountMobile />
                             </div>
                        </DrawerContent>
                    </Drawer>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-gray-100 rounded-lg">
                    {(["mahasiswa", "dosen"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "flex-1 py-2 text-sm font-medium rounded-md transition-all capitalize",
                                activeTab === tab
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Placeholder */}
             <div className="p-6 flex flex-col items-center justify-center text-gray-400 min-h-[50vh]">
                <Monitor size={48} className="mb-3 opacity-20" />
                <p>User list will appear here.</p>
                <p className="text-xs text-center mt-2">Swipe down to refresh (future feature)</p>
            </div>
        </div>
    );
}
