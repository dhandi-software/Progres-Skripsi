import { useOutletContext } from "react-router";
import { ManageAccountDesktop, ManageAccountMobile } from "~/features/admin/manage-account";

export default function ManageAccountRoute() {
  const { isMobile } = useOutletContext<{ isMobile: boolean }>();

  return isMobile ? <ManageAccountMobile /> : <ManageAccountDesktop />;
}
