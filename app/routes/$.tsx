import { useLocation } from "react-router";
import { AlertCircle, Home } from "lucide-react";

export default function NotFoundRoute() {
    const location = useLocation();

    return (
        <main className="w-screen min-h-screen grid place-items-center bg-slate-50 p-4 font-geist" style={{ width: "100vw" }}>
            <div className="bg-white rounded-3xl p-8 text-center shadow-xl shadow-slate-200/50 border border-slate-100 mx-auto" style={{ width: "100%", maxWidth: "450px", minWidth: "320px" }}>
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 mb-3">Halaman Tidak Ditemukan</h1>
                <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">
                    Maaf, halaman <code>{location.pathname}</code> tidak tersedia atau telah dipindahkan.
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
