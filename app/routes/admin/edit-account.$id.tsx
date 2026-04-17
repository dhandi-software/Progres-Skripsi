import { useOutletContext } from "react-router";
import { EditAccountDesktop, EditAccountMobile } from "~/features/admin/users";
import { useMediaQuery } from "~/hooks/useMediaQuery";

export default function EditAccountPage() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return isMobile ? <EditAccountMobile /> : <EditAccountDesktop />;
}
