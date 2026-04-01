import React, { useEffect, useState } from "react";
import { useAuth } from "~/hooks/useAuth";
import { penilaianApi } from "~/api/penilaianApi";
import { CheckCircle, Edit3, Trash2, X, Save, AlertCircle } from "lucide-react";
import { cn } from "~/lib/utils";

interface PenilaianItem {
    mahasiswaId: number;
    nama: string;
    nim: string;
    judulSkripsi: string;
    penilaianId: number | null;
    nilai: number | null;
    keterangan: string | null;
    tanggal: string | null;
}

interface FormState {
    mahasiswaId: number;
    penilaianId: number | null;
    nama: string;
    nilai: string;
    keterangan: string;
}

function getGrade(nilai: number | null): { huruf: string; color: string; bg: string } {
    if (nilai === null) return { huruf: "?", color: "text-gray-400", bg: "bg-gray-100" };
    if (nilai >= 85) return { huruf: "A", color: "text-emerald-700", bg: "bg-emerald-100" };
    if (nilai >= 75) return { huruf: "B", color: "text-blue-700", bg: "bg-blue-100" };
    if (nilai >= 65) return { huruf: "C", color: "text-yellow-700", bg: "bg-yellow-100" };
    if (nilai >= 55) return { huruf: "D", color: "text-orange-700", bg: "bg-orange-100" };
    return { huruf: "E", color: "text-red-700", bg: "bg-red-100" };
}

export function PenilaianDesktop({ title }: { title: string }) {
    const { user } = useAuth();
    const [data, setData] = useState<PenilaianItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [form, setForm] = useState<FormState | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<PenilaianItem | null>(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const result = await penilaianApi.getPenilaianByDosen();
            setData(result || []);
        } catch {
            showToast("error", "Gagal memuat data penilaian.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const showToast = (type: "success" | "error", msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3500);
    };

    const openForm = (item: PenilaianItem) => {
        setForm({
            mahasiswaId: item.mahasiswaId,
            penilaianId: item.penilaianId,
            nama: item.nama,
            nilai: item.nilai !== null ? String(item.nilai) : "",
            keterangan: item.keterangan || ""
        });
    };

    const handleSave = async () => {
        if (!form) return;
        const nilaiNum = parseFloat(form.nilai);
        if (isNaN(nilaiNum) || nilaiNum < 0 || nilaiNum > 100) {
            showToast("error", "Nilai harus angka antara 0 – 100.");
            return;
        }
        try {
            setIsSaving(true);
            await penilaianApi.createPenilaian(form.mahasiswaId, nilaiNum, form.keterangan);
            setForm(null);
            await fetchData();
            showToast("success", `Nilai ${form.nama} berhasil disimpan!`);
        } catch {
            showToast("error", "Gagal menyimpan nilai.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm?.penilaianId) return;
        try {
            await penilaianApi.deletePenilaian(deleteConfirm.penilaianId);
            setDeleteConfirm(null);
            await fetchData();
            showToast("success", "Penilaian berhasil dihapus.");
        } catch {
            showToast("error", "Gagal menghapus penilaian.");
        }
    };

    const graded = data.filter(d => d.nilai !== null);
    const ungraded = data.filter(d => d.nilai === null);
    const liveGrade = form?.nilai && !isNaN(parseFloat(form.nilai)) ? getGrade(parseFloat(form.nilai)) : null;

    return (
        <>
            {/* ===== Grading Modal ===== */}
            {form && (
                <div
                    style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)" }}
                    onClick={(e) => { if (e.target === e.currentTarget) setForm(null); }}
                >
                    <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 25px 60px rgba(0,0,0,0.25)", width: "100%", maxWidth: 480, margin: "0 16px", overflow: "hidden" }}>
                        {/* Header */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #f0f0f0" }}>
                            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111b21" }}>Beri Nilai Mahasiswa</h2>
                            <button onClick={() => setForm(null)} style={{ border: "none", background: "none", cursor: "pointer", padding: 8, borderRadius: "50%", display: "flex", alignItems: "center", color: "#667781" }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>
                            {/* Student info */}
                            <div style={{ background: "#f8f9fa", borderRadius: 12, padding: "14px 18px" }}>
                                <p style={{ margin: 0, fontSize: 12, color: "#667781", marginBottom: 4 }}>Mahasiswa</p>
                                <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: "#111b21" }}>{form.nama}</p>
                            </div>

                            {/* Nilai input */}
                            <div>
                                <label style={{ display: "block", fontWeight: 600, fontSize: 14, color: "#374151", marginBottom: 10 }}>
                                    Nilai Akhir <span style={{ color: "#ef4444" }}>*</span>
                                    <span style={{ fontWeight: 400, color: "#9ca3af", marginLeft: 6, fontSize: 12 }}>( 0 – 100 )</span>
                                </label>
                                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                    <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={form.nilai}
                                        onChange={e => setForm({ ...form, nilai: e.target.value })}
                                        placeholder="85"
                                        style={{
                                            width: 110,
                                            fontSize: 28,
                                            fontWeight: 800,
                                            textAlign: "center",
                                            border: "2px solid #e5e7eb",
                                            borderRadius: 12,
                                            padding: "10px 8px",
                                            outline: "none",
                                            color: "#111b21",
                                            background: "#fff",
                                        }}
                                        onFocus={e => (e.currentTarget.style.borderColor = "#D25026")}
                                        onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
                                    />
                                    {liveGrade ? (
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                                            <span style={{
                                                fontSize: 36,
                                                fontWeight: 900,
                                                color: liveGrade.huruf === "A" ? "#059669" : liveGrade.huruf === "B" ? "#2563eb" : liveGrade.huruf === "C" ? "#d97706" : liveGrade.huruf === "D" ? "#ea580c" : "#dc2626"
                                            }}>
                                                {liveGrade.huruf}
                                            </span>
                                            <span style={{ fontSize: 11, color: "#9ca3af" }}>Huruf Mutu</span>
                                        </div>
                                    ) : (
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                                            <span style={{ fontSize: 36, fontWeight: 900, color: "#e5e7eb" }}>–</span>
                                            <span style={{ fontSize: 11, color: "#d1d5db" }}>Ketik nilai</span>
                                        </div>
                                    )}
                                </div>
                                <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                                    {[["≥ 85", "A", "#059669"], ["≥ 75", "B", "#2563eb"], ["≥ 65", "C", "#d97706"], ["≥ 55", "D", "#ea580c"], ["< 55", "E", "#dc2626"]].map(([range, grade, color]) => (
                                        <span key={grade} style={{ fontSize: 11, color: color as string, background: `${color}18`, padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>
                                            {grade}: {range}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Keterangan */}
                            <div>
                                <label style={{ display: "block", fontWeight: 600, fontSize: 14, color: "#374151", marginBottom: 8 }}>
                                    Keterangan / Catatan
                                </label>
                                <textarea
                                    value={form.keterangan}
                                    onChange={e => setForm({ ...form, keterangan: e.target.value })}
                                    placeholder="Catatan penilaian untuk mahasiswa ini..."
                                    rows={3}
                                    style={{
                                        width: "100%",
                                        border: "2px solid #e5e7eb",
                                        borderRadius: 12,
                                        padding: "10px 14px",
                                        fontSize: 14,
                                        color: "#111b21",
                                        resize: "none",
                                        outline: "none",
                                        boxSizing: "border-box",
                                    }}
                                    onFocus={e => (e.currentTarget.style.borderColor = "#D25026")}
                                    onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "16px 24px", borderTop: "1px solid #f0f0f0" }}>
                            <button onClick={() => setForm(null)} style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", color: "#6b7280", fontWeight: 500, fontSize: 14, cursor: "pointer" }}>
                                Batal
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving || !form.nilai}
                                style={{
                                    display: "flex", alignItems: "center", gap: 8,
                                    padding: "10px 22px", borderRadius: 10, border: "none",
                                    background: isSaving || !form.nilai ? "#f0f0f0" : "#D25026",
                                    color: isSaving || !form.nilai ? "#aaa" : "#fff",
                                    fontWeight: 600, fontSize: 14, cursor: isSaving || !form.nilai ? "not-allowed" : "pointer"
                                }}
                            >
                                <Save size={15} />
                                {isSaving ? "Menyimpan..." : "Simpan Nilai"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Delete Confirm Modal ===== */}
            {deleteConfirm && (
                <div
                    style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)" }}
                    onClick={(e) => { if (e.target === e.currentTarget) setDeleteConfirm(null); }}
                >
                    <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 25px 60px rgba(0,0,0,0.25)", width: "100%", maxWidth: 380, margin: "0 16px", padding: 28, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Trash2 size={24} color="#ef4444" />
                        </div>
                        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#111b21" }}>Hapus Penilaian?</h3>
                        <p style={{ margin: 0, fontSize: 14, color: "#6b7280", textAlign: "center" }}>
                            Nilai untuk <strong>{deleteConfirm.nama}</strong> akan dihapus secara permanen.
                        </p>
                        <div style={{ display: "flex", width: "100%", gap: 10, marginTop: 8 }}>
                            <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", color: "#6b7280", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                                Batal
                            </button>
                            <button onClick={handleDelete} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "none", background: "#ef4444", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Toast ===== */}
            {toast && (
                <div style={{
                    position: "fixed", top: 24, right: 24, zIndex: 10000,
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "14px 20px", borderRadius: 12,
                    background: toast.type === "success" ? "#10b981" : "#ef4444",
                    color: "#fff", fontWeight: 600, fontSize: 14,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.18)"
                }}>
                    {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    {toast.msg}
                </div>
            )}

            {/* ===== Main Page ===== */}
            <div className="flex flex-col min-h-full bg-[#FAFAFA] p-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[#111b21] tracking-tight">Penilaian Mahasiswa</h1>
                        <p className="text-[#667781] mt-1 text-sm">Berikan nilai akhir untuk seluruh mahasiswa bimbingan Anda.</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium">{graded.length} sudah dinilai</span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">{ungraded.length} belum dinilai</span>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center py-20">
                        <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-[#D25026] animate-spin" />
                    </div>
                ) : data.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-20">
                        <AlertCircle size={40} className="text-gray-300" />
                        <p className="text-lg font-medium text-gray-500">Belum ada mahasiswa bimbingan</p>
                        <p className="text-sm text-gray-400">Mahasiswa akan muncul setelah pengajuan judul disetujui.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {ungraded.length > 0 && (
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Belum Dinilai ({ungraded.length})</p>
                                <div className="flex flex-col gap-3">
                                    {ungraded.map(item => (
                                        <StudentCard key={item.mahasiswaId} item={item} onGrade={() => openForm(item)} onDelete={() => setDeleteConfirm(item)} />
                                    ))}
                                </div>
                            </div>
                        )}
                        {graded.length > 0 && (
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Sudah Dinilai ({graded.length})</p>
                                <div className="flex flex-col gap-3">
                                    {graded.map(item => (
                                        <StudentCard key={item.mahasiswaId} item={item} onGrade={() => openForm(item)} onDelete={() => setDeleteConfirm(item)} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

function StudentCard({ item, onGrade, onDelete }: { item: PenilaianItem; onGrade: () => void; onDelete: () => void }) {
    const hasGrade = item.nilai !== null;
    const grade = getGrade(item.nilai);

    return (
        <div className={cn(
            "bg-white rounded-xl border p-5 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow",
            hasGrade ? "border-gray-200" : "border-amber-200"
        )}>
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-black text-xl", grade.bg, grade.color)}>
                    {hasGrade ? grade.huruf : "?"}
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-[#111b21] truncate">{item.nama}</span>
                    <span className="text-xs text-[#667781]">{item.nim}</span>
                    {item.judulSkripsi && <span className="text-xs text-gray-400 truncate mt-0.5">{item.judulSkripsi}</span>}
                </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
                {hasGrade && (
                    <div className="flex flex-col items-end mr-1">
                        <span className={cn("text-3xl font-black", grade.color)}>{item.nilai}</span>
                        <span className="text-xs text-gray-400">
                            {item.tanggal ? new Date(item.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : ""}
                        </span>
                    </div>
                )}
                {!hasGrade && (
                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        Belum dinilai
                    </span>
                )}
                <button
                    onClick={onGrade}
                    className={cn(
                        "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors",
                        hasGrade ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : "bg-[#D25026] text-white hover:bg-[#b03d19]"
                    )}
                >
                    <Edit3 size={14} />
                    {hasGrade ? "Edit Nilai" : "Beri Nilai"}
                </button>
                {hasGrade && (
                    <button onClick={onDelete} className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                    </button>
                )}
            </div>
        </div>
    );
}
