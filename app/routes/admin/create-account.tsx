import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";
import { CreateAccountDesktop, CreateAccountMobile } from "~/features/admin/create-account";

export default function CreateAccountRoute() {
  const { isMobile } = useOutletContext<ContextType>();
  return isMobile ? <CreateAccountMobile /> : <CreateAccountDesktop />;
}
