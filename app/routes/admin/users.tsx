import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";
import UserListDesktop from "~/features/admin/users/UserListDesktop";
import UserListMobile from "~/features/admin/users/UserListMobile";

export default function UsersRoute() {
  const { isMobile } = useOutletContext<ContextType>();
  return isMobile ? <UserListMobile /> : <UserListDesktop />;
}
