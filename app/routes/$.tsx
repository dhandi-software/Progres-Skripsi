import { useLocation } from "react-router";
import { AlertCircle, Home } from "lucide-react";

export default function NotFoundRoute() {
    const location = useLocation();

    return (
        <main className="relative w-screen min-h-screen grid place-items-center p-4 font-geist overflow-hidden" style={{ width: "100vw" }}>
            {/* Full Screen Background */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/images/background_cerah.png"
                    alt="Background"
                    className="h-full w-full object-cover"
                />
                {/* Overlay for better contrast */}
                <div className="absolute inset-0 bg-black/20" />
            </div>

            <div className="relative z-10 bg-white rounded-3xl p-10 md:p-12 text-center shadow-2xl border border-slate-100 mx-auto" style={{ width: "100%", maxWidth: "550px", minWidth: "320px" }}>
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 mb-4">Halaman Tidak Ditemukan</h1>
                <p className="text-base font-medium text-slate-500 mb-10 leading-relaxed">
                    Maaf, halaman <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">{location.pathname}</code> tidak tersedia atau telah dipindahkan.
                </p>
                <div className="flex flex-col gap-3">
                    <a href="/" className="inline-flex items-center justify-center gap-2 bg-[#119DA4] hover:bg-[#0c7a80] text-white rounded-xl h-12 px-6 font-bold transition-all shadow-lg shadow-[#119DA4]/30">
                        <Home size={18} />
                        Kembali ke Beranda
                    </a>
                </div>
            </div>
        </main>
    );
}
