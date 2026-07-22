import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { pengajuanApi } from "~/api/pengajuan";
import { ChevronLeft, Check, X, Loader2, RotateCcw } from "lucide-react";
import { Link } from "react-router";
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

export function PeninjauanDetailMobile({ id }: { id: string }) {
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
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-orange-600" size={32} />
            </div>
        );
    }
    
    if (!detail) return <div className="p-4 font-['Noto_Sans']">Detail tidak ditemukan.</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-geist">
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
            {/* Mobile Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10 px-4 py-3 flex items-center gap-3">
                 <Link to={`/dosen/peninjauan${location.search}`} className="p-2 -ml-2 text-gray-600">
                    <ChevronLeft size={24} />
                 </Link>
                 <h1 className="text-lg font-bold text-gray-900 flex-1">Peninjauan Judul</h1>
                 
                 <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                    ${detail.status === 'APPROVED' ? 'bg-Green-50 text-Green-700' : 
                      ['REJECTED', 'REJECTED_KOORDINATOR'].includes(detail.status) ? 'bg-Red-50 text-Red-700' : 
                      detail.status === 'PENDING_KOORDINATOR' ? 'bg-purple-50 text-purple-700' :
                      'bg-yellow-50 text-yellow-700'}`}
                 >
                    {detail.status}
                 </div>
            </div>

            <div className="p-4 space-y-6">
                {/* Official Header (Simplified) */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center space-y-2">
                    <img 
                        src="https://upload.wikimedia.org/wikipedia/id/thumb/4/46/Logo_Universitas_Pancasila.png/250px-Logo_Universitas_Pancasila.png" 
                        alt="Logo UP" 
                        className="w-12 h-12 mx-auto object-contain"
                    />
                    <h2 className="text-xs font-bold text-gray-800 uppercase leading-relaxed">
                        Fakultas Teknik <br/> Universitas Pancasila
                    </h2>
                    <div className="w-16 h-0.5 bg-gray-800 mx-auto rounded-full"></div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Permohonan Kerja Praktik</p>
                </div>

                <div className="space-y-6">
                    {/* Info Akademik Group */}
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Info Akademik</h3>
                        
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Semester</label>
                                    <div className="p-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 border border-gray-100">
                                        {detail.semester}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Tahun Akd</label>
                                    <div className="p-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 border border-gray-100">
                                        {detail.tahunAkademik}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data Diri Group */}
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Data Mahasiswa</h3>
                        
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Nama Lengkap</label>
                                <div className="p-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 border border-gray-100">
                                    {detail.mahasiswa.nama || "-"}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">NIM</label>
                                <div className="p-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 border border-gray-100">
                                    {detail.mahasiswa.nim || "-"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Proposal Group */}
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Detail Pengajuan</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Peminatan</label>
                                <div className="p-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 border border-gray-100">
                                    {detail.peminatan}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Usulan Judul</label>
                                <div className="w-full px-4 py-3 bg-blue-50/50 border border-blue-100 rounded-lg text-blue-900 font-medium leading-relaxed text-sm">
                                    {detail.judul}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Group */}
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Statistik Akademik</h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">SKS Dicapai</label>
                                <div className="p-3 bg-gray-50 rounded-lg text-sm font-bold text-gray-800 border border-gray-100 text-center">
                                    {detail.sksDicapai}
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">SKS Nilai D</label>
                                <div className="p-3 bg-gray-50 rounded-lg text-sm font-bold text-gray-800 border border-gray-100 text-center">
                                    {detail.sksNilaiD || "-"}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">IPK</label>
                                <div className="p-3 bg-gray-50 rounded-lg text-lg font-black text-blue-600 border border-blue-100 bg-blue-50 text-center">
                                    {detail.ipk}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Batas Studi</label>
                                <div className="text-sm font-semibold text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">{detail.batasStudi || "-"}</div>
                            </div>
                        </div>

                        {['REVISION', 'REVISION_KOORDINATOR'].includes(detail.status) && (
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                    <h3 className="font-bold text-yellow-800 mb-3 text-sm">Informasi Revisi</h3>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold text-yellow-700 uppercase tracking-wider">Catatan Revisi</label>
                                            <div className="text-sm text-yellow-900 bg-white p-3 rounded-lg border border-yellow-200 min-h-[60px]">
                                                {detail.remarks || "-"}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold text-yellow-700 uppercase tracking-wider">Batas Waktu Revisi</label>
                                            <div className="text-sm font-bold text-yellow-900 bg-white p-3 rounded-lg border border-yellow-200">
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
                    </div>

                    {/* Action Block */}
                    {['PENDING', 'PENDING_KOORDINATOR'].includes(detail.status) && (
                        <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200 shadow-sm space-y-4">
                            <h3 className="text-sm font-bold text-[#D25026] flex items-center gap-2">
                                <Check size={16} strokeWidth={3} />
                                {detail.status === 'PENDING_KOORDINATOR' ? 'Tindakan Persetujuan Koordinator' : 'Tindakan Persetujuan'}
                            </h3>
                            <div className="mb-4 flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-700">Catatan (Opsional)</label>
                                <textarea
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D25026]/20 focus:border-[#D25026] outline-none transition-all resize-none text-sm"
                                    rows={3}
                                    placeholder="Tuliskan catatan..."
                                    disabled={submitting}
                                />
                            </div>

                            <div className="flex flex-col gap-3 pt-2">
                                <Button
                                    variant="default"
                                    size="lg"
                                    onClick={() => handleAction('APPROVED')}
                                    disabled={submitting}
                                    className="w-full font-bold"
                                >
                                    <Check size={18} strokeWidth={3} />
                                    {detail.status === 'PENDING_KOORDINATOR' ? 'Teruskan ke Pembimbing' : 'Setujui Pengajuan'}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="md"
                                    onClick={() => setIsRevisionModalOpen(true)}
                                    disabled={submitting || !remarks.trim()}
                                    className="border-yellow-500 text-yellow-700 hover:bg-yellow-50 flex-1 font-bold h-11"
                                    title={!remarks.trim() ? 'Isi catatan terlebih dahulu untuk mengirim revisi' : ''}
                                >
                                    <RotateCcw size={18} />
                                    Revisi
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={() => handleAction('REJECTED')}
                                    disabled={submitting}
                                    className="w-full border-red-500 text-red-600 hover:bg-red-50 font-bold"
                                >
                                    <X size={18} strokeWidth={3} />
                                    Tolak Pengajuan
                                </Button>
                            </div>
                        </div>
                    )}
                    
                    <div className="h-4"></div>
                </div>
            </div>

            {/* Revision Modal Mobile */}
            {isRevisionModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity p-4 animate-in fade-in-0">
                    <div className="w-full bg-white rounded-xl shadow-lg border border-gray-100 p-5 flex flex-col gap-4 relative animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col gap-1.5">
                            <h3 className="text-[17px] font-bold text-gray-900 flex items-center gap-2">
                                <RotateCcw className="w-5 h-5 text-yellow-600" />
                                Tentukan Batas Waktu Revisi
                            </h3>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Silakan pilih tanggal maksimal mahasiswa dapat mengumpulkan perbaikan usulan judul mereka.
                            </p>
                        </div>
                        
                        <div className="flex flex-col gap-1.5 py-2">
                            <MonthYearFilter 
                                date={deadlineRevisi} 
                                setDate={setDeadlineRevisi} 
                                showLabel={true}
                                minDate={new Date()}
                                maxDate={new Date(new Date().getFullYear(), 11, 31)}
                                className="w-full"
                            />
                        </div>

                        <div className="flex flex-col gap-2.5 mt-2">
                            <button
                                onClick={() => handleAction('REVISION')}
                                disabled={!deadlineRevisi || submitting}
                                className="w-full px-4 py-3 bg-yellow-500 text-white rounded-lg text-[15px] font-bold hover:bg-yellow-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Menyimpan...' : 'Kirim Revisi'}
                            </button>
                            <button
                                onClick={() => setIsRevisionModalOpen(false)}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-[15px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
