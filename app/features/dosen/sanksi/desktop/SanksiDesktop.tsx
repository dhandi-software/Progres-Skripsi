import React, { useEffect, useState } from "react";
import { sanksiApi, type SanksiAdministrasi, type SupervisedStudent } from "~/api/sanksiApi";
import { Plus, Edit3, Trash2, X, Save, AlertCircle, FileText, Printer, Check, ChevronDown, User, Calendar, Clock, CheckCircle2 } from "lucide-react";
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

export function SanksiDesktop({ title }: { title: string }) {
    const [sanksiList, setSanksiList] = useState<SanksiAdministrasi[]>([]);
    const [studentList, setStudentList] = useState<SupervisedStudent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { user } = useAuth();

    // Modal & Form states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [form, setForm] = useState<FormState>({
        mahasiswaId: "",
        nama: "",
        nim: "",
        hariSidang: "",
        tanggalSidang: "",
        hariTenggat: "",
        tanggalSurat: ""
    });

    // Student dropdown state
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Preview state
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
        setIsFormOpen(true);
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

    const handleOpenEdit = (item: SanksiAdministrasi) => {
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
        setIsFormOpen(true);
    };

    const handleSelectStudent = (student: SupervisedStudent) => {
        let rawDate = form.rawTanggalSidang || new Date().toISOString().split("T")[0];
        if (student.tanggalSidang) {
            const sidDate = new Date(student.tanggalSidang);
            if (!isNaN(sidDate.getTime())) {
                rawDate = sidDate.toISOString().split("T")[0];
            }
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
            showToast("error", "Harap pilih mahasiswa dan lengkapi data.");
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
                showToast("success", "Sanksi administrasi berhasil diperbarui!");
            } else {
                await sanksiApi.createSanksi(payload);
                showToast("success", "Sanksi administrasi baru berhasil diterbitkan!");
            }
            setIsFormOpen(false);
            fetchData();
        } catch (error: any) {
            const msg = error.response?.data?.error || "Gagal menyimpan sanksi administrasi.";
            showToast("error", msg);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await sanksiApi.deleteSanksi(id);
            showToast("success", "Sanksi administrasi berhasil dihapus.");
            setDeleteConfirmId(null);
            fetchData();
        } catch (error) {
            showToast("error", "Gagal menghapus sanksi administrasi.");
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleTerimaHardcover = async (id: number) => {
        try {
            await sanksiApi.terimaHardcover(id);
            showToast("success", "Hardcover telah diterima, status diperbarui.");
            fetchData();
        } catch (error) {
            showToast("error", "Gagal memperbarui status hardcover.");
        }
    };

    const selectedStudent = studentList.find(s => String(s.id) === form.mahasiswaId);

    const calculateWeeksLate = (tenggat?: string) => {
        if (!tenggat) return 0;
        const now = new Date();
        const tglTenggat = new Date(tenggat);
        if (now <= tglTenggat) return 0;
        const diffMs = now.getTime() - tglTenggat.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        return Math.ceil(diffDays / 7);
    };

    return (
        <div className="flex flex-col min-h-full bg-slate-50 p-8 font-sans print:p-0 print:bg-white">
            <style type="text/css" media="print">
                {`@page { margin: 0; } body { margin: 1.6cm; }`}
            </style>
            {/* Toast feedback */}
            {toast && (
                <div className={cn(
                    "fixed top-6 right-6 z-[2000] flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border transition-all animate-in fade-in slide-in-from-top-4 print:hidden",
                    toast.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-red-50 border-red-100 text-red-800"
                )}>
                    {toast.type === "success" ? <Check size={18} /> : <AlertCircle size={18} />}
                    <span className="text-sm font-bold">{toast.msg}</span>
                </div>
            )}

            {/* Header Area */}
            <div className="flex justify-between items-end mb-8 print:hidden">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">{title}</h1>
                    <p className="text-sm text-slate-500 mt-1">Terbitkan dan kelola sanksi administrasi / surat pernyataan untuk mahasiswa setelah sidang evaluasi.</p>
                </div>
                <Button onClick={handleOpenCreate} className="bg-brand-primary text-white hover:bg-brand-primary/95 flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-lg shadow-brand-primary/20 font-bold transition-all active:scale-[0.98]">
                    <Plus size={16} />
                    Tambah Sanksi Administrasi
                </Button>
            </div>

            {/* Main Content Table / List */}
            {isLoading ? (
                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-24 text-center flex items-center justify-center print:hidden">
                    <div className="w-8 h-8 rounded-full border-3 border-slate-200 border-t-brand-primary animate-spin" />
                </div>
            ) : sanksiList.length === 0 ? (
                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-16 text-center flex flex-col items-center justify-center gap-4 print:hidden">
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                        <FileText size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-700">Belum Ada Sanksi Administrasi</h2>
                    <p className="text-sm text-slate-500 w-full text-center">Klik tombol "Tambah Sanksi Administrasi" di kanan atas untuk mulai menerbitkan surat pernyataan baru.</p>
                </div>
            ) : (
                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-x-auto print:hidden">
                    <table className="w-full min-w-[800px] text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Mahasiswa</th>
                                <th className="px-6 py-4">NIM</th>
                                <th className="px-6 py-4">Tanggal Sidang</th>
                                <th className="px-6 py-4">Tenggat Hardcover</th>
                                <th className="px-6 py-4">Tanggal Surat</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {sanksiList.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800">{item.nama}</div>

                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">{item.nim}</td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">
                                        <div>{item.hariSidang}</div>
                                        <div className="text-xs text-slate-400">{item.tanggalSidang}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">{item.hariTenggat}</td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">{item.tanggalSurat}</td>
                                    <td className="px-6 py-4">
                                        {item.status === 'Selesai/Lunas' && (
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 whitespace-nowrap">
                                                <CheckCircle2 size={14} /> Lunas / Diterima
                                            </div>
                                        )}
                                        {item.status === 'Terlambat' && (
                                            <div className="flex flex-col gap-1">
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200 whitespace-nowrap w-fit">
                                                    <AlertCircle size={14} /> Terlambat
                                                </div>
                                                <span className="text-xs text-red-600 font-semibold pl-1">
                                                    Telat {calculateWeeksLate(item.tenggatWaktu)} Minggu
                                                </span>
                                            </div>
                                        )}
                                        {(!item.status || item.status === 'Menunggu Hardcover') && (
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200 whitespace-nowrap">
                                                <Clock size={14} /> Menunggu
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            {user?.role?.toUpperCase() === 'STAF' && item.status !== 'Selesai/Lunas' && (
                                                <Button
                                                    onClick={() => handleTerimaHardcover(item.id)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl font-bold bg-emerald-50/50"
                                                >
                                                    <Check size={14} className="mr-1.5" /> Terima Hardcover
                                                </Button>
                                            )}
                                            <Button
                                                onClick={() => setPreviewItem(item)}
                                                variant="outline"
                                                size="sm"
                                                className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl"
                                            >
                                                Pratinjau
                                            </Button>
                                            <Button
                                                onClick={() => handleOpenEdit(item)}
                                                variant="outline"
                                                size="icon"
                                                className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl w-9 h-9"
                                            >
                                                <Edit3 size={14} />
                                            </Button>
                                            <Button
                                                onClick={() => setDeleteConfirmId(item.id)}
                                                variant="outline"
                                                size="icon"
                                                className="border-slate-200 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-100 rounded-xl w-9 h-9"
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Form Modal (Create / Edit) */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto print:hidden">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[600px] overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
                        {/* Modal Header */}
                        <div className="bg-slate-50 border-b border-slate-100 px-6 py-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h2 className="font-extrabold text-slate-800 text-lg leading-none">
                                        {form.id ? "Edit Sanksi Administrasi" : "Terbitkan Sanksi Administrasi"}
                                    </h2>
                                    <p className="text-xs text-slate-500 mt-1">Lengkapi form pembuatan surat pernyataan denda.</p>
                                </div>
                            </div>
                            <button onClick={() => setIsFormOpen(false)} className="p-2 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 flex flex-col gap-6 max-h-[70vh] overflow-y-auto">
                            {/* Student Selection Dropdown */}
                            <div className="relative">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Mahasiswa Bimbingan</label>
                                {!form.id ? (
                                    <>
                                        <button
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100/70 transition-all text-left"
                                        >
                                            <span className="flex items-center gap-2">
                                                <User size={16} className="text-slate-400" />
                                                {selectedStudent ? `${selectedStudent.nama} (${selectedStudent.nim})` : "Pilih Mahasiswa..."}
                                            </span>
                                            <ChevronDown size={16} className="text-slate-500" />
                                        </button>

                                        {isDropdownOpen && (
                                            <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-slate-200 shadow-xl rounded-2xl max-h-52 overflow-y-auto">
                                                {studentList.length === 0 ? (
                                                    <div className="p-4 text-xs text-slate-400 text-center">Tidak ada mahasiswa bimbingan yang memenuhi syarat.</div>
                                                ) : (
                                                    studentList.map(s => (
                                                        <div
                                                            key={s.id}
                                                            onClick={() => handleSelectStudent(s)}
                                                            className="px-4 py-3 hover:bg-slate-50 cursor-pointer text-sm font-semibold text-slate-800 transition-all flex items-center justify-between"
                                                        >
                                                            <span>{s.nama} <span className="text-xs text-slate-400 ml-1">({s.nim})</span></span>

                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-500 flex items-center gap-2">
                                        <User size={16} />
                                        {form.nama} ({form.nim})
                                    </div>
                                )}
                            </div>

                            {/* Manual Nama/NIM edit override (if needed) */}
                            {form.mahasiswaId && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Override Nama</label>
                                        <Input
                                            value={form.nama}
                                            onChange={e => setForm({ ...form, nama: e.target.value })}
                                            className="bg-white border-slate-200 h-11 text-sm font-semibold rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Override NIM</label>
                                        <Input
                                            value={form.nim}
                                            onChange={e => setForm({ ...form, nim: e.target.value })}
                                            className="bg-white border-slate-200 h-11 text-sm font-semibold rounded-xl"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Sidang Details */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Pilih Tanggal Sidang</label>
                                    <Input
                                        type="date"
                                        value={form.rawTanggalSidang || ""}
                                        onChange={e => updateTenggat(e.target.value, form.durasiTenggat || 1)}
                                        readOnly={true}
                                        className="bg-slate-50 border-slate-200 h-11 text-sm font-semibold rounded-xl text-slate-500 cursor-not-allowed focus-visible:ring-0 opacity-70"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Teks Tanggal Sidang (Otomatis)</label>
                                    <Input
                                        placeholder="Contoh: 15 Juni 2026"
                                        value={form.tanggalSidang}
                                        readOnly={true}
                                        className="bg-slate-50 border-slate-200 h-11 text-sm font-semibold rounded-xl text-slate-500 cursor-not-allowed focus-visible:ring-0 opacity-70"
                                    />
                                </div>
                            </div>

                            {/* Deadline Hardcover */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Tenggat Hardcover (+1 / +2 Minggu)</label>
                                    <div className="flex gap-2 mb-2">
                                        <button 
                                            onClick={() => {
                                                if (!form.rawTanggalSidang) {
                                                    alert("Silakan isi 'Pilih Tanggal Sidang' terlebih dahulu!");
                                                    return;
                                                }
                                                updateTenggat(form.rawTanggalSidang, 1);
                                            }}
                                            className={cn("flex-1 py-1.5 text-xs font-bold rounded-lg border", form.durasiTenggat === 1 ? "bg-brand-primary text-white border-brand-primary" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50")}
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
                                            className={cn("flex-1 py-1.5 text-xs font-bold rounded-lg border", form.durasiTenggat === 2 ? "bg-brand-primary text-white border-brand-primary" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50")}
                                        >
                                            +2 Minggu (Maks)
                                        </button>
                                    </div>
                                    <Input
                                        placeholder="Contoh: Senin atau Senin, 22 Juni 2026"
                                        value={form.hariTenggat}
                                        onChange={e => setForm({ ...form, hariTenggat: e.target.value })}
                                        className="bg-white border-slate-200 h-11 text-sm font-semibold rounded-xl"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Tanggal Surat Pernyataan</label>
                                    <Input
                                        placeholder="Contoh: 15 Juni 2026"
                                        value={form.tanggalSurat}
                                        onChange={e => setForm({ ...form, tanggalSurat: e.target.value })}
                                        className="bg-white border-slate-200 h-11 text-sm font-semibold rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-slate-50 border-t border-slate-100 px-6 py-5 flex items-center justify-end gap-3">
                            <button onClick={() => setIsFormOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-200 transition-colors">
                                Batal
                            </button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-brand-primary text-white hover:bg-brand-primary/95 px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-brand-primary/10 flex items-center gap-2"
                            >
                                <Save size={16} />
                                {isSaving ? "Menyimpan..." : "Simpan Sanksi"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Document Preview Modal */}
            {previewItem && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300 overflow-y-auto print:absolute print:inset-0 print:bg-white print:p-0 print:z-0 print:block print:overflow-visible print:w-full print:h-auto">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[850px] overflow-hidden my-auto print:rounded-none print:shadow-none print:w-full print:max-w-none print:m-0 print:bg-white">
                        {/* Preview Topbar (Hidden on print) */}
                        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between print:hidden">
                            <div className="flex items-center gap-2">
                                <FileText size={18} className="text-slate-500" />
                                <span className="font-bold text-slate-800 text-sm">Pratinjau Surat Pernyataan</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button onClick={handlePrint} size="sm" className="bg-brand-primary text-white hover:bg-brand-primary/95 flex items-center gap-1.5 px-4 rounded-xl text-xs font-bold">
                                    <Printer size={14} />
                                    Cetak PDF
                                </Button>
                                <button onClick={() => setPreviewItem(null)} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Formal Document Sheet */}
                        <div className="p-8 max-h-[75vh] overflow-y-auto bg-slate-100 flex justify-center print:p-0 print:bg-white print:max-h-none print:overflow-visible print:w-full print:block">
                            <div className="w-full max-w-[800px] bg-white border border-slate-200 shadow-lg p-16 flex flex-col text-black font-serif text-[14px] leading-relaxed min-h-[1000px] print:p-0 print:border-none print:shadow-none print:w-full print:max-w-none print:m-0 print:min-h-0 print:bg-white">
                                {/* Header */}
                                <div className="text-center font-bold text-lg border-b border-black pb-3 mb-8 tracking-widest uppercase">
                                    SURAT PERNYATAAN
                                </div>

                                <div className="mb-6 font-sans text-sm print:font-serif">
                                    Yang bertanda tangan di bawah ini:
                                </div>

                                {/* Student Meta */}
                                <div className="grid grid-cols-[100px_20px_1fr] gap-y-3 mb-8 font-sans text-sm pl-4 print:font-serif">
                                    <div className="font-bold">Nama</div>
                                    <div>:</div>
                                    <div className="border-b border-slate-200 pb-0.5 font-semibold text-slate-900 print:border-none">{previewItem.nama}</div>

                                    <div className="font-bold">NIM</div>
                                    <div>:</div>
                                    <div className="border-b border-slate-200 pb-0.5 font-semibold text-slate-900 print:border-none">{previewItem.nim}</div>
                                </div>

                                {/* Body */}
                                <div className="mb-6 font-sans text-sm leading-loose text-justify print:font-serif">
                                    Menyatakan telah mengikuti <strong className="font-bold text-black">Sidang Evaluasi Kerja Praktik</strong> pada hari <strong className="font-bold text-black">{previewItem.hariSidang}</strong> tanggal <strong className="font-bold text-black">{previewItem.tanggalSidang}</strong>, dan akan mengembalikan atau mengumpulkan:
                                </div>

                                <ol className="list-decimal pl-6 mb-12 flex flex-col gap-4 font-sans text-sm text-justify print:font-serif">
                                    <li>
                                        Berkas Kerja Praktik yang sudah diselesaikan dalam bentuk hardcover paling lambat hari <strong className="font-bold text-black">{previewItem.hariTenggat}</strong>.
                                    </li>
                                    <li>
                                        Jika mengumpulkan lebih dari tanggal tersebut, bersedia mengikuti konsekuensinya untuk membayar denda administrasi:
                                        <ul className="list-disc pl-5 mt-2 flex flex-col gap-2">
                                            <li>
                                                Sebesar <strong className="font-bold text-black">Rp. 50.000,- (Lima Puluh Ribu Rupiah)</strong> untuk keterlambatan 1 (satu) minggu setelah tanggal pelaksanaan Sidang KP.
                                            </li>
                                            <li>
                                                Sebesar <strong className="font-bold text-black">Rp. 50.000,- (Lima Puluh Ribu Rupiah)</strong> untuk keterlambatan setiap minggu berikutnya sampai dengan maksimal akumulasi denda adalah <strong className="font-bold text-black">Rp. 200.000,- (Dua Ratus Ribu Rupiah)</strong>.
                                            </li>
                                        </ul>
                                    </li>
                                </ol>

                                <div className="mt-auto flex flex-col items-end">
                                    <div className="font-sans text-sm mb-12 pr-6 print:font-serif">
                                        Jakarta, {previewItem.tanggalSurat}
                                    </div>

                                    <div className="flex flex-col items-center mr-10 select-none">
                                        <div className="w-[120px] h-[90px] border border-black flex flex-col items-center justify-center text-[10px] font-sans font-bold text-slate-500 tracking-wide uppercase bg-slate-50/50 mb-3 border-dashed print:bg-white print:border-solid">
                                            <span>Meterai</span>
                                            <span className="text-[11px] mt-1 text-slate-600">Rp. 10.000</span>
                                        </div>
                                        <div className="w-40 border-b border-black mt-12 mb-1"></div>
                                        <div className="text-[11px] font-sans text-slate-500 font-bold uppercase tracking-wider">{previewItem.nama}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmId && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200 print:hidden">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-[400px] text-center animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mx-auto mb-5">
                            <AlertCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Hapus Sanksi Administrasi</h3>
                        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                            Apakah Anda yakin ingin menghapus sanksi administrasi ini? Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                            >
                                Batal
                            </button>
                            <Button
                                onClick={() => handleDelete(deleteConfirmId)}
                                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-red-100"
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
