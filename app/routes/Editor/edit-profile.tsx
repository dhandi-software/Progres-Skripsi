import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";

import EditProfileDesktop from "~/features/Editor/editor-profile/EditProfileDesktop";
import EditProfileMobile from "~/features/Editor/editor-profile/EditProfileMobile";

export default function EditProfile() {
    const { isMobile } = useOutletContext<ContextType>();
    return isMobile ? <EditProfileMobile /> : <EditProfileDesktop />;
}
