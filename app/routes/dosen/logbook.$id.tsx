import { useOutletContext, useParams } from "react-router";
import type { ContextType } from "~/root";
import { LogbookDesktop, LogbookMobile } from "~/features/mahasiswa/logbook";

export default function LogbookIdRoute() {
  const { isMobile } = useOutletContext<ContextType>();
  const { id } = useParams();

  if (!id) return null;

  return isMobile ? (
    <LogbookMobile mahasiswaId={id} />
  ) : (
    <LogbookDesktop mahasiswaId={id} />
  );
}
