import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";
import { NavbarMobile } from "./NavbarMobile";
import { NavbarDesktop } from "./NavbarDesktop";

export default function Navbar() {
    const { isMobile } = useOutletContext<ContextType>();
    return isMobile ? <NavbarMobile /> : <NavbarDesktop />;
}
