import { useMediaQuery } from "~/hooks/useMediaQuery";
import { DirektoriDesktop } from "~/features/direktori/desktop/DirektoriDesktop";
import { DirektoriMobile } from "~/features/direktori/mobile/DirektoriMobile";

export default function Direktori() {
    const isDesktop = useMediaQuery("(min-width: 768px)");

    if (isDesktop) {
        return <DirektoriDesktop />;
    }

    return <DirektoriMobile />;
}
