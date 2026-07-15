import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";
import { SanksiDesktop, SanksiMobile } from "~/features/mahasiswa/sanksi";

export default function SanksiRoute() {
  const { isMobile } = useOutletContext<ContextType>();
  return isMobile ? <SanksiMobile title="Sanksi Administrasi" /> : <SanksiDesktop title="Sanksi Administrasi" />;
}
