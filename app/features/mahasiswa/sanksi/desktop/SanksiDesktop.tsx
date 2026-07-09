import React, { useEffect, useState } from "react";
import { sanksiApi, type SanksiAdministrasi } from "~/api/sanksiApi";
import { FileText, Printer, CheckCircle, AlertTriangle, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";

export function SanksiDesktop({ title }: { title: string }) {
    const [sanksiList, setSanksiList] = useState<SanksiAdministrasi[]>([]);
    const [selectedSanksi, setSelectedSanksi] = useState<SanksiAdministrasi | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const data = await sanksiApi.getAllSanksi();
            setSanksiList(data);
            if (data.length > 0) {
                setSelectedSanksi(data[0]);
            }
        } catch (error) {
            console.error("Gagal memuat data sanksi:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handlePrint = () => {
        window.print();
    };

    const calculateWeeksLate = (tenggat?: string) => {
        if (!tenggat) return 0;
        const now = new Date();
        const tglTenggat = new Date(tenggat);
        if (now <= tglTenggat) return 0;
        const diffMs = now.getTime() - tglTenggat.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        return Math.ceil(diffDays / 7);
    };

    return (
        <div className="flex flex-col min-h-full bg-slate-50 p-8 font-sans print:p-0 print:bg-white print:min-h-0">
            <style type="text/css" media="print">
                {`@page { margin: 0; } body { margin: 1.6cm; }`}
            </style>
            {/* Header - Hidden on Print */}
            <div className="flex justify-between items-center mb-6 print:hidden">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">{title}</h1>
                    <p className="text-sm text-slate-500 mt-1">Daftar sanksi administrasi dan surat pernyataan yang diterbitkan oleh dosen pembimbing.</p>
                </div>
            {selectedSanksi && (
                <Button onClick={handlePrint} className="bg-brand-primary text-white hover:bg-brand-primary/95 flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-lg shadow-brand-primary/20">
                    <Printer size={16} />
                    Cetak Surat Pernyataan
                </Button>
            )}
        </div>

        {isLoading ? (
            <div className="flex-1 bg-white border border-slate-200 shadow-sm rounded-2xl p-20 text-center flex items-center justify-center print:hidden">
                <div className="w-8 h-8 rounded-full border-3 border-slate-200 border-t-brand-primary animate-spin" />
            </div>
        ) : sanksiList.length === 0 ? (
            <div className="flex-1 bg-white border border-slate-200 shadow-sm rounded-2xl p-16 text-center flex flex-col items-center justify-center gap-4 print:hidden">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                    <CheckCircle size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Tidak Ada Sanksi Administrasi</h2>
                <p className="text-sm text-slate-500 w-full text-center">Luar biasa! Anda tidak memiliki sanksi administrasi yang aktif. Pertahankan terus progres pengumpulan berkas tepat waktu.</p>
            </div>
        ) : (
            <div className="flex-1 flex flex-col lg:flex-row gap-8 print:block print:w-full print:m-0">
                {/* Left Sidebar - List of Sanctions (Hidden on Print) */}
                <div className="w-80 flex flex-col gap-3 shrink-0 print:hidden">
                    <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider px-1">Daftar Surat</h3>
                    <div className="flex flex-col gap-2">
                        {sanksiList.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedSanksi(item)}
                                className={cn(
                                    "p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 bg-white",
                                    selectedSanksi?.id === item.id
                                        ? "border-brand-primary/40 bg-brand-primary/5 shadow-sm"
                                        : "border-slate-200 hover:bg-slate-50"
                                )}
                            >
                                <div className={cn(
                                    "p-2 rounded-xl shrink-0",
                                    selectedSanksi?.id === item.id ? "bg-brand-primary/10 text-brand-primary" : "bg-slate-100 text-slate-500"
                                )}>
                                    <FileText size={18} />
                                </div>
                                <div className="overflow-hidden flex-1">
                                    <h4 className="font-bold text-slate-800 truncate text-sm">Surat Pernyataan</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">Sidang: {item.tanggalSidang}</p>
                                    <p className="text-[10px] text-slate-400 mt-1 mb-2">Dibuat oleh: {item.dosen?.nama || "Dosen"}</p>
                                    
                                    {/* Status Badge */}
                                    {item.status === 'Selesai/Lunas' && (
                                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                                            <CheckCircle2 size={12} /> Lunas
                                        </div>
                                    )}
                                    {item.status === 'Terlambat' && (
                                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-700 text-[10px] font-bold border border-red-200">
                                            <AlertCircle size={12} /> Telat {calculateWeeksLate(item.tenggatWaktu)} Minggu
                                        </div>
                                    )}
                                    {(!item.status || item.status === 'Menunggu Hardcover') && (
                                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                                            <Clock size={12} /> Menunggu
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Pane - Formal Document View */}
                {selectedSanksi && (
                    <div className="flex-1 flex justify-center print:block print:w-full">
                        <div className="w-full max-w-[800px] bg-white border border-slate-200 shadow-xl rounded-2xl p-16 flex flex-col text-black font-serif text-[14px] leading-relaxed relative min-h-[1050px] print:p-0 print:border-none print:shadow-none print:rounded-none print:w-full print:max-w-none print:m-0 print:min-h-0">
                                {/* Letter Header */}
                                <div className="text-center font-bold text-lg border-b border-black pb-3 mb-8 tracking-widest uppercase">
                                    SURAT PERNYATAAN
                                </div>

                                <div className="mb-6 font-sans text-sm print:font-serif">
                                    Yang bertanda tangan di bawah ini:
                                </div>

                                {/* Student Meta */}
                                <div className="grid grid-cols-[100px_20px_1fr] gap-y-3 mb-8 font-sans text-sm pl-4 print:font-serif">
                                    <div className="font-bold">Nama</div>
                                    <div>:</div>
                                    <div className="border-b border-slate-200 pb-0.5 font-semibold text-slate-900 print:border-none">{selectedSanksi.nama}</div>

                                    <div className="font-bold">NIM</div>
                                    <div>:</div>
                                    <div className="border-b border-slate-200 pb-0.5 font-semibold text-slate-900 print:border-none">{selectedSanksi.nim}</div>
                                </div>

                                {/* Body Text */}
                                <div className="mb-6 font-sans text-sm leading-loose text-justify print:font-serif">
                                    Menyatakan telah mengikuti <strong className="font-bold text-black">Sidang Evaluasi Kerja Praktik</strong> pada hari <strong className="font-bold text-black">{selectedSanksi.hariSidang}</strong> tanggal <strong className="font-bold text-black">{selectedSanksi.tanggalSidang}</strong>, dan akan mengembalikan atau mengumpulkan:
                                </div>

                                {/* Ordered Lists */}
                                <ol className="list-decimal pl-6 mb-12 flex flex-col gap-4 font-sans text-sm text-justify print:font-serif">
                                    <li>
                                        Berkas Kerja Praktik yang sudah diselesaikan dalam bentuk hardcover paling lambat hari <strong className="font-bold text-black">{selectedSanksi.hariTenggat}</strong>.
                                    </li>
                                    <li>
                                        Jika mengumpulkan lebih dari tanggal tersebut, bersedia mengikuti konsekuensinya untuk membayar denda administrasi:
                                        <ul className="list-disc pl-5 mt-2 flex flex-col gap-2">
                                            <li>
                                                Sebesar <strong className="font-bold text-black">Rp. 50.000,- (Lima Puluh Ribu Rupiah)</strong> untuk keterlambatan 1 (satu) minggu setelah tanggal pelaksanaan Sidang KP.
                                            </li>
                                            <li>
                                                Sebesar <strong className="font-bold text-black">Rp. 50.000,- (Lima Puluh Ribu Rupiah)</strong> untuk keterlambatan setiap minggu berikutnya sampai dengan maksimal akumulasi denda adalah <strong className="font-bold text-black">Rp. 200.000,- (Dua Ratus Ribu Rupiah)</strong>.
                                            </li>
                                        </ul>
                                    </li>
                                </ol>

                                {/* Date and Signatures */}
                                <div className="mt-auto flex flex-col items-end">
                                    <div className="font-sans text-sm mb-12 pr-6 print:font-serif">
                                        Jakarta, {selectedSanksi.tanggalSurat}
                                    </div>

                                    {/* Signature Box Layout */}
                                    <div className="flex flex-col items-center mr-10 select-none">
                                        {/* Stamp Box */}
                                        <div className="w-[120px] h-[90px] border border-black flex flex-col items-center justify-center text-[10px] font-sans font-bold text-slate-500 tracking-wide uppercase bg-slate-50/50 mb-3 border-dashed print:bg-white print:border-solid">
                                            <span>Meterai</span>
                                            <span className="text-[11px] mt-1 text-slate-600">Rp. 10.000</span>
                                        </div>
                                        <div className="w-40 border-b border-black mt-12 mb-1"></div>
                                        <div className="text-[11px] font-sans text-slate-500 font-bold uppercase tracking-wider">{selectedSanksi.nama}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
