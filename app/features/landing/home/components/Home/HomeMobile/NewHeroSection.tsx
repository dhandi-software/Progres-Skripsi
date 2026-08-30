import { Link } from "react-router";
import { Play, ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";

const IMAGES = [
    { src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format&fit=crop&fm=webp", title: "Kolaborasi Tim", subtitle: "Budaya Kerja" },
    { src: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=600&auto=format&fit=crop&fm=webp", title: "Mentoring", subtitle: "Bimbingan Ahli" },
    { src: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=600&auto=format&fit=crop&fm=webp", title: "Diskusi Proyek", subtitle: "Problem Solving" },
    { src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600&auto=format&fit=crop&fm=webp", title: "Lingkungan Modern", subtitle: "Fasilitas Lengkap" },
    { src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=600&auto=format&fit=crop&fm=webp", title: "Event & Seminar", subtitle: "Knowledge Sharing" },
];

export function NewHeroSection() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.5,
            rotateY: direction > 0 ? 45 : -45
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
            rotateY: 0,
            transition: {
                x: { type: "spring" as const, stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
                scale: { duration: 0.4 }
            }
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.5,
            rotateY: direction < 0 ? 45 : -45,
            transition: {
                x: { type: "spring" as const, stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
                scale: { duration: 0.4 }
            }
        })
    };

    const swipePower = (offset: number, velocity: number) => {
        return Math.abs(offset) * velocity;
    };

    const paginate = (newDirection: number) => {
        setDirection(newDirection);
        setCurrentIndex((prev) => (prev + newDirection + IMAGES.length) % IMAGES.length);
    };

    const setPage = (index: number) => {
        setDirection(index > currentIndex ? 1 : -1);
        setCurrentIndex(index);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") paginate(1);
            if (e.key === "ArrowLeft") paginate(-1);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentIndex]); // Re-bind on index change to ensure fresh state if needed, though paginate uses functional update

    return (
        <section className="relative w-full overflow-hidden min-h-[90vh] flex items-center pt-20 pb-20">
            {/* Animated Background */}
            <AnimatePresence initial={false}>
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 z-0"
                >
                    <img 
                        src={IMAGES[currentIndex].src} 
                        alt="Background" 
                        className="w-full h-full object-cover"
                        loading="eager"
                        decoding="async"
                    />
                    {/* Dark Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    
                    {/* Gradient Overlay for extra depth */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                </motion.div>
            </AnimatePresence>

            <div className="container mx-auto px-4 md:px-6 relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                {/* Left Content */}
                <div className="flex flex-col gap-8 items-start w-full z-20 text-white">
                    <h1 className="text-5xl md:text-6xl lg:text-[4.5rem] font-bold leading-[1.1] tracking-tight font-geist">
                        Sistem Kerja <br />
                        Praktik{" "}
                        <span className="text-orange-500">
                            Terpadu
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-200 font-medium leading-relaxed w-full">
                        Platform digital terintegrasi untuk pengelolaan
                        administrasi dan monitoring kerja Praktik mahasiswa
                        Teknik Informatika.
                    </p>

                    <div className="flex flex-wrap items-center gap-4 mt-4">
                        <Link
                            to="/login"
                            className="h-14 px-8 bg-orange-600 hover:bg-orange-700 text-white rounded-full flex items-center gap-3 font-bold text-lg transition-all shadow-xl shadow-orange-900/20 hover:scale-105 active:scale-95"
                        >
                            <span>Masuk Sistem</span>
                        </Link>

                        <Link
                            to="/guide"
                            className="h-14 px-8 bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 rounded-full flex items-center gap-3 font-bold text-lg transition-all"
                        >
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                            </div>
                            <span>Panduan</span>
                        </Link>
                    </div>

                    {/* Additional Info */}
                    <div className="flex items-center gap-6 mt-8 pt-6 border-t border-white/10">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white">500+</div>
                            <div className="text-sm text-gray-300">Mahasiswa</div>
                        </div>
                        <div className="w-px h-8 bg-white/20" />
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white">50+</div>
                            <div className="text-sm text-gray-300">Perusahaan</div>
                        </div>
                        <div className="w-px h-8 bg-white/20" />
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white">24/7</div>
                            <div className="text-sm text-gray-300">Akses</div>
                        </div>
                    </div>
                </div>

                {/* Right Content: 3D Gallery System */}
                <div className="relative w-full flex flex-col items-center justify-center lg:h-[600px] perspective-1000">
                    
                    {/* Main Display Area */}
                    <div className="relative w-full max-w-[500px] aspect-[4/3] mb-8 z-10">
                        <AnimatePresence initial={false} custom={direction}>
                            <motion.div
                                key={currentIndex}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={1}
                                onDragEnd={(e, { offset, velocity }) => {
                                    const swipe = swipePower(offset.x, velocity.x);
                                    if (swipe < -10000) paginate(1);
                                    else if (swipe > 10000) paginate(-1);
                                }}
                                className="absolute w-full h-full rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/20 backdrop-blur-sm bg-white/10 cursor-grab active:cursor-grabbing"
                            >
                                <img
                                    src={IMAGES[currentIndex].src}
                                    alt={IMAGES[currentIndex].title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                <div className="absolute bottom-0 left-0 p-8 text-white transform translate-z-20">
                                    <motion.h3 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-3xl font-bold mb-2"
                                    >
                                        {IMAGES[currentIndex].title}
                                    </motion.h3>
                                    <motion.p 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="text-lg opacity-90"
                                    >
                                        {IMAGES[currentIndex].subtitle}
                                    </motion.p>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                        
                        {/* Navigation Arrows (Floating) */}
                        <button 
                            onClick={() => paginate(-1)}
                            className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all z-20 hidden md:flex"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <button 
                            onClick={() => paginate(1)}
                            className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all z-20 hidden md:flex"
                        >
                            <ArrowRight className="w-6 h-6" />
                        </button>
                    </div>

                </div>
            </div>
        </section>
    );
}

// Add strict style for 3D perspective
const perspectiveStyle = {
    perspective: "1000px",
    transformStyle: "preserve-3d" as const
};
