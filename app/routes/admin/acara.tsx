import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";
import { AcaraDesktop, AcaraMobile } from "~/features/acara";

export default function AcaraRoute() {
  const { isMobile } = useOutletContext<ContextType>();
  return isMobile ? <AcaraMobile title="Acara" /> : <AcaraDesktop title="Acara" />;
}
