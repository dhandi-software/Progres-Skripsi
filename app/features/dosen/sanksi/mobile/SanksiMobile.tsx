import React, { useEffect, useState } from "react";
import { sanksiApi, type SanksiAdministrasi, type SupervisedStudent } from "~/api/sanksiApi";
import { Plus, Edit3, Trash2, X, Save, AlertCircle, FileText, Printer, Check, ChevronDown, User, ArrowLeft, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useAuth } from "~/context/AuthContext";

interface FormState {
    id?: number;
    mahasiswaId: string;
    nama: string;
    nim: string;
    hariSidang: string;
    tanggalSidang: string;
    hariTenggat: string;
    tanggalSurat: string;
    rawTanggalSidang?: string;
    durasiTenggat?: 1 | 2;
}

export function SanksiMobile({ title }: { title: string }) {
    const [sanksiList, setSanksiList] = useState<SanksiAdministrasi[]>([]);
    const [studentList, setStudentList] = useState<SupervisedStudent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { user } = useAuth();
    
    // Navigation / views
    const [viewMode, setViewMode] = useState<"list" | "form" | "preview">("list");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    const [form, setForm] = useState<FormState>({
        mahasiswaId: "",
        nama: "",
        nim: "",
        hariSidang: "",
        tanggalSidang: "",
        hariTenggat: "",
        tanggalSurat: ""
    });
    
    const [previewItem, setPreviewItem] = useState<SanksiAdministrasi | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [sanksiData, studentData] = await Promise.all([
                sanksiApi.getAllSanksi(),
                sanksiApi.getSupervisedStudents()
            ]);
            setSanksiList(sanksiData);
            setStudentList(studentData);
        } catch (error) {
            showToast("error", "Gagal memuat data.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const showToast = (type: "success" | "error", msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3500);
    };

    const handleOpenCreate = () => {
        const today = new Date();
        const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        const dayName = days[today.getDay()];
        const dateString = today.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
        
        const rawDate = today.toISOString().split("T")[0];
        
        setForm({
            mahasiswaId: "",
            nama: "",
            nim: "",
            hariSidang: dayName,
            tanggalSidang: dateString,
            hariTenggat: "Senin",
            tanggalSurat: dateString,
            rawTanggalSidang: rawDate,
            durasiTenggat: 1
        });
        updateTenggat(rawDate, 1);
        setViewMode("form");
    };

    const updateTenggat = (dateStr: string, durasi: 1 | 2) => {
        if (!dateStr) return;
        const dateObj = new Date(dateStr);
        if (isNaN(dateObj.getTime())) return;

        const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        const hariSidang = days[dateObj.getDay()];
        const tanggalSidang = dateObj.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
        
        const tenggatObj = new Date(dateStr);
        tenggatObj.setDate(tenggatObj.getDate() + (durasi * 7));
        const hariTenggat = `${days[tenggatObj.getDay()]}, ${tenggatObj.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`;
        
        setForm(prev => ({
            ...prev,
            rawTanggalSidang: dateStr,
            durasiTenggat: durasi,
            hariSidang,
            tanggalSidang,
            hariTenggat
        }));
    };

    const handleOpenEdit = (item: SanksiAdministrasi, e: React.MouseEvent) => {
        e.stopPropagation();
        setForm({
            id: item.id,
            mahasiswaId: String(item.mahasiswaId),
            nama: item.nama,
            nim: item.nim,
            hariSidang: item.hariSidang,
            tanggalSidang: item.tanggalSidang,
            hariTenggat: item.hariTenggat,
            tanggalSurat: item.tanggalSurat,
            rawTanggalSidang: "",
            durasiTenggat: 1
        });
        setViewMode("form");
    };

    const handleOpenPreview = (item: SanksiAdministrasi) => {
        setPreviewItem(item);
        setViewMode("preview");
    };

    const handleSelectStudent = (student: SupervisedStudent) => {
        if (student.statusSidang !== 'TERJADWAL' || !student.tanggalSidang) {
            setForm(prev => ({
                ...prev,
                mahasiswaId: String(student.id),
                nama: student.nama,
                nim: student.nim,
                rawTanggalSidang: "",
                tanggalSidang: "Tanggal sidang belum dijadwalkan"
            }));
            setIsDropdownOpen(false);
            return;
        }

        let rawDate = new Date().toISOString().split("T")[0];
        const sidDate = new Date(student.tanggalSidang);
        if (!isNaN(sidDate.getTime())) {
            rawDate = sidDate.toISOString().split("T")[0];
        }

        setForm(prev => ({
            ...prev,
            mahasiswaId: String(student.id),
            nama: student.nama,
            nim: student.nim,
            rawTanggalSidang: rawDate
        }));
        
        updateTenggat(rawDate, form.durasiTenggat || 1);
        setIsDropdownOpen(false);
    };

    const handleSave = async () => {
        if (!form.mahasiswaId || !form.nama || !form.nim) {
            showToast("error", "Pilih mahasiswa dan lengkapi data.");
            return;
        }

        if (!form.rawTanggalSidang || form.tanggalSidang === "Tanggal sidang belum dijadwalkan") {
            showToast("error", "Sidang belum dijadwalkan. Sanksi administrasi tidak dapat diterbitkan.");
            return;
        }

        try {
            setIsSaving(true);
            const payload = {
                mahasiswaId: form.mahasiswaId,
                nama: form.nama,
                nim: form.nim,
                hariSidang: form.hariSidang,
                tanggalSidang: form.tanggalSidang,
                hariTenggat: form.hariTenggat,
                tanggalSurat: form.tanggalSurat
            };

            if (form.id) {
                await sanksiApi.updateSanksi(form.id, payload);
                showToast("success", "Sanksi diperbarui!");
            } else {
                await sanksiApi.createSanksi(payload);
                showToast("success", "Sanksi diterbitkan!");
            }
            setViewMode("list");
            fetchData();
        } catch (error: any) {
            const msg = error.response?.data?.error || "Gagal menyimpan sanksi.";
            showToast("error", msg);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteConfirmId(id);
    };

    const confirmDelete = async () => {
        if (!deleteConfirmId) return;
        try {
            await sanksiApi.deleteSanksi(deleteConfirmId);
            showToast("success", "Sanksi dihapus.");
            setDeleteConfirmId(null);
            fetchData();
        } catch (error) {
            showToast("error", "Gagal menghapus sanksi.");
        }
    };

    const handleTerimaHardcover = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await sanksiApi.terimaHardcover(id);
            showToast("success", "Hardcover telah diterima.");
            fetchData();
        } catch (error) {
            showToast("error", "Gagal memperbarui status hardcover.");
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const calculateWeeksLate = (tenggat?: string) => {
        if (!tenggat) return 0;
        const now = new Date();
        const tglTenggat = new Date(tenggat);
        if (now <= tglTenggat) return 0;
        const diffMs = now.getTime() - tglTenggat.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        return Math.ceil(diffDays / 7);
    };

    const selectedStudent = studentList.find(s => String(s.id) === form.mahasiswaId);

    return (
        <div className="flex flex-col min-h-full bg-slate-50 p-4 font-sans print:p-0 print:bg-white">
            <style type="text/css" media="print">
                {`@page { margin: 0; } body { margin: 1cm; }`}
            </style>

            {/* Toast feedback */}
            {toast && (
                <div className={cn(
                    "fixed top-4 right-4 left-4 z-[2000] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border bg-white border-slate-100 transition-all animate-in fade-in slide-in-from-top-4 print:hidden",
                    toast.type === "success" ? "text-emerald-700 bg-emerald-50 border-emerald-100" : "text-red-700 bg-red-50 border-red-100"
                )}>
                    {toast.type === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
                    <span className="text-xs font-bold">{toast.msg}</span>
                </div>
            )}

            {/* Back headers */}
            {viewMode !== "list" && (
                <div className="flex items-center gap-3 mb-6 print:hidden">
                    <button
                        onClick={() => setViewMode("list")}
                        className="p-2 bg-white rounded-full border border-slate-200 text-slate-600 active:scale-95 transition-transform"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-slate-800">
                            {viewMode === "form" ? (form.id ? "Edit Sanksi" : "Terbitkan Sanksi") : "Preview Surat"}
                        </h1>
                        <p className="text-xs text-slate-500">Kembali ke list sanksi</p>
                    </div>
                    {viewMode === "preview" && (
                        <Button onClick={handlePrint} size="sm" className="ml-auto bg-brand-primary text-white hover:bg-brand-primary/95 flex items-center gap-1 text-xs">
                            <Printer size={12} />
                            Cetak
                        </Button>
                    )}
                </div>
            )}

            {/* List View */}
            {viewMode === "list" && (
                <>
                    <div className="flex justify-between items-start mb-6 print:hidden">
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">{title}</h1>
                            <p className="text-xs text-slate-500 mt-1">Kelola sanksi administrasi bimbingan Anda.</p>
                        </div>
                        <Button onClick={handleOpenCreate} size="sm" className="bg-brand-primary text-white rounded-xl shadow-md p-2 h-9 w-9">
                            <Plus size={18} />
                        </Button>
                    </div>

                    {isLoading ? (
                        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex items-center justify-center print:hidden">
                            <div className="w-6 h-6 rounded-full border-3 border-slate-200 border-t-brand-primary animate-spin" />
                        </div>
                    ) : sanksiList.length === 0 ? (
                        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3 print:hidden">
                            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                                <FileText size={24} />
                            </div>
                            <h2 className="text-lg font-bold text-slate-700">Belum Ada Sanksi</h2>
                            <p className="text-xs text-slate-500">Ketuk ikon "+" untuk mulai menerbitkan sanksi baru.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 print:hidden">
                            {sanksiList.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => handleOpenPreview(item)}
                                    className="p-4 bg-white border border-slate-200 rounded-2xl cursor-pointer active:bg-slate-50 transition-all flex items-center gap-3"
                                >
                                    <div className="p-2.5 bg-brand-primary/10 text-brand-primary rounded-xl shrink-0">
                                        <FileText size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-800 text-sm truncate">{item.nama}</h4>
                                        <p className="text-xs text-slate-500 mb-0.5">NIM: {item.nim}</p>
                                        <p className="text-[10px] text-slate-500 mb-1">Pembimbing: {item.dosen?.nama || "-"}</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5 mb-2">Sidang: {item.tanggalSidang}</p>
                                        
                                        {/* Status Badge */}
                                        {item.status === 'Selesai/Lunas' && (
                                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 w-fit">
                                                <CheckCircle2 size={12} /> Lunas
                                            </div>
                                        )}
                                        {item.status === 'Terlambat' && (
                                            <div className="flex flex-col gap-1">
                                                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-700 text-[10px] font-bold border border-red-200 w-fit">
                                                    <AlertCircle size={12} /> Telat {calculateWeeksLate(item.tenggatWaktu)} Minggu
                                                </div>
                                                <div className="text-[10px] text-red-600 font-bold">
                                                    Denda: Rp {Math.min(calculateWeeksLate(item.tenggatWaktu) * 50000, 200000).toLocaleString('id-ID')}
                                                </div>
                                            </div>
                                        )}
                                        {(!item.status || item.status === 'Menunggu Hardcover') && (
                                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200 w-fit">
                                                <Clock size={12} /> Menunggu
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1 items-end">
                                        {user?.role?.toUpperCase() === 'STAF' && item.status !== 'Selesai/Lunas' && (
                                            <button
                                                onClick={(e) => handleTerimaHardcover(item.id, e)}
                                                className="p-2 mb-1 bg-emerald-50 text-emerald-600 rounded-lg active:bg-emerald-200 transition-colors border border-emerald-100"
                                            >
                                                <Check size={14} />
                                            </button>
                                        )}
                                        <div className="flex gap-1">
                                            <button
                                                onClick={(e) => handleOpenEdit(item, e)}
                                                className="p-2 bg-slate-50 text-slate-600 rounded-lg active:bg-slate-200 transition-colors"
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(item.id, e)}
                                                className="p-2 bg-red-50 text-red-500 rounded-lg active:bg-red-200 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Form View (Create / Edit) */}
            {viewMode === "form" && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-5 print:hidden">
                    {/* Student Selection */}
                    <div className="relative">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Mahasiswa Bimbingan</label>
                        {!form.id ? (
                            <>
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition-all text-left"
                                >
                                    <span className="flex items-center gap-2">
                                        <User size={14} className="text-slate-400" />
                                        {selectedStudent ? `${selectedStudent.nama} (${selectedStudent.nim})` : "Pilih Mahasiswa..."}
                                    </span>
                                    <ChevronDown size={14} className="text-slate-500" />
                                </button>
                                
                                {isDropdownOpen && (
                                    <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-slate-200 shadow-lg rounded-xl max-h-40 overflow-y-auto">
                                        {studentList.length === 0 ? (
                                            <div className="p-3 text-xs text-slate-400 text-center">Tidak ada mahasiswa yang sidangnya sudah dijadwalkan.</div>
                                        ) : (
                                            studentList.map(s => (
                                            <div
                                                key={s.id}
                                                onClick={() => handleSelectStudent(s)}
                                                className="px-3 py-2.5 hover:bg-slate-50 cursor-pointer text-xs font-semibold text-slate-800 transition-all flex items-center justify-between"
                                            >
                                                <span>{s.nama} ({s.nim})</span>
                                            </div>
                                        )))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-500 flex items-center gap-2">
                                <User size={14} />
                                {form.nama} ({form.nim})
                            </div>
                        )}
                    </div>

                    {form.mahasiswaId && (
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Override Nama</label>
                                <Input
                                    value={form.nama}
                                    onChange={e => setForm({ ...form, nama: e.target.value })}
                                    className="bg-white border-slate-200 h-10 text-xs font-semibold rounded-xl"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Override NIM</label>
                                <Input
                                    value={form.nim}
                                    onChange={e => setForm({ ...form, nim: e.target.value })}
                                    className="bg-white border-slate-200 h-10 text-xs font-semibold rounded-xl"
                                />
                            </div>
                        </div>
                    )}

                    {/* Sidang Details */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-4">
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Informasi Sidang</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-2">Pilih Tanggal Sidang</label>
                                <Input
                                    type="date"
                                    value={form.rawTanggalSidang || ""}
                                    onChange={e => updateTenggat(e.target.value, form.durasiTenggat || 1)}
                                    readOnly={true}
                                    className="bg-slate-50 border-slate-200 h-10 text-xs font-semibold rounded-xl text-slate-500 cursor-not-allowed focus-visible:ring-0 opacity-70"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-2">Teks Tanggal Sidang (Otomatis)</label>
                                <Input
                                    placeholder="Contoh: 15 Juni 2026"
                                    value={form.tanggalSidang}
                                    readOnly={true}
                                    className="bg-slate-50 border-slate-200 h-10 text-xs font-semibold rounded-xl text-slate-500 cursor-not-allowed focus-visible:ring-0 opacity-70"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Deadline hardcover */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Tenggat Waktu & Surat</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-2">Tenggat Hardcover (+1 / +2 Minggu)</label>
                                <div className="flex gap-2 mb-2">
                                    <button 
                                        onClick={() => {
                                            if (!form.rawTanggalSidang) {
                                                alert("Silakan isi 'Pilih Tanggal Sidang' terlebih dahulu!");
                                                return;
                                            }
                                            updateTenggat(form.rawTanggalSidang, 1);
                                        }}
                                        className={cn("flex-1 py-1.5 text-[10px] font-bold rounded-lg border", form.durasiTenggat === 1 ? "bg-brand-primary text-white border-brand-primary" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50")}
                                    >
                                        +1 Minggu
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if (!form.rawTanggalSidang) {
                                                alert("Silakan isi 'Pilih Tanggal Sidang' terlebih dahulu!");
                                                return;
                                            }
                                            updateTenggat(form.rawTanggalSidang, 2);
                                        }}
                                        className={cn("flex-1 py-1.5 text-[10px] font-bold rounded-lg border", form.durasiTenggat === 2 ? "bg-brand-primary text-white border-brand-primary" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50")}
                                    >
                                        +2 Minggu
                                    </button>
                                </div>
                                <Input
                                    placeholder="Contoh: Senin atau Senin, 22 Juni 2026"
                                    value={form.hariTenggat}
                                    onChange={e => setForm({ ...form, hariTenggat: e.target.value })}
                                    className="bg-white border-slate-200 h-10 text-xs font-semibold rounded-xl"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-2">Tanggal Surat</label>
                                <Input
                                    placeholder="Contoh: 15/06/2026"
                                    value={form.tanggalSurat}
                                    onChange={e => setForm({ ...form, tanggalSurat: e.target.value })}
                                    className="bg-white border-slate-200 h-10 text-xs font-semibold rounded-xl"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 justify-end mt-4">
                        <button
                            onClick={() => setViewMode("list")}
                            className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-600 transition-colors"
                        >
                            Batal
                        </button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-brand-primary text-white hover:bg-brand-primary/95 px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                        >
                            <Save size={14} />
                            {isSaving ? "Menyimpan..." : "Simpan Sanksi"}
                        </Button>
                    </div>
                </div>
            )}

            {/* Document Preview View */}
            {viewMode === "preview" && previewItem && (
                <div className="flex justify-center print:block print:w-full">
                    <div className="w-full bg-white border border-slate-200 shadow-md rounded-2xl p-6 flex flex-col text-black font-serif text-[13px] leading-relaxed relative min-h-[600px] print:p-0 print:border-none print:shadow-none print:rounded-none print:w-full print:max-w-none print:m-0 print:min-h-0">
                        {/* Letter Header */}
                        <div className="text-center font-bold text-base border-b border-black pb-2 mb-6 tracking-wider uppercase">
                            SURAT PERNYATAAN
                        </div>

                        <div className="mb-4 font-sans text-xs print:font-serif">
                            Yang bertanda tangan di bawah ini:
                        </div>

                        {/* Student Meta */}
                        <div className="grid grid-cols-[80px_15px_1fr] gap-y-2 mb-6 font-sans text-xs pl-2 print:font-serif">
                            <div className="font-bold">Nama</div>
                            <div>:</div>
                            <div className="font-semibold text-slate-900">{previewItem.nama}</div>

                            <div className="font-bold">NIM</div>
                            <div>:</div>
                            <div className="font-semibold text-slate-900">{previewItem.nim}</div>
                        </div>

                        {/* Body Text */}
                        <div className="mb-4 font-sans text-xs leading-relaxed text-justify print:font-serif">
                            Menyatakan telah mengikuti <strong className="font-bold">Sidang Evaluasi Kerja Praktik</strong> pada hari <strong>{previewItem.hariSidang}</strong> tanggal <strong>{previewItem.tanggalSidang}</strong>, dan akan mengembalikan atau mengumpulkan:
                        </div>

                        {/* Ordered Lists */}
                        <ol className="list-decimal pl-5 mb-8 flex flex-col gap-3 font-sans text-xs text-justify print:font-serif">
                            <li>
                                Berkas Kerja Praktik yang sudah diselesaikan dalam bentuk hardcover paling lambat hari <strong>{previewItem.hariTenggat}</strong>.
                            </li>
                            <li>
                                Jika mengumpulkan lebih dari tanggal tersebut, bersedia mengikuti konsekuensinya untuk membayar denda administrasi:
                                <ul className="list-disc pl-4 mt-1 flex flex-col gap-1">
                                    <li>
                                        Sebesar <strong>Rp. 50.000,- (Lima Puluh Ribu Rupiah)</strong> untuk keterlambatan 1 (satu) minggu setelah tanggal pelaksanaan Sidang KP.
                                    </li>
                                    <li>
                                        Sebesar <strong>Rp. 50.000,- (Lima Puluh Ribu Rupiah)</strong> untuk keterlambatan setiap minggu berikutnya sampai dengan maksimal akumulasi denda adalah <strong>Rp. 200.000,- (Dua Ratus Ribu Rupiah)</strong>.
                                    </li>
                                </ul>
                            </li>
                        </ol>

                        {/* Date and Signatures */}
                        <div className="mt-auto flex flex-col items-end">
                            <div className="font-sans text-xs mb-8 pr-2 print:font-serif">
                                Jakarta, {previewItem.tanggalSurat}
                            </div>

                            <div className="flex flex-col items-center mr-4 select-none">
                                {/* Stamp Box */}
                                <div className="w-[100px] h-[75px] border border-black flex flex-col items-center justify-center text-[9px] font-sans font-bold text-slate-500 tracking-wide uppercase bg-slate-50/50 mb-2 border-dashed print:bg-white print:border-solid">
                                    <span>Meterai</span>
                                    <span className="text-[10px] mt-0.5 text-slate-600">Rp. 10.000</span>
                                </div>
                                <div className="w-32 border-b border-black mt-8 mb-1"></div>
                                <div className="text-[10px] font-sans text-slate-500 font-bold uppercase tracking-wider">{previewItem.nama}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmId && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200 print:hidden">
                    <div className="bg-white rounded-3xl shadow-lg p-6 max-w-[320px] text-center animate-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 mx-auto mb-4">
                            <AlertCircle size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Hapus Sanksi</h3>
                        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                            Apakah Anda yakin ingin menghapus sanksi ini? Tindakan ini permanen.
                        </p>
                        <div className="flex gap-2 justify-center">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-500"
                            >
                                Batal
                            </button>
                            <Button
                                onClick={confirmDelete}
                                className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl text-xs font-bold"
                            >
                                Hapus
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
