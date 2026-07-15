import { useAuth } from "~/hooks/useAuth";
import { useEffect, useState } from "react";
import { adminApi } from "~/api/admin";
import { ClipboardList, Users, MessageSquare, Loader2, ChevronLeft, ChevronRight, Eye, Briefcase, CalendarDays, Building2, MapPin, Phone, FileText, Search, X } from "lucide-react";
import { cn } from "~/lib/utils";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

const ITEMS_PER_PAGE = 10;

function getPaginationGroup(currentPage: number, totalPages: number) {
    if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
        return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (currentPage >= totalPages - 2) {
        return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
}

export function DashboardDesktop() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"belum" | "sudah">("belum");
  
  const [studentsWithoutProposal, setStudentsWithoutProposal] = useState<any[]>([]);
  const [studentsWithProposal, setStudentsWithProposal] = useState<any[]>([]);
  
  const [pageBelum, setPageBelum] = useState(1);
  const [pageSudah, setPageSudah] = useState(1);
  
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
        setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resBelum, resSudah] = await Promise.all([
            adminApi.getMahasiswaTanpaPengajuan(debouncedSearch),
            adminApi.getMahasiswaSudahPengajuan(debouncedSearch)
        ]);
        setStudentsWithoutProposal(resBelum.data);
        setStudentsWithProposal(resSudah.data);
        setPageBelum(1);
        setPageSudah(1);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [debouncedSearch]);

  const handleDownloadPDF = async () => {
    try {
        const jsPDF = (await import("jspdf")).default;
        const autoTable = (await import("jspdf-autotable")).default;
        
        const doc = new jsPDF();
        
        doc.setFontSize(16);
        const title = activeTab === "belum" ? "Laporan Mahasiswa Belum Mengajukan Judul" : "Laporan Mahasiswa Sudah Mengajukan Judul";
        doc.text(title, 14, 22);
        
        doc.setFontSize(10);
        doc.text(`Dicetak pada: ${format(new Date(), "dd MMMM yyyy HH:mm", { locale: localeId })}`, 14, 30);
        
        const tableData = activeTab === "belum" 
            ? studentsWithoutProposal.map((s, i) => [i + 1, s.nama, s.nim, s.email || "-"])
            : studentsWithProposal.map((s, i) => [
                i + 1, 
                s.mahasiswa?.nama || "-", 
                s.mahasiswa?.nim || "-", 
                s.judul || "-", 
                s.dosen?.nama || "-", 
                s.status || "-"
              ]);
              
        const head = activeTab === "belum" 
            ? [["No", "Nama Mahasiswa", "NIM", "Email"]]
            : [["No", "Nama Mahasiswa", "NIM", "Judul", "Dosen Pembimbing", "Status"]];
            
        autoTable(doc, {
            startY: 35,
            head: head,
            body: tableData,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [41, 128, 185] }
        });
        
        doc.save(`Laporan_Mahasiswa_${activeTab}_Pengajuan.pdf`);
    } catch (e) {
        console.error("Gagal membuat PDF", e);
    }
  };
  
  const totalBelum = Math.ceil(studentsWithoutProposal.length / ITEMS_PER_PAGE);
  const totalSudah = Math.ceil(studentsWithProposal.length / ITEMS_PER_PAGE);
  
  const paginatedBelum = studentsWithoutProposal.slice((pageBelum - 1) * ITEMS_PER_PAGE, pageBelum * ITEMS_PER_PAGE);
  const paginatedSudah = studentsWithProposal.slice((pageSudah - 1) * ITEMS_PER_PAGE, pageSudah * ITEMS_PER_PAGE);

  const renderPagination = (currentPage: number, totalPages: number, setPage: (p: number) => void) => {
      if (totalPages <= 1) return null;
      const pages = getPaginationGroup(currentPage, totalPages);
      
      return (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white/50 backdrop-blur-sm">
              <span className="text-sm text-gray-500">
                  Halaman <span className="font-semibold text-gray-900">{currentPage}</span> dari <span className="font-semibold text-gray-900">{totalPages}</span>
              </span>
              <div className="flex items-center gap-1">
                  <button
                      onClick={() => setPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600"
                  >
                      <ChevronLeft size={16} />
                  </button>
                  {pages.map((p, i) => (
                      <button
                          key={i}
                          onClick={() => typeof p === 'number' && setPage(p)}
                          disabled={p === '...'}
                          className={cn(
                              "w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200",
                              p === currentPage 
                                ? activeTab === "belum" ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" : "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                                : p === '...' ? "text-gray-400 cursor-default" : "text-gray-600 hover:bg-gray-100"
                          )}
                      >
                          {p}
                      </button>
                  ))}
                  <button
                      onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600"
                  >
                      <ChevronRight size={16} />
                  </button>
              </div>
          </div>
      );
  };

  const openDetail = (studentData: any) => {
      setSelectedStudent(studentData);
      setIsDetailOpen(true);
  };

  const latestTempatKP = selectedStudent?.mahasiswa?.tempatKP?.[0];
  const logbooks = selectedStudent?.mahasiswa?.logbook || [];

  return (
    <div className="p-8 font-geist min-h-screen bg-gray-50/50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Staf</h1>
        <p className="text-gray-500 mt-2 text-sm">Pantau dan kelola administrasi kegiatan Kerja Praktik Mahasiswa</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div 
          onClick={() => { setActiveTab("belum"); setPageBelum(1); }}
          className={cn(
            "p-6 rounded-2xl border shadow-sm flex items-start gap-5 cursor-pointer transition-all duration-300 relative overflow-hidden group",
             activeTab === "belum" ? "bg-white border-orange-200 ring-4 ring-orange-500/10" : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md"
          )}
        >
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300", activeTab === "belum" ? "from-orange-50 to-transparent opacity-100" : "group-hover:from-gray-50")}></div>
          <div className={cn("p-4 rounded-xl relative z-10 transition-colors", activeTab === "belum" ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30" : "bg-orange-50 text-orange-600")}>
             <Users size={28} />
          </div>
          <div className="relative z-10">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Belum Mengajukan</h3>
            <p className="text-4xl font-black text-gray-900 tracking-tight">{studentsWithoutProposal.length}</p>
            <p className="text-xs text-gray-400 mt-2 font-medium">Mahasiswa tanpa judul</p>
          </div>
        </div>
        
        <div 
          onClick={() => { setActiveTab("sudah"); setPageSudah(1); }}
          className={cn(
             "p-6 rounded-2xl border shadow-sm flex items-start gap-5 cursor-pointer transition-all duration-300 relative overflow-hidden group",
             activeTab === "sudah" ? "bg-white border-blue-200 ring-4 ring-blue-500/10" : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md"
          )}
        >
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300", activeTab === "sudah" ? "from-blue-50 to-transparent opacity-100" : "group-hover:from-gray-50")}></div>
          <div className={cn("p-4 rounded-xl relative z-10 transition-colors", activeTab === "sudah" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" : "bg-blue-50 text-blue-600")}>
             <ClipboardList size={28} />
          </div>
          <div className="relative z-10">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Sudah Mengajukan</h3>
            <p className="text-4xl font-black text-gray-900 tracking-tight">{studentsWithProposal.length}</p>
            <p className="text-xs text-gray-400 mt-2 font-medium">Mahasiswa aktif KP</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-5 opacity-50 grayscale relative overflow-hidden">
          <div className="p-4 bg-green-50 rounded-xl text-green-600 relative z-10">
             <MessageSquare size={28} />
          </div>
          <div className="relative z-10">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Pesan Masuk</h3>
            <p className="text-4xl font-black text-gray-900 tracking-tight">0</p>
            <p className="text-xs text-gray-400 mt-2 font-medium">Belum ada pesan baru</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
            <div className="flex flex-col gap-1">
                <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                    {activeTab === "belum" ? "Mahasiswa Belum Mengajukan Judul" : "Mahasiswa Sudah Mengajukan Judul"}
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                    {activeTab === "belum" ? "Daftar mahasiswa yang belum memulai proses KP" : "Pantau progres dan detail aktivitas KP mahasiswa"}
                </p>
            </div>
            <div className="flex items-center gap-3">
                 <div className="relative">
                     <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                     <input 
                         type="text" 
                         placeholder="Cari Nama / NIM..." 
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-64 transition-all"
                     />
                 </div>
                 <span className={cn(
                    "text-xs font-bold px-3 py-1.5 rounded-lg border whitespace-nowrap",
                    activeTab === "belum" ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-blue-50 text-blue-600 border-blue-100"
                 )}>
                    TOTAL: {activeTab === "belum" ? studentsWithoutProposal.length : studentsWithProposal.length}
                </span>
                <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors shadow-sm"
                >
                    <FileText size={14} />
                    Download PDF
                </button>
            </div>
        </div>
        
        <div className="overflow-x-auto flex-1">
            {loading ? (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
                    <p className="text-sm text-gray-500 font-medium animate-pulse">Memuat data mahasiswa...</p>
                </div>
            ) : activeTab === "belum" ? (
                paginatedBelum.length > 0 ? (
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-gray-50/50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-5">No</th>
                                <th className="px-8 py-5">Nama Mahasiswa</th>
                                <th className="px-8 py-5">NIM</th>
                                <th className="px-8 py-5">Email</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {paginatedBelum.map((student, idx) => (
                                <tr key={student.id} className="hover:bg-gray-50/80 transition-colors group">
                                    <td className="px-8 py-5 text-gray-400 font-medium w-16">
                                        {(pageBelum - 1) * ITEMS_PER_PAGE + idx + 1}
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{student.nama}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded-md text-xs">{student.nim}</span>
                                    </td>
                                    <td className="px-8 py-5 text-gray-500">{student.email || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="h-full min-h-[300px] flex flex-col items-center justify-center gap-3">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                            <Users size={32} className="text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-medium">Tidak ada data</p>
                        <p className="text-sm text-gray-400">Semua mahasiswa sudah mengajukan judul.</p>
                    </div>
                )
            ) : (
                paginatedSudah.length > 0 ? (
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-gray-50/50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-5">No</th>
                                <th className="px-8 py-5">Mahasiswa</th>
                                <th className="px-8 py-5">Pengajuan Judul</th>
                                <th className="px-8 py-5">Detail KP</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {paginatedSudah.map((item, idx) => (
                                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-8 py-5 text-gray-400 font-medium w-16">
                                        {(pageSudah - 1) * ITEMS_PER_PAGE + idx + 1}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200 shadow-sm">
                                                {item.mahasiswa?.nama?.charAt(0) || 'M'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{item.mahasiswa?.nama}</span>
                                                <span className="text-xs text-slate-500 font-medium">{item.mahasiswa?.nim}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col gap-1.5">
                                            <p className="font-semibold text-slate-800">{item.judul}</p>
                                            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md w-fit text-slate-700 font-medium text-xs mt-1">
                                                <Briefcase size={13} className="text-blue-500 shrink-0" />
                                                <span>{item.dosen?.nama || '-'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3 text-slate-700 font-medium text-xs">
                                            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
                                                <Building2 size={13} className={item.mahasiswa?.tempatKP?.[0]?.namaPerusahaan ? "text-orange-500 shrink-0" : "text-slate-300 shrink-0"} />
                                                <span>
                                                    {item.mahasiswa?.tempatKP?.[0]?.namaPerusahaan || <span className="text-slate-400 italic">Belum diset</span>}
                                                </span>
                                            </div>
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-semibold shadow-sm border border-blue-100">
                                                <FileText size={12} />
                                                <span>{item.mahasiswa?.logbook?.length || 0} Logbook</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border flex items-center justify-center w-fit shadow-sm",
                                            item.status === 'APPROVED' ? "bg-green-100 text-green-700 border-green-200" :
                                            item.status === 'REJECTED' ? "bg-red-100 text-red-700 border-red-200" :
                                            "bg-amber-100 text-amber-700 border-amber-200"
                                        )}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button 
                                            onClick={() => openDetail(item)}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl transition-all font-medium text-sm shadow-sm"
                                        >
                                            <Eye size={16} />
                                            Detail
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="h-full min-h-[300px] flex flex-col items-center justify-center gap-3">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                            <ClipboardList size={32} className="text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-medium">Tidak ada data</p>
                        <p className="text-sm text-gray-400">Belum ada mahasiswa yang mengajukan judul.</p>
                    </div>
                )
            )}
        </div>
        
        {activeTab === "belum" 
            ? renderPagination(pageBelum, totalBelum, setPageBelum)
            : renderPagination(pageSudah, totalSudah, setPageSudah)
        }
      </div>

      {/* Side Drawer Overlay & Panel */}
      {/* Centered Modal (Like Delete Jadwal) */}
      {isDetailOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in-0 p-4">
          <div style={{ width: '750px', maxWidth: '95vw' }} className="bg-white rounded-2xl shadow-xl border border-slate-100 flex flex-col relative animate-in zoom-in-95 duration-200 max-h-[90vh]">
            
            {/* Header & Close */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
               <div>
                   <h2 className="text-xl font-bold text-slate-900">Detail Aktivitas KP</h2>
                   <p className="text-slate-500 text-sm">Informasi lengkap tempat KP dan riwayat logbook</p>
               </div>
               <button 
                   onClick={() => setIsDetailOpen(false)}
                   className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
               >
                   <X size={20} />
               </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto bg-slate-50/50 flex-1">
                {selectedStudent && (
                    <div className="flex flex-col gap-6">
                        {/* Profile Card */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-2xl border border-blue-200/50 shrink-0">
                                {selectedStudent.mahasiswa?.nama?.charAt(0) || 'M'}
                            </div>
                            <div className="flex flex-col">
                                <h4 className="font-bold text-slate-900 text-lg">{selectedStudent.mahasiswa?.nama}</h4>
                                <p className="text-slate-500 font-mono text-sm">{selectedStudent.mahasiswa?.nim}</p>
                            </div>
                        </div>

                        {/* Tempat KP Section */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Building2 size={16} className="text-blue-500" />
                                Informasi Tempat KP
                            </h3>
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                {latestTempatKP ? (
                                    <div className="divide-y divide-slate-100">
                                        <div className="p-4 flex gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                                <Building2 size={20} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">Perusahaan</p>
                                                <p className="font-bold text-slate-900">{latestTempatKP.namaPerusahaan || '-'}</p>
                                            </div>
                                        </div>
                                        <div className="p-4 flex gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                                <MapPin size={20} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">Alamat</p>
                                                <p className="font-medium text-slate-800 leading-relaxed">{latestTempatKP.alamatPerusahaan || '-'}</p>
                                            </div>
                                        </div>
                                        <div className="p-4 flex gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                                <Phone size={20} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">Kontak & Telepon</p>
                                                <p className="font-medium text-slate-800">{latestTempatKP.kontakPembimbing || '-'} / {latestTempatKP.tlpFaxPerusahaan || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center flex flex-col items-center gap-3 text-slate-400">
                                        <Building2 size={36} className="opacity-40" />
                                        <p className="text-sm font-medium">Belum ada data tempat KP.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Logbook Section */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2 mt-2">
                                <FileText size={16} className="text-blue-500" />
                                Logbook Kegiatan
                            </h3>
                            <div className="space-y-4">
                                {logbooks.length > 0 ? (
                                    logbooks.map((log: any, i: number) => (
                                        <div key={log.id || i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                                                <CalendarDays size={14} className="text-slate-400" />
                                                {log.tanggalPukul ? format(new Date(log.tanggalPukul), "EEEE, dd MMM yyyy • HH:mm", { locale: localeId }) : '-'}
                                            </div>
                                            <p className="text-slate-800 leading-relaxed font-medium pl-1">
                                                {log.uraian}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="bg-white rounded-xl border border-slate-200 border-dashed p-10 text-center flex flex-col items-center gap-3 text-slate-400">
                                        <FileText size={40} className="opacity-40" />
                                        <p className="text-sm font-medium">Mahasiswa ini belum mengisi logbook.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

