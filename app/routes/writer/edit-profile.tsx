import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";

import EditProfileDesktop from "~/features/writer/edit-profile/EditProfileDesktop";
import EditProfileMobile from "~/features/writer/edit-profile/EditProfileMobile";

export default function EditProfile() {
    const { isMobile } = useOutletContext<ContextType>();
    return isMobile ? <EditProfileMobile /> : <EditProfileDesktop />;
}
