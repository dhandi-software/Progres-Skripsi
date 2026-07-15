import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";
import { CreateAcaraDesktop, CreateAcaraMobile } from "~/features/acara";

export default function CreateAcaraRoute() {
  const { isMobile } = useOutletContext<ContextType>();
  return isMobile ? <CreateAcaraMobile /> : <CreateAcaraDesktop />;
}
