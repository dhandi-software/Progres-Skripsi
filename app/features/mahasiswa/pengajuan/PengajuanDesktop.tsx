import { useState, useEffect } from "react";
import { pengajuanApi } from "~/api/pengajuan";
import { CustomSelect } from "~/components/ui/custom-select";
import { useNavigate } from "react-router";
import { Loader2, Send } from "lucide-react";
import { Toast } from "~/components/ui/toast";

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
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [toastProps, setToastProps] = useState<{title: string, variant?: "success" | "destructive" | "default"} | null>(null);

    const showToast = (title: string, variant: "success" | "destructive" | "default" = "success") => {
        setToastProps({ title, variant });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, dosenRes] = await Promise.all([
                    pengajuanApi.getProfile(),
                    pengajuanApi.getDosenList()
                ]);
                
                // Block duplicate active applications
                if (profileRes.pengajuanJudul && profileRes.pengajuanJudul.length > 0) {
                    const latestPengajuan = profileRes.pengajuanJudul[0];
                    if (latestPengajuan.status !== 'REJECTED') {
                        setIsReadOnly(true);
                        setFormData({
                            peminatan: latestPengajuan.peminatan || "",
                            semester: latestPengajuan.semester || "",
                            tahunAkademik: latestPengajuan.tahunAkademik || "",
                            judul: latestPengajuan.judul || "",
                            dosenId: latestPengajuan.dosenId?.toString() || "",
                            sksDicapai: latestPengajuan.sksDicapai?.toString() || "",
                            sksNilaiD: latestPengajuan.sksNilaiD?.toString() || "",
                            ipk: latestPengajuan.ipk?.toString() || "",
                            batasStudi: latestPengajuan.batasStudi || ""
                        });
                    } else if (profileRes.tahunMasuk) {
                        // Apply Smart Defaults for resubmission
                        const currentYear = new Date().getFullYear();
                        const currentMonth = new Date().getMonth(); // 0-based
                        const startYear = parseInt(profileRes.tahunMasuk);
                        const diffYears = currentYear - startYear;
                        const calculatedSemester = (diffYears * 2) + (currentMonth > 6 ? 1 : 0);
                        const calculatedTahunAkademik = currentMonth > 6 ? `${currentYear}/${currentYear + 1}` : `${currentYear - 1}/${currentYear}`;
                        
                        setFormData(prev => ({
                            ...prev,
                            semester: calculatedSemester > 0 ? calculatedSemester.toString() : "1",
                            tahunAkademik: calculatedTahunAkademik
                        }));
                    }
                } else if (profileRes.tahunMasuk) {
                    // Smart Defaults for new applications
                    const currentYear = new Date().getFullYear();
                    const currentMonth = new Date().getMonth(); // 0-based
                    const startYear = parseInt(profileRes.tahunMasuk);
                    const diffYears = currentYear - startYear;
                    const calculatedSemester = (diffYears * 2) + (currentMonth > 6 ? 1 : 0);
                    const calculatedTahunAkademik = currentMonth > 6 ? `${currentYear}/${currentYear + 1}` : `${currentYear - 1}/${currentYear}`;
                    
                    setFormData(prev => ({
                        ...prev,
                        semester: calculatedSemester > 0 ? calculatedSemester.toString() : "1",
                        tahunAkademik: calculatedTahunAkademik
                    }));
                }

                setProfile(profileRes);
                setDosenList(dosenRes);
            } catch (error) {
                console.error("Failed to load data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

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
            showToast("Pengajuan judul berhasil dikirim!", "success");
            setTimeout(() => {
                navigate("/mahasiswa"); 
            }, 1500);
        } catch (error) {
            console.error("Submission error", error);
            showToast("Gagal mengirim pengajuan. Silakan coba lagi.", "destructive");
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
        <div className="min-h-screen bg-gray-50/50 p-8 font-geist relative">
            {toastProps && (
                <div className="fixed top-4 right-4 z-50">
                    <Toast
                        title={toastProps.title}
                        variant={toastProps.variant}
                        onClose={() => setToastProps(null)}
                    />
                </div>
            )}
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

                    {/* Right Side Logo */}
                    <div className="w-24 h-24 flex-shrink-0">
                         <img 
                            src="/images/LogoUpKebanggan.png" 
                            alt="Logo Fakultas" 
                            className="w-full h-full object-contain"
                         />
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
                                    disabled={isReadOnly}
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
                                    disabled={isReadOnly}
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
                                <CustomSelect
                                    options={[
                                        { label: "Data Science", value: "Data Science" },
                                        { label: "Artificial Intelligent", value: "Artificial Intelligent" },
                                        { label: "Software Engineering", value: "Software Engineering" },
                                        { label: "Network and Cyber Security", value: "Network and Cyber Security" }
                                    ]}
                                    value={formData.peminatan}
                                    onChange={(val) => handleSelectChange("peminatan", val)}
                                    disabled={isReadOnly}
                                    placeholder="Pilih Bidang Peminatan"
                                    className="w-full"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-700">Usulan Judul</label>
                                <textarea 
                                    name="judul"
                                    value={formData.judul}
                                    disabled={isReadOnly}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        const words = value.trim().split(/\s+/).filter(word => word.length > 0);
                                        // Allow deleting or if under the limit
                                        if (words.length <= 20 || value.length < formData.judul.length) {
                                            handleInputChange(e);
                                        }
                                    }}
                                    placeholder="Tuliskan usulan judul kerja praktik..."
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all resize-none"
                                    required
                                />
                                <div className="text-right flex justify-end w-full mt-1">
                                    <span className={formData.judul.trim().split(/\s+/).filter(word => word.length > 0).length >= 20 ? "text-xs font-medium text-red-500" : "text-xs font-medium text-gray-400"}>
                                        {formData.judul.trim().split(/\s+/).filter(word => word.length > 0).length} / 20 kata
                                    </span>
                                </div>
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
                                disabled={isReadOnly}
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
                                        disabled={isReadOnly}
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
                                        disabled={isReadOnly}
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
                                    disabled={isReadOnly}
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
                                    disabled={isReadOnly}
                                    placeholder="Sisa masa studi e.g. 2030"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 flex justify-end">
                        {isReadOnly ? (
                            <div className="px-8 py-3 bg-gray-100 text-gray-500 font-bold rounded-xl border border-gray-200">
                                Pengajuan Anda sedang dalam proses
                            </div>
                        ) : (
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
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
