import React, { useState, useEffect } from 'react';
import { Calendar, UploadCloud, AlertCircle } from 'lucide-react';
import { jadwalKpApi } from '~/api/jadwalKpApi';
import type { JadwalKp } from '~/api/jadwalKpApi';
import { sidangApi } from '~/api/sidangApi';
import { pengajuanApi } from '~/api/pengajuan';
import { Toast } from '~/components/ui/toast';

export function ApplySidangForm({ onApplied }: { onApplied: () => void }) {
    const [activeJadwal, setActiveJadwal] = useState<JadwalKp | null>(null);
    const [pengarahanJadwals, setPengarahanJadwals] = useState<JadwalKp[]>([]);
    const [loading, setLoading] = useState(true);
    const [judul, setJudul] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toastProps, setToastProps] = useState<{ title: string, variant: 'success' | 'destructive' } | null>(null);

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                // Fetch the active schedule for PENGARAHAN_SIDANG directly from backend
                // This prevents issues where students' device clocks are wrong
                const jadwalSidang = await jadwalKpApi.getActiveJadwalKp('PENGARAHAN_SIDANG');
                if (jadwalSidang) {
                    setActiveJadwal(jadwalSidang);
                    setPengarahanJadwals([jadwalSidang]);
                } else {
                    setPengarahanJadwals([]);
                }

                // Fetch profile for approved judul
                const profile = await pengajuanApi.getProfile();
                if (profile && profile.pengajuanJudul) {
                    const approved = profile.pengajuanJudul.find((p: any) => p.status === 'APPROVED');
                    if (approved) {
                        setJudul(approved.judul);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch schedules or profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSchedules();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setToastProps({ title: "Mohon unggah laporan akhir Anda.", variant: "destructive" });
            return;
        }
        
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('judul', judul);
            formData.append('laporan', file);

            await sidangApi.applyForSidang(formData);
            onApplied();
        } catch (error: any) {
            console.error(error);
            setToastProps({ 
                title: error.response?.data?.message || "Gagal mengajukan sidang.", 
                variant: "destructive" 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="text-center p-8 text-slate-500 font-medium animate-pulse">Memeriksa jadwal...</div>;
    }

    if (!activeJadwal) {
        return (
            <div className="flex flex-col gap-6 w-full mx-auto">
                {pengarahanJadwals.length > 0 && (
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 shadow-sm">
                        <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full mb-3">
                            Informasi Staf
                        </div>
                        {pengarahanJadwals.map((jadwal) => (
                            <div key={jadwal.id} className="mb-4 last:mb-0">
                                <h3 className="text-lg font-black text-slate-900 mb-1">{jadwal.judul}</h3>
                                <div 
                                    className="text-slate-600 text-sm mb-2 prose prose-sm max-w-none prose-slate"
                                    dangerouslySetInnerHTML={{ __html: jadwal.deskripsi || '' }} 
                                />
                                <div className="flex items-center gap-2 text-xs font-bold text-blue-800 bg-blue-100/50 w-fit px-3 py-1.5 rounded-lg">
                                    <Calendar size={14} />
                                    {new Date(jadwal.tanggal).toLocaleDateString('id-ID')}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="bg-white rounded-[24px] p-10 text-center border-2 border-dashed border-slate-200 shadow-sm flex flex-col items-center w-full">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-400">
                        <Calendar size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Belum Ada Jadwal Pengajuan</h3>
                    <p className="text-slate-500 w-full mt-3 leading-relaxed">
                        Saat ini belum ada jadwal pengajuan sidang yang aktif. Silakan tunggu informasi dari Staf Prodi.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 w-full mx-auto">
            {pengarahanJadwals.length > 0 && (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 shadow-sm">
                    <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full mb-3">
                        Informasi Staf
                    </div>
                    {pengarahanJadwals.map((jadwal) => (
                        <div key={jadwal.id} className="mb-4 last:mb-0">
                            <h3 className="text-lg font-black text-slate-900 mb-1">{jadwal.judul}</h3>
                            <div 
                                className="text-slate-600 text-sm mb-2 prose prose-sm max-w-none prose-slate"
                                dangerouslySetInnerHTML={{ __html: jadwal.deskripsi || '' }} 
                            />
                            <div className="flex items-center gap-2 text-xs font-bold text-blue-800 bg-blue-100/50 w-fit px-3 py-1.5 rounded-lg">
                                <Calendar size={14} />
                                {new Date(jadwal.tanggal).toLocaleDateString('id-ID')}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 w-full">
                <div className="mb-8">
                    <div className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full mb-3">
                        Jadwal Aktif
                    </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">{activeJadwal.judul}</h3>
                <div 
                    className="text-slate-600 mb-4 prose prose-sm max-w-none prose-slate"
                    dangerouslySetInnerHTML={{ __html: activeJadwal.deskripsi || '' }} 
                />
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex gap-3 items-start">
                    <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-orange-800">
                        <strong>Batas Waktu:</strong> {new Date(activeJadwal.tanggal).toLocaleString('id-ID')}
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Judul Laporan KP (Opsional)</label>
                    <input 
                        type="text" 
                        placeholder="Jika kosong, akan menggunakan judul yang telah disetujui"
                        className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#FF7A00] outline-none"
                        value={judul}
                        onChange={(e) => setJudul(e.target.value)}
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Unggah Laporan Akhir (PDF)</label>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-8 h-8 mb-2 text-slate-400" />
                            <p className="mb-2 text-sm text-slate-500">
                                <span className="font-bold text-[#FF7A00]">Klik untuk unggah</span> atau drag and drop
                            </p>
                            <p className="text-xs text-slate-500">
                                {file ? file.name : "PDF (Maks. 10MB)"}
                            </p>
                        </div>
                        <input 
                            type="file" 
                            className="hidden" 
                            accept="application/pdf"
                            onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                    setFile(e.target.files[0]);
                                }
                            }}
                        />
                    </label>
                    
                    {file && (
                        <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-700">Preview Dokumen</span>
                                <button 
                                    type="button" 
                                    onClick={() => setFile(null)}
                                    className="text-red-500 hover:text-red-700 text-xs font-bold"
                                >
                                    Hapus File
                                </button>
                            </div>
                            <object
                                data={URL.createObjectURL(file)}
                                type="application/pdf"
                                className="w-full h-[400px]"
                            >
                                <p className="p-4 text-sm text-slate-500">Browser Anda tidak mendukung preview PDF. <a href={URL.createObjectURL(file)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Download file</a></p>
                            </object>
                        </div>
                    )}
                </div>

                <button 
                    type="submit" 
                    disabled={isSubmitting || !file}
                    className="w-full bg-[#FF7A00] hover:bg-[#E66E00] text-white py-4 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Mengajukan..." : "Ajukan Sidang"}
                </button>
            </form>
            </div>

            {/* Toast Component */}
            {toastProps && (
                <div className="fixed bottom-4 right-4 z-50">
                    <Toast
                        title={toastProps.title}
                        variant={toastProps.variant}
                        onClose={() => setToastProps(null)}
                    />
                </div>
            )}
        </div>
    );
}

