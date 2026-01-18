import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";
import { PenilaianDesktop, PenilaianMobile } from "~/features/mahasiswa/penilaian";

export default function PenilaianRoute() {
  const { isMobile } = useOutletContext<ContextType>();
  return isMobile ? <PenilaianMobile title="Penilaian" /> : <PenilaianDesktop title="Penilaian" />;
}

