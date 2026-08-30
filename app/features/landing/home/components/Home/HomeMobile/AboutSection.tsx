export function AboutSection() {
    return (
        <section className="w-full py-20 bg-slate-50 relative overflow-hidden">
             
             <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
                    
                    {/* Left Side: Content */}
                    <div className="flex-1 relative flex flex-col justify-start items-start gap-10">
                        
                        <div className="self-stretch flex flex-col justify-start items-start gap-8 z-10">
                            <div className="self-stretch flex flex-col justify-start items-start gap-4">
                                <div className="self-stretch justify-start text-zinc-950 text-[2rem] md:text-[2.5rem] lg:text-[3.25rem] font-extrabold font-geist leading-tight">
                                    Platform Kerja Praktik
                                    <span className="block text-zinc-400 mt-2">Teknik Informatika</span>
                                </div>
                            </div>
                            
                            <div className="self-stretch justify-start text-slate-600 text-lg md:text-xl font-normal font-geist leading-relaxed">
                                <p className="mb-6">
                                    Sistem Informasi Kerja Praktik (SIKP) adalah inisiatif digital Universitas Pancasila untuk memodernisasi proses magang mahasiswa.
                                </p>
                                <p>
                                    Platform ini menghubungkan dua pilar utama: <strong>Mahasiswa</strong> dan <strong>Dosen Pembimbing</strong>. Kami memastikan setiap tahapan berjalan transparan dan efisien.
                                </p>
                            </div>

                            {/* Stats Area (Replacing Buttons from snippet) */}
                            <div className="w-full grid grid-cols-2 gap-8 pt-4">
                                <div className="p-4 bg-white rounded-xl border border-zinc-100 shadow-sm">
                                    <h4 className="text-3xl font-bold text-zinc-900 mb-1 font-geist">5</h4>
                                    <p className="text-slate-500 font-medium">Peminatan Studi</p>
                                </div>
                                <div className="p-4 bg-white rounded-xl border border-zinc-100 shadow-sm">
                                    <h4 className="text-3xl font-bold text-zinc-900 mb-1 font-geist">100%</h4>
                                    <p className="text-slate-500 font-medium">Digitalisasi</p>
                                </div>
                            </div>
                        </div>

                         {/* Trusted By (Optional - Keeping original clean style, omitted for now matching original content) */}
                    </div>

                    {/* Right Side: Images Composition */}
                    <div className="flex-1 relative w-full h-[600px] flex items-center justify-center lg:justify-center scale-90 lg:scale-100">
                        <div className="relative w-[500px] h-[600px]">
                            {/* Abstract Background Shapes */}
                            {/* Student Background (Orange Blob - Top Right) */}
                            <div className="absolute top-0 right-0 w-80 h-72 bg-orange-400 rounded-br-[40%] rounded-tl-[30%] rounded-tr-[30%] rounded-bl-[60%] -z-10 transform -rotate-3" />
                            
                            {/* Teacher Background (Yellow Blob - Bottom Left) */}
                            <div className="absolute bottom-4 left-0 w-80 h-72 bg-yellow-400 rounded-tr-[50%] rounded-bl-[30%] rounded-tl-[40%] rounded-br-[60%] -z-10 transform -rotate-3" />
                            
                            {/* Student Image (Top Right) */}
                            <img 
                                className="absolute right-0 top-0 w-44 h-52 object-cover rounded-xl shadow-lg z-10 border-2 border-white transform -rotate-6" 
                                src="/images/Student.webp" 
                                alt="Mahasiswa"
                            />
                            
                            {/* Teacher Image (Bottom Left) */}
                            <img 
                                className="absolute left-0 bottom-4 w-48 h-48 object-cover rounded-xl shadow-xl z-20 border-2 border-white transform -rotate-6" 
                                src="/images/Teacher.webp" 
                                alt="Dosen Pembimbing"
                            />

                            {/* Decorative Dots/Squares */}
                            <div className="absolute right-[-20px] top-[150px] flex flex-wrap w-20 gap-2 z-0 opacity-50">
                                {[...Array(16)].map((_, i) => (
                                    <div key={i} className="w-2 h-2 bg-orange-400 rounded-full" />
                                ))}
                            </div>

                            {/* Chat Bubbles */}
                            <div className="absolute left-[-20px] top-[100px] z-30 flex flex-col gap-4">
                                <div className="px-5 py-3 bg-white rounded-2xl rounded-bl-none shadow-lg border border-zinc-100 max-w-[200px]">
                                    <p className="text-slate-900 text-sm font-medium font-geist leading-snug">
                                        Proses bimbingan jadi lebih mudah 🚀
                                    </p>
                                </div>
                            </div>

                            <div className="absolute right-[-30px] bottom-[150px] z-30 flex flex-col gap-4">
                                <div className="px-5 py-3 bg-slate-800 rounded-2xl rounded-br-none shadow-lg max-w-[220px]">
                                    <p className="text-white text-sm font-medium font-geist leading-snug">
                                        Monitoring progress mahasiswa real-time 📊
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
             </div>
        </section>
    );
}
