import { useOutletContext, useParams } from "react-router";
import type { ContextType } from "~/root";
import { PeninjauanDetailDesktop, PeninjauanDetailMobile } from "~/features/dosen/pengajuan";

// Minimal loader for React Router 7 Single Fetch to avoid turbo-stream decoding errors
export const loader = async () => {
    return { ok: true };
};

export default function PeninjauanDetailRoute() {
  const { isMobile } = useOutletContext<ContextType>();
  const { id } = useParams<{ id: string }>();
  
  return isMobile ? <PeninjauanDetailMobile id={id!} /> : <PeninjauanDetailDesktop id={id!} />;
}
