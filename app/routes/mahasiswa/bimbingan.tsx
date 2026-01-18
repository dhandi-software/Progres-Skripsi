import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";
import { BimbinganDesktop, BimbinganMobile } from "~/features/mahasiswa/bimbingan";

export default function BimbinganRoute() {
  const { isMobile } = useOutletContext<ContextType>();
  return isMobile ? <BimbinganMobile title="Bimbingan" /> : <BimbinganDesktop title="Bimbingan" />;
}

