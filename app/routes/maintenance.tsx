import { useLocation, useNavigate } from "react-router";
import { RefreshCw, Home, Wrench } from "lucide-react";
import { useEffect, useState } from "react";

export default function MaintenanceRoute() {
    const location = useLocation();
    const navigate = useNavigate();

    const [homeLink] = useState("/");
    const [homeLabel] = useState("Kembali ke Halaman Utama");

    return (
        <main className="relative min-h-screen w-screen overflow-hidden font-geist bg-slate-900 flex items-center justify-center p-4">
            {/* Full Screen Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/images/kuning.webp"
                    alt="Background"
                    className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 backdrop-blur-xs" />
            </div>

            {/* Maintenance Card Container */}
            <div className="relative z-10 flex w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in-95 duration-500">
                
                {/* Left Column: Branding / Visual (Hidden on mobile, visible on lg) */}
                <div className="hidden w-5/12 flex-col items-center justify-center bg-gradient-to-br from-[#119DA4] to-[#FDE789] p-12 lg:flex relative overflow-hidden text-white">
                    {/* Decorative Circles */}
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-60 h-60 bg-[#119DA4]/20 rounded-full blur-3xl"></div>

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="mb-6 rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur-sm">
                            <img 
                                src="/logo_up.webp" 
                                alt="Logo Universitas Pancasila" 
                                className="h-28 w-auto object-contain"
                            />
                        </div>
                        <div className="flex flex-col gap-1 text-white">
                            <span className="text-2xl font-black leading-tight tracking-tight drop-shadow-sm">Sistem Informasi</span>
                            <span className="text-lg font-bold text-white/90 leading-tight tracking-wide drop-shadow-sm">Kerja Praktik</span>
                        </div>
                        <p className="mt-5 text-xs text-white/90 w-full leading-relaxed font-medium drop-shadow-sm">
                            Platform terintegrasi untuk pengelolaan administrasi dan monitoring Kerja Praktik mahasiswa Universitas Pancasila.
                        </p>
                    </div>
                </div>

                {/* Right Column: Maintenance Content */}
                <div className="flex w-full flex-col justify-center bg-white p-8 lg:w-7/12 sm:p-12 md:p-16">
                    {/* Mobile Logo & Title Header */}
                    <div className="mb-6 flex flex-col items-center text-center lg:hidden">
                        <div className="mb-3 rounded-2xl bg-white p-3 shadow-md border border-slate-100">
                            <img 
                                src="/logo_up.webp" 
                                alt="Logo Universitas Pancasila" 
                                className="h-14 w-auto"
                            />
                        </div>
                        <h2 className="text-xl font-black text-slate-900">Sistem Informasi</h2>
                        <h3 className="text-base font-bold text-[#D25026]">Kerja Praktik</h3>
                    </div>

                    <div className="mb-6">
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold bg-orange-50 text-[#D25026] border border-orange-200 uppercase tracking-wider mb-4">
                            <Wrench size={14} className="animate-spin" />
                            502 BAD GATEWAY
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                            Sistem Sedang Dalam Pemeliharaan
                        </h1>
                        <p className="mt-3 text-sm text-slate-500 leading-relaxed font-medium">
                            Mohon maaf atas ketidaknyamanannya. Sistem sedang dalam pemeliharaan (maintenance) berkala untuk meningkatkan kualitas layanan. Silakan coba beberapa saat lagi atau tekan tombol muat ulang di bawah.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <a
                            href="/"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D25026] to-[#EA580C] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#D25026]/30 hover:from-[#EA580C] hover:to-[#F97316] transition-all hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <Home size={18} />
                            Kembali ke Halaman Utama
                        </a>

                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-6 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
                        >
                            <RefreshCw size={18} />
                            Muat Ulang Halaman
                        </button>
                    </div>

                    <div className="mt-8 text-center text-xs text-slate-400 font-medium">
                        &copy; 2026 Universitas Pancasila &bull; Sistem Informasi Kerja Praktik
                    </div>
                </div>

            </div>
        </main>
    );
}
