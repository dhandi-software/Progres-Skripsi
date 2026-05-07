import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";
import { CreateDownloadDesktop, CreateDownloadMobile } from "~/features/dosen/download";

export default function CreateDownloadRoute() {
  const { isMobile } = useOutletContext<ContextType>();
  return isMobile ? <CreateDownloadMobile /> : <CreateDownloadDesktop />;
}
