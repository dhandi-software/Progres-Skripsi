import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";
import { LogbookDesktop, LogbookMobile } from "~/features/mahasiswa/logbook";

export default function LogbookRoute() {
  const { isMobile } = useOutletContext<ContextType>();
  return isMobile ? <LogbookMobile /> : <LogbookDesktop />;
}


