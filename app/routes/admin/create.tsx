import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";
import CreateNewsVideoDesktop from "~/features/admin/news-video/CreateNewsVideoDesktop";
import CreateNewsVideoMobile from "~/features/admin/news-video/CreateNewsVideoMobile";

export default function CreateNewsVideo() {
  const { isMobile } = useOutletContext<ContextType>();
  return isMobile ? <CreateNewsVideoMobile /> : <CreateNewsVideoDesktop />;
}
