import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";
import { UserListDesktop, UserListMobile } from "~/features/admin/users";

export default function UsersRoute() {
  const { isMobile } = useOutletContext<ContextType>();
  return isMobile ? <UserListMobile /> : <UserListDesktop />;
}
