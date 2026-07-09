import React, { useEffect, useState } from "react";
import { sanksiApi, type SanksiAdministrasi } from "~/api/sanksiApi";
import { FileText, Printer, CheckCircle, ArrowLeft, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";

export function SanksiMobile({ title }: { title: string }) {
    const [sanksiList, setSanksiList] = useState<SanksiAdministrasi[]>([]);
    const [selectedSanksi, setSelectedSanksi] = useState<SanksiAdministrasi | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"list" | "detail">("list");

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const data = await sanksiApi.getAllSanksi();
            setSanksiList(data);
        } catch (error) {
            console.error("Gagal memuat data sanksi:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSelect = (sanksi: SanksiAdministrasi) => {
        setSelectedSanksi(sanksi);
        setViewMode("detail");
    };

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
        <div className="flex flex-col min-h-full bg-slate-50 p-4 font-sans print:p-0 print:bg-white">
            <style type="text/css" media="print">
                {`@page { margin: 0; } body { margin: 1cm; }`}
            </style>
            {/* Back header for detail view */}
            {viewMode === "detail" && selectedSanksi && (
                <div className="flex items-center gap-3 mb-6 print:hidden">
                    <button
                        onClick={() => setViewMode("list")}
                        className="p-2 bg-white rounded-full border border-slate-200 text-slate-600 hover:text-slate-800 active:scale-95 transition-transform"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Preview Surat</h1>
                        <p className="text-xs text-slate-500">Kembali ke daftar sanksi</p>
                    </div>
                    <Button onClick={handlePrint} size="sm" className="ml-auto bg-brand-primary text-white hover:bg-brand-primary/95 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs">
                        <Printer size={14} />
                        Cetak
                    </Button>
                </div>
            )}

            {viewMode === "list" && (
                <div className="mb-6 print:hidden">
                    <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">{title}</h1>
                    <p className="text-xs text-slate-500 mt-1">Sanksi administrasi & surat pernyataan Anda.</p>
                </div>
            )}

            {isLoading ? (
                <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-12 text-center flex items-center justify-center print:hidden">
                    <div className="w-6 h-6 rounded-full border-3 border-slate-200 border-t-brand-primary animate-spin" />
                </div>
            ) : sanksiList.length === 0 ? (
                <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3 print:hidden">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                        <CheckCircle size={24} />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800">Tidak Ada Sanksi</h2>
                    <p className="text-xs text-slate-500">Anda tidak memiliki sanksi administrasi aktif.</p>
                </div>
            ) : viewMode === "list" ? (
                <div className="flex flex-col gap-3 print:hidden">
                    {sanksiList.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => handleSelect(item)}
                            className="p-4 bg-white border border-slate-200 rounded-2xl cursor-pointer active:bg-slate-50 active:scale-[0.98] transition-all flex items-center gap-3"
                        >
                            <div className="p-2.5 bg-brand-primary/10 text-brand-primary rounded-xl">
                                <FileText size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-slate-800 text-sm truncate">Surat Pernyataan</h4>
                                <p className="text-xs text-slate-500 mt-0.5 mb-2">Sidang: {item.tanggalSidang}</p>
                                
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
            ) : (
                /* Mobile Formal Preview Card */
                selectedSanksi && (
                    <div className="flex justify-center print:block print:w-full">
                        <div className="w-full bg-white border border-slate-200 shadow-md rounded-2xl p-6 flex flex-col text-black font-serif text-[13px] leading-relaxed relative min-h-[600px] print:p-0 print:border-none print:shadow-none print:rounded-none print:w-full print:max-w-none print:m-0 print:min-h-0">
                            {/* Letter Header */}
                            <div className="text-center font-bold text-base border-b border-black pb-2 mb-6 tracking-wider uppercase">
                                SURAT PERNYATAAN
                            </div>

                            <div className="mb-4 font-sans text-xs print:font-serif">
                                Yang bertanda tangan di bawah ini:
                            </div>

                            {/* Student Meta */}
                            <div className="grid grid-cols-[80px_15px_1fr] gap-y-2 mb-6 font-sans text-xs pl-2 print:font-serif">
                                <div className="font-bold">Nama</div>
                                <div>:</div>
                                <div className="font-semibold text-slate-900">{selectedSanksi.nama}</div>

                                <div className="font-bold">NIM</div>
                                <div>:</div>
                                <div className="font-semibold text-slate-900">{selectedSanksi.nim}</div>
                            </div>

                            {/* Body Text */}
                            <div className="mb-4 font-sans text-xs leading-relaxed text-justify print:font-serif">
                                Menyatakan telah mengikuti <strong className="font-bold">Sidang Evaluasi Kerja Praktik</strong> pada hari <strong>{selectedSanksi.hariSidang}</strong> tanggal <strong>{selectedSanksi.tanggalSidang}</strong>, dan akan mengembalikan atau mengumpulkan:
                            </div>

                            {/* Ordered Lists */}
                            <ol className="list-decimal pl-5 mb-8 flex flex-col gap-3 font-sans text-xs text-justify print:font-serif">
                                <li>
                                    Berkas Kerja Praktik yang sudah diselesaikan dalam bentuk hardcover paling lambat hari <strong>{selectedSanksi.hariTenggat}</strong>.
                                </li>
                                <li>
                                    Jika mengumpulkan lebih dari tanggal tersebut, bersedia mengikuti konsekuensinya untuk membayar denda administrasi:
                                    <ul className="list-disc pl-4 mt-1 flex flex-col gap-1">
                                        <li>
                                            Sebesar <strong>Rp. 50.000,- (Lima Puluh Ribu Rupiah)</strong> untuk keterlambatan 1 (satu) minggu setelah tanggal pelaksanaan Sidang KP.
                                        </li>
                                        <li>
                                            Sebesar <strong>Rp. 50.000,- (Lima Puluh Ribu Rupiah)</strong> untuk keterlambatan setiap minggu berikutnya sampai dengan maksimal akumulasi denda adalah <strong>Rp. 200.000,- (Dua Ratus Ribu Rupiah)</strong>.
                                        </li>
                                    </ul>
                                </li>
                            </ol>

                            {/* Date and Signatures */}
                            <div className="mt-auto flex flex-col items-end">
                                <div className="font-sans text-xs mb-8 pr-2 print:font-serif">
                                    Jakarta, {selectedSanksi.tanggalSurat}
                                </div>

                                <div className="flex flex-col items-center mr-4 select-none">
                                    {/* Stamp Box */}
                                    <div className="w-[100px] h-[75px] border border-black flex flex-col items-center justify-center text-[9px] font-sans font-bold text-slate-500 tracking-wide uppercase bg-slate-50/50 mb-2 border-dashed print:bg-white print:border-solid">
                                        <span>Meterai</span>
                                        <span className="text-[10px] mt-0.5 text-slate-600">Rp. 10.000</span>
                                    </div>
                                    <div className="w-32 border-b border-black mt-8 mb-1"></div>
                                    <div className="text-[10px] font-sans text-slate-500 font-bold uppercase tracking-wider">{selectedSanksi.nama}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            )}
        </div>
    );
}
