export function AboutSection() {
    return (
        <section className="w-full py-24 bg-slate-50 relative overflow-hidden">
             <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col-reverse lg:flex-row items-center gap-16 lg:gap-24">
                    
                    {/* Left: Content Text */}
                    <div className="flex-1 space-y-8">
                        <div>
                            <span className="text-orange-600 font-bold tracking-wider uppercase text-sm mb-2 block">Tentang Sistem</span>
                            <h2 className="text-4xl md:text-5xl font-bold text-zinc-950 leading-tight font-['Plus_Jakarta_Sans']">
                                Platform Kerja Praktek <br/>
                                <span className="text-zinc-400">Teknik Informatika</span>
                            </h2>
                        </div>
                        
                        <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
                            <p>
                                Sistem Informasi Kerja Praktek (SIKP) adalah inisiatif digital Universitas Pancasila untuk memodernisasi proses magang mahasiswa. 
                            </p>
                            <p>
                                Platform ini menghubungkan dua pilar utama: <strong>Mahasiswa</strong> dan <strong>Dosen Pembimbing</strong> dalam satu ekosistem terpadu. Kami memastikan setiap tahapan, mulai dari pengajuan proposal hingga penilaian akhir, berjalan transparan dan efisien.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-8 pt-4">
                            <div>
                                <h4 className="text-3xl font-bold text-zinc-900 mb-1">5</h4>
                                <p className="text-slate-500 font-medium">Peminatan Studi</p>
                            </div>
                            <div>
                                <h4 className="text-3xl font-bold text-zinc-900 mb-1">100%</h4>
                                <p className="text-slate-500 font-medium">Digitalisasi Logbook</p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Images Composition */}
                    <div className="flex-1 relative w-full flex justify-center lg:justify-end">
                        <div className="relative w-[500px] h-[500px]">
                            {/* Back Image */}
                            <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-[2rem] overflow-hidden shadow-2xl">
                                <img 
                                    src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=800&auto=format&fit=crop" 
                                    alt="Office Environment" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {/* Front Image */}
                            <div className="absolute bottom-0 left-0 w-[280px] h-[280px] rounded-[1.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-8 border-slate-50">
                                <img 
                                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop" 
                                    alt="Students" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            
                            {/* Decor */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl -z-10" />
                        </div>
                    </div>

                </div>
             </div>
        </section>
    );
}
