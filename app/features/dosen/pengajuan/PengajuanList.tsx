import React, { useEffect, useState } from "react";
import { pengajuanApi } from "~/api/pengajuan";
import { useAuth } from "~/hooks/useAuth";
import { Check, X, FileText, User } from "lucide-react";

interface Pengajuan {
    id: number;
    judul: string;
    mahasiswa: {
        nama: string;
        nim: string;
        jurusan: string;
    };
    status: string;
    tanggal: string;
    peminatan: string;
    semester: string;
    tahunAkademik: string;
    ipk: string;
    sksDicapai: string;
}

export function PengajuanList() {
    const [pengajuanList, setPengajuanList] = useState<Pengajuan[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth(); // Ensure user is authenticated

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await pengajuanApi.getPengajuanByDosen();
            setPengajuanList(data);
        } catch (error) {
            console.error("Failed to fetch pengajuan list", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: number, status: 'APPROVED' | 'REJECTED') => {
        if (!confirm(`Are you sure you want to ${status} this proposal?`)) return;
        try {
            await pengajuanApi.updateStatus(id, status);
            alert(`Proposal ${status} successfully!`);
            fetchData(); // Refresh list
        } catch (error: any) {
            alert("Failed to update status: " + (error.response?.data?.message || error.message));
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Daftar Pengajuan Judul</h1>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {pengajuanList.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        Belum ada pengajuan judul.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="p-4 font-semibold text-gray-600">Mahasiswa</th>
                                    <th className="p-4 font-semibold text-gray-600">Judul</th>
                                    <th className="p-4 font-semibold text-gray-600">Detail Akademik</th>
                                    <th className="p-4 font-semibold text-gray-600">Status</th>
                                    <th className="p-4 font-semibold text-gray-600 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {pengajuanList.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                                    <User size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{item.mahasiswa.nama}</p>
                                                    <p className="text-sm text-gray-500">{item.mahasiswa.nim}</p>
                                                    <p className="text-xs text-gray-400">{item.mahasiswa.jurusan}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-start gap-2">
                                                <FileText size={18} className="text-gray-400 mt-1 shrink-0" />
                                                <div>
                                                    <p className="font-medium text-gray-800">{item.judul}</p>
                                                    <p className="text-sm text-gray-500">Peminatan: {item.peminatan}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            <p>Sem: {item.semester} / {item.tahunAkademik}</p>
                                            <p>IPK: {item.ipk}</p>
                                            <p>SKS: {item.sksDicapai}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                                item.status === 'APPROVED' ? 'bg-green-100 text-green-700 border-green-200' :
                                                item.status === 'REJECTED' ? 'bg-red-100 text-red-700 border-red-200' :
                                                'bg-yellow-100 text-yellow-700 border-yellow-200'
                                            }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            {item.status === 'PENDING' && (
                                                <div className="flex justify-end gap-2">
                                                    <button 
                                                        onClick={() => handleStatusUpdate(item.id, 'APPROVED')}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Approve"
                                                    >
                                                        <Check size={20} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleStatusUpdate(item.id, 'REJECTED')}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Reject"
                                                    >
                                                        <X size={20} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
