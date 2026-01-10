import { Link } from "react-router";
import { Play } from "lucide-react";
import { motion } from "motion/react";

export function NewHeroSection() {
    return (
        <section className="relative w-full overflow-hidden bg-gradient-to-br from-white via-orange-50 to-amber-50 min-h-[90vh] flex items-center pt-20 pb-20">
            {/* Background Decorations - Reduced blur for better clarity */}
            <div className="absolute left-[5%] top-[15%] w-[600px] h-[600px] bg-orange-200/40 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute right-[-10%] top-[-10%] w-[600px] h-[600px] bg-amber-100/40 rounded-full blur-[80px] pointer-events-none" />
            
            {/* Subtle grid overlay for texture */}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
            
            <div className="container mx-auto px-4 md:px-6 relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                {/* Left Content */}
                <div className="flex flex-col gap-8 items-start w-full z-20">
                    <h1 className="text-5xl md:text-6xl lg:text-[4.5rem] font-bold text-gray-900 leading-[1.1] tracking-tight font-['Plus_Jakarta_Sans']">
                        Sistem Kerja <br/> 
                        Praktek <span className="text-orange-600 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Terpadu</span>
                    </h1>
                    
                    <p className="text-xl md:text-2xl text-gray-700 font-medium leading-relaxed w-full">
                        Platform digital terintegrasi untuk pengelolaan administrasi dan monitoring kerja praktek mahasiswa Teknik Informatika.
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-4">
                        <Link 
                            to="/login" 
                            className="h-14 px-8 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-full flex items-center gap-3 font-bold text-lg transition-all shadow-xl shadow-orange-300/50 hover:shadow-orange-400/50 hover:scale-105 active:scale-95"
                        >
                            <span>Masuk Sistem</span>
                        </Link>
                        
                        <Link 
                            to="/guide"
                            className="h-14 px-8 bg-white border-2 border-gray-200 text-gray-800 hover:bg-gray-50 hover:border-orange-200 hover:text-orange-700 rounded-full flex items-center gap-3 font-bold text-lg transition-all shadow-lg shadow-gray-200/50"
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center group-hover:from-orange-200 group-hover:to-amber-200">
                                <Play className="w-3 h-3 text-orange-600 fill-orange-600 ml-0.5" />
                            </div>
                            <span>Panduan</span>
                        </Link>
                    </div>
                    
                    {/* Additional Info */}
                    <div className="flex items-center gap-6 mt-8 pt-6 border-t border-gray-200/50">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900">500+</div>
                            <div className="text-sm text-gray-600">Mahasiswa</div>
                        </div>
                        <div className="w-px h-8 bg-gray-300/50" />
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900">50+</div>
                            <div className="text-sm text-gray-600">Perusahaan</div>
                        </div>
                        <div className="w-px h-8 bg-gray-300/50" />
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900">24/7</div>
                            <div className="text-sm text-gray-600">Akses</div>
                        </div>
                    </div>
                </div>

                {/* Right Images - Draggable Slider */}
                <div className="hidden lg:block relative w-full h-[700px] overflow-visible">
                     {/* Decorative Elements */}
                     <div className="absolute left-0 bottom-10 w-16 h-16 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 blur-xl" />
                     <div className="absolute right-10 top-10 w-24 h-24 rounded-full bg-gradient-to-r from-orange-400/10 to-amber-400/10 blur-lg" />

                     {/* Horizontal Draggable Container */}
                     <div className="absolute right-[-15%] top-1/2 -translate-y-1/2 w-[130%] h-[500px] cursor-grab active:cursor-grabbing">
                        <motion.div 
                            className="flex gap-6 px-12"
                            drag="x"
                            dragConstraints={{ left: -1000, right: 0 }}
                            whileTap={{ cursor: "grabbing" }}
                        >
                            {[
                                "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop",
                                "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800&auto=format&fit=crop",
                                "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop",
                                "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop",
                                "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop",
                            ].map((img, i) => (
                                <motion.div 
                                    key={i}
                                    className="min-w-[300px] h-[400px] rounded-[2rem] overflow-hidden shadow-xl border-4 border-white bg-white relative group"
                                    whileHover={{ y: -10, scale: 1.02 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <img src={img} alt={`Slide ${i}`} className="w-full h-full object-cover" />
                                    <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="font-bold text-lg">Kegiatan {i + 1}</p>
                                        <p className="text-sm">Dokumentasi KP</p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                     </div>

                    {/* Floating Info Card (Static overlay) */}
                    <div className="absolute right-[60%] bottom-[10%] bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-30 flex items-center gap-5 max-w-xs border border-white/50 animate-bounce-slow">
                        <div className="flex -space-x-4">
                            {[11, 12, 13].map((id) => (
                                <div key={id} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                                     <img src={`https://i.pravatar.cc/150?img=${id}`} alt="User" className="w-full h-full object-cover" />
                                </div>
                            ))}
                            <div className="w-10 h-10 rounded-full border-2 border-white bg-orange-500 flex items-center justify-center text-xs font-bold text-white">
                                +1k
                            </div>
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-sm">Bergabunglah</p>
                            <p className="text-xs text-gray-600">Komunitas Mahasiswa</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}