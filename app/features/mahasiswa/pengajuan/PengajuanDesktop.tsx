import { useState, useEffect } from "react";
import { pengajuanApi } from "~/api/pengajuan";
import { CustomSelect } from "~/components/ui/custom-select";
import { useNavigate } from "react-router";
import { Loader2, Send, MessageSquare, RotateCcw, AlertTriangle, Calendar, Clock } from "lucide-react";
import { Toast } from "~/components/ui/toast";
import { DeleteConfirmationModal } from "~/components/ui/delete-confirmation-modal";
import { useAuth } from "~/hooks/useAuth";

export function PengajuanDesktop() {
    const navigate = useNavigate();
    const { user } = useAuth();
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
    const [cancelling, setCancelling] = useState(false);
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const isReadOnly = ['PENDING', 'PENDING_KOORDINATOR', 'APPROVED'].includes(profile?.pengajuanJudul?.[0]?.status);
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
                
                // Block duplicate active applications, but allow resubmission for REJECTED and REVISION
                const tahunMasuk = profileRes.tahunMasuk || user?.tahunMasuk;
                let calculatedBatasStudi = "";
                if (tahunMasuk) {
                    const startYear = parseInt(tahunMasuk);
                    calculatedBatasStudi = !isNaN(startYear) ? (startYear + 6).toString() : "";
                }

                const sksDicapai = profileRes.sksDicapai || profileRes.pengajuanJudul?.[0]?.sksDicapai?.toString() || "";
                const sksNilaiD = profileRes.sksNilaiD !== undefined && profileRes.sksNilaiD !== null ? profileRes.sksNilaiD.toString() : (profileRes.pengajuanJudul?.[0]?.sksNilaiD?.toString() || "0");
                const ipk = profileRes.ipk || profileRes.pengajuanJudul?.[0]?.ipk?.toString() || "";
                const batasStudi = profileRes.batasStudi || profileRes.pengajuanJudul?.[0]?.batasStudi?.toString() || calculatedBatasStudi;

                if (profileRes.pengajuanJudul && profileRes.pengajuanJudul.length > 0) {
                    const latestPengajuan = profileRes.pengajuanJudul[0];
                    setFormData({
                        peminatan: latestPengajuan.peminatan || "",
                        semester: latestPengajuan.semester || "",
                        tahunAkademik: latestPengajuan.tahunAkademik || "",
                        judul: latestPengajuan.judul || "",
                        dosenId: latestPengajuan.dosenNidn?.toString() || latestPengajuan.dosenId?.toString() || "",
                        sksDicapai: sksDicapai,
                        sksNilaiD: sksNilaiD,
                        ipk: ipk,
                        batasStudi: batasStudi
                    });
                } else {
                    if (tahunMasuk) {
                        // Smart Defaults for new applications
                        const currentYear = new Date().getFullYear();
                        const currentMonth = new Date().getMonth(); // 0-based
                        const startYear = parseInt(tahunMasuk);
                        const diffYears = currentYear - startYear;
                        const calculatedSemester = (diffYears * 2) + (currentMonth > 6 ? 1 : 0);
                        const calculatedTahunAkademik = currentMonth > 6 ? `${currentYear}/${currentYear + 1}` : `${currentYear - 1}/${currentYear}`;
                    
                        setFormData(prev => ({
                            ...prev,
                            semester: calculatedSemester > 0 ? calculatedSemester.toString() : "1",
                            tahunAkademik: calculatedTahunAkademik,
                            sksDicapai: sksDicapai,
                            sksNilaiD: sksNilaiD,
                            ipk: ipk,
                            batasStudi: batasStudi
                        }));
                    } else {
                        setFormData(prev => ({
                            ...prev,
                            sksDicapai: sksDicapai,
                            sksNilaiD: sksNilaiD,
                            ipk: ipk,
                            batasStudi: batasStudi
                        }));
                    }
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
        let { name, value } = e.target;

        if (name === 'sksNilaiD' && Number(value) < 0) {
            value = '0';
        }

        setFormData(prev => ({ ...prev, [name]: value }));

        // Toast alert for SKS Grade D or E
        if (name === 'sksNilaiD' && Number(value) > 0) {
            showToast("kamu harus memperbaiki nilai yang tidak lulus tersebut", "default");
        }

        // Batas Studi is now read-only, no warning needed
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            if (name === "peminatan") {
                newData.dosenId = ""; // Reset pembimbing when peminatan changes
            }
            return newData;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validasi minimal 100 SKS
        if (Number(formData.sksDicapai) < 100) {
            showToast("Jumlah SKS yang dicapai minimal 100 SKS untuk mengajukan KP.", "destructive");
            return;
        }

        // Validasi Batas Studi is handled by the disabled input

        // BLOCK submission if SKS Grade D or E > 0
        if (Number(formData.sksNilaiD) > 0) {
            showToast("kamu harus memperbaiki nilai yang tidak lulus tersebut", "destructive");
            return;
        }

        // Validasi IPK minimal 2.00
        if (Number(formData.ipk) < 2.00) {
            showToast("IPK minimal 2.00 untuk mengajukan KP.", "destructive");
            return;
        }

        // Validation for CustomSelect fields (since they don't have 'required' attribute)
        if (!formData.peminatan) {
            showToast("Silakan pilih bidang peminatan terlebih dahulu.", "destructive");
            return;
        }

        if (!formData.dosenId) {
            showToast("Silakan pilih dosen pembimbing yang diusulkan.", "destructive");
            return;
        }

        setSubmitting(true);
        try {
            await pengajuanApi.createPengajuan(formData);
            showToast("Pengajuan judul berhasil dikirim!", "success");
            setTimeout(() => {
                navigate("/mahasiswa"); 
            }, 3000);
        } catch (error: any) {
            console.error("Submit error:", error);
            showToast(error.response?.data?.message || "Gagal mengirim pengajuan. Silakan coba lagi.", "destructive");
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (!profile?.pengajuanJudul?.[0]?.id) return;
        setIsCancelDialogOpen(true);
    };

    const confirmCancel = async () => {
        setIsCancelDialogOpen(false);
        setCancelling(true);
        try {
            await pengajuanApi.cancelPengajuan(profile!.pengajuanJudul[0].id);
            showToast("Pengajuan berhasil dibatalkan. Silakan edit dan kirim ulang jika perlu.", "success");
            
            // Allow editing with current data instead of reloading
            setProfile((prev: any) => ({
                ...prev,
                pengajuanJudul: []
            }));
            setCancelling(false);
        } catch (error) {
            console.error("Cancel error", error);
            showToast("Gagal membatalkan pengajuan", "destructive");
            setCancelling(false);
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
            {/* Modals */}
            <DeleteConfirmationModal
                isOpen={isCancelDialogOpen}
                onClose={() => setIsCancelDialogOpen(false)}
                onConfirm={confirmCancel}
                title="Batalkan Pengajuan"
                description="Apakah Anda yakin ingin membatalkan pengajuan ini? Data akan dihapus dan Anda harus mengisi ulang formulir jika ingin mengajukan kembali."
            />

            {toastProps && (
                <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-right-full">
                    <Toast
                        title={toastProps.title}
                        variant={toastProps.variant}
                        onClose={() => setToastProps(null)}
                    />
                </div>
            )}
            <div className="w-full mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Pending Koordinator Status Banner */}
                {profile?.pengajuanJudul?.[0]?.status === 'PENDING_KOORDINATOR' && (
                    <div className="mx-8 mt-8 p-4 bg-purple-50 border border-purple-300 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="p-2 bg-purple-100 rounded-full text-purple-700 shrink-0">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-purple-800 font-bold text-sm">Status Pengajuan: Menunggu Persetujuan Koordinator</h3>
                            <p className="text-purple-700 text-xs mt-1">Pengajuan Anda telah berhasil dikirim dan sedang ditinjau oleh Koordinator sebelum diteruskan ke Dosen Pembimbing.</p>
                        </div>
                    </div>
                )}

                {/* Pending Status Banner */}
                {profile?.pengajuanJudul?.[0]?.status === 'PENDING' && (
                    <div className="mx-8 mt-8 p-4 bg-blue-50 border border-blue-300 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="p-2 bg-blue-100 rounded-full text-blue-700 shrink-0">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-blue-800 font-bold text-sm">Status Pengajuan: Menunggu Persetujuan Dosen Pembimbing</h3>
                            <p className="text-blue-700 text-xs mt-1">Pengajuan Anda telah disetujui oleh Koordinator dan saat ini sedang menunggu persetujuan akhir dari Dosen Pembimbing.</p>
                        </div>
                    </div>
                )}

                {/* Revision Feedback Banner */}
                {(profile?.pengajuanJudul?.[0]?.status === 'REVISION' || profile?.pengajuanJudul?.[0]?.status === 'REVISION_KOORDINATOR') && (
                    <div className="mx-8 mt-8 p-4 bg-yellow-50 border border-yellow-300 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="p-2 bg-yellow-100 rounded-full text-yellow-700 shrink-0">
                            <RotateCcw className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-yellow-800 font-bold text-sm">Pengajuan Perlu Diperbaiki</h3>
                            <p className="text-yellow-700 text-xs mt-1">
                                {profile?.pengajuanJudul?.[0]?.status === 'REVISION_KOORDINATOR' 
                                    ? "Koordinator meminta Anda merevisi usulan judul. Silakan perbaiki dan kirim ulang."
                                    : "Dosen Pembimbing meminta Anda merevisi usulan judul. Silakan perbaiki dan kirim ulang."}
                            </p>
                            {profile.pengajuanJudul[0].remarks && (
                                <div className="mt-2 p-3 bg-white border border-yellow-200 rounded-lg">
                                    <p className="text-xs font-bold text-yellow-700 mb-1 flex items-center gap-1">
                                        <MessageSquare className="w-3.5 h-3.5" /> 
                                        {profile?.pengajuanJudul?.[0]?.status === 'REVISION_KOORDINATOR' ? "Komentar Koordinator:" : "Komentar Dosen Pembimbing:"}
                                    </p>
                                    <p className="text-sm text-yellow-900 italic">"{profile.pengajuanJudul[0].remarks}"</p>
                                </div>
                            )}
                            {profile.pengajuanJudul[0].deadlineRevisi && (
                                <div className="mt-2 p-3 bg-white border border-yellow-200 rounded-lg">
                                    <p className="text-xs font-bold text-yellow-700 mb-1 flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" /> Batas Waktu Pengumpulan Revisi:
                                    </p>
                                    <p className="text-sm text-yellow-900 font-semibold">
                                        {new Date(profile.pengajuanJudul[0].deadlineRevisi).toLocaleDateString('id-ID', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
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
                                        value={user?.name || profile?.nama || "-"} 
                                        disabled 
                                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 font-medium"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-semibold text-gray-700">No. Pokok / NIM</label>
                                    <input 
                                        type="text" 
                                        value={user?.mahasiswaNim || profile?.nim || "-"} 
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
                                        { label: "Artificial Intelligence", value: "Artificial Intelligence" },
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
                                options={[...dosenList]
                                    .filter(d => {
                                        if (!formData.peminatan) return true;
                                        let isMatch = d.peminatan && Array.isArray(d.peminatan) && d.peminatan.includes(formData.peminatan);
                                        if (!isMatch && formData.peminatan === "Network and Cyber Security") {
                                            isMatch = d.peminatan && Array.isArray(d.peminatan) && d.peminatan.includes("Cyber Security");
                                        }
                                        return isMatch;
                                    })
                                    .sort((a, b) => {
                                        const aSelectable = (a.jabatan || '').toLowerCase().includes('pembimbing') || (a.jabatan || '').toLowerCase().includes('koordinator');
                                        const bSelectable = (b.jabatan || '').toLowerCase().includes('pembimbing') || (b.jabatan || '').toLowerCase().includes('koordinator');
                                        if (aSelectable && !bSelectable) return -1;
                                        if (!aSelectable && bSelectable) return 1;
                                        return a.nama.localeCompare(b.nama);
                                    })
                                    .map(d => {
                                        const isSelectable = (d.jabatan || '').toLowerCase().includes('pembimbing') || (d.jabatan || '').toLowerCase().includes('koordinator');
                                        const peminatanText = d.peminatan && Array.isArray(d.peminatan) && d.peminatan.length > 0 
                                            ? ` - [${d.peminatan.join(', ')}]` 
                                            : '';
                                        const isFull = (d.terisi ?? 0) >= (d.kuota ?? 6);
                                        const kuotaText = isSelectable ? ` (${d.terisi ?? 0}/${d.kuota ?? 6})` : '';
                                        return { 
                                            label: isSelectable ? `${d.nama} (${d.appointment || d.jabatan})${kuotaText}${peminatanText}` : `${d.nama} (Viewer)`, 
                                            value: d.nidn.toString(),
                                            disabled: !isSelectable || isFull
                                        };
                                    })}
                                value={formData.dosenId}
                                onChange={(val) => handleSelectChange("dosenId", val)}
                                disabled={isReadOnly}
                                placeholder={formData.peminatan ? "Pilih Dosen Pembimbing" : "Pilih Peminatan Dahulu"}
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Data Akademik</h3>
                            <span className="text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-600 rounded-full border border-gray-200">Terverifikasi Admin / Read-Only</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-700">Jumlah SKS yang dicapai <span className="text-xs font-normal text-gray-500">(tanpa nilai D, E, Blank)</span></label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        name="sksDicapai"
                                        value={formData.sksDicapai}
                                        disabled={true}
                                        placeholder="Terisi dari Data Admin"
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-medium outline-none pr-12 cursor-not-allowed"
                                        required
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">SKS</span>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-700">Jumlah yang tidak Lulus (D dan E)</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        name="sksNilaiD"
                                        value={formData.sksNilaiD}
                                        disabled={true}
                                        placeholder="Terisi dari Data Admin"
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-medium outline-none pr-12 cursor-not-allowed"
                                        required
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">SKS</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-700">Indeks Prestasi Komulatif (IPK)</label>
                                <input 
                                    type="text" 
                                    name="ipk"
                                    value={formData.ipk}
                                    disabled={true}
                                    placeholder="Terisi dari Data Admin"
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-medium outline-none cursor-not-allowed"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-700">Batas Studi</label>
                                <input 
                                    type="text" 
                                    name="batasStudi"
                                    value={formData.batasStudi}
                                    disabled={true}
                                    placeholder="Otomatis (Tahun Masuk + 6)"
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-medium cursor-not-allowed"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 flex justify-end">
                        {isReadOnly ? (
                            <div className="flex flex-col items-end gap-3">
                                <div className={`px-8 py-3 font-bold rounded-xl border ${profile?.pengajuanJudul?.[0]?.status === 'APPROVED' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                    {profile?.pengajuanJudul?.[0]?.status === 'APPROVED' ? 'Pengajuan Sudah di ACC' : 'Pengajuan Anda sedang dalam proses'}
                                </div>
                                {['PENDING', 'PENDING_KOORDINATOR'].includes(profile?.pengajuanJudul?.[0]?.status) && (
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        disabled={cancelling}
                                        className="text-sm font-bold text-red-600 hover:text-red-700 underline flex items-center gap-1 transition-all disabled:opacity-50"
                                    >
                                        {cancelling ? <Loader2 className="animate-spin" size={14} /> : null}
                                        Batalkan Pengajuan
                                    </button>
                                )}
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
                                ) : ['REVISION', 'REVISION_KOORDINATOR'].includes(profile?.pengajuanJudul?.[0]?.status) ? (
                                    <>
                                        <RotateCcw size={20} />
                                        Kirim Ulang Permohonan
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
