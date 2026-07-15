import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { jadwalKpApi } from '~/api/jadwalKpApi';
import type { JadwalKp } from '~/api/jadwalKpApi';
import { useNavigate } from 'react-router';
import { DeleteConfirmationModal } from '~/components/ui/delete-confirmation-modal';

interface Props {
    filterTipe?: string;
}

const StafJadwalDesktop = ({ filterTipe = "PENGARAHAN_KP" }: Props) => {
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
            console.error("Failed to fetch jadwals", error);
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
        <div className="px-8 flex-1">
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

            <div>
                {loading ? (
                    <div className="text-center text-gray-500 py-10">Memuat...</div>
                ) : jadwals.length === 0 ? (
                    <div className="bg-white rounded-2xl p-10 text-center border border-gray-200 mt-6">
                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-gray-900 font-bold mb-2">Belum Ada Jadwal</h3>
                        <p className="text-gray-500">Buat jadwal baru untuk mulai menginformasikan mahasiswa.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                        {jadwals.map((j) => {
                            const now = new Date();
                            const eventDate = new Date(j.tanggal);
                            const isActive = now.toDateString() === eventDate.toDateString();
                            const isPast = now > eventDate && !isActive;

                            return (
                                <div key={j.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                                    <div className={`h-2 ${j.tipe === 'JADWAL_SIDANG' ? 'bg-orange-500' : j.tipe === 'PENGARAHAN_SIDANG' ? 'bg-purple-500' : 'bg-blue-500'}`} />
                                    <div className="p-6 flex-1">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-md ${j.tipe === 'JADWAL_SIDANG' ? 'bg-orange-100 text-orange-700' : j.tipe === 'PENGARAHAN_SIDANG' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {j.tipe === 'JADWAL_SIDANG' ? 'JADWAL SIDANG' : j.tipe === 'PENGARAHAN_SIDANG' ? 'PENGARAHAN SIDANG' : 'PENGARAHAN KP'}
                                            </span>
                                            {isActive ? (
                                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">AKTIF</span>
                                            ) : isPast ? (
                                                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200">SELESAI</span>
                                            ) : (
                                                <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded border border-yellow-200">MENDATANG</span>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-lg mb-1">{j.judul}</h3>
                                        <div 
                                            className="text-sm text-gray-500 mb-4 line-clamp-2 prose prose-sm max-w-none prose-gray"
                                            dangerouslySetInnerHTML={{ __html: j.deskripsi || '-' }} 
                                        />

                                        <div className="space-y-2">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                {eventDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                                {eventDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-100 p-4 bg-gray-50 flex gap-2">
                                        <button 
                                            onClick={() => navigate(`/staf/jadwal/edit/${j.id}`)}
                                            className="flex-1 flex items-center justify-center py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                                        >
                                            <Edit2 className="w-4 h-4 mr-2" /> Edit
                                        </button>
                                        <button 
                                            onClick={() => confirmDelete(j.id)}
                                            className="flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
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

export default StafJadwalDesktop;


