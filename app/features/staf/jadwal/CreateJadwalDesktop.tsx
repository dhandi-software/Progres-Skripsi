import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, Save, CalendarIcon } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { jadwalKpApi } from '~/api/jadwalKpApi';
import type { JadwalKp } from '~/api/jadwalKpApi';
import { CustomSelect } from '~/components/ui/custom-select';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { Calendar } from '~/components/ui/calendar';
import { format } from 'date-fns';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "~/components/ui/alert-dialog";

export function CreateJadwalDesktop() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const defaultTipe = searchParams.get('tipe') || 'PENGARAHAN_KP';

    const [formData, setFormData] = useState<Partial<JadwalKp>>({
        tipe: defaultTipe,
        judul: '',
        deskripsi: '',
    });

    const [endDate, setEndDate] = useState<string>('');
    const [endTime, setEndTime] = useState<string>('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await jadwalKpApi.createJadwalKp({
                ...formData,
                tanggal: endDate,
                waktu: endTime,
            } as any);
            navigate(`/staf/jadwal?tab=${formData.tipe}&success=true`);
        } catch (error) {
            console.error('Error saving jadwal:', error);
            alert('Gagal menyimpan jadwal');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 font-inter">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-6">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 shrink-0 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full flex items-center justify-center transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Tambah Jadwal Baru</h1>
                        <p className="text-sm text-gray-500 mt-1">Lengkapi form di bawah ini untuk membuat jadwal.</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-8">
                <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <form className="space-y-6 w-full" onSubmit={(e) => e.preventDefault()}>
                        <div className="w-full">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Tipe Jadwal</label>
                            <CustomSelect
                                options={[
                                    { label: 'Pengarahan KP', value: 'PENGARAHAN_KP' },
                                    { label: 'Pengumpulan Sidang', value: 'PENGARAHAN_SIDANG' },
                                ]}
                                value={formData.tipe || defaultTipe}
                                onChange={(value) => setFormData({ ...formData, tipe: value })}
                                placeholder="Pilih Tipe Jadwal"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Judul / Nama Jadwal</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#119DA4] outline-none text-gray-900"
                                value={formData.judul}
                                onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                                required
                                placeholder="Contoh: Batas Akhir Pengumpulan Berkas Sidang"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi Informasi</label>
                            <textarea
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#119DA4] outline-none text-gray-900 resize-none"
                                rows={4}
                                value={formData.deskripsi}
                                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                                placeholder="Informasi tambahan (opsional)"
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-gray-700">
                                    Tanggal Batas Akhir
                                </label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button type="button" className="flex justify-between items-center w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-900 hover:bg-gray-50 focus:ring-2 focus:ring-[#119DA4] outline-none transition-all">
                                            <span>{endDate ? format(new Date(endDate), "dd MMMM yyyy") : "Pilih Tanggal"}</span>
                                            <CalendarIcon className="w-4 h-4 text-gray-500" />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={endDate ? new Date(endDate) : undefined}
                                            onSelect={(date) => date && setEndDate(format(date, "yyyy-MM-dd"))}
                                            disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                                            startMonth={new Date()}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-gray-700">
                                    Waktu Batas Akhir
                                </label>
                                <input
                                    type="time"
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#119DA4] outline-none text-gray-900 text-sm h-[46px]"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => navigate(-1)}
                                disabled={isSubmitting}
                            >
                                Batal
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button 
                                        type="button" 
                                        disabled={isSubmitting || !endDate || !endTime || !formData.judul}
                                        className="gap-2 bg-[#119DA4] hover:bg-[#0f8b91] text-white"
                                    >
                                        <Save className="w-4 h-4" /> 
                                        {isSubmitting ? 'Menyimpan...' : 'Simpan Jadwal'}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Jadwal baru akan dibuat dan dapat dilihat oleh pengguna lain sesuai tipe jadwal.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleSubmit} className="bg-[#119DA4] hover:bg-[#0f8b91] text-white">
                                            Yakin & Simpan
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
