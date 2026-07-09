import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Edit2, Trash2 } from 'lucide-react';
import { jadwalKpApi } from '~/api/jadwalKpApi';
import type { JadwalKp } from '~/api/jadwalKpApi';
import { useNavigate } from 'react-router';
import { DeleteConfirmationModal } from '~/components/ui/delete-confirmation-modal';

interface Props {
    filterTipe?: string;
}

const StafJadwalMobile = ({ filterTipe = "PENGARAHAN_KP" }: Props) => {
    const navigate = useNavigate();
    const [jadwals, setJadwals] = useState<JadwalKp[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedJadwalId, setSelectedJadwalId] = useState<number | null>(null);

    const fetchJadwals = async () => {
        try {
            const data = await jadwalKpApi.getAllJadwalKp();
            setJadwals(data.filter((j: JadwalKp) => j.tipe === filterTipe));
        } catch (error) {
            console.error('Error fetching jadwal:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJadwals();
    }, [filterTipe]);

    const confirmDelete = (id: number) => {
        setSelectedJadwalId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (selectedJadwalId === null) return;
        try {
            await jadwalKpApi.deleteJadwalKp(selectedJadwalId);
            fetchJadwals();
            setIsDeleteDialogOpen(false);
            setSelectedJadwalId(null);
        } catch (error) {
            console.error('Error deleting jadwal:', error);
            alert('Gagal menghapus jadwal');
        }
    };

    return (
        <div className="flex flex-col flex-1 bg-slate-50 pb-20 font-inter">
            <DeleteConfirmationModal 
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setSelectedJadwalId(null);
                }}
                onConfirm={handleDelete}
                title="Hapus Jadwal"
                description="Apakah Anda yakin ingin menghapus jadwal ini? Tindakan ini tidak dapat dibatalkan."
            />

            {/* Content */}
            <div className="px-6 flex-1 pt-6">
                {loading ? (
                    <div className="text-center text-slate-500 py-10 text-sm font-bold">Memuat...</div>
                ) : jadwals.length === 0 ? (
                    <div className="bg-white rounded-3xl p-10 text-center border-2 border-dashed border-slate-200 mt-4">
                        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-slate-900 font-black mb-2 text-lg tracking-tight">Belum Ada Jadwal</h3>
                        <p className="text-slate-500 text-sm font-medium">Buat jadwal baru untuk mulai menginformasikan mahasiswa.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 mt-4">
                        {jadwals.map((jadwal) => {
                            const now = new Date();
                            const eventDate = new Date(jadwal.tanggal);
                            const isActive = now.toDateString() === eventDate.toDateString();
                            const isPast = now > eventDate && !isActive;

                            return (
                                <div key={jadwal.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-[#119DA4]" />
                                    <div className="flex flex-col gap-4 ml-2">
                                        <div className="flex items-start justify-between">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-wider rounded-md ${jadwal.tipe === 'JADWAL_SIDANG' ? 'bg-orange-100 text-orange-700' : jadwal.tipe === 'PENGARAHAN_SIDANG' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {jadwal.tipe === 'JADWAL_SIDANG' ? 'JADWAL SIDANG' : jadwal.tipe === 'PENGARAHAN_SIDANG' ? 'PENGARAHAN SIDANG' : 'PENGARAHAN KP'}
                                                    </span>
                                                    {isActive ? (
                                                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-wider rounded-md">
                                                            Aktif
                                                        </span>
                                                    ) : isPast ? (
                                                        <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-wider rounded-md">
                                                            Selesai
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-wider rounded-md">
                                                            Mendatang
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="font-black text-slate-900 text-lg tracking-tight leading-tight">
                                                    {jadwal.judul}
                                                </h3>
                                                <div 
                                                    className="text-slate-500 text-sm font-medium line-clamp-2 mt-1 prose prose-sm max-w-none prose-slate"
                                                    dangerouslySetInnerHTML={{ __html: jadwal.deskripsi || '-' }} 
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 text-slate-400">
                                                    <Calendar size={14} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal</span>
                                                    <span className="text-xs font-bold text-slate-700">
                                                        {eventDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 text-slate-400">
                                                    <Clock size={14} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu</span>
                                                    <span className="text-xs font-bold text-slate-700">
                                                        {eventDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-2 border-t border-slate-100">
                                            <button 
                                                onClick={() => navigate(`/staf/jadwal/edit/${jadwal.id}`)}
                                                className="flex-1 bg-white border border-slate-200 text-slate-700 rounded-xl h-10 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                                            >
                                                <Edit2 size={14} /> Edit
                                            </button>
                                            <button 
                                                onClick={() => confirmDelete(jadwal.id)}
                                                className="w-10 bg-red-50 text-red-600 rounded-xl h-10 flex items-center justify-center hover:bg-red-100 transition-colors shrink-0"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StafJadwalMobile;


