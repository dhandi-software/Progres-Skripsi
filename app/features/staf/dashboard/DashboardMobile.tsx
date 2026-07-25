import { useAuth } from "~/hooks/useAuth";
import { useEffect, useState } from "react";
import { adminApi } from "~/api/admin";
import { Users, Loader2, ChevronRight, ClipboardList, ChevronLeft, Eye, Briefcase, CalendarDays, Building2, MapPin, Phone, FileText, Search } from "lucide-react";
import { cn } from "~/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

const avatarColors = [
    'bg-blue-500', 'bg-orange-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-pink-500'
];

const getAvatarColor = (name: string = '') => {
    if (!name) return avatarColors[0];
    const idx = name.charCodeAt(0) % avatarColors.length;
    return avatarColors[idx];
};

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

export function DashboardMobile() {
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
          <div className="flex flex-col items-center justify-center gap-3 p-4 border-t border-gray-100 bg-white">
              <span className="text-[11px] text-gray-500 font-medium">
                  Halaman <span className="font-bold text-gray-900">{currentPage}</span> / <span className="font-bold text-gray-900">{totalPages}</span>
              </span>
              <div className="flex items-center gap-1 overflow-x-auto w-full justify-center pb-1">
                  <button
                      onClick={() => setPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600 shrink-0"
                  >
                      <ChevronLeft size={16} />
                  </button>
                  {pages.map((p, i) => (
                      <button
                          key={i}
                          onClick={() => typeof p === 'number' && setPage(p)}
                          disabled={p === '...'}
                          className={cn(
                              "w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all duration-200 shrink-0",
                              p === currentPage 
                                ? activeTab === "belum" ? "bg-orange-500 text-white shadow-md shadow-orange-500/30" : "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                                : p === '...' ? "text-gray-400 cursor-default" : "text-gray-600 hover:bg-gray-100 bg-gray-50"
                          )}
                      >
                          {p}
                      </button>
                  ))}
                  <button
                      onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600 shrink-0"
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
    <div className="p-4 font-geist pb-24 bg-gray-50/50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-gray-500 mt-1 text-xs font-medium">Administrasi Kerja Praktik Mahasiswa</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div 
          onClick={() => { setActiveTab("belum"); setPageBelum(1); }}
          className={cn(
            "p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden",
            activeTab === "belum" ? "bg-white border-orange-200 ring-4 ring-orange-500/10 shadow-sm" : "bg-white border-gray-100 opacity-80"
          )}
        >
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300", activeTab === "belum" ? "from-orange-50 to-transparent opacity-100" : "")}></div>
          <div className={cn("p-2.5 rounded-xl w-fit mb-3 relative z-10", activeTab === "belum" ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" : "bg-orange-50 text-orange-600")}>
             <Users size={20} />
          </div>
          <div className="relative z-10">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Belum KP</p>
              <p className="text-3xl font-black text-gray-900">{studentsWithoutProposal.length}</p>
          </div>
        </div>

        <div 
          onClick={() => { setActiveTab("sudah"); setPageSudah(1); }}
          className={cn(
            "p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden",
            activeTab === "sudah" ? "bg-white border-blue-200 ring-4 ring-blue-500/10 shadow-sm" : "bg-white border-gray-100 opacity-80"
          )}
        >
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300", activeTab === "sudah" ? "from-blue-50 to-transparent opacity-100" : "")}></div>
          <div className={cn("p-2.5 rounded-xl w-fit mb-3 relative z-10", activeTab === "sudah" ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "bg-blue-50 text-blue-600")}>
             <ClipboardList size={20} />
          </div>
          <div className="relative z-10">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Sudah KP</p>
              <p className="text-3xl font-black text-gray-900">{studentsWithProposal.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-4 min-h-[400px] flex flex-col">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col gap-3 bg-white">
            <div className="flex justify-between items-center">
                <h2 className="font-bold text-gray-900 text-sm tracking-tight">
                    {activeTab === "belum" ? "Daftar Belum KP" : "Daftar Sudah KP"}
                </h2>
                <div className="flex items-center gap-2">
                    <span className={cn(
                        "text-[10px] font-bold px-2 py-1 rounded-md border",
                        activeTab === "belum" ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-blue-50 text-blue-600 border-blue-100"
                    )}>
                        {activeTab === "belum" ? studentsWithoutProposal.length : studentsWithProposal.length} TOTAL
                    </span>
                    <button
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 text-white rounded-md text-[10px] font-bold hover:bg-slate-700 transition-colors shadow-sm"
                    >
                        <FileText size={12} />
                        PDF
                    </button>
                </div>
            </div>
            <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Cari Nama / NIM..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
            </div>
        </div>
        
        <div className="divide-y divide-gray-50 flex-1">
            {loading ? (
                <div className="p-12 flex flex-col items-center justify-center gap-3 h-[300px]">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    <p className="text-xs text-gray-500 font-medium animate-pulse">Memuat data...</p>
                </div>
            ) : activeTab === "belum" ? (
                paginatedBelum.length > 0 ? (
                    paginatedBelum.map((student, idx) => (
                        <div key={student.id} className="p-4 flex items-center gap-4 active:bg-gray-50 transition-colors">
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 text-white shadow-sm",
                                getAvatarColor(student.nama)
                            )}>
                                {(pageBelum - 1) * ITEMS_PER_PAGE + idx + 1}
                            </div>
                            <div className="flex flex-col gap-1 flex-1">
                                <span className="font-bold text-gray-900 text-sm leading-tight">{student.nama}</span>
                                <span className="text-[11px] font-mono text-gray-500 bg-gray-100 w-fit px-1.5 py-0.5 rounded">
                                    {student.nim}
                                </span>
                                {student.email && (
                                    <span className="text-[11px] text-gray-400">
                                        {student.email}
                                    </span>
                                )}
                                {student.nomorTelepon && (
                                    <a href={`tel:${student.nomorTelepon}`} className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-700 hover:text-blue-600">
                                        <Phone size={10} className="text-slate-400 shrink-0" />
                                        {student.nomorTelepon}
                                    </a>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-12 text-center flex flex-col items-center gap-2 text-gray-400 h-[300px] justify-center">
                        <Users size={32} className="opacity-30 mb-2" />
                        <p className="text-sm font-medium">Semua sudah beres.</p>
                    </div>
                )
            ) : (
                paginatedSudah.length > 0 ? (
                    paginatedSudah.map((item, idx) => (
                        <div key={item.id} className="p-5 flex flex-col gap-4 active:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start gap-2">
                                <div className="flex gap-3 items-start">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-1 text-white shadow-sm",
                                        getAvatarColor(item.mahasiswa?.nama)
                                    )}>
                                        {(pageSudah - 1) * ITEMS_PER_PAGE + idx + 1}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="font-bold text-gray-900 text-sm leading-tight line-clamp-1">{item.mahasiswa?.nama}</span>
                                        <span className="text-[11px] font-mono text-gray-500 bg-gray-100 w-fit px-1.5 py-0.5 rounded">{item.mahasiswa?.nim}</span>
                                    </div>
                                </div>
                                <span className={cn(
                                    "px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border shrink-0",
                                    item.status === 'APPROVED' ? "bg-green-50 text-green-700 border-green-200" :
                                    item.status === 'REJECTED' ? "bg-red-50 text-red-700 border-red-200" :
                                    "bg-orange-50 text-orange-700 border-orange-200"
                                )}>
                                    {item.status || 'PENDING'}
                                </span>
                            </div>
                            <div className="pl-11">
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 mb-3">
                                    <p className="text-xs font-semibold text-gray-700 leading-relaxed">{item.judul}</p>
                                    <div className="flex flex-col gap-1.5 mt-2 text-[10px] text-gray-500 font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <Briefcase size={12} className="text-blue-500" />
                                            <span className="truncate">{item.dosen?.nama}</span>
                                        </div>
                                        {item.mahasiswa?.tempatKP?.[0]?.namaPerusahaan ? (
                                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 border border-green-200 w-fit">
                                                <Building2 size={12} className="shrink-0" />
                                                <span className="truncate">{item.mahasiswa.tempatKP[0].namaPerusahaan}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-slate-400 italic border border-slate-200 w-fit">
                                                <Building2 size={12} className="shrink-0" />
                                                <span className="truncate">Belum diset</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200 w-fit">
                                            <FileText size={12} className="shrink-0" />
                                            <span className="truncate">{item.mahasiswa?.logbook?.length || 0} Logbook</span>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => openDetail(item)}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-blue-600 active:bg-blue-50 active:border-blue-200 transition-all shadow-sm"
                                >
                                    <Eye size={14} />
                                    Lihat Detail Aktivitas
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-12 text-center flex flex-col items-center gap-2 text-gray-400 h-[300px] justify-center">
                        <ClipboardList size={32} className="opacity-30 mb-2" />
                        <p className="text-sm font-medium">Belum ada pengajuan.</p>
                    </div>
                )
            )}
        </div>
        
        {activeTab === "belum" 
            ? renderPagination(pageBelum, totalBelum, setPageBelum)
            : renderPagination(pageSudah, totalSudah, setPageSudah)
        }
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-md bg-white p-0 overflow-hidden rounded-2xl w-[95vw] border-0 mx-auto max-h-[90vh] flex flex-col">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-5 py-6 text-white relative shrink-0">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Building2 size={80} />
                  </div>
                  <DialogHeader className="relative z-10 text-left">
                      <DialogTitle className="text-xl font-bold text-white mb-1">Detail Aktivitas KP</DialogTitle>
                      <DialogDescription className="text-blue-100 text-xs">
                          Tempat KP & Logbook Mahasiswa
                      </DialogDescription>
                  </DialogHeader>
              </div>
              
              <div className="p-5 overflow-y-auto bg-gray-50/50 flex-1">
                  {selectedStudent && (
                      <div className="flex flex-col gap-6">
                          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                                  {selectedStudent.mahasiswa?.nama?.charAt(0) || 'M'}
                              </div>
                              <div className="flex flex-col">
                                  <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{selectedStudent.mahasiswa?.nama}</h4>
                                  <p className="text-xs text-gray-500 font-mono mt-0.5">{selectedStudent.mahasiswa?.nim}</p>
                              </div>
                          </div>

                          <div>
                              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                  <Building2 size={14} className="text-blue-500" />
                                  Tempat KP
                              </h3>
                              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                  {latestTempatKP ? (
                                      <div className="divide-y divide-gray-100">
                                          <div className="p-3.5 flex gap-3">
                                              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                                  <Building2 size={14} />
                                              </div>
                                              <div className="flex-1">
                                                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">Perusahaan</p>
                                                  <p className="font-bold text-gray-900 text-sm">{latestTempatKP.namaPerusahaan || '-'}</p>
                                              </div>
                                          </div>
                                          <div className="p-3.5 flex gap-3">
                                              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                                  <MapPin size={14} />
                                              </div>
                                              <div className="flex-1">
                                                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">Alamat</p>
                                                  <p className="font-medium text-gray-800 text-xs leading-relaxed">{latestTempatKP.alamatPerusahaan || '-'}</p>
                                              </div>
                                          </div>
                                          <div className="p-3.5 flex gap-3">
                                              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                                  <Phone size={14} />
                                              </div>
                                              <div className="flex-1">
                                                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">Kontak</p>
                                                  <p className="font-medium text-gray-800 text-xs">{latestTempatKP.kontakPembimbing || '-'} / {latestTempatKP.tlpFaxPerusahaan || '-'}</p>
                                              </div>
                                          </div>
                                      </div>
                                  ) : (
                                      <div className="p-6 text-center flex flex-col items-center gap-2 text-gray-400">
                                          <Building2 size={24} className="opacity-40" />
                                          <p className="text-xs font-medium">Belum ada data tempat KP.</p>
                                      </div>
                                  )}
                              </div>
                          </div>

                          <div>
                              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                  <FileText size={14} className="text-blue-500" />
                                  Logbook Kegiatan
                              </h3>
                              <div className="space-y-3">
                                  {logbooks.length > 0 ? (
                                      logbooks.map((log: any, i: number) => (
                                          <div key={log.id || i} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400"></div>
                                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                                                  <CalendarDays size={12} className="text-gray-400" />
                                                  {log.tanggalPukul ? format(new Date(log.tanggalPukul), "dd MMM yy • HH:mm", { locale: localeId }) : '-'}
                                              </div>
                                              <p className="text-gray-800 text-xs leading-relaxed font-medium">
                                                  {log.uraian}
                                              </p>
                                          </div>
                                      ))
                                  ) : (
                                      <div className="bg-white rounded-xl border border-gray-200 border-dashed p-6 text-center flex flex-col items-center gap-2 text-gray-400">
                                          <FileText size={24} className="opacity-40" />
                                          <p className="text-xs font-medium">Belum mengisi logbook.</p>
                                      </div>
                                  )}
                              </div>
                          </div>
                      </div>
                  )}
              </div>
          </DialogContent>
      </Dialog>
    </div>
  );
}

