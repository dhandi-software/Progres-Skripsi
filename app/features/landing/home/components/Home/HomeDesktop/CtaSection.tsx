import { Link } from "react-router";

export function CtaSection() {
    return (
        <section className="w-full py-20 px-4">
            <div className="container mx-auto rounded-3xl overflow-hidden relative min-h-[400px] flex items-center justify-center text-center bg-zinc-900">
                {/* Background Overlay */}
                <div className="absolute inset-0 z-0 opacity-30">
                    <img
                        src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop"
                        alt="Technology Background"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-900/80 z-0" />

                <div className="relative z-10 w-full px-6 py-16 space-y-8 flex flex-col items-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight font-geist">
                        Siap Memulai Karir <br />{" "}
                        <span className="text-orange-500">Profesional</span>{" "}
                        Anda?
                    </h2>
                    <p className="text-zinc-300 text-lg md:text-xl font-medium w-full">
                        Bergabunglah dengan ratusan mahasiswa lainnya yang telah
                        sukses menyelesaikan Kerja Praktik dan terhubung dengan
                        industri.
                    </p>
                    <Link
                        to="/login"
                        className="inline-flex items-center justify-center h-16 px-10 bg-orange-600 hover:bg-orange-500 text-white text-lg font-bold rounded-full transition-all hover:scale-105 shadow-[0_10px_30px_rgba(249,115,22,0.4)]"
                    >
                        Masuk ke Sistem
                    </Link>
                </div>
            </div>
        </section>
    );
}
