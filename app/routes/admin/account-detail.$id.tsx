import { useOutletContext } from "react-router";
import { AccountDetailDesktop, AccountDetailMobile } from "~/features/admin/manage-account";

export default function AccountDetailRoute() {
  const { isMobile } = useOutletContext<{ isMobile: boolean }>();

  return isMobile ? <AccountDetailMobile /> : <AccountDetailDesktop />;
}
