import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { useState, useRef, useEffect } from "react";

const testimonials = [
    {
        quote: "Sistem ini sangat membantu saya dalam mencari tempat kerja praktek yang sesuai dengan minat. Proses administrasi menjadi jauh lebih efisien dan transparan.",
        name: "Rina Anjani",
        role: "Mahasiswa Teknik Informatika",
        img: "https://i.pravatar.cc/150?img=32"
    },
    {
        quote: "Fitur monitoring bimbingan sangat memudahkan dosen dalam memantau progress mahasiswa tanpa harus bertemu tatap muka setiap saat.",
        name: "Dr. Budi Santoso",
        role: "Dosen Pembimbing",
        img: "https://i.pravatar.cc/150?img=11"
    },
    {
        quote: "Digitalisasi logbook membuat pelaporan kegiatan harian menjadi lebih terstruktur dan mudah divalidasi oleh pembimbing lapangan.",
        name: "Siti Rahmawati",
        role: "Mahasiswa Angkatan 2021",
        img: "https://i.pravatar.cc/150?img=5"
    }
];

export function TestimonialsSection() {
    const [index, setIndex] = useState(0);
    const x = useMotionValue(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleDragEnd = (event: any, info: any) => {
        const threshold = 50;
        if (info.offset.x < -threshold) {
             setIndex((prev) => (prev + 1) % testimonials.length);
        } else if (info.offset.x > threshold) {
             setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
        }
    };

    return (
        <section className="w-full py-24 bg-white overflow-hidden border-t border-zinc-100">
            <div className="container mx-auto px-4 md:px-6 flex flex-col lg:flex-row items-center justify-between gap-12">
                
                {/* Left Text */}
                <div className="flex-1 space-y-6 w-full min-w-[300px]">
                    <h2 className="text-4xl font-bold text-zinc-950 leading-tight">
                        Pengalaman <br/> Mahasiswa
                    </h2>
                    <p className="text-gray-500 text-base font-medium">
                        Platform ini dirancang untuk memastikan kualitas lulusan yang siap kerja. Kami menghubungkan talenta terbaik dengan standar industri.
                    </p>
                </div>

                {/* Right Card / Slider Area */}
                <div className="flex-1 w-full relative h-[450px] flex items-center min-w-[300px] justify-center lg:justify-end">
                    {/* Abstract Shapes */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -z-10" />
                    <div className="absolute bottom-0 left-20 w-32 h-32 bg-orange-50 rounded-full -z-10" />
                    
                    {/* Testimonial Card Slider */}
                    <div className="relative w-full" ref={containerRef}>
                        <motion.div 
                            className="relative z-10 bg-white p-8 rounded-[20px] shadow-[0px_8px_30px_rgba(0,0,0,0.08)] border border-zinc-100 cursor-grab active:cursor-grabbing"
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.2}
                            onDragEnd={handleDragEnd}
                            key={index}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            <div className="absolute -top-4 -left-4 bg-orange-500 text-white p-3 rounded-xl shadow-lg">
                                <span className="text-4xl font-serif leading-none">"</span>
                            </div>

                            <p className="text-zinc-800 text-lg leading-relaxed italic mb-8 pt-4">
                                {testimonials[index].quote}
                            </p>
                            
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden border border-zinc-200">
                                    <img 
                                        src={testimonials[index].img} 
                                        alt={testimonials[index].name} 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h5 className="text-zinc-900 font-bold">{testimonials[index].name}</h5>
                                    <p className="text-sm text-gray-500">{testimonials[index].role}</p>
                                </div>
                            </div>

                             {/* Navigation Buttons */}
                             <div className="absolute bottom-8 right-8 flex gap-3">
                                <button 
                                    onClick={() => setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                                    className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
                                >
                                    ←
                                </button>
                                <button 
                                    onClick={() => setIndex((prev) => (prev + 1) % testimonials.length)}
                                    className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-800 transition-colors"
                                >
                                    →
                                </button>
                             </div>
                        </motion.div>
                        
                        {/* Stack effect decorators */}
                        <div className="absolute top-4 left-4 w-full h-full bg-zinc-50 rounded-[20px] -z-10 border border-zinc-100/50" />
                        <div className="absolute top-8 left-8 w-full h-full bg-zinc-50/50 rounded-[20px] -z-20 border border-zinc-100/20" />
                    </div>
                </div>

            </div>
        </section>
    );
}
