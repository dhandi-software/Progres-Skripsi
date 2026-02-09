import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import { CheckCircle2, ArrowLeft } from "lucide-react";

export default function RequirementsMobile() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-7xl">
            <Button asChild variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-brand-primary">
                <Link to="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Beranda
                </Link>
            </Button>

            <h1 className="text-3xl font-bold mb-8 text-foreground">Persyaratan Kerja Praktik</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    {
                        title: "Syarat Akademik",
                        items: ["Telah menempuh min. 100 SKS", "IPK Minimal 2.75", "Lulus Mata Kuliah Prasyarat", "Status Mahasiswa Aktif"]
                    },
                    {
                        title: "Syarat Administrasi",
                        items: ["Surat Pengantar dari Prodi", "Proposal KP disetujui", "Transkrip Nilai Terbaru", "KRS Semester Berjalan"]
                    },
                    {
                        title: "Syarat Perusahaan",
                        items: ["Berbadan Hukum (PT/CV)", "Memiliki Mentor/Pembimbing Lapangan", "Relevan dengan Bidang IT", "Durasi min. 1 Bulan"]
                    }
                ].map((category, idx) => (
                    <Card key={idx} className="hover:shadow-lg transition-all duration-300 border-zinc-200">
                        <CardHeader className="bg-slate-50 border-b border-zinc-100 pb-4">
                            <CardTitle className="text-xl text-orange-600">{category.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <ul className="space-y-3">
                                {category.items.map((req, i) => (
                                    <li key={i} className="flex items-start gap-3 text-slate-700">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                        <span className="text-sm font-medium leading-relaxed">{req}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
