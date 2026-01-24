import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";
import { PengajuanDesktop, PengajuanMobile } from "~/features/dosen/pengajuan";

export default function PengajuanRoute() {
  const { isMobile } = useOutletContext<ContextType>();
  return isMobile ? <PengajuanMobile title="Pengajuan" /> : <PengajuanDesktop title="Pengajuan" />;
}
