import { Code, Smartphone, Database, Globe } from "lucide-react"; 

export function PopularPositionsSection() {
    const categories = [
        { title: "Software Engineer", count: "120", icon: Code },
        { title: "Mobile Developer", count: "85", icon: Smartphone },
        { title: "Data Analyst", count: "64", icon: Database },
        { title: "Web Developer", count: "95", icon: Globe },
    ];

    return (
        <section className="w-full py-24 bg-white">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div className="space-y-3 w-full">
                        <h2 className="text-4xl font-bold text-zinc-950 font-geist leading-tight">
                            Bidang Peminatan <br className="hidden md:block"/>
                            <span className="text-orange-500">Populer</span>
                        </h2>
                        <p className="text-lg text-gray-400 font-medium">
                            Kategori posisi magang dengan jumlah peminat tertinggi semester ini.
                        </p>
                    </div>
                    {/* Optional: Add browse all button here if needed */}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((cat, idx) => (
                        <div 
                            key={idx} 
                            className="p-6 bg-white rounded-2xl border border-zinc-100 shadow-sm hover:shadow-lg hover:border-orange-100 transition-all duration-300 flex items-center gap-4 group cursor-default w-full"
                        >
                            <div className="shrink-0 p-3 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                                <cat.icon className="w-6 h-6 text-zinc-800 group-hover:text-white transition-colors" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <h3 className="text-lg font-bold text-zinc-900 leading-tight group-hover:text-orange-600 transition-colors truncate">{cat.title}</h3>
                                <div className="flex items-center gap-1 text-gray-400 text-sm font-medium">
                                    <span className="text-zinc-900 font-bold">{cat.count}</span>
                                    <span>+ Mahasiswa</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
