import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";
import { ProdiGuard } from "~/routes/ProdiGuard";
import { ProdiBimbingan, ProdiBimbinganMobile } from "~/features/dosen/prodi";

export default function ProdiBimbinganRoute() {
  const { isMobile } = useOutletContext<ContextType>();
  return (
    <ProdiGuard>
      {isMobile ? <ProdiBimbinganMobile /> : <ProdiBimbingan />}
    </ProdiGuard>
  );
}
