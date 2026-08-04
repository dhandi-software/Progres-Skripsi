import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { pengajuanApi } from "~/api/pengajuan";
import { ChevronLeft, Check, X, Loader2, RotateCcw } from "lucide-react";
import { Toast } from "~/components/ui/toast";
import { Button } from "~/components/ui/button";
import { MonthYearFilter } from "~/components/ui/calendar";

interface PengajuanDetail {
    id: number;
    judul: string;
    mahasiswa: {
        nama: string;
        nim: string;
    };
    status: string;
    peminatan: string;
    semester: string;
    tahunAkademik: string;
    ipk: string;
    sksDicapai: string;
    sksNilaiD?: string;
    batasStudi?: string;
    remarks?: string;
    deadlineRevisi?: string;
}

export function PeninjauanDetailDesktop({ id }: { id: string }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [detail, setDetail] = useState<PengajuanDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [remarks, setRemarks] = useState("");
    const [deadlineRevisi, setDeadlineRevisi] = useState<Date | undefined>(undefined);
    const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState<{ title: string; variant: "success" | "destructive" | "default" } | null>(null);

    const showToast = (title: string, variant: "success" | "destructive" | "default" = "success") => {
        setToast({ title, variant });
    };

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const data = await pengajuanApi.getPengajuanById(parseInt(id));
                setDetail(data);
            } catch (error) {
                console.error("Failed to fetch detail", error);
                alert("Gagal memuat detail pengajuan.");
                navigate(`/dosen/peninjauan${location.search}`);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id, navigate]);

    const handleAction = async (status: 'APPROVED' | 'REJECTED' | 'REVISION') => {
        setSubmitting(true);
        try {
            const deadlineStr = deadlineRevisi ? deadlineRevisi.toISOString() : undefined;
            await pengajuanApi.updateStatus(parseInt(id), status, remarks, deadlineStr);
            const label = status === 'APPROVED' ? 'disetujui' : status === 'REJECTED' ? 'ditolak' : 'diminta revisi';
            showToast(`Pengajuan berhasil ${label}.`, "success");
            setIsRevisionModalOpen(false);
            setTimeout(() => navigate(`/dosen/peninjauan${location.search}`), 1800);
        } catch (error: any) {
            showToast("Gagal memproses aksi: " + (error.response?.data?.message || error.message), "destructive");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin text-orange-600" size={48} />
            </div>
        );
    }
    
    if (!detail) return <div className="p-8 font-['Noto_Sans']">Detail tidak ditemukan.</div>;

    return (
        <div className="min-h-screen bg-gray-50/50 p-8 font-geist">
            {/* Toast Notification */}
            {toast && (
                <div className="fixed top-4 right-4 z-[9999]">
                    <Toast
                        title={toast.title}
                        variant={toast.variant}
                        duration={toast.variant === 'success' ? 2500 : 5000}
                        onClose={() => setToast(null)}
                    />
                </div>
            )}
            <button 
                onClick={() => navigate(`/dosen/peninjauan${location.search}`)}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors font-medium"
            >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Kembali ke Daftar
            </button>

            <div className="w-full mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
                {/* Status Badge Positioned absolutely in the corner */}
                <div className={`absolute top-6 right-6 px-4 py-2 rounded-full text-sm font-semibold z-10 shadow-sm border
                    ${detail.status === 'APPROVED' ? 'bg-Green-50 text-Green-700 border-Green-200' : 
                      ['REJECTED', 'REJECTED_KOORDINATOR'].includes(detail.status) ? 'bg-Red-50 text-Red-700 border-Red-200' : 
                      detail.status === 'PENDING_KOORDINATOR' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      'bg-yellow-50 text-yellow-700 border-yellow-200'}`}
                >
                    Status: {detail.status}
                </div>

                {/* Header Section matching the document */}
                <div className="border-b-2 border-gray-800 p-6 flex items-center justify-between bg-white relative">
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
                        <h1 className="text-xl font-bold text-gray-900 tracking-wide">FAKULTAS TEKNIK UNIVERSITAS PANCASILA</h1>
                        <div className="w-full h-px bg-gray-800 my-2"></div>
                        <h2 className="text-lg font-bold text-gray-800 uppercase tracking-widest">Permohonan Kerja Praktik</h2>
                    </div>

                    {/* Right Side (Department Logo) */}
                    <div className="w-24 h-24 flex-shrink-0">
                         <img 
                            src="/images/LogoUpKebanggan.png" 
                            alt="Logo Fakultas" 
                            className="w-full h-full object-contain"
                         />
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Section 1: Academic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-700">Semester</label>
                                <input 
                                    type="text" 
                                    value={detail.semester}
                                    readOnly
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-700">Tahun Akademik</label>
                                <input 
                                    type="text" 
                                    value={detail.tahunAkademik}
                                    readOnly
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Yang bertanda tangan dibawah ini :</h3>
                        
                        <div className="grid grid-cols-1 gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-semibold text-gray-700">Nama</label>
                                    <input 
                                        type="text" 
                                        value={detail.mahasiswa.nama || "-"} 
                                        readOnly 
                                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 font-medium"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-semibold text-gray-700">No. Pokok / NIM</label>
                                    <input 
                                        type="text" 
                                        value={detail.mahasiswa.nim || "-"} 
                                        readOnly 
                                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 font-medium"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-700">Peminatan</label>
                                <input 
                                    type="text" 
                                    value={detail.peminatan}
                                    readOnly
                                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-700">Usulan Judul</label>
                                <textarea 
                                    value={detail.judul}
                                    readOnly
                                    rows={3}
                                    className="w-full px-4 py-3 bg-blue-50/50 border border-blue-100 rounded-lg text-blue-900 font-medium outline-none resize-none leading-relaxed"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Data Akademik</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-700">Jumlah SKS yang dicapai</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        value={detail.sksDicapai}
                                        readOnly
                                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 pr-12"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">SKS</span>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-700">Jumlah yang tidak lulus(D,E)</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        value={detail.sksNilaiD || "-"}
                                        readOnly
                                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 pr-12"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">SKS</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-700">Indeks Prestasi Komulatif (IPK)</label>
                                <input 
                                    type="text" 
                                    value={detail.ipk}
                                    readOnly
                                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-700">Batas Studi</label>
                                <input 
                                    type="text" 
                                    value={detail.batasStudi || "-"}
                                    readOnly
                                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800"
                                />
                            </div>
                        </div>
                    </div>

                    {['REVISION', 'REVISION_KOORDINATOR'].includes(detail.status) && (
                        <div className="border-t-2 border-dashed border-gray-200 mt-8 pt-8 pb-4">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                                <h3 className="font-bold text-yellow-800 mb-4">Informasi Revisi</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-semibold text-yellow-700">Catatan Revisi</label>
                                        <div className="px-4 py-3 bg-white border border-yellow-200 rounded-lg text-yellow-900 min-h-[60px]">
                                            {detail.remarks || "-"}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-semibold text-yellow-700">Batas Waktu Revisi</label>
                                        <div className="px-4 py-3 bg-white border border-yellow-200 rounded-lg text-yellow-900">
                                            {detail.deadlineRevisi ? new Date(detail.deadlineRevisi).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            }) : "-"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {['PENDING', 'PENDING_KOORDINATOR'].includes(detail.status) && (
                        <div className="border-t-2 border-dashed border-gray-200 mt-8 pt-8 pb-4">
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Check className="w-5 h-5 text-[#D25026]" />
                                    {detail.status === 'PENDING_KOORDINATOR' ? 'Tindakan Persetujuan Koordinator' : 'Tindakan Persetujuan Dosen'}
                                </h3>
                                
                                <div className="mb-6 flex flex-col gap-1.5">
                                    <label className="text-sm font-semibold text-gray-700">Catatan (Opsional)</label>
                                    <textarea
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D25026]/20 focus:border-[#D25026] outline-none transition-all resize-none"
                                        rows={3}
                                        placeholder="Tuliskan alasan penolakan atau catatan tambahan jika disetujui..."
                                        disabled={submitting}
                                    />
                                </div>

                                <div className="flex justify-end gap-3">
                                    <Button
                                        variant="outline"
                                        size="md"
                                        onClick={() => handleAction('REJECTED')}
                                        disabled={submitting}
                                        className="border-red-500 text-red-600 hover:bg-red-50 font-bold"
                                    >
                                        <X size={16} strokeWidth={3} />
                                        Tolak
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="md"
                                        onClick={() => setIsRevisionModalOpen(true)}
                                        disabled={submitting || !remarks.trim()}
                                        className="border-yellow-500 text-yellow-700 hover:bg-yellow-50 font-bold"
                                        title={!remarks.trim() ? 'Isi catatan terlebih dahulu untuk mengirim revisi' : ''}
                                    >
                                        <RotateCcw size={16} />
                                        Revisi
                                    </Button>
                                    <Button
                                        variant="default"
                                        size="md"
                                        onClick={() => handleAction('APPROVED')}
                                        disabled={submitting}
                                        className="font-bold"
                                    >
                                        <Check size={16} strokeWidth={3} />
                                        {detail.status === 'PENDING_KOORDINATOR' ? 'Teruskan ke Pembimbing' : 'Setujui Pengajuan'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Revision Modal */}
            {isRevisionModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in-0">
                    <div className="w-[450px] bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col gap-4 relative animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col gap-2">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <RotateCcw className="w-5 h-5 text-yellow-600" />
                                Tentukan Batas Waktu Revisi
                            </h3>
                            <p className="text-sm text-gray-500">
                                Silakan pilih tanggal maksimal mahasiswa dapat mengumpulkan perbaikan usulan judul mereka.
                            </p>
                        </div>
                        
                        <div className="flex flex-col gap-1.5 py-4">
                            <MonthYearFilter 
                                date={deadlineRevisi} 
                                setDate={setDeadlineRevisi} 
                                showLabel={true}
                                minDate={new Date()}
                                maxDate={new Date(new Date().getFullYear(), 11, 31)}
                                className="w-full"
                            />
                        </div>

                        <div className="flex gap-3 w-full mt-2">
                            <button
                                onClick={() => setIsRevisionModalOpen(false)}
                                className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => handleAction('REVISION')}
                                disabled={!deadlineRevisi || submitting}
                                className="flex-1 px-4 py-2.5 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                            >
                                {submitting ? 'Menyimpan...' : 'Kirim Revisi'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Space at the bottom */}
            <div className="h-12"></div>
        </div>
    );
}
