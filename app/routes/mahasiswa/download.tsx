import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";
import { DownloadDesktop, DownloadMobile } from "~/features/mahasiswa/download";

export default function DownloadRoute() {
  const { isMobile } = useOutletContext<ContextType>();
  return isMobile ? <DownloadMobile title="Download" /> : <DownloadDesktop title="Download" />;
}

