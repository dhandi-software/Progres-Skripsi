import { useLocation, useNavigate } from "react-router";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

export default function NotFoundRoute() {
    const location = useLocation();
    const navigate = useNavigate();

    const [homeLink] = useState("/");
    const [homeLabel] = useState("Kembali ke Halaman Utama");

    return (
        <main className="fixed inset-0 z-[9999] w-screen h-screen grid place-items-center p-4 font-geist overflow-hidden bg-slate-950/80 backdrop-blur-md">
            {/* Background Image */}
            <div className="absolute inset-0 z-0 opacity-30">
                <img
                    src="/images/kuning.png"
                    alt="Background"
                    className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
            </div>

            <div className="relative z-10 bg-white rounded-3xl p-8 sm:p-10 md:p-12 text-center shadow-2xl border border-slate-100 mx-auto" style={{ width: "100%", maxWidth: "540px" }}>
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
                    <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">Halaman Tidak Ditemukan</h1>
                <p className="text-sm sm:text-base font-medium text-slate-500 mb-8 leading-relaxed">
                    Maaf, halaman <code className="bg-slate-100 px-2 py-0.5 rounded text-red-600 font-mono text-xs sm:text-sm">{location.pathname}</code> tidak tersedia atau telah dipindahkan.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl h-12 px-5 font-bold transition-all text-xs sm:text-sm"
                    >
                        <ArrowLeft size={18} />
                        Halaman Sebelumnya
                    </button>
                    <a
                        href={homeLink}
                        className="inline-flex items-center justify-center gap-2 bg-[#D25026] hover:bg-[#b0401c] text-white rounded-xl h-12 px-5 font-bold transition-all shadow-lg shadow-[#D25026]/30 text-xs sm:text-sm"
                    >
                        <Home size={18} />
                        {homeLabel}
                    </a>
                </div>
            </div>
        </main>
    );
}
