import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";
import { CreateNewsVideoDesktop, CreateNewsVideoMobile } from "~/features/admin/news-video";

export default function CreateNewsVideo() {
  const { isMobile } = useOutletContext<ContextType>();
  return isMobile ? <CreateNewsVideoMobile /> : <CreateNewsVideoDesktop />;
}
