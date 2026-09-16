import React from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { cn } from "~/lib/utils";
import type { LaporanItem } from "../types/laporan";


function getGrade(nilai: number | null): string {
    if (nilai === null) return "-";
    if (nilai >= 80) return "A";
    if (nilai >= 70) return "B";
    if (nilai >= 60) return "B-";
    if (nilai >= 50) return "C";
    if (nilai >= 40) return "C-";
    return "D";
}

function formatNilai(val: number | null | undefined, fractionDigits = 0): string {
    if (val === null || val === undefined) return "—";
    return val.toFixed(fractionDigits);
}


interface CetakLaporanDocumentProps {
    data: LaporanItem[];
}

export function CetakLaporanDocument({ data }: CetakLaporanDocumentProps) {
    const currentYear = new Date().getFullYear();

    return (
        <div className="hidden print:block print-section w-full text-slate-900 bg-white font-sans">
            {data.map((item, idx) => {
                const totalLogbook = item.totalLogbook || (item.logbooks ? item.logbooks.length : 0);
                const totalApproved = item.totalLogbookApproved || (item.logbooks ? item.logbooks.filter(l => l.catatan || l.pembimbingParaf || l.mahasiswaParaf || l.dosenParaf || l.parafDosen).length : 0);
                const progressPercent = totalLogbook > 0 ? Math.round((totalApproved / totalLogbook) * 100) : 0;

                return (
                    <div
                        key={item.id}
                        className={cn(
                            "w-full flex flex-col bg-white text-slate-900",
                            idx > 0 && "page-break-before-always mt-8"
                        )}
                    >
                        {/* Header Section */}
                        <div className="flex flex-col items-center justify-center text-center w-full mb-4">
                            <span className="text-[11px] font-semibold text-[#2B4C7E] tracking-[0.25em] uppercase mb-1">
                                UNIVERSITAS · KERJA PRAKTIK MAHASISWA
                            </span>
                            <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#0F2137] tracking-wide uppercase leading-tight">
                                LAPORAN REKAPITULASI<br />KERJA PRAKTIK MAHASISWA
                            </h1>
                            <p className="text-xs text-slate-500 font-medium mt-1">
                                Tahun Akademik: {currentYear}
                            </p>
                        </div>

                        {/* Top Thin Divider */}
                        <div className="w-full border-t border-slate-200 mb-4" />

                        {/* Student Info Block */}
                        <div className="flex flex-col items-center justify-center text-center w-full mb-4">
                            <h2 className="text-xl font-bold text-slate-900">
                                {item.nama}
                            </h2>
                            <p className="text-sm font-semibold text-slate-800 mt-0.5">
                                NIM: {item.nim}
                            </p>
                            <p className="text-xs text-slate-600 mt-2 font-normal">
                                Dosen Pembimbing: <span className="font-medium text-slate-800">{item.p1_nama || "-"}</span>
                            </p>
                            {item.judulSkripsi && (
                                <p className="text-xs text-slate-500 italic mt-0.5 max-w-[650px]">
                                    Judul KP: "{item.judulSkripsi}"
                                </p>
                            )}
                        </div>

                        {/* Solid Divider Line */}
                        <div className="w-full border-t-2 border-[#0F2137] mb-6" />

                        {/* SECTION 1: IDENTITAS PERUSAHAAN / INSTANSI MAGANG */}
                        <div className="mb-6 w-full">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A] mb-2.5">
                                IDENTITAS PERUSAHAAN / INSTANSI MAGANG
                            </h3>
                            <div className="border border-slate-300 rounded-none bg-white text-xs w-full">
                                <div className="grid grid-cols-2">
                                    {/* Row 1 Col 1 */}
                                    <div className="p-3 border-r border-b border-slate-300">
                                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                            NAMA PERUSAHAAN
                                        </span>
                                        <span className="font-bold text-slate-900 text-xs">
                                            {item.tempatKP?.namaPerusahaan || "-"}
                                        </span>
                                    </div>
                                    {/* Row 1 Col 2 */}
                                    <div className="p-3 border-b border-slate-300">
                                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                            TELEPON / FAX
                                        </span>
                                        <span className="font-semibold text-slate-800 text-xs">
                                            {item.tempatKP?.tlpFaxPerusahaan || "-"}
                                        </span>
                                    </div>
                                    {/* Row 2 Col 1 */}
                                    <div className="p-3 border-r border-slate-300">
                                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                            ALAMAT PERUSAHAAN
                                        </span>
                                        <span className="font-semibold text-slate-800 text-xs leading-normal block">
                                            {item.tempatKP?.alamatPerusahaan || "-"}
                                        </span>
                                    </div>
                                    {/* Row 2 Col 2 */}
                                    <div className="p-3">
                                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                            KONTAK PEMBIMBING LAPANGAN
                                        </span>
                                        <span className="font-semibold text-slate-800 text-xs">
                                            {item.tempatKP?.kontakPembimbing || "-"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: URAIAN KEGIATAN LOGBOOK KERJA PRAKTIK */}
                        <div className="mb-6 w-full">
                            <div className="flex justify-between items-center mb-2.5">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A]">
                                    URAIAN KEGIATAN LOGBOOK KERJA PRAKTIK
                                </h3>
                                <div className="bg-[#FFF9E6] text-[#B47818] border border-[#F6E095] px-3 py-1 rounded-sm text-[11px] font-semibold">
                                    Progres: {progressPercent}% ({totalApproved}/{totalLogbook} Disetujui)
                                </div>
                            </div>

                            <table className="w-full text-left border-collapse border border-slate-300 text-xs">
                                <thead>
                                    <tr className="bg-[#0F2137] text-white text-[10px] font-bold uppercase tracking-wider">
                                        <th className="py-2.5 px-2 text-center border-r border-[#1E3A5F] w-[40px]">NO</th>
                                        <th className="py-2.5 px-3 text-left border-r border-[#1E3A5F] w-[110px]">TANGGAL</th>
                                        <th className="py-2.5 px-4 text-left border-r border-[#1E3A5F]">URAIAN SINGKAT KEGIATAN</th>
                                        <th className="py-2.5 px-3 text-center border-r border-[#1E3A5F] w-[130px]">PARAF DOSEN</th>
                                        <th className="py-2.5 px-3 text-center w-[140px]">PARAF PEMBIMBING PERUSAHAAN</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(!item.logbooks || item.logbooks.length === 0) ? (
                                        <tr>
                                            <td colSpan={5} className="py-6 text-center border-b border-slate-300 text-slate-400 italic">
                                                Belum ada catatan logbook.
                                            </td>
                                        </tr>
                                    ) : (
                                        item.logbooks.map((l, lIdx) => {
                                            const dosenSig = l.dosenParaf || l.parafDosen || l.mahasiswaParaf || l.paraf || item.p1_paraf || item.dosenParaf;
                                            return (
                                                <tr key={l.id} className="border-b border-slate-200">
                                                    <td className="py-3 px-2 text-center border-r border-slate-200 font-medium text-slate-600">
                                                        {lIdx + 1}
                                                    </td>
                                                    <td className="py-3 px-3 border-r border-slate-200 font-medium text-slate-700 whitespace-nowrap">
                                                        {new Date(l.tanggalPukul).toLocaleDateString("id-ID", {
                                                            day: "numeric",
                                                            month: "short",
                                                            year: "numeric"
                                                        })}
                                                    </td>
                                                    <td className="py-3 px-4 border-r border-slate-200 text-slate-800 leading-normal">
                                                        {l.uraian}
                                                    </td>
                                                    <td className="py-3 px-3 border-r border-slate-200 text-center align-middle">
                                                        {dosenSig ? (
                                                            <img
                                                                src={dosenSig}
                                                                alt="Paraf Dosen"
                                                                className="h-12 w-auto max-w-[130px] mx-auto object-contain font-bold drop-shadow-md scale-110"
                                                            />
                                                        ) : null}
                                                    </td>
                                                    <td className="py-3 px-3 text-center align-middle">
                                                        {l.pembimbingParaf ? (
                                                            <img
                                                                src={l.pembimbingParaf}
                                                                alt="Paraf Pembimbing"
                                                                className="h-12 w-auto max-w-[130px] mx-auto object-contain font-bold drop-shadow-md scale-110"
                                                            />
                                                        ) : null}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* SECTION 3: LAPORAN EVALUASI & PENILAIAN AKHIR */}
                        <div className="mb-6 w-full">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A] mb-2.5">
                                LAPORAN EVALUASI & PENILAIAN AKHIR
                            </h3>

                            <div className="border border-slate-300 rounded-none bg-white text-xs w-full overflow-hidden">
                                {/* Table Header */}
                                <div className="grid grid-cols-12 bg-[#0F2137] text-white text-[10px] font-bold uppercase tracking-wider">
                                    <div className="col-span-5 py-2.5 px-4 text-left border-r border-[#1E3A5F]">
                                        NILAI PEMBIMBING (P1)
                                    </div>
                                    <div className="col-span-4 py-2.5 px-4 text-left border-r border-[#1E3A5F]">
                                        NILAI PENGUJI (P2)
                                    </div>
                                    <div className="col-span-3 py-2.5 px-4 text-left">
                                        HASIL AKHIR
                                    </div>
                                </div>

                                {/* Table Body */}
                                <div className="grid grid-cols-12 align-top">
                                    {/* Col 1: P1 */}
                                    <div className="col-span-5 p-4 border-r border-slate-300 flex flex-col justify-between">
                                        <div>
                                            <p className="text-xs text-slate-500 font-medium mb-3 truncate">
                                                {item.p1_nama || "-"}
                                            </p>

                                            <div className="grid grid-cols-3 gap-2 mb-4">
                                                <div className="bg-[#F8FAFC] border border-slate-200 p-2.5 text-center rounded-sm">
                                                    <span className="block text-[10px] font-semibold text-slate-400 mb-0.5">K1</span>
                                                    <span className="text-sm font-bold text-slate-800">{formatNilai(item.p1_k1, 0)}</span>
                                                </div>
                                                <div className="bg-[#F8FAFC] border border-slate-200 p-2.5 text-center rounded-sm">
                                                    <span className="block text-[10px] font-semibold text-slate-400 mb-0.5">K2</span>
                                                    <span className="text-sm font-bold text-slate-800">{formatNilai(item.p1_k2, 0)}</span>
                                                </div>
                                                <div className="bg-[#F8FAFC] border border-slate-200 p-2.5 text-center rounded-sm">
                                                    <span className="block text-[10px] font-semibold text-slate-400 mb-0.5">K3</span>
                                                    <span className="text-sm font-bold text-slate-800">{formatNilai(item.p1_k3, 0)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                TOTAL P1
                                            </span>
                                            <span className="text-lg font-bold text-[#0F2137]">
                                                {formatNilai(item.p1_total, 1)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Col 2: P2 */}
                                    <div className="col-span-4 p-4 border-r border-slate-300 flex flex-col justify-between">
                                        <div>
                                            <p className="text-xs text-slate-500 font-medium italic mb-3 truncate">
                                                {item.p2_nama || "Belum ditentukan"}
                                            </p>

                                            <div className="grid grid-cols-3 gap-2 mb-4">
                                                <div className="bg-[#F8FAFC] border border-slate-200 p-2.5 text-center rounded-sm">
                                                    <span className="block text-[10px] font-semibold text-slate-400 mb-0.5">K1</span>
                                                    <span className="text-sm font-bold text-slate-800">{formatNilai(item.p2_k1, 0)}</span>
                                                </div>
                                                <div className="bg-[#F8FAFC] border border-slate-200 p-2.5 text-center rounded-sm">
                                                    <span className="block text-[10px] font-semibold text-slate-400 mb-0.5">K2</span>
                                                    <span className="text-sm font-bold text-slate-800">{formatNilai(item.p2_k2, 0)}</span>
                                                </div>
                                                <div className="bg-[#F8FAFC] border border-slate-200 p-2.5 text-center rounded-sm">
                                                    <span className="block text-[10px] font-semibold text-slate-400 mb-0.5">K3</span>
                                                    <span className="text-sm font-bold text-slate-800">{formatNilai(item.p2_k3, 0)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                TOTAL P2
                                            </span>
                                            <span className="text-lg font-bold text-[#0F2137]">
                                                {formatNilai(item.p2_total, 1)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Col 3: Hasil Akhir */}
                                    <div className="col-span-3 p-4 flex flex-col justify-between">
                                        <div>
                                            <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block">
                                                NILAI TOTAL
                                            </span>
                                            <p className="text-2xl font-extrabold text-slate-900 mt-0.5 mb-2.5">
                                                {formatNilai(item.nilaiAkhir, 1)}
                                            </p>
                                        </div>

                                        <div className="border-t border-slate-200 pt-2 mb-2">
                                            <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block">
                                                GRADE
                                            </span>
                                            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">
                                                {getGrade(item.nilaiAkhir)}
                                            </p>
                                        </div>

                                        <div className="border-t border-slate-200 pt-2">
                                            <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block">
                                                TANGGAL SIDANG
                                            </span>
                                            <p className="text-xs font-bold text-slate-800 mt-0.5">
                                                {item.tanggalPenilaian
                                                    ? format(new Date(item.tanggalPenilaian), "dd MMM yyyy", { locale: localeId })
                                                    : "-"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 4: LEMBAR PENGESAHAN & TANDA TANGAN DOSEN PEMBIMBING */}
                        <div className="w-full grid grid-cols-2 gap-8 mt-6 mb-2 pt-4 border-t-2 border-slate-800 text-xs">
                            {/* Left: Pembimbing Perusahaan */}
                            <div className="flex flex-col items-center text-center">
                                <span className="text-slate-600 font-semibold mb-1">Pembimbing Lapangan Perusahaan,</span>
                                <div className="h-16 flex items-center justify-center my-1">
                                    {item.logbooks && item.logbooks.find(l => l.pembimbingParaf)?.pembimbingParaf ? (
                                        <img
                                            src={item.logbooks.find(l => l.pembimbingParaf)!.pembimbingParaf!}
                                            alt="TTD Pembimbing Lapangan"
                                            className="h-14 w-auto max-w-[150px] object-contain font-bold drop-shadow-md scale-110"
                                        />
                                    ) : null}
                                </div>
                                <span className="font-bold text-slate-900 mt-1">{item.tempatKP?.kontakPembimbing || "-"}</span>
                                <span className="text-[10px] text-slate-500 font-medium">Pembimbing Lapangan</span>
                            </div>

                            {/* Right: Dosen Pembimbing Utama */}
                            <div className="flex flex-col items-center text-center">
                                <span className="text-slate-600 font-semibold mb-1">Dosen Pembimbing Utama,</span>
                                <div className="h-16 flex items-center justify-center my-1">
                                    {item.p1_paraf || item.dosenParaf || (item.logbooks && item.logbooks.find(l => l.dosenParaf || l.parafDosen || l.mahasiswaParaf)?.mahasiswaParaf) ? (
                                        <img
                                            src={item.p1_paraf || item.dosenParaf || (item.logbooks && item.logbooks.find(l => l.dosenParaf || l.parafDosen || l.mahasiswaParaf)?.mahasiswaParaf)!}
                                            alt="TTD Dosen Pembimbing"
                                            className="h-14 w-auto max-w-[150px] object-contain font-bold drop-shadow-md scale-110"
                                        />
                                    ) : null}
                                </div>
                                <span className="font-bold text-slate-900 mt-1">{item.p1_nama || "-"}</span>
                                <span className="text-[10px] text-slate-500 font-medium">Dosen Pembimbing KP</span>
                            </div>
                        </div>

                        {/* Footer Section */}
                        <div className="w-full border-t border-slate-200 mt-6 pt-3 flex justify-between items-center text-[10px] text-slate-400">
                            <span>Dokumen resmi — Kerja Praktik Mahasiswa</span>
                            <span>TA {currentYear}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
