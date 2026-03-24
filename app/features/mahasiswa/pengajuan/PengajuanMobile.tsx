import { useState, useEffect } from "react";
import { pengajuanApi } from "~/api/pengajuan";
import { CustomSelect } from "~/components/ui/custom-select";
import { useNavigate } from "react-router";
import { Loader2, Send, ChevronLeft } from "lucide-react";
import { Link } from "react-router";
import { Toast } from "~/components/ui/toast";

export function PengajuanMobile() {
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
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-orange-600" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-geist relative">
            {toastProps && (
                <div className="fixed top-4 right-4 left-4 z-50">
                    <Toast
                        title={toastProps.title}
                        variant={toastProps.variant}
                        onClose={() => setToastProps(null)}
                    />
                </div>
            )}
            {/* Mobile Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10 px-4 py-3 flex items-center gap-3">
                 <Link to="/mahasiswa/dashboard" className="p-2 -ml-2 text-gray-600">
                    <ChevronLeft size={24} />
                 </Link>
                 <h1 className="text-lg font-bold text-gray-900">Pengajuan Judul</h1>
            </div>

            <div className="p-4 space-y-6">
                {/* Official Header (Simplified) */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center space-y-2">
                    <div className="flex justify-center items-center gap-4">
                        <img 
                            src="https://upload.wikimedia.org/wikipedia/id/thumb/4/46/Logo_Universitas_Pancasila.png/250px-Logo_Universitas_Pancasila.png" 
                            alt="Logo UP" 
                            className="w-12 h-12 object-contain"
                        />
                        <img 
                            src="/images/LogoUpKebanggan.png" 
                            alt="Logo Fakultas" 
                            className="w-12 h-12 object-contain"
                        />
                    </div>
                    <h2 className="text-xs font-bold text-gray-800 uppercase leading-relaxed">
                        Fakultas Teknik <br/> Universitas Pancasila
                    </h2>
                    <div className="w-16 h-0.5 bg-orange-500 mx-auto rounded-full"></div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Permohonan Kerja Praktik</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Data Akademik Group */}
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Info Akademik</h3>
                        
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Program Studi</label>
                                <input 
                                    type="text" 
                                    value={profile?.jurusan || "-"} 
                                    disabled 
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 font-medium outline-none"
                                />
                            </div>
                            
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Semester</label>
                                <input 
                                    type="text" 
                                    name="semester"
                                    value={formData.semester}
                                    onChange={handleInputChange}
                                    disabled={isReadOnly}
                                    placeholder="e.g. 7"
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Tahun Akademik</label>
                                <input 
                                    type="text" 
                                    name="tahunAkademik"
                                    value={formData.tahunAkademik}
                                    onChange={handleInputChange}
                                    disabled={isReadOnly}
                                    placeholder="e.g. 2025/2026"
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Data Diri Group */}
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Data Mahasiswa</h3>
                        
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Nama Lengkap</label>
                                <input 
                                    type="text" 
                                    value={profile?.nama || "-"} 
                                    disabled 
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 font-medium outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">NIM</label>
                                <input 
                                    type="text" 
                                    value={profile?.nim || "-"} 
                                    disabled 
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 font-medium outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Proposal Group */}
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Detail Pengajuan</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Peminatan</label>
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

                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Usulan Judul</label>
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
                                    rows={4}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all resize-none"
                                    required
                                />
                                <div className="text-right flex justify-end w-full mt-1">
                                    <span className={formData.judul.trim().split(/\s+/).filter(word => word.length > 0).length >= 20 ? "text-[10px] font-medium text-red-500" : "text-[10px] font-medium text-gray-400"}>
                                        {formData.judul.trim().split(/\s+/).filter(word => word.length > 0).length} / 20 kata
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Usulan Pembimbing</label>
                                <CustomSelect
                                    options={dosenList.map(d => ({ label: d.nama, value: d.id.toString() }))}
                                    value={formData.dosenId}
                                    onChange={(val) => handleSelectChange("dosenId", val)}
                                    disabled={isReadOnly}
                                    placeholder="Pilih Dosen"
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stats Group */}
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Statistik Akademik</h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">SKS Dicapai</label>
                                <input 
                                    type="number" 
                                    name="sksDicapai"
                                    value={formData.sksDicapai}
                                    onChange={handleInputChange}
                                    disabled={isReadOnly}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">SKS Nilai D</label>
                                <input 
                                    type="number" 
                                    name="sksNilaiD"
                                    value={formData.sksNilaiD}
                                    onChange={handleInputChange}
                                    disabled={isReadOnly}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">IPK</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    name="ipk"
                                    value={formData.ipk}
                                    onChange={handleInputChange}
                                    disabled={isReadOnly}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Batas Studi</label>
                                <input 
                                    type="text" 
                                    name="batasStudi"
                                    value={formData.batasStudi}
                                    onChange={handleInputChange}
                                    disabled={isReadOnly}
                                    placeholder="Sisa masa studi e.g. 2030"
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    {isReadOnly ? (
                        <div className="w-full py-3.5 bg-gray-100 text-gray-500 font-bold rounded-xl border border-gray-200 text-center text-sm">
                            Pengajuan Anda sedang dalam proses
                        </div>
                    ) : (
                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="w-full py-3.5 bg-[#D25026] text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <Send size={18} />
                            )}
                            {submitting ? "Mengirim..." : "Kirim Permohonan"}
                        </button>
                    )}
                    
                    <div className="h-4"></div>
                </form>
            </div>
        </div>
    );
}
