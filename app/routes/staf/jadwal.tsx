import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate, useSearchParams } from "react-router";
import type { ContextType } from "~/root";
import StafJadwalDesktop from "~/features/staf/jadwal/StafJadwalDesktop";
import StafJadwalMobile from "~/features/staf/jadwal/StafJadwalMobile";
import { StafSidangDesktop, StafSidangMobile } from "~/features/staf/sidang";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";
import { Toast } from "~/components/ui/toast";

export default function JadwalPage() {
    const { isMobile } = useOutletContext<ContextType>();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    
    const defaultTab = (searchParams.get("tab") as any) || "PENGARAHAN_KP";
    const [activeTab, setActiveTab] = useState<"PENGARAHAN_KP" | "PENGARAHAN_SIDANG">(defaultTab);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        if (searchParams.get("success") === "true") {
            setShowToast(true);
            const newParams = new URLSearchParams(searchParams);
            newParams.delete("success");
            setSearchParams(newParams, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 font-inter p-4 md:p-8 relative">
            {/* Toast Notification */}
            {showToast && (
                <div className="fixed top-4 right-4 z-50">
                    <Toast 
                        title="Jadwal berhasil dibuat!" 
                        onClose={() => setShowToast(false)} 
                    />
                </div>
            )}

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white gap-4 sm:gap-0">
                    <div>
                        <h1 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight">Manajemen Jadwal & Sidang</h1>
                        <p className="text-xs md:text-sm text-gray-500 mt-1">Kelola jadwal pengarahan KP dan pengumpulan sidang mahasiswa.</p>
                    </div>
                    <Button 
                        onClick={() => navigate(`/staf/jadwal/create?tipe=${activeTab}`)} 
                        className="h-10 md:h-11 px-4 md:px-6 rounded-xl font-bold flex items-center gap-2 shadow-sm text-sm bg-[#119DA4] hover:bg-[#0f8b91] text-white w-full sm:w-auto justify-center"
                    >
                        <Plus className="w-4 h-4 md:w-5 md:h-5" /> Buat Jadwal Baru
                    </Button>
                </div>

                {/* Tabs */}
                <div className="bg-white px-4 md:px-8 flex space-x-6 overflow-x-auto border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab("PENGARAHAN_KP")}
                        className={`py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === "PENGARAHAN_KP" ? "border-[#119DA4] text-[#119DA4]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                    >
                        Pengarahan KP
                    </button>
                    <button
                        onClick={() => setActiveTab("PENGARAHAN_SIDANG")}
                        className={`py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === "PENGARAHAN_SIDANG" ? "border-[#119DA4] text-[#119DA4]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                    >
                        Pengumpulan Laporan Sidang
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 -mx-8 mt-4">
                {isMobile ? <StafJadwalMobile filterTipe={activeTab} /> : <StafJadwalDesktop filterTipe={activeTab} />}
            </div>
        </div>
    );
}
