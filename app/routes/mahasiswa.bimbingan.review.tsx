import { useOutletContext, useParams } from "react-router";
import type { ContextType } from "~/root";
import { MahasiswaBimbinganReviewDesktop } from "~/features/mahasiswa/bimbingan/MahasiswaBimbinganReviewDesktop";
import { MahasiswaBimbinganReviewMobile } from "~/features/mahasiswa/bimbingan/MahasiswaBimbinganReviewMobile";

export default function MahasiswaBimbinganReviewRoute() {
  const { isMobile } = useOutletContext<ContextType>();
  const { taskId } = useParams();

  if (!taskId) {
    return <div className="p-8 text-center text-gray-500">Parameter tidak lengkap</div>;
  }

  return isMobile ? (
    <MahasiswaBimbinganReviewMobile taskId={parseInt(taskId)} />
  ) : (
    <MahasiswaBimbinganReviewDesktop taskId={parseInt(taskId)} />
  );
}
