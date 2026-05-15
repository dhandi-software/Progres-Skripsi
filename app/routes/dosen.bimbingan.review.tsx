import { useOutletContext, useParams } from "react-router";
import type { ContextType } from "~/root";
import { BimbinganReviewDesktop } from "~/features/dosen/bimbingan/desktop/BimbinganReviewDesktop";
import { BimbinganReviewMobile } from "~/features/dosen/bimbingan/mobile/BimbinganReviewMobile";

export default function BimbinganReviewRoute() {
  const { isMobile } = useOutletContext<ContextType>();
  const { mahasiswaId, taskId } = useParams();

  if (!mahasiswaId || !taskId) {
    return <div className="p-8 text-center text-gray-500">Parameter tidak lengkap</div>;
  }

  return isMobile ? (
    <BimbinganReviewMobile mahasiswaId={parseInt(mahasiswaId)} taskId={parseInt(taskId)} />
  ) : (
    <BimbinganReviewDesktop mahasiswaId={parseInt(mahasiswaId)} taskId={parseInt(taskId)} />
  );
}
