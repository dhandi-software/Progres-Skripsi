"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale/id";
import { 
    Calendar as CalendarIcon, 
    Clock, 
    MapPin, 
    Info, 
    CheckCircle2,
    User,
    ChevronRight,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Calendar, MonthYearFilter } from "~/components/ui/calendar";
import { Label } from "~/components/ui/label";

interface SidangPengajuanFormProps {
    mahasiswaNama: string;
    mahasiswaNim: string;
    onSubmit: (data: { tanggalSidang: string; waktuSidang: string; lokasi: string }) => void;
    onCancel: () => void;
}

export function SidangPengajuanForm({ mahasiswaNama, mahasiswaNim, onSubmit, onCancel }: SidangPengajuanFormProps) {
    const [date, setDate] = useState<Date>();
    const [time, setTime] = useState("09:00");
    const [location, setLocation] = useState("Ruang Sidang Lt. 3");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!date) return;
        onSubmit({
            tanggalSidang: format(date, "yyyy-MM-dd"),
            waktuSidang: time,
            lokasi: location
        });
    };

    return (
        <div className="w-full bg-white rounded-[48px] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.15)] border border-slate-100 flex flex-col md:flex-row min-h-[600px] transition-all duration-500">
            {/* Left Sidebar - decorative & status */}
            <div className="w-full md:w-1/4 bg-[#0F172A] p-10 md:p-14 text-white flex flex-col justify-between relative overflow-hidden shrink-0 border-r border-white/5">
                {/* Abstract decoration */}
                <div className="absolute top-[-10%] right-[-10%] w-[200px] h-[200px] bg-brand-primary/20 rounded-full blur-[80px]" />
                <div className="absolute bottom-[-5%] left-[-5%] w-[150px] h-[150px] bg-blue-500/10 rounded-full blur-[60px]" />
                
                <div className="relative z-10">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center mb-8 border border-white/10 shadow-inner">
                        <CalendarIcon size={32} className="text-brand-primary" />
                    </div>
                    <h3 className="text-3xl font-black tracking-tight leading-tight mb-6">Pengajuan Sidang<br />Kerja Praktik</h3>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed mb-10">
                        Silakan lengkapi formulir di samping untuk mengajukan jadwal sidang Kerja Praktik bagi mahasiswa bimbingan Anda.
                    </p>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 group">
                            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
                                <User size={18} className="text-slate-400 group-hover:text-brand-primary" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Mahasiswa</p>
                                <p className="text-sm font-bold text-slate-200">{mahasiswaNama}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 mt-12 md:mt-0">
                    <div className="p-5 bg-white/5 backdrop-blur-md rounded-[32px] border border-white/10 shadow-lg">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-200/90">Status Pengajuan</span>
                        </div>
                        <p className="text-xs font-bold text-slate-300 leading-relaxed italic">
                            "Menunggu Persetujuan Kaprodi"
                        </p>
                        <div className="mt-4 flex justify-between items-center text-[10px] font-bold text-slate-500">
                            <span>Wajib ACC Kaprodi</span>
                            <ChevronRight size={12} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 p-12 md:p-20 bg-white flex flex-col justify-center">
                <form onSubmit={handleSubmit} className="w-full space-y-12">
                    <div className="space-y-10">
                        {/* Grid for Inputs */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                            {/* Date Picker - Using MonthYearFilter from Bimbingan */}
                            <div className="space-y-4">
                                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 mb-3">
                                    <CalendarIcon size={12} className="text-brand-primary" />
                                    Tanggal Pelaksanaan
                                </Label>
                                <div className="bg-white border-2 border-slate-100 rounded-2xl p-4 shadow-sm hover:border-brand-primary/20 transition-all flex justify-center">
                                    <MonthYearFilter 
                                        date={date}
                                        setDate={setDate}
                                        showLabel={false}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            {/* Time Input - Using Time Picker from Bimbingan */}
                            <div className="space-y-4">
                                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 mb-3">
                                    <Clock size={12} className="text-brand-primary" />
                                    Waktu Pelaksanaan
                                </Label>
                                <div className="bg-white border-2 border-slate-100 rounded-2xl p-4 shadow-sm flex items-center justify-between hover:border-brand-primary/20 transition-all group">
                                    <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-brand-primary" /> 
                                        Jam
                                    </label>
                                    <input 
                                        type="time" 
                                        className="px-4 py-2 text-xl font-black bg-slate-50 rounded-xl outline-none text-slate-900 border-none focus:ring-2 focus:ring-brand-primary/20 transition-all tracking-wider"
                                        value={time === "09:00 - 11:00" ? "09:00" : time} // Handle default transition
                                        onChange={(e) => setTime(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Location Input */}
                            <div className="space-y-4">
                                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 mb-3">
                                    <MapPin size={12} className="text-brand-primary" />
                                    Lokasi Sidang
                                </Label>
                                <div className="bg-white border-2 border-slate-100 rounded-2xl p-4 shadow-sm flex items-center hover:border-brand-primary/20 transition-all border-dashed">
                                    <div className="w-full group relative">
                                        <MapPin className="absolute left-0 top-1/2 -translate-y-1/2 text-brand-primary/60 group-focus-within:text-brand-primary z-10 transition-colors" size={20} />
                                        <input
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            placeholder="Gedung / Ruang / Link"
                                            className="w-full h-12 pl-8 pr-2 font-bold bg-transparent outline-none text-slate-900 text-base placeholder:text-slate-300 placeholder:font-medium"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notification info */}
                    <div className="bg-slate-50/80 backdrop-blur-sm rounded-3xl p-6 flex gap-4 border border-slate-100 items-start">
                        <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center shrink-0 text-brand-primary">
                            <Info size={20} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-black text-slate-900 tracking-tight">Informasi Penting</p>
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                Pengajuan ini bersifat <span className="font-bold text-slate-700">usulan</span>. Penjadwalan resmi akan ditentukan oleh Kaprodi setelah data divalidasi.
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-6 w-full pt-6">
                        <Button 
                            type="button"
                            variant="ghost" 
                            onClick={onCancel}
                            className="flex-1 h-16 rounded-[24px] font-black text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all text-sm uppercase tracking-widest"
                        >
                            Batalkan
                        </Button>
                        <Button 
                            type="submit"
                            disabled={!date}
                            className="flex-[2] h-16 bg-brand-primary hover:bg-slate-900 text-white rounded-[24px] font-black text-lg shadow-2xl shadow-brand-primary/30 transition-all hover:-translate-y-1 active:translate-y-0 group disabled:opacity-50 disabled:translate-y-0 gap-3"
                        >
                            <span>Ajukan Sekarang</span>
                            <CheckCircle2 size={24} className="group-hover:scale-110 transition-transform" />
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
