import { useState, useEffect } from "react";
import { useAuth } from "~/hooks/useAuth";
import { pengajuanApi } from "~/api/pengajuan";
import { logbookApi } from "~/api/logbookApi";
import { Loader2, Plus, Trash2, Save, CheckCircle, Clock, Search, UserCheck, Briefcase, FileText, ChevronDown } from "lucide-react";
import { Toast } from "~/components/ui/toast";
import { MonthYearFilter } from "~/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";

import { SignatureModal } from "./SignatureModal";

interface LogbookEntry {
    id: string;
    tanggalPukul: string;
    uraian: string;
    mahasiswaParaf: string | null;
    pembimbingParaf: string | null;
    catatan: string;
}

interface LogbookProps {
    mahasiswaId?: string;
}

const parseSafeDate = (val: string): Date => {
    if (!val) return new Date();
    if (typeof val === 'string') {
        const match = val.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
            const [, y, m, d] = match;
            return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        }
    }
    const parsed = new Date(val);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
};

export function LogbookMobile({ mahasiswaId }: LogbookProps) {
    const { user } = useAuth();
    const role = user?.role?.toLowerCase();
    const isDosen = role === 'dosen' || role === 'kaprodi' || role === 'dosen_pembimbing';
    const isViewingStudent = isDosen && !!mahasiswaId;
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toastProps, setToastProps] = useState<{title: string, variant?: "success" | "destructive" | "default"} | null>(null);

    const [headerInfo, setHeaderInfo] = useState({
        semester: "",
        tahunAkademik: "",
        namaPerusahaan: "",
        tlpFaxPerusahaan: "",
        alamatPerusahaan: "",
        kontakPembimbing: ""
    });

    const [isManualInput, setIsManualInput] = useState(false);
    const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [companies, setCompanies] = useState<{namaPerusahaan: string, tlpFaxPerusahaan: string, alamatPerusahaan: string, kontakPembimbing: string}[]>([]);

    useEffect(() => {
        if (!isViewingStudent && companies.length === 0) {
            logbookApi.getCompanies().then((res) => {
                setCompanies(res);
            }).catch(console.error);
        }
    }, [isViewingStudent, companies.length]);

    // Jika sudah ada data perusahaan dari backend yang tidak ada di list, otomatis mode manual
    useEffect(() => {
        if (companies.length > 0 && headerInfo.namaPerusahaan && !isManualInput) {
            const exists = companies.some(c => c.namaPerusahaan === headerInfo.namaPerusahaan);
            if (!exists) {
                setIsManualInput(true);
            }
        }
    }, [companies, headerInfo.namaPerusahaan]);

    const [entries, setEntries] = useState<LogbookEntry[]>([]);
    const [editingRowIds, setEditingRowIds] = useState<Set<string>>(new Set());
    const [activeSignature, setActiveSignature] = useState<{ id: string, type: 'mahasiswaParaf' | 'pembimbingParaf' } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const showToast = (title: string, variant: "success" | "destructive" | "default" = "success") => {
        setToastProps({ title, variant });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const profileRes = isViewingStudent
                    ? await logbookApi.getStudentProfile(mahasiswaId!)
                    : isDosen 
                        ? await pengajuanApi.getDosenProfile() 
                        : await pengajuanApi.getProfile();
                setProfile(profileRes);
                
                const currentYear = new Date().getFullYear();
                const currentMonth = new Date().getMonth();
                const startYear = profileRes.tahunMasuk ? parseInt(profileRes.tahunMasuk) : currentYear - 3;
                const diffYears = currentYear - startYear;
                const calculatedSemester = (diffYears * 2) + (currentMonth > 6 ? 1 : 0);
                const calculatedTahunAkademik = currentMonth > 6 ? `${currentYear}/${currentYear + 1}` : `${currentYear - 1}/${currentYear}`;
                
                const infoRes = await logbookApi.getInfo(mahasiswaId);
                setHeaderInfo(prev => ({
                    ...prev,
                    semester: profileRes.pengajuanJudul?.[0]?.semester || calculatedSemester.toString(),
                    tahunAkademik: profileRes.pengajuanJudul?.[0]?.tahunAkademik || calculatedTahunAkademik,
                    namaPerusahaan: infoRes.namaPerusahaan || "",
                    tlpFaxPerusahaan: infoRes.tlpFaxPerusahaan || "",
                    alamatPerusahaan: infoRes.alamatPerusahaan || "",
                    kontakPembimbing: infoRes.kontakPembimbing || ""
                }));

                const entriesRes = await logbookApi.getEntries(mahasiswaId);
                if (entriesRes && entriesRes.length > 0) {
                    setEntries(entriesRes);
                    // Kunci baris hanya jika sudah ada paraf pembimbing
                    const lockedIds = new Set<string>();
                    entriesRes.forEach(e => {
                        if (e.pembimbingParaf) {
                            // Jika sudah ada paraf, berarti terkunci
                        } else {
                            lockedIds.add(e.id);
                        }
                    });
                    setEditingRowIds(lockedIds);
                } else {
                    // Inisialisasi baris kosong untuk pertama kali
                    const firstId = Date.now().toString();
                    setEntries([
                        {
                            id: firstId,
                            tanggalPukul: new Date().toISOString(),
                            uraian: "",
                            mahasiswaParaf: null,
                            pembimbingParaf: null,
                            catatan: ""
                        }
                    ]);
                    setEditingRowIds(new Set([firstId]));
                }
            } catch (error) {
                console.error("Failed to load data", error);
                showToast("Gagal memuat profil pengguna", "destructive");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user, mahasiswaId]);

    const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setHeaderInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleEntryChange = (id: string, field: keyof LogbookEntry, value: string | boolean | null) => {
        setEntries(prev => prev.map(entry => 
            entry.id === id ? { ...entry, [field]: value } : entry
        ));
    };

    // Fungsi menambah kegiatan (Mobile)
    const addEntry = () => {
        const newId = Date.now().toString();
        const newEntries = [
            ...entries,
            {
                id: newId,
                tanggalPukul: new Date().toISOString(),
                uraian: "",
                mahasiswaParaf: null,
                pembimbingParaf: null,
                catatan: ""
            }
        ];
        setEntries(newEntries);
        setEditingRowIds(prev => new Set(prev).add(newId));

        // Pindah ke halaman terakhir
        const totalPages = Math.ceil(newEntries.length / itemsPerPage);
        setCurrentPage(totalPages);
    };

    // Fungsi menghapus kegiatan
    const removeEntry = (id: string) => {
        setEntries(entries.filter(e => e.id !== id));
        setEditingRowIds(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    };

    // Fungsi toggle mode edit (Unlock baris yang terkunci)
    const toggleEditRow = (id: string) => {
        setEditingRowIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
                // Removed clearing of pembimbingParaf and catatan when editing
                // so users don't lose them when editing other fields
            }
            return next;
        });
    };

    // Fungsi simpan seluruh data ke database
    const handleSave = async () => {
        setSaving(true);
        try {
            // Save all entries regardless of empty uraian

            await logbookApi.updateInfo({
                namaPerusahaan: headerInfo.namaPerusahaan,
                tlpFaxPerusahaan: headerInfo.tlpFaxPerusahaan,
                alamatPerusahaan: headerInfo.alamatPerusahaan,
                kontakPembimbing: headerInfo.kontakPembimbing
            }, mahasiswaId);
            await logbookApi.syncEntries(entries, mahasiswaId);
            
            const updatedEntries = await logbookApi.getEntries(mahasiswaId);
            if (updatedEntries && updatedEntries.length > 0) {
                setEntries(updatedEntries);
                
                // Kunci baris jika sudah ada paraf pembimbing
                const nextEditing = new Set<string>();
                updatedEntries.forEach(e => {
                    if (!e.pembimbingParaf) nextEditing.add(e.id);
                });
                setEditingRowIds(nextEditing);
            }
            
            showToast("Logbook berhasil disimpan!", "success");
        } catch (error) {
            showToast("Gagal menyimpan logbook", "destructive");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin text-[#D25026]" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24 font-geist relative">
            {toastProps && (
                <div className="fixed top-4 right-4 left-4 z-[999]">
                    <Toast
                        title={toastProps.title}
                        variant={toastProps.variant}
                        duration={toastProps.variant === 'success' ? 3000 : 5000}
                        onClose={() => setToastProps(null)}
                    />
                </div>
            )}
            
            {/* Header Area */}
            <div className="bg-slate-900 text-white p-6 rounded-b-3xl shadow-md">
                    <div className="flex items-center gap-4 mb-4">
                        {isViewingStudent && (
                            <button 
                                onClick={() => window.history.back()}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                            </button>
                        )}
                        <div className="w-14 h-14 bg-white rounded-lg p-1">
                            <img src="https://upload.wikimedia.org/wikipedia/id/thumb/4/46/Logo_Universitas_Pancasila.png/250px-Logo_Universitas_Pancasila.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                    <div>
                        <h1 className="text-[10px] font-bold text-gray-300 uppercase">FAKULTAS TEKNIK - TEKNIK INFORMATIKA</h1>
                        <h2 className="text-lg font-bold text-white leading-tight uppercase">LOGBOOK KERJA PRAKTIK</h2>
                    </div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-sm space-y-2">
                    <div className="flex justify-between pb-1">
                        <span className="text-gray-300">{isViewingStudent ? "Nama Mahasiswa" : isDosen ? "Nama Dosen" : "Nama Mahasiswa"}</span>
                        <span className="font-medium text-right line-clamp-1 max-w-[150px]">{profile?.nama || "-"}</span>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* Form Perusahaan Detail - Accordion style simplified */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
                    <h3 className="font-bold flex items-center gap-2 text-gray-800 border-b pb-2">
                        <Briefcase size={18} className="text-[#D25026]" /> Data Perusahaan
                    </h3>
                    
                    <div className="space-y-3 text-sm">
                        <div className="flex flex-col gap-1">
                            <label className="text-gray-500 font-medium">Nama Perusahaan</label>
                            {isViewingStudent ? (
                                <input 
                                    type="text" 
                                    name="namaPerusahaan"
                                    value={headerInfo.namaPerusahaan}
                                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none w-full opacity-70"
                                    readOnly
                                />
                            ) : isManualInput ? (
                                <div className="flex w-full items-center gap-2">
                                    <input 
                                        type="text" 
                                        name="namaPerusahaan"
                                        value={headerInfo.namaPerusahaan}
                                        onChange={handleHeaderChange}
                                        className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#D25026] w-full"
                                        placeholder="Ketik nama perusahaan baru..."
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setIsManualInput(false);
                                        }}
                                        className="text-[10px] text-gray-500 hover:text-red-500 whitespace-nowrap px-2 py-2 bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                                    >
                                        Batal
                                    </button>
                                </div>
                            ) : (
                                <div className="relative w-full">
                                    <button 
                                        type="button"
                                        onClick={() => setCompanyDropdownOpen(!companyDropdownOpen)}
                                        className="flex w-full items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#D25026] text-left transition-colors"
                                    >
                                        <span className={headerInfo.namaPerusahaan ? "text-gray-900" : "text-gray-500"}>
                                            {headerInfo.namaPerusahaan || "-- Pilih Perusahaan Terdaftar --"}
                                        </span>
                                        <ChevronDown size={16} className="text-gray-400" />
                                    </button>
                                    
                                    {companyDropdownOpen && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 flex flex-col overflow-hidden">
                                            <div className="p-2 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
                                                <Search size={14} className="text-gray-400" />
                                                <input 
                                                    type="text"
                                                    className="w-full outline-none text-sm bg-transparent"
                                                    placeholder="Cari perusahaan..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    autoFocus
                                                />
                                            </div>
                                            
                                            <div className="max-h-60 overflow-y-auto custom-scrollbar flex-1">
                                                {companies
                                                    .filter(c => c.namaPerusahaan.toLowerCase().includes(searchQuery.toLowerCase()))
                                                    .map((c, i) => (
                                                        <div 
                                                            key={i}
                                                            className="px-4 py-2 hover:bg-blue-100 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0"
                                                            onClick={() => {
                                                                setHeaderInfo(prev => ({
                                                                    ...prev,
                                                                    namaPerusahaan: c.namaPerusahaan || "",
                                                                    tlpFaxPerusahaan: c.tlpFaxPerusahaan || "",
                                                                    alamatPerusahaan: c.alamatPerusahaan || "",
                                                                    kontakPembimbing: c.kontakPembimbing || ""
                                                                }));
                                                                setSearchQuery("");
                                                                setCompanyDropdownOpen(false);
                                                            }}
                                                        >
                                                            <div className="font-medium text-gray-800 text-sm">{c.namaPerusahaan}</div>
                                                            {(c.alamatPerusahaan || c.tlpFaxPerusahaan) && (
                                                                <div className="text-[11px] text-gray-500 truncate mt-0.5">
                                                                    {c.alamatPerusahaan} {c.tlpFaxPerusahaan && `• ${c.tlpFaxPerusahaan}`}
                                                                </div>
                                                            )}
                                                        </div>
                                                ))}
                                                
                                                {companies.filter(c => c.namaPerusahaan.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                                                    <div className="px-4 py-3 text-sm text-gray-500 text-center italic">
                                                        Perusahaan tidak ditemukan.
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div 
                                                className="sticky bottom-0 text-red-600 font-semibold bg-red-50 hover:bg-red-100 px-4 py-3 cursor-pointer border-t border-red-100 transition-colors mt-auto text-sm shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
                                                onClick={() => {
                                                    setIsManualInput(true);
                                                    setSearchQuery("");
                                                    setCompanyDropdownOpen(false);
                                                }}
                                            >
                                                + Input Manual (Perusahaan Baru)
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-gray-500 font-medium">No. Telp / Fax</label>
                            <input 
                                type="text" name="tlpFaxPerusahaan" value={headerInfo.tlpFaxPerusahaan} onChange={handleHeaderChange}
                                readOnly={isViewingStudent}
                                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#D25026] disabled:opacity-70"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-gray-500 font-medium">Alamat</label>
                            <textarea 
                                name="alamatPerusahaan" value={headerInfo.alamatPerusahaan} onChange={handleHeaderChange}
                                readOnly={isViewingStudent}
                                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#D25026] resize-none h-20 disabled:opacity-70"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-gray-500 font-medium">Kontak Pembimbing Lapangan</label>
                            <input 
                                type="text" name="kontakPembimbing" value={headerInfo.kontakPembimbing} onChange={handleHeaderChange}
                                readOnly={isViewingStudent}
                                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#D25026] disabled:opacity-70"
                            />
                        </div>
                    </div>
                </div>

                {/* Logbook Entries */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <FileText size={18} className="text-[#D25026]" /> Daftar Kegiatan
                        </h3>
                        {!isViewingStudent && (
                            <button 
                                onClick={addEntry}
                                className="bg-[#D25026]/10 text-[#D25026] px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 active:scale-95 transition-transform"
                            >
                                <Plus size={16} /> Tambah
                            </button>
                        )}
                    </div>

                    {entries.length === 0 ? (
                        <div className="bg-white p-8 rounded-2xl text-center border border-dashed border-gray-300">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <FileText className="text-gray-400" size={24} />
                            </div>
                            <p className="text-gray-500 text-sm">Belum ada kegiatan yang dicatat.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {(() => {
                                const paginatedEntries = entries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
                                return paginatedEntries.map((entry) => (
                                <div key={entry.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    {/* Card Header */}
                                    <div className={cn("bg-gray-50 px-4 py-3 border-b flex justify-between items-start", (entry.pembimbingParaf && !editingRowIds.has(entry.id)) && "opacity-70")}>
                                        <div className={cn("flex flex-col gap-3 w-full py-1 pr-4", (entry.pembimbingParaf && !editingRowIds.has(entry.id)) && "pointer-events-none")}>
                                            {/* Mobile Date Box */}
                                            <div className="w-full border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
                                                <div className="bg-gray-50 px-3 py-1.5 border-b border-gray-100 flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tanggal Kegiatan</span>
                                                    <div className="w-2 h-2 rounded-full bg-[#D25026]/40" />
                                                </div>
                                                <div className="p-1">
                                                    <MonthYearFilter 
                                                        date={parseSafeDate(entry.tanggalPukul)}
                                                        setDate={(d) => {
                                                            if (isViewingStudent || !d) return;
                                                            const year = d.getFullYear();
                                                            const month = String(d.getMonth() + 1).padStart(2, '0');
                                                            const day = String(d.getDate()).padStart(2, '0');
                                                            const dateStr = `${year}-${month}-${day}`;
                                                            
                                                            let timeStr = "09:00";
                                                            if (entry.tanggalPukul && entry.tanggalPukul.includes('T')) {
                                                                timeStr = entry.tanggalPukul.split('T')[1].slice(0, 5);
                                                            }
                                                            handleEntryChange(entry.id, 'tanggalPukul', `${dateStr}T${timeStr}:00`);
                                                        }}
                                                        showLabel={false}
                                                        className="w-full scale-100"
                                                    />
                                                </div>
                                            </div>

                                            {/* Mobile Time Box */}
                                            <div className="w-full border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
                                                <div className="bg-gray-50 px-3 py-1.5 border-b border-gray-100 flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pukul / Waktu</span>
                                                    <Clock size={12} className="text-[#D25026] opacity-50" />
                                                </div>
                                                <div className="p-3">
                                                    <input 
                                                        type="time"
                                                        disabled={isViewingStudent || (!editingRowIds.has(entry.id) && !!entry.pembimbingParaf)}
                                                        value={entry.tanggalPukul && entry.tanggalPukul.includes('T') ? entry.tanggalPukul.split('T')[1].slice(0, 5) : "09:00"}
                                                        onChange={(e) => {
                                                            const currentVal = entry.tanggalPukul || "";
                                                            let datePart = new Date().toISOString().split('T')[0];
                                                            const match = currentVal.match(/^(\d{4}-\d{2}-\d{2})/);
                                                            if (match) datePart = match[1];
                                                            handleEntryChange(entry.id, 'tanggalPukul', `${datePart}T${e.target.value}:00`);
                                                        }}
                                                        className="outline-none text-sm font-black w-full bg-transparent text-gray-800 disabled:cursor-not-allowed tracking-widest text-center"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 pt-1">
                                            {!isViewingStudent && (
                                                <>
                                                    <button 
                                                        onClick={() => (editingRowIds.has(entry.id)) ? handleSave() : toggleEditRow(entry.id)} 
                                                        className={cn("p-1.5 rounded-full transition-colors", (editingRowIds.has(entry.id)) ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600")}
                                                    >
                                                        {(editingRowIds.has(entry.id)) ? <Save size={18} /> : <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>}
                                                    </button>
                                                    <button onClick={() => removeEntry(entry.id)} className="p-1.5 bg-red-100 text-red-600 rounded-full">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Card Body */}
                                    <div className="p-4 space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Uraian Singkat</label>
                                            <textarea 
                                                value={entry.uraian}
                                                disabled={isViewingStudent || (!editingRowIds.has(entry.id) && !!entry.pembimbingParaf)}
                                                onChange={(e) => {
                                                    handleEntryChange(entry.id, 'uraian', e.target.value);
                                                }}
                                                placeholder="Deskripsikan aktivitas harian Anda..."
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#D25026] focus:ring-1 focus:ring-[#D25026] text-sm min-h-[80px] disabled:text-gray-500 disabled:bg-gray-100/50"
                                            />
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                                            {/* Mahasiswa Sign */}
                                            <div className="flex flex-col gap-2">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase text-center">Paraf Dosen</span>
                                                {entry.mahasiswaParaf ? (
                                                    <div className="relative border border-gray-200 rounded-lg bg-white p-1 h-12 flex justify-center items-center group">
                                                        <img src={entry.mahasiswaParaf} alt="Signature" className="max-w-full max-h-full object-contain" />
                                                        {isViewingStudent && (
                                                            <button 
                                                                disabled={!isViewingStudent}
                                                                onClick={() => setActiveSignature({ id: entry.id, type: 'mahasiswaParaf' })}
                                                                className={cn("absolute -top-2 -right-2 bg-gray-100 text-gray-500 rounded-full p-1 border border-gray-200 shadow-sm transition-opacity", isViewingStudent ? "opacity-100" : "opacity-0 pointer-events-none")}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <button 
                                                        disabled={!isViewingStudent}
                                                        onClick={() => setActiveSignature({ id: entry.id, type: 'mahasiswaParaf' })}
                                                        className={cn("h-12 border border-dashed border-gray-300 rounded-lg flex items-center justify-center gap-1 text-gray-400 transition-colors", !isViewingStudent ? "opacity-50 cursor-not-allowed" : "hover:border-[#D25026] hover:text-[#D25026]")}
                                                    >
                                                        <Plus size={14} />
                                                        <span className="text-[10px]">{isViewingStudent ? "Klik TTD" : "Belum TTD"}</span>
                                                    </button>
                                                )}
                                            </div>

                                            {/* Pembimbing Sign */}
                                            <div className="flex flex-col gap-2">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase text-center">Paraf Pembimbing</span>
                                                {entry.pembimbingParaf ? (
                                                    <div className="relative border border-gray-200 rounded-lg bg-white p-1 h-12 flex justify-center items-center group">
                                                        <img src={entry.pembimbingParaf} alt="Signature" className="max-w-full max-h-full object-contain" />
                                                        {!isViewingStudent && (
                                                            <button 
                                                                disabled={!editingRowIds.has(entry.id)}
                                                                onClick={() => setActiveSignature({ id: entry.id, type: 'pembimbingParaf' })}
                                                                className={cn("absolute -top-2 -right-2 bg-gray-100 text-gray-500 rounded-full p-1 border border-gray-200 shadow-sm transition-opacity", editingRowIds.has(entry.id) ? "opacity-100" : "opacity-0 pointer-events-none")}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <button 
                                                        disabled={isViewingStudent}
                                                        onClick={() => setActiveSignature({ id: entry.id, type: 'pembimbingParaf' })}
                                                        className={cn("h-12 border border-dashed border-gray-300 rounded-lg flex items-center justify-center gap-1 text-gray-400 transition-colors", isViewingStudent ? "opacity-50 cursor-not-allowed" : "hover:border-[#D25026] hover:text-[#D25026]")}
                                                    >
                                                        <Plus size={14} />
                                                        <span className="text-[10px]">{isViewingStudent ? "Belum TTD" : "Klik TTD"}</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-1.5 pt-2 border-t">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Catatan Pembimbing</label>
                                            <textarea 
                                                value={entry.catatan}
                                                onChange={(e) => {
                                                    handleEntryChange(entry.id, 'catatan', e.target.value);
                                                }}
                                                disabled={isViewingStudent || (!editingRowIds.has(entry.id) && !!entry.pembimbingParaf)}
                                                placeholder={isViewingStudent ? "Tidak ada catatan." : "Catatan dari pembimbing..."}
                                                className="w-full px-3 py-2 bg-white border border-gray-100 rounded-lg outline-none focus:border-blue-400 text-xs min-h-[50px] italic text-gray-500 disabled:opacity-70"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                            })()}
                        </div>
                    )}

                    {/* Pagination */}
                    {entries.length > itemsPerPage && (
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-500">
                                Hal {currentPage} dari {Math.ceil(entries.length / itemsPerPage)}
                            </span>
                            <div className="flex gap-2">
                                <Button 
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    className="h-8 text-xs px-3"
                                >
                                    Sebelumnya
                                </Button>
                                <Button 
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === Math.ceil(entries.length / itemsPerPage)}
                                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(entries.length / itemsPerPage), p + 1))}
                                    className="h-8 text-xs px-3"
                                >
                                    Selanjutnya
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Save Button */}

            {!isViewingStudent && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-200 z-[40] flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                    <button 
                        onClick={addEntry}
                        className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                        <Plus size={20} />
                        Tambah
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className={cn(
                            "py-3 px-4 bg-[#D25026] text-white font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-[#D25026]/20 disabled:opacity-70 flex-[2]"
                        )}
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {saving ? 'Menyimpan...' : 'Simpan Logbook'}
                    </button>
                </div>
            )}

            <SignatureModal 
                isOpen={!!activeSignature}
                onClose={() => setActiveSignature(null)}
                onSave={async (data) => {
                    if (activeSignature) {
                        const updatedEntries = entries.map(entry => 
                            entry.id === activeSignature.id ? { ...entry, [activeSignature.type]: data || null } : entry
                        );
                        setEntries(updatedEntries);
                        
                        try {
                            setSaving(true);
                            await logbookApi.syncEntries(updatedEntries, mahasiswaId);
                            const freshEntries = await logbookApi.getEntries(mahasiswaId);
                            if (freshEntries && freshEntries.length > 0) {
                                setEntries(freshEntries);
                            }
                            showToast("Paraf berhasil disimpan!", "success");
                        } catch (error) {
                            showToast("Gagal menyimpan paraf", "destructive");
                        } finally {
                            setSaving(false);
                        }
                    }
                }}
            />
        </div>
    );
}
