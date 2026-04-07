import { ProdiGuard } from "~/routes/ProdiGuard";
import { ProdiBimbingan } from "~/features/dosen/prodi/ProdiBimbingan";

export default function ProdiBimbinganRoute() {
  return (
    <ProdiGuard>
      <ProdiBimbingan />
    </ProdiGuard>
  );
}
