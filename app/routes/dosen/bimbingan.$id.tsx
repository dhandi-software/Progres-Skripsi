import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";
import { BimbinganDetailDesktop, BimbinganDetailMobile } from "~/features/dosen/bimbingan";

export default function BimbinganDetailRoute() {
  const { isMobile } = useOutletContext<ContextType>();
  return isMobile ? <BimbinganDetailMobile /> : <BimbinganDetailDesktop />;
}
