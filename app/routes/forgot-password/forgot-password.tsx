import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";
import { ForgotPasswordDesktop, ForgotPasswordMobile } from "~/features/login";

export default function ForgotPassword() {
  const { isMobile } = useOutletContext<ContextType>();
  return isMobile ? <ForgotPasswordMobile /> : <ForgotPasswordDesktop />;
}
