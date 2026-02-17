import { useState, useEffect } from "react";
import { pengajuanApi } from "~/api/pengajuan";
import { CustomSelect } from "~/components/ui/custom-select";
import { useNavigate } from "react-router";
import { Loader2, Send } from "lucide-react";

export function PengajuanDesktop() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [dosenList, setDosenList] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        peminatan: "",
        semester: "",
        tahunAkademik: "",
        judul: "",
        dosenId: "",
        sksDicapai: "",
        sksNilaiD: "",
        ipk: "",
        batasStudi: ""
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, dosenRes] = await Promise.all([
                    pengajuanApi.getProfile(),
                    pengajuanApi.getDosenList()
                ]);
                setProfile(profileRes);
                setDosenList(dosenRes);
            } catch (error) {
                console.error("Failed to load data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await pengajuanApi.createPengajuan(formData);
            alert("Pengajuan judul berhasil dikirim! Dosen pembimbing akan menerima notifikasi.");
            // Reset or navigate
            navigate("/mahasiswa/dashboard"); 
        } catch (error) {
            console.error("Submission error", error);
            alert("Gagal mengirim pengajuan. Silakan coba lagi.");
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

    return (
        <div className="min-h-screen bg-gray-50/50 p-8 font-geist">
            <div className="w-full mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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

                    {/* Right Side (Logo KM or similar placeholder based on image, using empty space for balance if no asset) */}
                    <div className="w-24 h-24 flex flex-col items-center justify-center text-xs text-gray-400 border border-dashed border-gray-300 rounded-lg">
                        <span className="text-center">Space for <br/> Department Logo</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Section 1: Academic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-700">Program Studi</label>
                                <input 
                                    type="text" 
                                    value={profile?.jurusan || "-"} 
                                    disabled 
                                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 font-medium"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-700">Semester</label>
                                <input 
                                    type="text" 
                                    name="semester"
                                    value={formData.semester}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 7 (Ganjil)"
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-700">Tahun Akademik</label>
                                <input 
                                    type="text" 
                                    name="tahunAkademik"
                                    value={formData.tahunAkademik}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 2025/2026"
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                    required
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
                                        value={profile?.nama || "-"} 
                                        disabled 
                                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 font-medium"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-semibold text-gray-700">No. Pokok / NIM</label>
                                    <input 
                                        type="text" 
                                        value={profile?.nim || "-"} 
                                        disabled 
                                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 font-medium bg-white"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-700">Peminatan</label>
                                <input 
                                    type="text" 
                                    name="peminatan"
                                    value={formData.peminatan}
                                    onChange={handleInputChange}
                                    placeholder="Bidang peminatan skripsi (e.g. AI, Software Engineering)"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-700">Usulan Judul</label>
                                <textarea 
                                    name="judul"
                                    value={formData.judul}
                                    onChange={handleInputChange}
                                    placeholder="Tuliskan usulan judul skripsi anda secara lengkap..."
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all resize-none"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <div className="flex flex-col gap-4">
                            <label className="text-lg font-bold text-gray-900">Usulan Pembimbing :</label>
                            <CustomSelect
                                options={dosenList.map(d => ({ label: `${d.nama} (${d.appointment || d.jabatan})`, value: d.id.toString() }))}
                                value={formData.dosenId}
                                onChange={(val) => handleSelectChange("dosenId", val)}
                                placeholder="Pilih Dosen Pembimbing"
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Data Akademik</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-700">Jumlah SKS yang dicapai <span className="text-xs font-normal text-gray-500">(tanpa nilai D, E, Blank)</span></label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        name="sksDicapai"
                                        value={formData.sksDicapai}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all pr-12"
                                        required
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">SKS</span>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-700">Jumlah SKS nilai D</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        name="sksNilaiD"
                                        value={formData.sksNilaiD}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all pr-12"
                                        required
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">SKS</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-700">Indeks Prestasi Komulatif (IPK)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    name="ipk"
                                    value={formData.ipk}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 3.50"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-700">Batas Studi</label>
                                <input 
                                    type="text" 
                                    name="batasStudi"
                                    value={formData.batasStudi}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Semester 14 (2028/2029)"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 flex justify-end">
                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="flex items-center gap-2 px-8 py-3 bg-[#D25026] text-white font-bold rounded-xl hover:bg-[#B9441F] transition-all active:scale-95 shadow-lg shadow-[#D25026]/20 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Mengirim...
                                </>
                            ) : (
                                <>
                                    <Send size={20} />
                                    Kirim Permohonan
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
