import { Trophy, CheckCircle2, BadgeCheck, Star, ShieldCheck, Heart } from "lucide-react";
import { cn } from "~/lib/utils";

interface BadgeWallProps {
    bimbinganTasks: any[];
}

export function BadgeWall({ bimbinganTasks }: BadgeWallProps) {
    // Badge Logic
    
    // Tepat Waktu Logic: No approved tasks that were submitted after their deadline
    const hasTepatWaktuBadge = bimbinganTasks.length > 0 && 
        !bimbinganTasks.some(t => 
            t.status === 'APPROVED' && 
            t.jadwalBimbingan && 
            new Date(t.tanggal) > new Date(t.jadwalBimbingan)
        );

    // Rajin Bimbingan Logic: Has at least 5 bimbingan records (including versions/revisions)
    const hasRajinBadge = bimbinganTasks.length >= 5;

    const badges = [
        {
            id: "rajin",
            label: "Rajin Bimbingan",
            desc: "Selalu aktif bimbingan & revisi",
            icon: <Trophy className="w-8 h-8" />,
            color: "purple",
            active: hasRajinBadge
        },
        {
            id: "tepat_waktu",
            label: "Tepat Waktu",
            desc: "Kumpulkan draf sebelum tenggat",
            icon: <CheckCircle2 className="w-8 h-8" />,
            color: "green",
            active: hasTepatWaktuBadge
        },
        {
            id: "sikap_baik",
            label: "Sikap Terpuji",
            desc: "Apresiasi dari pembimbing",
            icon: <Heart className="w-8 h-8" />,
            color: "red",
            active: true // Placeholder
        },
        {
            id: "berdedikasi",
            label: "Berdedikasi",
            desc: "Menyelesaikan Bab 3",
            icon: <ShieldCheck className="w-8 h-8" />,
            color: "blue",
            active: bimbinganTasks.some(t => t.topik.toLowerCase().includes("bab 3") && t.status === 'APPROVED')
        },
        {
            id: "expert",
            label: "Calon Ahli",
            desc: "IPK di atas 3.50",
            icon: <Star className="w-8 h-8" />,
            color: "orange",
            active: false // Mocked for now
        }
    ];

    return (
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <Trophy className="w-6 h-6 text-orange-500" />
                Dinding Pencapaian
            </h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {badges.map((badge) => (
                    <div 
                        key={badge.id}
                        className={cn(
                            "relative group flex flex-col items-center text-center p-6 rounded-[2rem] border transition-all duration-500",
                            badge.active 
                                ? "bg-white border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 cursor-pointer" 
                                : "bg-gray-50 border-gray-100 grayscale opacity-40 cursor-not-allowed"
                        )}
                    >
                        {/* Glow effect for active badges */}
                        {badge.active && (
                            <div className={cn(
                                "absolute -inset-px rounded-[2rem] opacity-0 group-hover:opacity-10 transition-opacity blur-xl",
                                badge.color === 'purple' && "bg-purple-600",
                                badge.color === 'green' && "bg-green-600",
                                badge.color === 'red' && "bg-red-600",
                                badge.color === 'blue' && "bg-blue-600",
                                badge.color === 'orange' && "bg-orange-600"
                            )} />
                        )}

                        <div className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-500",
                            badge.active && "group-hover:scale-110",
                            badge.active ? (
                                badge.color === 'purple' ? "bg-purple-50 text-purple-600" :
                                badge.color === 'green' ? "bg-green-50 text-green-600" :
                                badge.color === 'red' ? "bg-red-50 text-red-600" :
                                badge.color === 'blue' ? "bg-blue-50 text-blue-600" :
                                "bg-orange-50 text-orange-600"
                            ) : "bg-gray-100 text-gray-300"
                        )}>
                            {badge.icon}
                        </div>
                        
                        <h4 className="font-black text-gray-900 text-sm mb-1">{badge.label}</h4>
                        <p className="text-[10px] text-gray-500 font-medium leading-tight">{badge.desc}</p>
                        
                        {badge.active && (
                            <div className="mt-3">
                                <BadgeCheck className="w-5 h-5 text-[#119DA4]" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
