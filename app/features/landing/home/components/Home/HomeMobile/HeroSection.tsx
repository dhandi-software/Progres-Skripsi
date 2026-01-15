import { motion } from "motion/react";
import { ArrowRight, LogIn } from "lucide-react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";

export function HeroSection() {
    return (
        <section className="relative w-full h-[600px] flex items-center justify-center bg-gradient-to-br from-brand-secondary to-brand-primary/10 overflow-hidden rounded-2xl">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-brand-primary/10 rounded-full blur-3xl rounded-full" />
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-3xl rounded-full" />
            </div>

            <div className="container relative z-10 flex flex-col items-center text-center px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-semibold mb-6">
                        Sistem Informasi Kerja Praktek
                    </span>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6">
                        Mulai Perjalanan <br />
                        <span className="text-brand-primary">Karir Profesionalmu</span>
                    </h1>
                    <p className="max-w-[700px] text-lg text-muted-foreground mb-8 mx-auto leading-relaxed">
                        Platform terintegrasi untuk pengelolaan Kerja Praktek. 
                        Memudahkan Mahasiswa, Dosen, dan Staff Administrasi dalam satu ekosistem digital.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                        <Button asChild size="lg" className="rounded-full px-8 h-12 text-base font-medium">
                            <Link to="/login">
                                <LogIn className="mr-2 h-5 w-5" />
                                Masuk Sekarang
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="rounded-full px-8 h-12 text-base font-medium">
                            <Link to="#info-kp">
                                Pelajari Lebih Lanjut
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
