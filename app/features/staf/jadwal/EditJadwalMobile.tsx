import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
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

export function EditJadwalMobile() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [formData, setFormData] = useState<Partial<JadwalKp>>({
        tipe: 'PENGARAHAN_KP',
        judul: '',
        deskripsi: '',
    });

    const [endDate, setEndDate] = useState<string>('');
    const [endTime, setEndTime] = useState<string>('');

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchJadwal = async () => {
            if (!id) return;
            try {
                const data = await jadwalKpApi.getAllJadwalKp();
                const jadwal = data.find((j: JadwalKp) => j.id === parseInt(id));
                if (jadwal) {
                    setFormData({
                        tipe: jadwal.tipe,
                        judul: jadwal.judul,
                        deskripsi: jadwal.deskripsi || '',
                    });
                    
                    const endDt = new Date(jadwal.tanggal);
                    setEndDate(format(endDt, "yyyy-MM-dd"));
                    setEndTime(format(endDt, "HH:mm"));
                } else {
                    alert('Jadwal tidak ditemukan');
                    navigate('/staf/jadwal');
                }
            } catch (error) {
                console.error('Error fetching jadwal:', error);
                alert('Gagal memuat jadwal');
            } finally {
                setIsLoading(false);
            }
        };

        fetchJadwal();
    }, [id, navigate]);

    const handleSubmit = async () => {
        if (!id) return;
        
        setIsSubmitting(true);
        try {
            await jadwalKpApi.updateJadwalKp(parseInt(id), {
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

    if (isLoading) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-inter text-sm">Memuat...</div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 font-inter">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-4">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate(-1)}
                        className="w-8 h-8 shrink-0 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full flex items-center justify-center transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Edit Jadwal</h1>
                        <p className="text-xs text-gray-500 mt-1">Ubah informasi jadwal yang sudah ada.</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4">
                <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <form className="space-y-5 w-full" onSubmit={(e) => e.preventDefault()}>
                        <div className="w-full">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Tipe Jadwal</label>
                            <CustomSelect
                                options={[
                                    { label: 'Pengarahan KP', value: 'PENGARAHAN_KP' },
                                    { label: 'Pengumpulan Sidang', value: 'PENGARAHAN_SIDANG' },
                                ]}
                                value={formData.tipe || 'PENGARAHAN_SIDANG'}
                                onChange={(value) => setFormData({ ...formData, tipe: value })}
                                placeholder="Pilih Tipe Jadwal"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Judul / Nama Jadwal</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#119DA4] outline-none text-gray-900 text-sm"
                                value={formData.judul}
                                onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                                required
                                placeholder="Contoh: Batas Akhir Pengumpulan Berkas Sidang"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi Informasi</label>
                            <textarea
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#119DA4] outline-none text-gray-900 resize-none text-sm"
                                rows={4}
                                value={formData.deskripsi}
                                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                                placeholder="Informasi tambahan (opsional)"
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 gap-5">
                            <div className="space-y-2">
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
                            <div className="space-y-2">
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
                                className="w-full"
                            >
                                Batal
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button 
                                        type="button" 
                                        disabled={isSubmitting || !endDate || !endTime || !formData.judul}
                                        className="gap-2 bg-[#119DA4] hover:bg-[#0f8b91] text-white w-full"
                                    >
                                        <Save className="w-4 h-4" /> 
                                        {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="w-[90%] max-w-sm rounded-2xl">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-sm">
                                            Perubahan jadwal akan disimpan dan diumumkan.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="flex-col gap-2 mt-4">
                                        <AlertDialogAction onClick={handleSubmit} className="bg-[#119DA4] hover:bg-[#0f8b91] text-white w-full m-0">
                                            Yakin & Simpan
                                        </AlertDialogAction>
                                        <AlertDialogCancel className="w-full m-0">Batal</AlertDialogCancel>
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


