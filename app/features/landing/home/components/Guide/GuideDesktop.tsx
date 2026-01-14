import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import { FileText, ArrowLeft } from "lucide-react";

export default function GuideDesktop() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-7xl">
            <Button
                asChild
                variant="ghost"
                className="mb-6 pl-0 hover:bg-transparent hover:text-brand-primary"
            >
                <Link to="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Beranda
                </Link>
            </Button>

            <h1 className="text-3xl font-bold mb-8 text-foreground">
                Panduan Kerja Praktek
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    {
                        step: 1,
                        title: "Persiapan Administrasi",
                        desc: "Pelajari syarat dan ketentuan, unduh template dokumen, dan siapkan transkrip nilai terbaru.",
                    },
                    {
                        step: 2,
                        title: "Pencarian & Lamaran",
                        desc: "Cari perusahaan mitra atau mandiri, kirim proposal dan CV, lalu tunggu surat penerimaan (LoA).",
                    },
                    {
                        step: 3,
                        title: "Pengajuan di Sistem",
                        desc: "Daftar akun di SIKP, input data perusahaan, dan upload surat balasan dari perusahaan.",
                    },
                    {
                        step: 4,
                        title: "Pelaksanaan KP",
                        desc: "Jalankan kerja praktek, isi logbook harian, dan ikut bimbingan dengan dosen pembimbing.",
                    },
                ].map((item, i) => (
                    <Card
                        key={i}
                        className="group hover:border-orange-200 hover:shadow-lg transition-all duration-300"
                    >
                        <CardHeader className="flex flex-row items-center gap-4 pb-2">
                            <div className="p-3 bg-orange-50 rounded-xl group-hover:bg-orange-500 transition-colors duration-300">
                                <FileText className="h-6 w-6 text-orange-600 group-hover:text-white transition-colors" />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">
                                    Langkah {item.step}
                                </span>
                                <CardTitle className="text-xl text-zinc-900 group-hover:text-orange-700 transition-colors">
                                    {item.title}
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-600 mb-6 leading-relaxed text-sm">
                                {item.desc}
                            </p>
                            <Button
                                variant="ghost"
                                className="w-full justify-between hover:bg-orange-50 text-slate-700 group-hover:text-orange-700"
                            >
                                <span>Detail Panduan</span>
                                <span>→</span>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
