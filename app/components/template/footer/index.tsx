import FooterDesktop from "./FooterDesktop";
import FooterMobile from "././FooterMobile";
export default function Footer({ isMobile = false }: { isMobile?: boolean }) {
    return isMobile ? <FooterMobile /> : <FooterDesktop />
}