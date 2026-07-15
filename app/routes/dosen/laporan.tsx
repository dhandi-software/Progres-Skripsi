import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";
import { LaporanDesktop, LaporanMobile } from "~/features/dosen/laporan";

export function meta() {
    return [
        { title: "Laporan Akhir - Dosen | Skripsi" },
        { name: "description", content: "Laporan akhir mahasiswa bimbingan" },
    ];
}

export default function LaporanRoute() {
    const { isMobile } = useOutletContext<ContextType>();
    return isMobile 
        ? <LaporanMobile title="Laporan Akhir Bimbingan" /> 
        : <LaporanDesktop title="Laporan Akhir Bimbingan" />;
}
