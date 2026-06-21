import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";
import { SanksiDesktop, SanksiMobile } from "~/features/dosen/sanksi";

export default function SanksiRoute() {
  const { isMobile } = useOutletContext<ContextType>();
  return isMobile ? (
    <SanksiMobile title="Manajemen Sanksi Administrasi" />
  ) : (
    <SanksiDesktop title="Manajemen Sanksi Administrasi" />
  );
}
