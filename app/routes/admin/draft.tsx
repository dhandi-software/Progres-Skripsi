import { useOutletContext } from "react-router";
import { DraftDesktop } from "../../features/admin/draft";
import { DraftMobile } from "../../features/admin/draft";

export default function DraftPage() {
  const { isMobile } = useOutletContext<{ isMobile: boolean }>();
  return isMobile ? <DraftMobile /> : <DraftDesktop />;
}
