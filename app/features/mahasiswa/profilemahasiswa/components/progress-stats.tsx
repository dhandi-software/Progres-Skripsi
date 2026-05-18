import { BarChart3, CheckCircle2, Circle } from "lucide-react";
import { cn } from "~/lib/utils";

interface ProgressStatsProps {
    bimbinganTasks: any[];
}

export function ProgressStats({ bimbinganTasks }: ProgressStatsProps) {
    const totalChapters = 5;
    const chapters = ["Bab 1", "Bab 2", "Bab 3", "Bab 4", "Bab 5"];
    
    const approvedTasks = bimbinganTasks
        .filter(t => t.status === 'APPROVED')
        .map(t => t.topik.toLowerCase());

    const progressPercent = Math.min(Math.round((approvedTasks.length / totalChapters) * 100), 100);

    return (
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-12 items-center">
            {/* Circular Progress (Mobile/Visual) */}
            <div className="relative w-48 h-48 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle 
                        cx="50" cy="50" r="45" 
                        fill="none" stroke="#F3F4F6" strokeWidth="8"
                    />
                    <circle 
                        cx="50" cy="50" r="45" 
                        fill="none" stroke="url(#gradient)" strokeWidth="8" 
                        strokeDasharray="283" 
                        strokeDashoffset={283 - (283 * progressPercent) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#119DA4" />
                            <stop offset="100%" stopColor="#40C991" />
                        </linearGradient>
                    </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-gray-900">{progressPercent}%</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Selesai</span>
                </div>
            </div>

            {/* Detailed Chapters List */}
            <div className="flex-1 w-full space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-[#119DA4]" />
                        Status Penulisan
                    </h3>
                    <span className="text-xs font-bold text-gray-400">{approvedTasks.length} / {totalChapters} Bab Disetujui</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {chapters.map((chap, i) => {
                        const isApproved = approvedTasks.some(t => t.includes(chap.toLowerCase()));
                        return (
                            <div 
                                key={chap} 
                                className={cn(
                                    "p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2",
                                    isApproved 
                                        ? "bg-green-50 border-green-100 text-green-700" 
                                        : "bg-gray-50 border-gray-100 text-gray-400 opacity-60"
                                )}
                            >
                                {isApproved ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                                <span className="text-[10px] font-black uppercase tracking-tight">{chap}</span>
                            </div>
                        );
                    })}
                </div>

                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
                        ⚠️ <span className="font-bold">Info:</span> Bar di atas menunjukkan bab yang telah benar-benar disetujui oleh pembimbing melalui sistem. Terus upload draf bimbingan kamu untuk melengkapi portofolio ini.
                    </p>
                </div>
            </div>
        </div>
    );
}
