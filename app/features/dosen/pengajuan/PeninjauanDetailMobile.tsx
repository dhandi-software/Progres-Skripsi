import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { pengajuanApi } from "~/api/pengajuan";
import { ChevronLeft, Check, X, Loader2 } from "lucide-react";
import { Link } from "react-router";

interface PengajuanDetail {
    id: number;
    judul: string;
    mahasiswa: {
        nama: string;
        nim: string;
        jurusan: string;
    };
    status: string;
    peminatan: string;
    semester: string;
    tahunAkademik: string;
    ipk: string;
    sksDicapai: string;
    sksNilaiD?: string;
    batasStudi?: string;
}

export function PeninjauanDetailMobile({ id }: { id: string }) {
    const navigate = useNavigate();
    const [detail, setDetail] = useState<PengajuanDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [remarks, setRemarks] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const data = await pengajuanApi.getPengajuanById(parseInt(id));
                setDetail(data);
            } catch (error) {
                console.error("Failed to fetch detail", error);
                alert("Gagal memuat detail pengajuan.");
                navigate("/dosen/peninjauan");
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id, navigate]);

    const handleAction = async (status: 'APPROVED' | 'REJECTED') => {
        setSubmitting(true);
        try {
            await pengajuanApi.updateStatus(parseInt(id), status, remarks);
            alert(`Pengajuan berhasil di-${status.toLowerCase()}`);
            navigate("/dosen/peninjauan");
        } catch (error: any) {
            alert("Gagal memproses aksi: " + (error.response?.data?.message || error.message));
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
            {/* Mobile Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10 px-4 py-3 flex items-center gap-3">
                 <Link to="/dosen/peninjauan" className="p-2 -ml-2 text-gray-600">
                    <ChevronLeft size={24} />
                 </Link>
                 <h1 className="text-lg font-bold text-gray-900 flex-1">Peninjauan Judul</h1>
                 
                 <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                    ${detail.status === 'APPROVED' ? 'bg-Green-50 text-Green-700' : 
                      detail.status === 'REJECTED' ? 'bg-Red-50 text-Red-700' : 
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
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Program Studi</label>
                                <div className="p-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 border border-gray-100">
                                    {detail.mahasiswa.jurusan || "-"}
                                </div>
                            </div>
                            
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

                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Batas Studi</label>
                                <div className="p-3 bg-gray-50 rounded-lg text-sm font-bold text-gray-800 border border-gray-100 text-center">
                                    {detail.batasStudi || "-"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Block */}
                    {detail.status === 'PENDING' && (
                        <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200 shadow-sm space-y-4">
                            <h3 className="text-sm font-bold text-[#D25026] flex items-center gap-2">
                                <Check size={16} strokeWidth={3} />
                                Tindakan Persetujuan
                            </h3>
                            
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Catatan (Opsional)</label>
                                <textarea
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#D25026] focus:ring-1 focus:ring-[#D25026] outline-none transition-all resize-none"
                                    rows={3}
                                    placeholder="Alasan penolakan / catatan revisi..."
                                    disabled={submitting}
                                />
                            </div>

                            <div className="flex flex-col gap-3 pt-2">
                                <button
                                    onClick={() => handleAction('APPROVED')}
                                    disabled={submitting}
                                    className="w-full py-3.5 bg-[#D25026] text-white font-bold rounded-xl shadow-lg shadow-[#D25026]/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    <Check size={18} strokeWidth={3} />
                                    Setujui Pengajuan
                                </button>
                                <button
                                    onClick={() => handleAction('REJECTED')}
                                    disabled={submitting}
                                    className="w-full py-3.5 bg-white border-2 border-red-500 text-red-600 font-bold rounded-xl hover:bg-red-50 active:scale-95 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    <X size={18} strokeWidth={3} />
                                    Tolak Pengajuan
                                </button>
                            </div>
                        </div>
                    )}
                    
                    <div className="h-4"></div>
                </div>
            </div>
        </div>
    );
}
