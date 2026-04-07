"use client";

import React, { useEffect, useState } from "react";
import { bimbinganApi } from "../../../api/bimbinganApi";
import { 
    Users, User, FileText, Search, BookOpen, AlertCircle, 
    ChevronRight, MapPin, Briefcase, GraduationCap,
    LayoutDashboard, ArrowRight, Filter, MoreVertical,
    BarChart3, Loader2, Info, Send
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { Button } from "../../../components/ui/button";
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
    ReferenceLine
} from 'recharts';
import { Label } from "../../../components/ui/label";
import { UPLOADS_URL } from "../../../api/client";
import { 
    X, Download, Clock, CheckCircle2, AlertCircle as AlertIcon, 
    FileStack, History as HistoryIcon, Eye
} from "lucide-react";

const taskOptionsList = [
    { label: "Bab 1: Pendahuluan", value: "Bab 1: Pendahuluan" },
    { label: "Bab 2: Tinjauan Pustaka", value: "Bab 2: Tinjauan Pustaka" },
    { label: "Bab 3: Metodologi", value: "Bab 3: Metodologi" },
    { label: "Bab 4: Hasil dan Pembahasan", value: "Bab 4: Hasil dan Pembahasan" },
    { label: "Bab 5: Kesimpulan dan Saran", value: "Bab 5: Kesimpulan dan Saran" },
    { label: "Laporan Akhir (Finalisasi)", value: "Laporan Akhir (Finalisasi)" },
];

interface BimbinganData {
    dosen: {
        id: number;
        nama: string;
        username: string;
        photo?: string;
    };
    students: any[];
    totalStudents: number;
    activeProgress: number; // percentage
}

export function ProdiBimbingan() {
    const [data, setData] = useState<BimbinganData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDosen, setSelectedDosen] = useState<BimbinganData | null>(null);
    
    // History Modal State
    const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [detailTab, setDetailTab] = useState<"target" | "riwayat" | "grafik">("target");

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await bimbinganApi.getAllProdiBimbingan();
            setData(response || []);
        } catch (error) {
            console.error("Fetch Monitoring Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

            const fetchHistory = async (student: any) => {
                try {
                    setSelectedStudentForHistory(student.mahasiswa);
                    setDetailTab("target");
                    setIsHistoryLoading(true);
                    
                    // 1. Fetch full history for the student (all topics)
                    const historyData = await bimbinganApi.getBimbinganByMahasiswa(student.mahasiswa.id);
                    
                    // Priority map for sorting topics Bab 1 -> Bab 5
                    const topicOrder: Record<string, number> = {
                        "Bab 1: Pendahuluan": 1,
                        "Bab 2: Tinjauan Pustaka": 2,
                        "Bab 3: Metodologi": 3,
                        "Bab 4: Hasil dan Pembahasan": 4,
                        "Bab 5: Kesimpulan dan Saran": 5,
                        "Laporan Akhir (Finalisasi)": 6
                    };

                    // Sort by Topic Order ascending, then by Version ascending within the topic
                    const sortedHistory = [...historyData].sort((a: any, b: any) => {
                        const orderA = topicOrder[a.topik] || 99;
                        const orderB = topicOrder[b.topik] || 99;
                        if (orderA !== orderB) return orderA - orderB;
                        return a.versi - b.versi;
                    });
                    
                    setHistory(sortedHistory);

            // 2. Generate Chart Data for Timeliness (Sync with BimbinganDesktop.tsx)
            const groupedByTopic = historyData.reduce((acc: any, task: any) => {
                if (!acc[task.topik]) acc[task.topik] = [];
                acc[task.topik].push(task);
                return acc;
            }, {});

            const newChartData: any[] = [];
            newChartData.push({
                name: "Mulai",
                score: 0,
                fullTopic: "Mulai Bimbingan",
                diffDays: 0,
                isSubmitted: false,
                statusText: "Belum Mulai"
            });
            
            taskOptionsList.forEach(opt => {
                const topicTasks = groupedByTopic[opt.value];
                if (topicTasks) {
                    const assignedTask = topicTasks.find((t: any) => t.status === 'ASSIGNED');
                    const submittedTasks = topicTasks.filter((t: any) => ['SUBMITTED', 'REVISION', 'APPROVED'].includes(t.status));
                    submittedTasks.sort((a: any, b: any) => a.versi - b.versi); 

                    if (assignedTask || submittedTasks.length > 0) {
                        const deadline = assignedTask?.jadwalBimbingan ? new Date(assignedTask.jadwalBimbingan) : null;
                        
                        if (submittedTasks.length > 0) {
                            const firstSubmission = submittedTasks[0];
                            const submittedDate = new Date(firstSubmission.tanggal);
                            
                            let diffDays = 0;
                            if (deadline) {
                                const diffTime = submittedDate.getTime() - deadline.getTime();
                                diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            }
                            
                            const isApproved = submittedTasks.some((t: any) => t.status === 'APPROVED');
                            const baseScore = isApproved ? 100 : 50;

                            let score = baseScore;
                            if (diffDays > 0) {
                                score = Math.max(0, baseScore - (diffDays * 10));
                            }
                            
                            newChartData.push({
                                name: opt.label.split(':')[0].replace('Laporan Akhir (Finalisasi)', 'Laporan Akhir'), 
                                score: score,
                                fullTopic: opt.label,
                                diffDays: diffDays > 0 ? diffDays : 0,
                                isSubmitted: true,
                                isApproved: isApproved,
                                statusText: isApproved ? "Disetujui Dosen" : "Sedang Direviu"
                            });
                        } else if (assignedTask) {
                            let diffDays = 0;
                            if (deadline) {
                                const now = new Date();
                                const diffTime = now.getTime() - deadline.getTime();
                                diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            }
                            
                            const baseScore = 50;
                            let score = baseScore;
                            if (diffDays > 0) {
                                score = Math.max(0, baseScore - (diffDays * 10));
                            }
                            
                            newChartData.push({
                                name: opt.label.split(':')[0].replace('Laporan Akhir (Finalisasi)', 'Laporan Akhir'), 
                                score: score,
                                fullTopic: opt.label,
                                diffDays: diffDays > 0 ? diffDays : 0,
                                isSubmitted: false,
                                isApproved: false,
                                statusText: "Sedang Berjalan (Belum Submit)"
                            });
                        }
                    } else {
                        newChartData.push({
                            name: opt.label.split(':')[0].replace('Laporan Akhir (Finalisasi)', 'Laporan Akhir'), 
                            score: 0,
                            fullTopic: opt.label,
                            diffDays: 0,
                            isSubmitted: false,
                            statusText: "Belum Mulai"
                        });
                    }
                } else {
                    newChartData.push({
                        name: opt.label.split(':')[0].replace('Laporan Akhir (Finalisasi)', 'Laporan Akhir'), 
                        score: 0,
                        fullTopic: opt.label,
                        diffDays: 0,
                        isSubmitted: false,
                        statusText: "Belum Mulai"
                    });
                }
            });
            setChartData(newChartData);

        } catch (error) {
            console.error("Fetch History Error:", error);
        } finally {
            setIsHistoryLoading(false);
        }
    };

    const filteredData = data.filter(d => 
        d.dosen.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.students.some(s => s.mahasiswa.nama.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const statsData = [
        { name: 'Total Dosen', value: data.length, icon: Users, color: 'text-blue-600 bg-blue-50' },
        { name: 'Total Mahasiswa', value: data.reduce((acc, d) => acc + d.totalStudents, 0), icon: GraduationCap, color: 'text-emerald-600 bg-emerald-50' },
        { name: 'Rata-rata Progres', value: `${Math.round(data.reduce((acc, d) => acc + d.activeProgress, 0) / (data.length || 1))}%`, icon: BarChart3, color: 'text-amber-600 bg-amber-50' },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-12 font-geist">
            <div className="max-w-[1600px] mx-auto space-y-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -mr-32 -mt-32" />
                    <div className="relative z-10 space-y-2">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                                <BarChart3 size={28} />
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Monitoring Bimbingan</h1>
                        </div>
                        <p className="text-slate-500 font-medium ml-18 text-lg">Pantau perkembangan bimbingan dosen dan mahasiswa secara real-time.</p>
                    </div>
                    
                    <div className="flex gap-6 relative z-10">
                        {statsData.map((stat, idx) => (
                            <div key={idx} className={cn("px-8 py-5 rounded-[28px] flex flex-col items-center border", stat.color.split(' ')[2])}>
                                <div className="flex items-center gap-2 mb-1">
                                    <stat.icon size={16} className={stat.color.split(' ')[0]} />
                                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{stat.name}</span>
                                </div>
                                <span className={cn("text-2xl font-black", stat.color.split(' ')[0])}>{stat.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Left List of Dosen */}
                    <div className="md:w-[450px] space-y-6">
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors" size={20} />
                            <input 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari dosen atau mahasiswa..."
                                className="w-full h-16 pl-16 pr-6 bg-white border border-slate-200 rounded-[28px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary transition-all shadow-sm"
                            />
                        </div>

                        <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto pr-2 custom-scrollbar">
                            {isLoading ? (
                                <div className="flex justify-center p-10"><Loader2 className="animate-spin text-brand-primary" /></div>
                            ) : filteredData.map((dosenData) => (
                                <div 
                                    key={dosenData.dosen.id}
                                    onClick={() => setSelectedDosen(dosenData)}
                                    className={cn(
                                        "p-6 rounded-[32px] border transition-all cursor-pointer group relative overflow-hidden",
                                        selectedDosen?.dosen.id === dosenData.dosen.id 
                                            ? "bg-brand-primary border-brand-primary text-white shadow-xl shadow-brand-primary/20 scale-[1.02]" 
                                            : "bg-white border-slate-100 hover:border-brand-primary/30 hover:shadow-lg text-slate-900"
                                    )}
                                >
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl", 
                                                selectedDosen?.dosen.id === dosenData.dosen.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400")}>
                                                {dosenData.dosen.nama.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-sm">{dosenData.dosen.nama}</h4>
                                                <p className={cn("text-[11px] font-bold opacity-60 uppercase tracking-widest", 
                                                    selectedDosen?.dosen.id === dosenData.dosen.id ? "text-white" : "text-slate-400")}>
                                                    {dosenData.totalStudents} Mahasiswa
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight size={20} className={cn("transition-transform", selectedDosen?.dosen.id === dosenData.dosen.id ? "translate-x-1" : "text-slate-300 group-hover:text-brand-primary")} />
                                    </div>
                                    
                                    {/* Progress mini bar */}
                                    <div className="mt-4 pt-4 border-t border-white/10 relative z-10">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1.5 opacity-60">
                                            <span>Rata-rata Progres</span>
                                            <span>{dosenData.activeProgress}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-white transition-all duration-1000" style={{ width: `${dosenData.activeProgress}%` }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Detail Content */}
                    <div className="flex-1 bg-white rounded-[48px] border border-slate-100 shadow-sm p-10 min-h-[600px] flex flex-col">
                        {selectedDosen ? (
                            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                                {/* Dosen Detail Header */}
                                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 bg-brand-primary/5 rounded-[32px] flex items-center justify-center border-2 border-brand-primary/10">
                                            <Users size={36} className="text-brand-primary" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-slate-900">{selectedDosen.dosen.nama}</h2>
                                            <div className="flex items-center gap-3 mt-1 text-slate-500 text-sm font-medium">
                                                <span className="flex items-center gap-1.5"><GraduationCap size={16} /> Dosen Pembimbing</span>
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                <span>{selectedDosen.dosen.username}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100 text-center px-8">
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Mhs Bimbingan</div>
                                            <div className="text-2xl font-black text-slate-900">{selectedDosen.totalStudents}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Student List section */}
                                <div className="space-y-4 pt-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                            <div className="w-2 h-8 bg-brand-primary rounded-full" />
                                            Daftar Mahasiswa Bimbingan
                                        </h3>
                                        <div className="bg-slate-50 px-4 py-2 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Info size={14} className="text-brand-primary" /> View Only Access
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                        {selectedDosen.students.map((student, idx) => {
                                            const activeTask = student.mahasiswa?.bimbingan?.[0];
                                            return (
                                                <div key={idx} className="bg-slate-50/50 p-6 rounded-[32px] border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm font-black border border-slate-100">
                                                                {student.mahasiswa.nama.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-slate-900 text-sm leading-none mb-1">{student.mahasiswa.nama}</p>
                                                                <p className="text-[11px] font-mono text-slate-400 tracking-tighter">{student.mahasiswa.nim}</p>
                                                            </div>
                                                        </div>
                                                        <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                            activeTask?.status === 'APPROVED' ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                                                            activeTask?.status === 'SUBMITTED' ? "bg-blue-50 border-blue-100 text-blue-600" :
                                                            "bg-amber-50 border-amber-100 text-amber-600"
                                                        )}>
                                                            {activeTask?.status || "BELUM MULAI"}
                                                        </span>
                                                    </div>

                                                    <div className="bg-white/80 p-4 rounded-3xl border border-slate-100/50 space-y-3">
                                                        <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                                                            <div className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500">
                                                                <FileText size={14} />
                                                            </div>
                                                            <span className="flex-1 truncate">{activeTask?.topik || "Belum ada target aktif"}</span>
                                                        </div>
                                                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-brand-primary" style={{ width: activeTask?.status === 'APPROVED' ? '100%' : '50%' }} />
                                                        </div>
                                                    </div>

                                                    <button 
                                                        onClick={() => fetchHistory(student)}
                                                        className="w-full mt-4 py-3 bg-white border border-slate-100 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2 hover:border-brand-primary/30 hover:text-brand-primary transition-all group-hover:bg-slate-50"
                                                    >
                                                        Lihat Detail Progres <ArrowRight size={14} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-20">
                                <div className="w-32 h-32 bg-slate-50 rounded-[40px] flex items-center justify-center mb-8 border border-slate-100 relative">
                                    <Users size={48} className="text-slate-200" />
                                    <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent rounded-[40px]" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-400 mb-2">Pilih Dosen untuk Memantau</h3>
                                <p className="text-slate-300 font-medium max-w-[300px]">Pilih salah satu dosen pembimbing dari daftar di samping untuk melihat progres bimbingan mahasiswa.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Detail Progres Modal (Synced with Bimbingan View) */}
                {selectedStudentForHistory && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12 animate-in fade-in duration-300">
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setSelectedStudentForHistory(null)} />
                        
                        <div className="relative w-full  bg-white rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                            {/* Modal Header - Student Profile */}
                            <div className="p-8 lg:p-10 border-b border-slate-100 bg-white relative">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-slate-50 rounded-[28px] flex items-center justify-center text-slate-400 border border-slate-100 shadow-inner">
                                            <User size={32} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900 leading-tight">Detail Bimbingan: {selectedStudentForHistory.nama}</h2>
                                            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">
                                                {selectedStudentForHistory.nim} — {data.find(d => d.students.some(s => s.mahasiswa.id === selectedStudentForHistory.id))?.students.find(s => s.mahasiswa.id === selectedStudentForHistory.id)?.judul || "Kerja Praktik"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                                            Role: Penjabat Prodi
                                        </div>
                                        <button 
                                            onClick={() => setSelectedStudentForHistory(null)}
                                            className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all hover:rotate-90"
                                        >
                                            <X size={24} />
                                        </button>
                                    </div>
                                </div>

                                {/* Tab Navigation - Synced with BimbinganDesktop.tsx */}
                                <div className="flex gap-8 mt-10 border-b border-slate-100 px-2 overflow-x-auto scrollbar-hide">
                                    {[
                                        { id: "target", label: "Target Saat Ini", icon: FileStack },
                                        { id: "riwayat", label: "Riwayat Selesai", icon: HistoryIcon },
                                        { id: "grafik", label: "Grafik Kedisiplinan", icon: BarChart3 },
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setDetailTab(tab.id as any)}
                                            className={cn(
                                                "pb-4 text-xs font-black uppercase tracking-[0.15em] flex items-center gap-2.5 transition-all border-b-4",
                                                detailTab === tab.id 
                                                    ? "border-brand-primary text-brand-primary translate-y-px" 
                                                    : "border-transparent text-slate-400 hover:text-slate-600"
                                            )}
                                        >
                                            <tab.icon size={16} />
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Modal Content Area */}
                            <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar bg-slate-50/30">
                                {isHistoryLoading ? (
                                    <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-4">
                                        <Loader2 className="animate-spin" size={48} />
                                        <p className="font-bold uppercase tracking-[0.2em] text-[10px]">Menyinkronkan Data...</p>
                                    </div>
                                ) : (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        {detailTab === "target" && (
                                            <div className="max-w-6xl mx-auto space-y-8">
                                                {history.length > 0 ? (
                                                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                                                        <div className="h-3 w-full bg-brand-primary" />
                                                        <div className="p-8 md:p-12 space-y-10">
                                                            <div className="flex justify-between items-start">
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center gap-3">
                                                                        <h3 className="text-2xl font-black text-slate-900">{history[0].topik}</h3>
                                                                        <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-primary/20">
                                                                            Versi {history[0].versi}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-sm font-bold text-slate-400 flex items-center gap-2 italic">
                                                                        <Clock size={14} /> Terakhir diperbarui: {new Date(history[0].tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                                    </p>
                                                                </div>
                                                                <div className={cn(
                                                                    "px-6 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest border shadow-sm",
                                                                    history[0].status === 'APPROVED' ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                                                                    history[0].status === 'REVISION' ? "bg-orange-50 border-orange-100 text-orange-600" :
                                                                    "bg-blue-50 border-blue-100 text-blue-600"
                                                                )}>
                                                                    {history[0].status === 'SUBMITTED' ? "Menunggu Reviu" : history[0].status}
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                                <div className="space-y-3">
                                                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                                        <FileText size={12} className="text-brand-primary" /> Berkas Mahasiswa
                                                                    </Label>
                                                                    {history[0].fileMahasiswa ? (
                                                                        <a 
                                                                            href={`${UPLOADS_URL}${history[0].fileMahasiswa}`}
                                                                            target="_blank" rel="noopener noreferrer"
                                                                            className="flex items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 transition-all group"
                                                                        >
                                                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-brand-primary shadow-sm mr-4">
                                                                                <FileStack size={18} />
                                                                            </div>
                                                                            <span className="text-xs font-bold text-slate-600 flex-1 truncate">Draft_Laporan_v{history[0].versi}.pdf</span>
                                                                            <Download size={16} className="text-slate-300 group-hover:text-brand-primary" />
                                                                        </a>
                                                                    ) : <p className="text-xs text-slate-400 italic">Belum ada berkas.</p>}
                                                                </div>
                                                                <div className="space-y-3">
                                                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                                        <CheckCircle2 size={12} className="text-brand-primary" /> Hasil Reviu Dosen
                                                                    </Label>
                                                                    {history[0].fileDosen ? (
                                                                        <a 
                                                                            href={`${UPLOADS_URL}${history[0].fileDosen}`}
                                                                            target="_blank" rel="noopener noreferrer"
                                                                            className="flex items-center p-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl hover:bg-emerald-50 transition-all group"
                                                                        >
                                                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm mr-4">
                                                                                <FileText size={18} />
                                                                            </div>
                                                                            <span className="text-xs font-bold text-emerald-700 flex-1 truncate">Reviu_Dosen_v{history[0].versi}.pdf</span>
                                                                            <Download size={16} className="text-emerald-300 group-hover:text-emerald-600" />
                                                                        </a>
                                                                    ) : <p className="text-xs text-slate-400 italic">Belum ada reviu.</p>}
                                                                </div>
                                                            </div>

                                                            <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100/50">
                                                                <div className="flex items-center gap-3 mb-4">
                                                                    <div className="w-1 h-6 bg-brand-primary rounded-full" />
                                                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Catatan & Feedback</h4>
                                                                </div>
                                                                <p className="text-sm text-slate-600 font-medium leading-relaxed italic">
                                                                    {history[0].catatan || "Tidak ada catatan untuk progres saat ini."}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                                        <div className="w-24 h-24 bg-slate-100 rounded-[40px] flex items-center justify-center text-slate-300 mb-6">
                                                            <FileStack size={48} />
                                                        </div>
                                                        <h4 className="text-xl font-black text-slate-400">Belum Ada Target Aktif</h4>
                                                        <p className="text-slate-300 font-medium mt-2">Dosen pembimbing belum memberikan tugas bimbingan resmi.</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {detailTab === "riwayat" && (
                                            <div className="max-w-6xl mx-auto space-y-8 pb-10">
                                                <div className="relative space-y-10 before:absolute before:left-[17px] before:top-2 before:bottom-0 before:w-1 text-slate-900 before:bg-slate-100 before:rounded-full">
                                                    {history.length > 0 ? history.map((item, idx) => (
                                                        <div key={item.id} className="relative pl-14 group">
                                                            <div className={cn(
                                                                "absolute left-0 top-0 w-9 h-9 rounded-full border-4 border-white flex items-center justify-center z-10 shadow-sm transition-all group-hover:scale-110",
                                                                item.status === 'APPROVED' ? "bg-emerald-500 text-white" : "bg-brand-primary text-white"
                                                            )}>
                                                                <span className="text-[10px] font-black">V{item.versi}</span>
                                                            </div>

                                                            <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all">
                                                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                                                    <div className="space-y-4">
                                                                        <div className="flex items-center gap-3">
                                                                            <h5 className="font-black text-xl text-slate-900">{item.topik}</h5>
                                                                            <span className={cn(
                                                                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                                                item.status === 'APPROVED' ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                                                                                "bg-orange-50 border-orange-100 text-orange-600"
                                                                            )}>
                                                                                {item.status}
                                                                            </span>
                                                                        </div>
                                                                        <div className="bg-slate-50/80 px-5 py-3 rounded-2xl border border-slate-100/50">
                                                                            <p className="text-sm text-slate-600 font-medium italic">"{item.catatan || "Tidak ada catatan."}"</p>
                                                                        </div>
                                                                        <div className="flex gap-4">
                                                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                                                <Clock size={12} /> {new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                                            </div>
                                                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                                                <FileText size={12} /> {item.fileMahasiswa ? "Ada Berkas" : "Tanpa Berkas"}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-col gap-2">
                                                                        {item.fileMahasiswa && (
                                                                            <a href={`${UPLOADS_URL}${item.fileMahasiswa}`} target="_blank" className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 hover:bg-brand-primary hover:text-white transition-all rounded-xl border border-slate-100 text-[10px] font-black uppercase tracking-widest group/btn">
                                                                                <Download size={14} className="group-hover/btn:animate-bounce" /> Draft
                                                                            </a>
                                                                        )}
                                                                        {item.fileDosen && (
                                                                            <a href={`${UPLOADS_URL}${item.fileDosen}`} target="_blank" className="flex items-center gap-3 px-5 py-2.5 bg-emerald-50 hover:bg-emerald-500 hover:text-white transition-all rounded-xl border border-emerald-100 text-[10px] font-black uppercase tracking-widest group/btn">
                                                                                <Download size={14} className="group-hover/btn:animate-bounce" /> Reviu
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )) : (
                                                        <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-[11px]">Belum Ada Riwayat</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {detailTab === "grafik" && (
                                            <div className="max-w-6xl mx-auto space-y-10">
                                                <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-xl shadow-slate-200/30">
                                                    <div className="flex items-center justify-between mb-10">
                                                        <div>
                                                            <h3 className="text-xl font-black text-slate-900">Grafik Kedisiplinan</h3>
                                                            <p className="text-sm font-medium text-slate-400 mt-1">Skor 100 = Tepat waktu. Skor menurun jika terlambat mengumpulkan draf.</p>
                                                        </div>
                                                        <div className="bg-orange-50 px-5 py-2.5 rounded-2xl flex items-center gap-3 border border-orange-100">
                                                            <div className="w-3 h-3 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">Disiplin Progres</span>
                                                        </div>
                                                    </div>

                                                    <div className="h-[400px] w-full">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                                                <defs>
                                                                    <linearGradient id="colorScoreProdi" x1="0" y1="0" x2="0" y2="1">
                                                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                                                    </linearGradient>
                                                                </defs>
                                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                                <XAxis 
                                                                    dataKey="name" 
                                                                    axisLine={false} 
                                                                    tickLine={false} 
                                                                    tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 900 }}
                                                                    dy={15}
                                                                />
                                                                <YAxis 
                                                                    axisLine={false} 
                                                                    tickLine={false} 
                                                                    tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 900 }}
                                                                    domain={[0, 100]}
                                                                    ticks={[0, 25, 50, 75, 100]}
                                                                    dx={-15}
                                                                />
                                                                <Tooltip 
                                                                    content={({ active, payload }) => {
                                                                        if (active && payload && payload.length) {
                                                                            const data = payload[0].payload;
                                                                            return (
                                                                                <div className="bg-white p-4 border-none shadow-[0_10px_40px_rgba(0,0,0,0.1)] rounded-[24px]">
                                                                                    <p className="font-black text-xs text-slate-900 mb-1 uppercase tracking-wider">{data.fullTopic}</p>
                                                                                    {data.statusText === 'Belum Mulai' ? (
                                                                                        <p className="text-[10px] font-bold text-slate-400">Belum Ada Progres</p>
                                                                                    ) : (
                                                                                        <div className="space-y-1">
                                                                                            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Skor: {data.score}</p>
                                                                                            <p className="text-[10px] text-slate-500 font-bold">{data.isApproved ? '✔ Disetujui Dosen' : data.isSubmitted ? '⏳ Sudah Submit' : '⏳ Sedang Berjalan'}</p>
                                                                                            {data.diffDays > 0 ? (
                                                                                                <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Terlambat {data.diffDays} hari</p>
                                                                                            ) : (
                                                                                                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">{data.isSubmitted ? 'Tepat Waktu' : 'Dalam Tenggat'}</p>
                                                                                            )}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        }
                                                                        return null;
                                                                    }}
                                                                />
                                                                <Area 
                                                                    type="monotone" 
                                                                    dataKey="score" 
                                                                    stroke="#f97316" 
                                                                    fillOpacity={1} 
                                                                    fill="url(#colorScoreProdi)" 
                                                                    strokeWidth={4}
                                                                    dot={{ r: 5, fill: '#f97316', strokeWidth: 0, stroke: '#fff' }}
                                                                    activeDot={{ r: 7, stroke: '#ffedd5', strokeWidth: 4, fill: '#f97316' }}
                                                                />
                                                                <ReferenceLine y={0} stroke="#E5E7EB" />
                                                            </AreaChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            {/* Modal Footer */}
                            <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-center items-center gap-10">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Monitoring Akademik Terpusat — Pejabat Prodi View</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
