import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";
import {ProfileMahasiswaDes}
import { PortfolioDesktop } from "~/features/mahasiswa/portfolio/PortfolioDesktop";
import { PortfolioMobile } from "~/features/mahasiswa/portfolio/PortfolioMobile";

export default function PortfolioRoute() {
  const { isMobile } = useOutletContext<ContextType>();
  return isMobile ? <PortfolioMobile /> : <PortfolioDesktop />;
}
