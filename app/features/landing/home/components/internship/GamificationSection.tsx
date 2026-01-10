import { motion } from "motion/react";
import { Award, Target, Trophy, Flame, Star } from "lucide-react";
import { Progress } from "~/components/ui/progress";

export function GamificationSection() {
    return (
        <section className="w-full py-20 md:py-32 overflow-hidden relative bg-white">
            <div className="absolute inset-0 bg-orange-50/50 -skew-y-3 transform origin-top-left z-0" />
            
            <div className="container relative z-10 px-4 md:px-6 mx-auto flex flex-col lg:flex-row items-center gap-16 md:gap-24">
                <div className="flex-1 space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 text-sm font-bold tracking-wide">
                        <Flame className="w-4 h-4" />
                        <span>GAMIFIKASI BIMBINGAN</span>
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-4xl md:text-5xl font-bold text-zinc-950 leading-tight font-['Plus_Jakarta_Sans']">
                            Monitoring Progress <br />
                            <span className="text-orange-600">Lebih Menyenangkan</span>
                        </h2>
                        <p className="text-lg text-slate-600 leading-relaxed w-full">
                             Sistem ini mengintegrasikan elemen gamifikasi untuk meningkatkan keterlibatan mahasiswa. 
                             Dilengkapi dengan <strong>Progress Bar</strong> real-time, <strong>Daily Quests</strong> terukur, dan <strong>Badge System</strong> sebagai apresiasi kinerja.
                        </p>
                    </div>
                    
                    <div className="space-y-6 pt-4 bg-white/60 p-6 rounded-2xl border border-orange-100 backdrop-blur-sm">
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm font-bold text-zinc-900">
                                <span>Status Kelengkapan Dokumen</span>
                                <span className="text-orange-600">85%</span>
                            </div>
                            <Progress value={85} className="h-3 bg-slate-100" /> {/* Ensure Progress component accepts className color override logic if needed, usually it has a prop or internal class. Assuming standard UI component. */}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                                <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
                                    <Trophy className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-yellow-800 font-semibold mb-0.5">Achievement</p>
                                    <p className="text-sm font-bold text-zinc-900">Tepat Waktu</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                    <Star className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-blue-800 font-semibold mb-0.5">Badges</p>
                                    <p className="text-sm font-bold text-zinc-900">Rajin Bimbingan</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 relative w-full flex justify-center">
                    <motion.div 
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="relative z-10 bg-white border-2 border-zinc-100 p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] max-w-md w-full"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h4 className="font-bold text-xl text-zinc-900">Misi Hari Ini</h4>
                                <p className="text-sm text-slate-500 font-medium">Selesaikan untuk naik level!</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
                                <Target className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            {["Upload Bukti Bimbingan Bab 2", "Isi Logbook Minggu Ke-4", "Revisi Format Laporan"].map((task, i) => (
                                <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${i === 0 ? "bg-orange-50 border-orange-200" : "bg-white border-zinc-100"}`}>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${i === 0 ? "border-orange-500 bg-orange-500 text-white" : "border-slate-300"}`}>
                                        {i === 0 && <span className="text-[10px] font-bold">✓</span>}
                                    </div>
                                    <span className={`text-sm font-medium ${i === 0 ? "text-zinc-900 line-through decoration-orange-500/50" : "text-slate-600"}`}>{task}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                    
                    {/* Decorative Elements */}
                    <div className="absolute top-20 -right-4 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
                </div>
            </div>
        </section>
    );
}
