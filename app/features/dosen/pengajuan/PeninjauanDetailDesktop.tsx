import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { pengajuanApi } from "~/api/pengajuan";
import { ChevronLeft, Check, X, Loader2 } from "lucide-react";

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

export function PeninjauanDetailDesktop({ id }: { id: string }) {
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
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin text-orange-600" size={48} />
            </div>
        );
    }
    
    if (!detail) return <div className="p-8 font-['Noto_Sans']">Detail tidak ditemukan.</div>;

    return (
        <div className="min-h-screen bg-gray-50/50 p-8 font-geist">
            <button 
                onClick={() => navigate("/dosen/peninjauan")}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors font-medium"
            >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Kembali ke Daftar
            </button>

            <div className="w-full mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
                {/* Status Badge Positioned absolutely in the corner */}
                <div className={`absolute top-6 right-6 px-4 py-2 rounded-full text-sm font-semibold z-10 shadow-sm border
                    ${detail.status === 'APPROVED' ? 'bg-Green-50 text-Green-700 border-Green-200' : 
                      detail.status === 'REJECTED' ? 'bg-Red-50 text-Red-700 border-Red-200' : 
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
                                <label className="text-sm font-semibold text-gray-700">Program Studi</label>
                                <input 
                                    type="text" 
                                    value={detail.mahasiswa.jurusan || "-"} 
                                    readOnly 
                                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 font-medium"
                                />
                            </div>
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
                                <label className="text-sm font-semibold text-gray-700">Jumlah SKS nilai D</label>
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

                    {detail.status === 'PENDING' && (
                        <div className="border-t-2 border-dashed border-gray-200 mt-8 pt-8 pb-4">
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Check className="w-5 h-5 text-[#D25026]" />
                                    Tindakan Persetujuan Dosen
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
                                    <button
                                        onClick={() => handleAction('REJECTED')}
                                        disabled={submitting}
                                        className="px-6 py-3 bg-white border-2 border-red-500 text-red-600 font-bold rounded-xl hover:bg-red-50 focus:ring-4 focus:ring-red-100 transition-all flex items-center gap-2 disabled:opacity-70"
                                    >
                                        <X size={18} strokeWidth={3} />
                                        Tolak
                                    </button>
                                    <button
                                        onClick={() => handleAction('APPROVED')}
                                        disabled={submitting}
                                        className="px-8 py-3 bg-[#D25026] text-white font-bold rounded-xl hover:bg-[#B9441F] shadow-lg shadow-[#D25026]/20 focus:ring-4 focus:ring-[#D25026]/30 transition-all flex items-center gap-2 disabled:opacity-70"
                                    >
                                        <Check size={18} strokeWidth={3} />
                                        Setujui Pengajuan
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Space at the bottom */}
            <div className="h-12"></div>
        </div>
    );
}
