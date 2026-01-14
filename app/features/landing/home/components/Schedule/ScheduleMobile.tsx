import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Calendar } from "~/components/ui/calendar";
import { useState } from "react";

export default function ScheduleMobile() {
    const [date, setDate] = useState<Date | undefined>(new Date());

    return (
        <div className="container mx-auto py-12 px-4 max-w-7xl">
             <Button asChild variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-brand-primary">
                <Link to="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Beranda
                </Link>
            </Button>

            <h1 className="text-3xl font-bold mb-8 text-foreground">Jadwal & Agenda</h1>

            <div className="grid lg:grid-cols-2 gap-10 items-start">
                <div className="w-full">
                     <Card className="border-0 shadow-lg shadow-orange-500/5 overflow-hidden">
                        <CardContent className="p-0">
                            <div className="bg-orange-600 p-6 text-white text-center">
                                <h2 className="text-2xl font-bold">Kalender Akademik</h2>
                                <p className="opacity-80">Semester Ganjil 2025/2026</p>
                            </div>
                            <div className="p-6 flex justify-center bg-white">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    className="rounded-md border-0 w-full max-w-sm"
                                />
                            </div>
                        </CardContent>
                     </Card>
                </div>
                
                <div className="space-y-6 w-full">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-zinc-900">Agenda Terdekat</h3>
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">Januari 2026</span>
                    </div>
                    
                    <div className="grid gap-4">
                        {[
                            { date: "15 Jan", title: "Batas Akhir Pengajuan Proposal", type: "Deadline", desc: "Pastikan seluruh dokumen lengkap" },
                            { date: "20 Jan", title: "Seminar KP Gelombang 1", type: "Sidang", desc: "Wajib hadir 30 menit sebelum jadwal" },
                            { date: "25 Jan", title: "Pembekalan Mahasiswa KP", type: "Event", desc: "Aula Fakultas Teknik Lt. 3" },
                            { date: "01 Feb", title: "Awal Periode Pelaksanaan KP", type: "Info", desc: "Mulai kegiatan di perusahaan" },
                        ].map((item, i) => (
                            <Card key={i} className="hover:shadow-md transition-all duration-300 border-l-4 border-l-orange-500 hover:border-l-orange-600 group cursor-default">
                                <CardContent className="flex items-start p-5 gap-5">
                                    <div className="flex flex-col items-center justify-center w-16 h-16 bg-orange-50 rounded-xl shrink-0 group-hover:bg-orange-100 transition-colors">
                                        <span className="text-xl font-bold text-orange-700">{item.date.split(" ")[0]}</span>
                                        <span className="text-[10px] uppercase font-bold text-orange-800/60">{item.date.split(" ")[1]}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-zinc-900 text-lg group-hover:text-orange-700 transition-colors">{item.title}</h4>
                                            <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wide ${
                                                item.type === 'Deadline' ? 'bg-red-50 text-red-600' : 
                                                item.type === 'Sidang' ? 'bg-blue-50 text-blue-600' : 
                                                item.type === 'Info' ? 'bg-zinc-100 text-zinc-600' : 'bg-green-50 text-green-600'
                                            }`}>
                                                {item.type}
                                            </span>
                                        </div>
                                        <p className="text-muted-foreground text-sm">{item.desc}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
