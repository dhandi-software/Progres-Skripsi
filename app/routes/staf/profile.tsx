import { useOutletContext } from "react-router";
import ProfileStafDesktop from "~/features/staf/profile/ProfileStafDesktop";

export default function ProfileStafRoute() {
    const { isMobile } = useOutletContext<{ isMobile: boolean }>();
    
    // Using responsive desktop view for consistent experience
    return <ProfileStafDesktop />;
}
