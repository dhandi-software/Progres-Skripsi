import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";
import { LoginDesktop, LoginMobile } from "~/features/login";
export default function Login() {
  const { isMobile } = useOutletContext<ContextType>();
  return isMobile ? <LoginMobile /> : <LoginDesktop />;
}
