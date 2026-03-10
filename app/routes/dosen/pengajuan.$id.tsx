import { useOutletContext, useParams } from "react-router";
import type { ContextType } from "~/root";
import { PeninjauanDetailDesktop, PeninjauanDetailMobile } from "~/features/dosen/pengajuan";

export default function PengajuanDetailRoute() {
  const { isMobile } = useOutletContext<ContextType>();
  const { id } = useParams<{ id: string }>();
  
  return isMobile ? <PeninjauanDetailMobile id={id!} /> : <PeninjauanDetailDesktop id={id!} />;
}
