import { ProdiGuard } from "~/routes/ProdiGuard";
import { ProdiSidang } from "~/features/dosen/prodi/ProdiSidang";

export default function ProdiSidangRoute() {
  return (
    <ProdiGuard>
      <ProdiSidang />
    </ProdiGuard>
  );
}
