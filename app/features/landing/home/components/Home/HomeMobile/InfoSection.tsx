import { motion } from "motion/react";
import { FileText, Users, Calculator, BookOpen, ShieldCheck, Database } from "lucide-react";

const features = [
    {
        icon: <BookOpen className="h-8 w-8 text-blue-500" />,
        title: "Modul Informasi KP",
        description: "Panduan teknis digital yang mudah diakses dan forum tanya-jawab terpusat untuk komunikasi yang efektif antara mahasiswa dan prodi.",
    },
    {
        icon: <Database className="h-8 w-8 text-green-500" />,
        title: "Resources & Downloads",
        description: "Sentralisasi dokumen administratif, logbook PIC & Dosen digital, serta template surat yang terstandarisasi.",
    },
    {
        icon: <FileText className="h-8 w-8 text-purple-500" />,
        title: "Formulir Digital",
        description: "Integrasi 6 formulir kunci: pengajuan surat, persetujuan sidang, revisi makalah, dan kegiatan harian secara paperless.",
    },
    {
        icon: <Calculator className="h-8 w-8 text-orange-500" />,
        title: "Modul Laporan Akhir",
        description: "Otomatisasi pembuatan Berita Acara Sidang, rekapitulasi nilai penguji, dan perhitungan Nilai Akhir mata kuliah.",
    },
];

// Mobile version of InfoSection
export function InfoSection() {
    return (
        <section id="info-kp" className="w-full py-24 bg-white/50">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center w-full mx-auto mb-16">
                    <span className="text-orange-600 font-bold tracking-wider uppercase text-sm mb-2 block">Fitur Unggulan</span>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground font-geist">
                        Modul Sistem <span className="text-orange-500">Terpadu</span>
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Solusi komprehensif untuk mendigitalisasi seluruh alur kerja Kerja Praktek, 
                        dari administrasi awal hingga pelaporan akhir.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-white border border-zinc-100 p-8 rounded-2xl shadow-sm hover:shadow-xl hover:border-orange-100 transition-all duration-300 group cursor-default"
                        >
                            <div className="mb-6 p-4 bg-slate-50 rounded-xl w-fit group-hover:bg-orange-50 group-hover:scale-110 transition-all duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-zinc-900 group-hover:text-orange-600 transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-slate-600 leading-relaxed text-sm">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
