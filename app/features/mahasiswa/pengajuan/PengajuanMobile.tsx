import { useState, useEffect } from "react";
import { pengajuanApi } from "~/api/pengajuan";
import { CustomSelect } from "~/components/ui/custom-select";
import { useNavigate } from "react-router";
import { Loader2, Send, ChevronLeft, MessageSquare, RotateCcw, Calendar } from "lucide-react";
import { Link } from "react-router";
import { Toast } from "~/components/ui/toast";
import { DeleteConfirmationModal } from "~/components/ui/delete-confirmation-modal";
import { useAuth } from "~/hooks/useAuth";

export function PengajuanMobile() {
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
    const isReadOnly = profile?.pengajuanJudul?.[0]?.status === 'PENDING' || profile?.pengajuanJudul?.[0]?.status === 'APPROVED';
    const [toastProps, setToastProps] = useState<{ title: string, variant?: "success" | "destructive" | "default" } | null>(null);

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

                if (profileRes.pengajuanJudul && profileRes.pengajuanJudul.length > 0) {
                    const latestPengajuan = profileRes.pengajuanJudul[0];
                    setFormData({
                        peminatan: latestPengajuan.peminatan || "",
                        semester: latestPengajuan.semester || "",
                        tahunAkademik: latestPengajuan.tahunAkademik || "",
                        judul: latestPengajuan.judul || "",
                        dosenId: latestPengajuan.dosenNidn?.toString() || latestPengajuan.dosenId?.toString() || "",
                        sksDicapai: latestPengajuan.sksDicapai?.toString() || "",
                        sksNilaiD: latestPengajuan.sksNilaiD?.toString() || "",
                        ipk: latestPengajuan.ipk?.toString() || "",
                        batasStudi: calculatedBatasStudi
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
                            batasStudi: calculatedBatasStudi
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
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Toast alert for SKS Grade D
        if (name === 'sksNilaiD' && Number(value) > 0) {
            showToast("kamu harus memperbaiki nilai D tersebut", "default");
        }

        // Batas Studi is now read-only, no warning needed
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            if (name === "peminatan") {
                newData.dosenId = "";
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

        // BLOCK submission if SKS Grade D > 0
        if (Number(formData.sksNilaiD) > 0) {
            showToast("kamu harus memperbaiki nilai D tersebut", "destructive");
            return;
        }

        // Validation for CustomSelect fields
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
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-orange-600" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-geist relative">
            {/* Modals & Popups */}
            <DeleteConfirmationModal
                isOpen={isCancelDialogOpen}
                onClose={() => setIsCancelDialogOpen(false)}
                onConfirm={confirmCancel}
                title="Batalkan Pengajuan"
                description="Apakah Anda yakin ingin membatalkan pengajuan ini? Data akan dihapus dan Anda bisa mengisi ulang formulir."
            />

            {toastProps && (
                <div className="fixed top-4 right-4 left-4 z-[100] animate-in fade-in slide-in-from-top-4">
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
                {/* Revision Feedback Banner */}
                {profile?.pengajuanJudul?.[0]?.status === 'REVISION' && (
                    <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="p-2 bg-yellow-100 rounded-full text-yellow-700 shrink-0">
                            <RotateCcw className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-yellow-800 font-bold text-sm">Pengajuan Perlu Diperbaiki</h3>
                            <p className="text-yellow-700 text-xs mt-1">Dosen meminta Anda merevisi usulan judul. Silakan perbaiki dan kirim ulang.</p>
                            {profile.pengajuanJudul[0].remarks && (
                                <div className="mt-2 p-2.5 bg-white border border-yellow-200 rounded-lg text-sm">
                                    <p className="text-xs font-bold text-yellow-700 mb-1 flex items-center gap-1">
                                        <MessageSquare className="w-3.5 h-3.5" /> Komentar Dosen:
                                    </p>
                                    <p className="text-[13px] text-yellow-900 italic">"{profile.pengajuanJudul[0].remarks}"</p>
                                </div>
                            )}
                            {profile.pengajuanJudul[0].deadlineRevisi && (
                                <div className="mt-2 p-2.5 bg-white border border-yellow-200 rounded-lg text-sm">
                                    <p className="text-xs font-bold text-yellow-700 mb-1 flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" /> Batas Waktu Pengumpulan Revisi:
                                    </p>
                                    <p className="text-[13px] text-yellow-900 font-semibold">
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
                        Fakultas Teknik <br /> Universitas Pancasila
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
                                <label className="text-sm font-semibold text-gray-700">Nama</label>
                                <input
                                    type="text"
                                    value={user?.name || profile?.nama || "-"}
                                    disabled
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 font-medium outline-none"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700">No. Pokok / NIM</label>
                                <input
                                    type="text"
                                    value={user?.mahasiswaNim || profile?.nim || "-"}
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
                                    options={[...dosenList]
                                        .filter(d => {
                                            if (!formData.peminatan) return true;
                                            return d.peminatan && Array.isArray(d.peminatan) && d.peminatan.includes(formData.peminatan);
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
                                            return {
                                                label: isSelectable ? `${d.nama} (${d.appointment || d.jabatan})${peminatanText}` : `${d.nama} (Viewer)`,
                                                value: d.nidn.toString(),
                                                disabled: !isSelectable
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
                                    disabled={true}
                                    placeholder="Otomatis (Tahun Masuk + 6)"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 font-medium outline-none"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    {isReadOnly ? (
                        <div className="space-y-3">
                            <div className={`w-full py-3.5 font-bold rounded-xl border text-center text-sm ${profile?.pengajuanJudul?.[0]?.status === 'APPROVED' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                {profile?.pengajuanJudul?.[0]?.status === 'APPROVED' ? 'Pengajuan Sudah di ACC' : 'Pengajuan Anda sedang dalam proses'}
                            </div>
                            {profile?.pengajuanJudul?.[0]?.status === 'PENDING' && (
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={cancelling}
                                    className="w-full text-sm font-bold text-red-600 hover:text-red-700 underline flex items-center justify-center gap-1 py-2 transition-all disabled:opacity-50"
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
                            className="w-full py-3.5 bg-[#D25026] text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : profile?.pengajuanJudul?.[0]?.status === 'REVISION' ? (
                                <RotateCcw size={18} />
                            ) : (
                                <Send size={18} />
                            )}
                            {submitting ? "Mengirim..." : (profile?.pengajuanJudul?.[0]?.status === 'REVISION' ? "Kirim Ulang Permohonan" : "Kirim Permohonan")}
                        </button>
                    )}

                    <div className="h-4"></div>
                </form>
            </div>
        </div>
    );
}
