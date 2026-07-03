import { useAuth } from "~/hooks/useAuth";
import { useEffect, useState } from "react";
import { adminApi } from "~/api/admin";
import { ClipboardList, Users, MessageSquare, Loader2, Search } from "lucide-react";
import { cn } from "~/lib/utils";

export function DashboardDesktop() {
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
    <div className="p-8 font-geist">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">Membantu administrasi kegiatan KP</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div 
          onClick={() => setActiveTab("belum")}
          className={cn(
            "p-6 rounded-xl border shadow-sm flex items-start gap-4 cursor-pointer transition-all",
             activeTab === "belum" ? "bg-orange-50 border-orange-200 ring-2 ring-orange-500/20" : "bg-white border-gray-200 hover:border-gray-300"
          )}
        >
          <div className={cn("p-3 rounded-lg", activeTab === "belum" ? "bg-orange-500 text-white" : "bg-orange-100 text-orange-600")}>
             <Users size={24} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Belum Mengajukan</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{studentsWithoutProposal.length}</p>
            <p className="text-xs text-gray-400 mt-1">Mahasiswa tanpa judul</p>
          </div>
        </div>
        
        <div 
          onClick={() => setActiveTab("sudah")}
          className={cn(
             "p-6 rounded-xl border shadow-sm flex items-start gap-4 cursor-pointer transition-all",
             activeTab === "sudah" ? "bg-blue-50 border-blue-200 ring-2 ring-blue-500/20" : "bg-white border-gray-200 hover:border-gray-300"
          )}
        >
          <div className={cn("p-3 rounded-lg", activeTab === "sudah" ? "bg-blue-500 text-white" : "bg-blue-100 text-blue-600")}>
             <ClipboardList size={24} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Sudah Mengajukan</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{studentsWithProposal.length}</p>
            <p className="text-xs text-gray-400 mt-1">Mahasiswa sudah KP</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4 opacity-40 grayscale">
          <div className="p-3 bg-green-100 rounded-lg text-green-600">
             <MessageSquare size={24} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pesan Masuk</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">0</p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
            <h2 className="font-bold text-gray-800">
                {activeTab === "belum" ? "Daftar Mahasiswa Belum Mengajukan Judul" : "Daftar Mahasiswa Sudah Mengajukan Judul"}
            </h2>
            <div className="flex items-center gap-3">
                 <span className={cn(
                    "text-xs font-semibold px-2 py-1 rounded-md",
                    activeTab === "belum" ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"
                 )}>
                    {activeTab === "belum" ? studentsWithoutProposal.length : studentsWithProposal.length} MAHASISWA
                </span>
            </div>
        </div>
        
        <div className="overflow-x-auto">
            {loading ? (
                <div className="p-20 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-[#D25026]" />
                    <p className="text-sm text-gray-400 italic">Sinkronisasi data...</p>
                </div>
            ) : activeTab === "belum" ? (
                studentsWithoutProposal.length > 0 ? (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">No</th>
                                <th className="px-6 py-4">Nama Mahasiswa</th>
                                <th className="px-6 py-4">NIM</th>
                                <th className="px-6 py-4">Email</th>

                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {studentsWithoutProposal.map((student, idx) => (
                                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-gray-400 font-medium">{idx + 1}</td>
                                    <td className="px-6 py-4 font-bold text-gray-800">{student.nama}</td>
                                    <td className="px-6 py-4 font-mono text-gray-600">{student.nim}</td>
                                    <td className="px-6 py-4 text-gray-500">{student.user?.email}</td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-20 text-center text-gray-400 italic">
                        Semua mahasiswa sudah mengajukan judul.
                    </div>
                )
            ) : (
                studentsWithProposal.length > 0 ? (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">No</th>
                                <th className="px-6 py-4">Mahasiswa</th>
                                <th className="px-6 py-4">Judul KP</th>
                                <th className="px-6 py-4">Pembimbing</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {studentsWithProposal.map((item, idx) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-gray-400 font-medium">{idx + 1}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-800">{item.mahasiswa?.nama}</span>
                                            <span className="text-[11px] text-gray-400 uppercase tracking-tighter">{item.mahasiswa?.nim}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-gray-700 line-clamp-1 max-w-xs">{item.judul}</p>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 font-medium">{item.dosen?.nama}</td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                            item.status === 'APPROVED' ? "bg-green-50 text-green-600 border-green-100" :
                                            item.status === 'REJECTED' ? "bg-red-50 text-red-600 border-red-100" :
                                            "bg-orange-50 text-orange-600 border-orange-100"
                                        )}>
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-20 text-center text-gray-400 italic">
                        Belum ada pengajuan judul yang masuk.
                    </div>
                )
            )}
        </div>
      </div>
    </div>
  );
}
