import { useAuth } from "~/hooks/useAuth";
import { useEffect, useState } from "react";
import { adminApi } from "~/api/admin";
import { Users, Loader2, ChevronRight, ClipboardList } from "lucide-react";
import { cn } from "~/lib/utils";

export function DashboardMobile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"belum" | "sudah">("belum");
  const [studentsWithoutProposal, setStudentsWithoutProposal] = useState<any[]>([]);
  const [studentsWithProposal, setStudentsWithProposal] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resBelum, resSudah] = await Promise.all([
          adminApi.getMahasiswaTanpaPengajuan(),
          adminApi.getMahasiswaSudahPengajuan()
        ]);
        setStudentsWithoutProposal(resBelum.data);
        setStudentsWithProposal(resSudah.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  return (
    <div className="p-4 font-geist pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm">Membantu administrasi kegiatan KP</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div 
          onClick={() => setActiveTab("belum")}
          className={cn(
            "p-4 rounded-2xl border transition-all",
            activeTab === "belum" ? "bg-orange-50 border-orange-200 ring-2 ring-orange-500/20" : "bg-white border-gray-100"
          )}
        >
          <div className={cn("p-2 rounded-lg w-fit mb-2", activeTab === "belum" ? "bg-orange-500 text-white" : "bg-orange-100 text-orange-600")}>
             <Users size={18} />
          </div>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Belum</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{studentsWithoutProposal.length}</p>
        </div>

        <div 
          onClick={() => setActiveTab("sudah")}
          className={cn(
            "p-4 rounded-2xl border transition-all",
            activeTab === "sudah" ? "bg-blue-50 border-blue-200 ring-2 ring-blue-500/20" : "bg-white border-gray-100"
          )}
        >
          <div className={cn("p-2 rounded-lg w-fit mb-2", activeTab === "sudah" ? "bg-blue-500 text-white" : "bg-blue-100 text-blue-600")}>
             <ClipboardList size={18} />
          </div>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Sudah</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{studentsWithProposal.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4 min-h-[300px]">
        <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <h2 className="font-black text-gray-800 text-[11px] uppercase tracking-widest">
                {activeTab === "belum" ? "Mahasiswa Tanpa Judul" : "Mahasiswa Sudah KP"}
            </h2>
        </div>
        <div className="divide-y divide-gray-50">
            {loading ? (
                <div className="p-12 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-[#D25026]" />
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sinkronisasi...</p>
                </div>
            ) : activeTab === "belum" ? (
                studentsWithoutProposal.length > 0 ? (
                    studentsWithoutProposal.map((student) => (
                        <div key={student.id} className="p-5 flex items-center justify-between active:bg-gray-50 transition-colors">
                            <div className="flex flex-col gap-0.5">
                                <span className="font-bold text-gray-800 text-sm leading-tight">{student.nama}</span>
                                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter">
                                    {student.nim} • {student.jurusan}
                                </span>
                            </div>
                            <ChevronRight size={14} className="text-gray-300" />
                        </div>
                    ))
                ) : (
                    <div className="p-12 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest opacity-50 italic">
                        Semua mahasiswa sudah beres.
                    </div>
                )
            ) : (
                studentsWithProposal.length > 0 ? (
                    studentsWithProposal.map((item) => (
                        <div key={item.id} className="p-5 flex flex-col gap-3 active:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col">
                                    <span className="font-bold text-gray-800 text-sm leading-tight">{item.mahasiswa?.nama}</span>
                                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter">{item.mahasiswa?.nim}</span>
                                </div>
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                    item.status === 'APPROVED' ? "bg-green-50 text-green-600 border-green-100" :
                                    item.status === 'REJECTED' ? "bg-red-50 text-red-600 border-red-100" :
                                    "bg-orange-50 text-orange-600 border-orange-100"
                                )}>
                                    {item.status}
                                </span>
                            </div>
                            <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100">
                                <p className="text-[11px] font-bold text-gray-600 leading-snug line-clamp-2">{item.judul}</p>
                                <p className="text-[9px] text-gray-400 mt-1 uppercase font-black tracking-widest italic">{item.dosen?.nama}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-12 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest opacity-50 italic">
                        Belum ada data pengajuan.
                    </div>
                )
            )}
        </div>
      </div>
    </div>
  );
}
