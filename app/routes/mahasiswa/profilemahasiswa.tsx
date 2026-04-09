import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";
import { ProfileMahasiswaDesktop, ProfileMahasiswaMobile } from "~/features/mahasiswa/profilemahasiswa";

export default function ProfileMahasiswaRoute() {
  const { isMobile } = useOutletContext<ContextType>();
  return isMobile ? <ProfileMahasiswaMobile /> : <ProfileMahasiswaDesktop />;
}
