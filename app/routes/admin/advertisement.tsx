import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";
import { AdsManagementDesktop } from "~/features/admin/ads-management/AdsManagementDesktop";
import { AdsManagementMobile } from "~/features/admin/ads-management/AdsManagementMobile";

export default function AdvertisementRoute() {
  const { isMobile } = useOutletContext<ContextType>();
  return isMobile ? <AdsManagementMobile /> : <AdsManagementDesktop />;
}