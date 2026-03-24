import { useOutletContext } from "react-router";
import EditAccountDesktop from "~/features/admin/users/EditAccountDesktop";
import EditAccountMobile from "~/features/admin/users/EditAccountMobile";
import { useMediaQuery } from "~/hooks/useMediaQuery";

export default function EditAccountPage() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return isMobile ? <EditAccountMobile /> : <EditAccountDesktop />;
}
