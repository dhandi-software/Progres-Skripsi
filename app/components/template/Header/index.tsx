import HeaderMobile from "./HeaderMobile";
import HeaderDesktop from "./HeaderDesktop";

export default function Header({ isMobile }: { isMobile: boolean }) {
    return isMobile ? <HeaderMobile /> : <HeaderDesktop />
}