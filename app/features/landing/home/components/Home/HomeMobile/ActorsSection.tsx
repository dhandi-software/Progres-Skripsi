import { motion } from "motion/react";
import { UserCog, GraduationCap, School, UserCheck } from "lucide-react";

const actors = [
    {
        role: "Mahasiswa KP",
        icon: <GraduationCap className="w-10 h-10 text-brand-primary" />,
        desc: "Mengelola logbook, mengajukan surat, dan melihat progress bimbingan.",
    },
    {
        role: "Dosen",
        icon: <UserCheck className="w-10 h-10 text-brand-primary" />,
        desc: "Membimbing, menguji, dan memberikan penilaian sidang KP.",
        details: ["Dosen Pembimbing", "Dosen Penguji", "Koordinator KP", "Kasekpro"],
    },
    {
        role: "Administrator",
        icon: <UserCog className="w-10 h-10 text-brand-primary" />,
        desc: "Mengelola data pengguna, konfigurasi sistem, dan hak akses.",
    },
    {
        role: "Staf Prodi",
        icon: <School className="w-10 h-10 text-brand-primary" />,
        desc: "Verifikasi dokumen, penjadwalan sidang, dan administrasi.",
    },
];

export function ActorsSection() {
    return (
        <section className="py-16 md:py-24 bg-muted/30">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                        Ekosistem Pengguna
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Siapa saja yang terlibat dalam Sistem Kerja Praktik?
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {actors.map((actor, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ scale: 0.95, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-background border border-border rounded-xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="mb-4 p-4 rounded-full bg-brand-primary/5">
                                {actor.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-2">{actor.role}</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                {actor.desc}
                            </p>
                            {actor.details && (
                                <div className="flex flex-wrap justify-center gap-2 mt-auto">
                                    {actor.details.map((detail, i) => (
                                        <span key={i} className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-muted rounded-md text-muted-foreground">
                                            {detail}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
