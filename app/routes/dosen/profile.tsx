import { useOutletContext } from "react-router";
import ProfileDosenDesktop from "~/features/dosen/profile/ProfileDosenDesktop";

export default function ProfileDosenRoute() {
    const { isMobile } = useOutletContext<{ isMobile: boolean }>();
    
    // For now we use the desktop-optimized premium view even on mobile
    // as it uses responsive Tailwind classes.
    return <ProfileDosenDesktop />;
}
