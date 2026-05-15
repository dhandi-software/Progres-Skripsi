import React from "react";
import { FileText } from "lucide-react";
import { getStatusPenilaian } from "../../utils/bimbinganUtils";

interface MobileStudentCardProps {
    pengajuan: any;
    handleStudentClick: (pengajuan: any) => void;
}

export const MobileStudentCard: React.FC<MobileStudentCardProps> = ({
    pengajuan,
    handleStudentClick
}) => {
    const mhs = pengajuan.mahasiswa;
    const bimbinganList = mhs.bimbingan || [];
    const activeTask = bimbinganList.length > 0 ? bimbinganList[0] : null;

    return (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4 active:scale-[0.98] transition-transform duration-200">
            <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                    <div className="flex flex-col gap-1.5 items-start">
                        <h3 className="font-bold text-gray-900 text-[15px] leading-tight">{mhs.nama}</h3>
                        {activeTask?.status === 'SUBMITTED' && (
                            <span className="bg-red-50 text-red-600 text-[9px] px-2 py-0.5 rounded-lg border border-red-100 font-black uppercase tracking-widest whitespace-nowrap inline-flex">BARU</span>
                        )}
                    </div>
                    <p className="text-[11px] font-mono text-gray-400 mt-1.5">{mhs.nim}</p>
                </div>
                <button 
                    onClick={() => handleStudentClick(pengajuan)}
                    className="px-4 py-2 bg-[#119DA4] text-white text-[11px] font-bold rounded-xl shadow-lg shadow-cyan-500/20 active:bg-cyan-700"
                >
                    Lihat
                </button>
            </div>

            <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-100/50">
                <p className="text-[11px] font-medium text-gray-600 leading-relaxed line-clamp-2 italic">
                    "{pengajuan.judul}"
                </p>
            </div>

            <div className="pt-2 border-t border-gray-50">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] mb-2.5 block">Target Saat Ini</span>
                {activeTask ? (
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0 border border-orange-100/50 shadow-sm">
                            <FileText className="w-5 h-5 text-orange-500" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[13px] font-bold text-gray-800 leading-tight">{activeTask.topik}</span>
                            <span className="text-[10px] text-gray-400 font-bold flex items-center gap-2 mt-0.5">
                                <span className={`w-2 h-2 rounded-full ${activeTask.status === 'APPROVED' ? 'bg-green-500' : 'bg-orange-500'} shadow-sm shadow-current/20`} />
                                {getStatusPenilaian(activeTask.status)}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="py-2 text-[11px] text-gray-400 font-bold bg-gray-50/50 rounded-lg px-3 inline-block">Batas Belum Diatur</div>
                )}
            </div>
        </div>
    );
};
