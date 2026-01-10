import { ChevronDown, CheckCircle } from "lucide-react";
import { useState } from "react";

export function StepsSection() {
    const [activeStep, setActiveStep] = useState<number | null>(1);

    return (
        <section className="w-full py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-4 md:px-6 flex flex-col lg:flex-row items-center gap-20">
                
                {/* Left Content */}
                <div className="flex-1 space-y-10">
                    <div className="space-y-4">
                        <h2 className="text-4xl font-bold text-zinc-950 leading-tight">
                            Langkah Mudah Memulai <br/>
                            Kerja Praktek Anda
                        </h2>
                        <p className="text-gray-500 text-lg font-medium">
                            Kami membantu Anda menemukan tempat magang yang tepat dengan proses yang terstruktur.
                        </p>
                    </div>

                    <div className="space-y-4">
                    <div className="space-y-4">
                        {[
                            {
                                id: 1,
                                title: "Langkah 1: Registrasi",
                                desc: "Daftarkan akun Anda di sistem SIKP, lengkapi profil akademik, dan upload transkrip nilai terbaru untuk verifikasi kelayakan KP."
                            },
                            {
                                id: 2,
                                title: "Langkah 2: Pengajuan Proposal",
                                desc: "Ajukan proposal topik kerja praktek Anda melalui sistem. Proposal akan direview oleh koordinator KP dan calon dosen pembimbing."
                            },
                            {
                                id: 3,
                                title: "Langkah 3: Pelaksanaan & Laporan",
                                desc: "Lakukan kegiatan kerja praktek, isi logbook harian, dan susun laporan akhir untuk disidangkan sebagai syarat kelulusan mata kuliah."
                            }
                        ].map((step, idx) => (
                            <div 
                                key={step.id}
                                className={`p-6 rounded-2xl transition-all duration-300 border cursor-pointer group ${
                                    activeStep === step.id 
                                    ? "bg-white border-orange-200 shadow-[0_4px_20px_rgba(249,115,22,0.15)] scale-[1.02]" 
                                    : "bg-white/50 border-zinc-100 hover:border-orange-100"
                                }`}
                                onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
                            >
                                <div className="flex justify-between items-center">
                                    <h4 className={`text-lg font-bold transition-colors ${
                                        activeStep === step.id ? "text-orange-600" : "text-zinc-700 group-hover:text-orange-600"
                                    }`}>
                                        {step.title}
                                    </h4>
                                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${
                                        activeStep === step.id ? "rotate-180 text-orange-500" : "text-gray-400 group-hover:text-orange-400"
                                    }`} />
                                </div>
                                <div 
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                        activeStep === step.id ? "max-h-40 opacity-100 mt-4" : "max-h-0 opacity-0"
                                    }`}
                                >
                                    <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                                        {step.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    </div>
                </div>

                {/* Right Image/Mockup */}
                <div className="flex-1 relative">
                    <div className="relative z-10 rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl max-w-md mx-auto rotate-3 hover:rotate-0 transition-all duration-500">
                        {/* Mockup content mimicking an app screen */}
                        <div className="flex flex-col gap-6">
                            <div>
                                <h3 className="text-2xl font-bold text-zinc-900">Status KP</h3>
                                <div className="mt-4 flex gap-3">
                                   <div className="h-16 w-16 bg-orange-100 rounded-lg flex items-center justify-center">
                                     <CheckCircle className="text-orange-500 w-8 h-8" />
                                   </div>
                                   <div className="flex flex-col justify-center">
                                      <span className="font-bold text-lg">Disetujui</span>
                                      <span className="text-slate-500 text-sm">Proposal diterima industri</span>
                                   </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="h-4 w-full bg-slate-100 rounded"></div>
                                <div className="h-4 w-3/4 bg-slate-100 rounded"></div>
                            </div>
                        </div>
                    </div>
                    {/* Background decor */}
                    <div className="absolute top-10 right-10 w-full h-full bg-slate-50 rounded-full blur-[100px] -z-10" />
                </div>
            </div>
        </section>
    );
}
