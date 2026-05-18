import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";
import { SidangDesktop, SidangMobile } from "~/features/mahasiswa/sidang";

export default function SidangRoute() {
  const { isMobile } = useOutletContext<ContextType>();
  return isMobile ? <SidangMobile title="Jadwal Sidang" /> : <SidangDesktop title="Jadwal Sidang" />;
}
