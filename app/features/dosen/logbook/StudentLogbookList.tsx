import { useState, useEffect } from "react";
import { bimbinganApi } from "~/api/bimbinganApi";
import { Loader2, Search, User, ArrowRight, BookOpen } from "lucide-react";
import { Link } from "react-router";

export function StudentLogbookList() {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await bimbinganApi.getDosenBimbinganStudents();
                setStudents(res);
            } catch (error) {
                console.error("Failed to fetch students", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const filteredStudents = students.filter(s => 
        s.mahasiswa?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.mahasiswa?.nim?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="animate-spin text-[#D25026]" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Logbook Mahasiswa Bimbingan</h1>
                    <p className="text-gray-500">Pilih mahasiswa untuk melihat dan memverifikasi logbook mereka.</p>
                </div>
                
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text"
                        placeholder="Cari nama atau NIM..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D25026]/20 focus:border-[#D25026] outline-none transition-all shadow-sm"
                    />
                </div>
            </div>

            {filteredStudents.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="text-gray-300" size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Tidak ada mahasiswa ditemukan</h3>
                    <p className="text-gray-500">Belum ada mahasiswa bimbingan yang terdaftar atau pencarian tidak cocok.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredStudents.map((item) => (
                        <Link 
                            key={item.id}
                            to={`/dosen/logbook/${item.mahasiswaId}`}
                            className="group bg-white p-5 rounded-2xl border border-gray-100 hover:border-[#D25026] hover:shadow-xl hover:shadow-[#D25026]/5 transition-all duration-300"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-[#D25026]/10 transition-colors">
                                    <User className="text-gray-400 group-hover:text-[#D25026]" size={24} />
                                </div>
                                <div className="p-2 bg-green-50 text-green-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                    Aktif
                                </div>
                            </div>
                            
                            <div className="space-y-1">
                                <h3 className="font-bold text-gray-900 group-hover:text-[#D25026] transition-colors line-clamp-1">
                                    {item.mahasiswa?.nama}
                                </h3>
                                <p className="text-sm text-gray-500 font-medium">{item.mahasiswa?.nim}</p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 group-hover:text-gray-600">
                                    <BookOpen size={14} />
                                    <span>Lihat Logbook</span>
                                </div>
                                <ArrowRight className="text-gray-300 group-hover:text-[#D25026] group-hover:translate-x-1 transition-all" size={18} />
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
