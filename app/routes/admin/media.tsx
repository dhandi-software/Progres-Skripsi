import { useOutletContext } from "react-router";
import { MediaDesktop, MediaMobile } from "~/features/admin/media";

export default function MediaPage() {
  const { isMobile } = useOutletContext<{ isMobile: boolean }>();
  return isMobile ? <MediaMobile /> : <MediaDesktop />;
}
