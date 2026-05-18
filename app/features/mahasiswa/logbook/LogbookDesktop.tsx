import { useState, useEffect } from "react";
import { useAuth } from "~/hooks/useAuth";
import { pengajuanApi } from "~/api/pengajuan";
import { logbookApi } from "~/api/logbookApi";
import { Loader2, Plus, Trash2, Save, CheckCircle, Clock } from "lucide-react";
import { Toast } from "~/components/ui/toast";
import { MonthYearFilter } from "~/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "~/lib/utils";

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
    mahasiswaId?: number;
}

export function LogbookDesktop({ mahasiswaId }: LogbookProps) {
    const { user } = useAuth();
    const role = user?.role?.toLowerCase();
    const isDosen = role === 'dosen' || role === 'kaprodi' || role === 'dosen_pembimbing';
    const isViewingStudent = isDosen && !!mahasiswaId;
    
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toastProps, setToastProps] = useState<{title: string, variant?: "success" | "destructive" | "default"} | null>(null);

    // Mock header info state
    const [headerInfo, setHeaderInfo] = useState({
        semester: "",
        tahunAkademik: "",
        namaPerusahaan: "",
        tlpFaxPerusahaan: "",
        alamatPerusahaan: ""
    });

    const [entries, setEntries] = useState<LogbookEntry[]>([]);
    const [editingRowIds, setEditingRowIds] = useState<Set<string>>(new Set());
    const [activeSignature, setActiveSignature] = useState<{ id: string, type: 'mahasiswaParaf' | 'pembimbingParaf' } | null>(null);

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
                
                // Smart Defaults
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
                    alamatPerusahaan: infoRes.alamatPerusahaan || ""
                }));

                const entriesRes = await logbookApi.getEntries(mahasiswaId);
                if (entriesRes && entriesRes.length > 0) {
                    setEntries(entriesRes);
                    // Kunci baris hanya jika sudah ada paraf pembimbing
                    const lockedIds = new Set<string>();
                    entriesRes.forEach(e => {
                        if (e.pembimbingParaf) {
                            // Jika ada paraf, jangan masukkan ke daftar edit (berarti terkunci)
                        } else {
                            lockedIds.add(e.id);
                        }
                    });
                    setEditingRowIds(lockedIds);
                } else {
                    // Inisialisasi baris kosong jika data belum ada
                    setEntries([
                        {
                            id: Date.now().toString(),
                            tanggalPukul: new Date().toISOString(),
                            uraian: "",
                            mahasiswaParaf: null,
                            pembimbingParaf: null,
                            catatan: ""
                        }
                    ]);
                    setEditingRowIds(new Set([Date.now().toString()]));
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

    const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setHeaderInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleEntryChange = (id: string, field: keyof LogbookEntry, value: string | boolean | null) => {
        setEntries(prev => prev.map(entry => 
            entry.id === id ? { ...entry, [field]: value } : entry
        ));
    };

    // Fungsi untuk menambah baris kegiatan baru
    const addEntry = () => {
        const newId = Date.now().toString();
        setEntries([
            ...entries,
            {
                id: newId,
                tanggalPukul: new Date().toISOString(),
                uraian: "",
                mahasiswaParaf: null,
                pembimbingParaf: null,
                catatan: ""
            }
        ]);
        // Baris baru otomatis masuk mode edit
        setEditingRowIds(prev => new Set(prev).add(newId));
    };

    // Fungsi untuk menghapus baris kegiatan
    const removeEntry = (id: string) => {
        setEntries(entries.filter(e => e.id !== id));
        setEditingRowIds(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    };

    // Fungsi untuk toggle mode edit (Lock/Unlock)
    const toggleEditRow = (id: string) => {
        setEditingRowIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
                // Jika mengedit baris yang sudah ada paraf, hapus paraf pembimbingnya
                setEntries(current => current.map(e => 
                    e.id === id ? { ...e, pembimbingParaf: null, catatan: "" } : e
                ));
                showToast("Peringatan: Mengedit baris ini akan menghapus paraf pembimbing.", "default");
            }
            return next;
        });
    };

    // Fungsi utama untuk sinkronisasi data ke backend
    const handleSave = async () => {
        setSaving(true);
        try {
            // Validasi: pastikan semua baris yang diedit sudah memiliki uraian
            const hasEmpty = entries.some(e => !e.uraian.trim());
            if (hasEmpty) {
                showToast("Harap isi semua uraian kegiatan", "destructive");
                setSaving(false);
                return;
            }

            await logbookApi.updateInfo({
                namaPerusahaan: headerInfo.namaPerusahaan,
                tlpFaxPerusahaan: headerInfo.tlpFaxPerusahaan,
                alamatPerusahaan: headerInfo.alamatPerusahaan
            }, mahasiswaId);
            await logbookApi.syncEntries(entries, mahasiswaId);
            
            const updatedEntries = await logbookApi.getEntries(mahasiswaId);
            if (updatedEntries && updatedEntries.length > 0) {
                setEntries(updatedEntries);
                
                // Kalkulasi ulang status edit: kunci baris hanya jika pembimbing sudah ttd
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
                <Loader2 className="animate-spin text-[#D25026]" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-8 font-geist relative">
            {toastProps && (
                <div className="fixed top-6 right-6 z-[999]">
                    <Toast
                        title={toastProps.title}
                        variant={toastProps.variant}
                        duration={toastProps.variant === 'success' ? 3000 : 5000}
                        onClose={() => setToastProps(null)}
                    />
                </div>
            )}
            
            <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100">
                {/* Header Section */}
                <div className="border-b-2 border-gray-800 p-6 flex items-center justify-between bg-white relative">
                    {isViewingStudent && (
                        <button 
                            onClick={() => window.history.back()}
                            className="absolute left-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        </button>
                    )}
                    {/* Logo */}
                    <div className="w-24 h-24 flex-shrink-0">
                         <img 
                            src="https://upload.wikimedia.org/wikipedia/id/thumb/4/46/Logo_Universitas_Pancasila.png/250px-Logo_Universitas_Pancasila.png" 
                            alt="Logo UP" 
                            className="w-full h-full object-contain"
                         />
                    </div>
                    
                    {/* Title Text */}
                    <div className="flex-1 text-center px-4">
                        <h1 className="text-xl font-bold text-gray-900 tracking-wide">FAKULTAS TEKNIK - TEKNIK INFORMATIKA</h1>
                        <div className="w-full h-px bg-gray-800 my-2"></div>
                        <h2 className="text-lg font-bold text-gray-800 uppercase tracking-widest">DAFTAR HADIR MAHASISWA DI PERUSAHAAN</h2>
                    </div>

                    {/* Right Side Logo */}
                    <div className="w-24 h-24 flex-shrink-0">
                         <img 
                            src="/images/LogoUpKebanggan.png" 
                            alt="Logo Fakultas" 
                            className="w-full h-full object-contain"
                         />
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Student & Company Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-sm">
                        {/* Left Column */}
                        <div className="space-y-3">
                            <div className="grid grid-cols-[140px_10px_1fr] items-center">
                                <span className="font-semibold text-gray-700">{isViewingStudent ? "Nama Mahasiswa" : isDosen ? "Nama Dosen" : "Nama Mahasiswa"}</span>
                                <span>:</span>
                                <span className="font-medium text-gray-900">{profile?.nama || "-"}</span>
                            </div>
                            <div className="grid grid-cols-[140px_10px_1fr] items-center">
                                <span className="font-semibold text-gray-700">{isViewingStudent ? "No. Pokok / NIM" : isDosen ? "NIDN / NIP" : "No. Pokok / NIM"}</span>
                                <span>:</span>
                                <span className="font-medium text-gray-900">{(isViewingStudent ? profile?.nim : isDosen ? profile?.nidn : profile?.nim) || "-"}</span>
                            </div>
                            <div className="grid grid-cols-[140px_10px_1fr] items-center">
                                <span className="font-semibold text-gray-700">Nama Perusahaan</span>
                                <span>:</span>
                                <input 
                                    type="text" 
                                    name="namaPerusahaan"
                                    value={headerInfo.namaPerusahaan}
                                    onChange={handleHeaderChange}
                                    className="px-2 py-1 border-b border-gray-300 focus:border-[#D25026] outline-none bg-transparent w-full disabled:opacity-70"
                                    placeholder="Nama Perusahaan..."
                                    readOnly={isViewingStudent}
                                />
                            </div>
                            <div className="grid grid-cols-[140px_10px_1fr] items-center">
                                <span className="font-semibold text-gray-700">Tlp / Fax Perusahaan</span>
                                <span>:</span>
                                <input 
                                    type="text" 
                                    name="tlpFaxPerusahaan"
                                    value={headerInfo.tlpFaxPerusahaan}
                                    onChange={handleHeaderChange}
                                    className="px-2 py-1 border-b border-gray-300 focus:border-[#D25026] outline-none bg-transparent w-full disabled:opacity-70"
                                    placeholder="No Telp/Fax..."
                                    readOnly={isViewingStudent}
                                />
                            </div>
                            <div className="grid grid-cols-[140px_10px_1fr] items-start">
                                <span className="font-semibold text-gray-700 mt-1">Alamat Perusahaan</span>
                                <span className="mt-1">:</span>
                                <textarea 
                                    name="alamatPerusahaan"
                                    value={headerInfo.alamatPerusahaan}
                                    onChange={handleHeaderChange}
                                    readOnly={isViewingStudent}
                                    className="px-2 py-1 border-b border-gray-300 focus:border-[#D25026] outline-none bg-transparent w-full resize-none h-12 disabled:opacity-70"
                                    placeholder="Alamat lengkap..."
                                />
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-3">
                            <div className="grid grid-cols-[140px_10px_1fr] items-center">
                                <span className="font-semibold text-gray-700">Semester</span>
                                <span>:</span>
                                <input 
                                    type="text" 
                                    name="semester"
                                    value={headerInfo.semester}
                                    onChange={handleHeaderChange}
                                    readOnly={isViewingStudent}
                                    className="px-2 py-1 border-b border-gray-300 focus:border-[#D25026] outline-none bg-transparent w-full disabled:opacity-70"
                                    placeholder="e.g. 7"
                                />
                            </div>
                            <div className="grid grid-cols-[140px_10px_1fr] items-center">
                                <span className="font-semibold text-gray-700">Th. Akademik</span>
                                <span>:</span>
                                <input 
                                    type="text" 
                                    name="tahunAkademik"
                                    value={headerInfo.tahunAkademik}
                                    onChange={handleHeaderChange}
                                    readOnly={isViewingStudent}
                                    className="px-2 py-1 border-b border-gray-300 focus:border-[#D25026] outline-none bg-transparent w-full disabled:opacity-70"
                                    placeholder="e.g. 2023/2024"
                                />
                            </div>
                            <div className="grid grid-cols-[140px_10px_1fr] items-center">
                                <span className="font-semibold text-gray-700">Program Studi</span>
                                <span>:</span>
                                <span className="font-medium text-gray-900">{profile?.jurusan || "-"}</span>
                            </div>
                            <div className="grid grid-cols-[140px_10px_1fr] items-center">
                                <span className="font-semibold text-gray-700">Prog. Pendidikan</span>
                                <span>:</span>
                                <span className="font-medium text-gray-900">S-1</span>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="mt-8 space-y-4">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-8 bg-[#D25026] rounded-full" />
                                <h2 className="text-xl font-black text-gray-800 tracking-tight uppercase">Tabel Kegiatan Logbook</h2>
                            </div>
                        </div>
                        
                        <div className="border border-gray-800 rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 border-b-2 border-gray-800 text-gray-800">
                                <tr>
                                    <th className="px-4 py-3 border-r border-gray-800 text-center w-[220px]">
                                        <div className="font-bold">Tanggal & Pukul</div>
                                    </th>
                                    <th className="px-4 py-3 border-r border-gray-800 text-center">
                                        <div className="font-bold">Uraian Singkat</div>
                                        <div className="font-normal text-xs">sub pokok bahasan</div>
                                    </th>
                                    <th className="px-4 py-3 text-center border-r border-gray-800 w-[100px]">
                                        <div className="font-bold">Mahasiswa</div>
                                        <div className="text-xs font-normal">Paraf</div>
                                    </th>
                                    <th className="px-4 py-3 text-center border-r border-gray-800" colSpan={2}>
                                        <div className="font-bold">Pembimbing di Perusahaan</div>
                                        <div className="grid grid-cols-2 mt-1 gap-2 text-xs font-normal border-t border-gray-300 pt-1">
                                            <span>Paraf</span>
                                            <span>Catatan</span>
                                        </div>
                                    </th>
                                    {!isViewingStudent && <th className="px-4 py-3 text-center w-[60px]">Aksi</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map((entry, index) => (
                                    <tr key={entry.id} className={cn("border-b border-gray-300 transition-colors", (editingRowIds.has(entry.id) || !entry.pembimbingParaf) ? "bg-white" : "bg-gray-50/30")}>
                                        <td className="p-2 border-r border-gray-800 align-top bg-gray-50/30">
                                            <div className={cn("flex flex-col gap-2 h-full w-full", (!editingRowIds.has(entry.id) && entry.pembimbingParaf) && "pointer-events-none opacity-80")}>
                                                {/* Date Box */}
                                                <div className="w-full border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
                                                    <div className="bg-gray-50 px-2 py-1 border-b border-gray-100 flex items-center justify-between">
                                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Tanggal</span>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#D25026]/40" />
                                                    </div>
                                                    <div className="p-1">
                                                        <MonthYearFilter 
                                                            date={new Date(entry.tanggalPukul)}
                                                            setDate={(d) => {
                                                                if (isViewingStudent) return;
                                                                if (d) {
                                                                    const timePart = entry.tanggalPukul.split('T')[1] || "09:00";
                                                                    const newDateTime = `${format(d, "yyyy-MM-dd")}T${timePart}`;
                                                                    handleEntryChange(entry.id, 'tanggalPukul', newDateTime);
                                                                    handleEntryChange(entry.id, 'pembimbingParaf', null);
                                                                }
                                                            }}
                                                            showLabel={false}
                                                            compact={true}
                                                            className="w-full"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Time Box */}
                                                <div className="w-full border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
                                                    <div className="bg-gray-50 px-2 py-1 border-b border-gray-100 flex items-center justify-between">
                                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Pukul</span>
                                                        <Clock size={10} className="text-[#D25026] opacity-50" />
                                                    </div>
                                                    <div className="p-2">
                                                        <input 
                                                            type="time" 
                                                            disabled={isViewingStudent || isDosen || (!editingRowIds.has(entry.id) && !!entry.pembimbingParaf)}
                                                            value={entry.tanggalPukul.split('T')[1]?.slice(0, 5) || "09:00"}
                                                            onChange={(e) => {
                                                                const datePart = entry.tanggalPukul.split('T')[0];
                                                                handleEntryChange(entry.id, 'tanggalPukul', `${datePart}T${e.target.value}`);
                                                                handleEntryChange(entry.id, 'pembimbingParaf', null);
                                                            }}
                                                            className="outline-none text-sm font-black w-full bg-transparent text-gray-800 disabled:cursor-not-allowed tracking-widest text-center"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-0 border-r border-gray-800 align-top">
                                            <textarea 
                                                disabled={isViewingStudent || (!editingRowIds.has(entry.id) && !!entry.pembimbingParaf)}
                                                value={entry.uraian}
                                                onChange={(e) => {
                                                    handleEntryChange(entry.id, 'uraian', e.target.value);
                                                    handleEntryChange(entry.id, 'pembimbingParaf', null);
                                                }}
                                                placeholder="Tulis kegiatan..."
                                                className="w-full h-full min-h-[100px] p-4 bg-transparent outline-none resize-none text-sm leading-relaxed placeholder:text-gray-300 disabled:cursor-not-allowed disabled:text-gray-500"
                                            />
                                        </td>
                                        <td className="p-3 border-r border-gray-800 align-top text-center">
                                            <div className="flex items-center justify-center h-full pt-2">
                                                {entry.mahasiswaParaf ? (
                                                    <div className="flex flex-col items-center gap-1 group">
                                                        <div className="w-16 h-10 border border-gray-200 rounded bg-white p-0.5 relative">
                                                            <img src={entry.mahasiswaParaf} alt="Signature" className="w-full h-full object-contain" />
                                                             <button 
                                                                disabled={isViewingStudent || (!editingRowIds.has(entry.id) && !!entry.pembimbingParaf)}
                                                                onClick={() => setActiveSignature({ id: entry.id, type: 'mahasiswaParaf' })}
                                                                className={cn("absolute -top-2 -right-2 bg-gray-100 text-gray-500 rounded-full p-1 border border-gray-200 transition-opacity", (!isViewingStudent && (editingRowIds.has(entry.id) || !entry.pembimbingParaf)) ? "opacity-100" : "opacity-0 pointer-events-none")}
                                                                title="Ubah Tanda Tangan"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                                            </button>
                                                        </div>
                                                        <span className="text-[10px] text-green-600 font-medium flex items-center gap-1">
                                                            <CheckCircle size={10} /> Tertanda
                                                        </span>
                                                    </div>
                                                ) : (
                                                     <button 
                                                        type="button"
                                                        disabled={!editingRowIds.has(entry.id) && !!entry.pembimbingParaf}
                                                        onClick={() => setActiveSignature({ id: entry.id, type: 'mahasiswaParaf' })}
                                                        className={cn("flex flex-col items-center gap-1 cursor-pointer group p-1 transition-opacity", (!editingRowIds.has(entry.id) && entry.pembimbingParaf) && "opacity-50 cursor-not-allowed")}
                                                    >
                                                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border-2 bg-gray-50 border-gray-300 text-gray-400 transition-all", (editingRowIds.has(entry.id) || !entry.pembimbingParaf) && "group-hover:border-[#D25026] group-hover:text-[#D25026]")}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path><path d="m15 5 4 4"></path></svg>
                                                        </div>
                                                        <span className={cn("text-[10px] text-gray-500", (editingRowIds.has(entry.id) || !entry.pembimbingParaf) && "group-hover:text-[#D25026]")}>Klik TTD</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-3 border-r border-gray-300 align-top text-center w-[100px] bg-white">
                                            <div className="flex flex-col items-center justify-center h-full pt-2">
                                                {entry.pembimbingParaf ? (
                                                    <div className="flex flex-col items-center gap-1 group">
                                                        <div className="relative border border-gray-200 rounded bg-white p-1 h-12 w-24 flex items-center justify-center">
                                                            <img src={entry.pembimbingParaf} alt="Paraf" className="h-full w-auto object-contain" />
                                                            {!isViewingStudent && (
                                                                <button 
                                                                    disabled={!editingRowIds.has(entry.id)}
                                                                    onClick={() => setActiveSignature({ id: entry.id, type: 'pembimbingParaf' })}
                                                                    className={cn("absolute -top-2 -right-2 bg-gray-100 text-gray-500 rounded-full p-0.5 border border-gray-200 transition-opacity", editingRowIds.has(entry.id) ? "opacity-100" : "opacity-0 pointer-events-none")}
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                                                </button>
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] text-blue-600 font-medium flex items-center gap-1 uppercase tracking-tighter">
                                                            <CheckCircle size={10} /> Disetujui
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        type="button"
                                                        disabled={true}
                                                        className={cn("flex flex-col items-center gap-1 p-1 opacity-50 cursor-not-allowed")}
                                                    >
                                                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border-2 border-dashed bg-gray-50 border-gray-300 text-gray-400 transition-all")}>
                                                            <Plus size={16} />
                                                        </div>
                                                        <span className={cn("text-[10px] text-gray-500")}>Belum TTD</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-3 border-r border-gray-800 align-top">
                                            <textarea 
                                                value={entry.catatan}
                                                readOnly={true}
                                                disabled={true}
                                                placeholder={isViewingStudent ? "Tidak ada catatan." : "Catatan dari pembimbing..."}
                                                className="w-full px-3 py-2 border border-transparent bg-transparent outline-none min-h-[60px] resize-none text-sm text-gray-600 focus:bg-white focus:border-gray-100 rounded transition-all disabled:opacity-70"
                                            />
                                        </td>
                                        {!isViewingStudent && (
                                            <td className="p-3 align-middle text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    {(editingRowIds.has(entry.id) || !entry.pembimbingParaf) ? (
                                                        <button 
                                                            onClick={handleSave}
                                                            disabled={saving}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                                            title="Simpan perubahan"
                                                        >
                                                            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => toggleEditRow(entry.id)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Edit baris"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => removeEntry(entry.id)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Hapus baris"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {/* Add Button Row */}
                        {!isViewingStudent && (
                            <div className="bg-gray-50 p-3 border-t border-gray-800">
                                <button 
                                    onClick={addEntry}
                                    className="w-full py-2 border-2 border-dashed border-[#D25026]/50 text-[#D25026] hover:bg-[#D25026]/10 font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Plus size={18} />
                                    Tambah Kegiatan
                                </button>
                            </div>
                        )}
                        </div>
                    </div>

                    {/* Actions */}
                    {!isViewingStudent && (
                        <div className="flex justify-end pt-4">
                            <button 
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-8 py-3 bg-[#D25026] text-white font-bold rounded-xl hover:bg-[#B9441F] transition-all active:scale-95 shadow-lg shadow-[#D25026]/20 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save size={20} />
                                        Simpan Logbook
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <SignatureModal 
                isOpen={!!activeSignature}
                onClose={() => setActiveSignature(null)}
                onSave={(data) => {
                    if (activeSignature) {
                        handleEntryChange(activeSignature.id, activeSignature.type, data || null);
                    }
                }}
            />
        </div>
    );
}
