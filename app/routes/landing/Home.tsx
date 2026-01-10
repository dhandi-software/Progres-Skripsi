import { getInstance } from "~/middleware/i18next";
import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";
import { HomeDesktop, HomeMobile } from "~/features/landing/home/pages";
import type { Route } from "./+types";
export async function loader({ context }: Route.LoaderArgs) {
    let i18next = getInstance(context);
    return {
        title: i18next.t("title"),
        description: i18next.t("description"),
    };
}

export default function Home({ loaderData }: Route.ComponentProps) {
    const { isMobile } = useOutletContext<ContextType>();
    return isMobile ? <HomeMobile /> : <HomeDesktop />;
}

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Kerja Praktek" },
        { name: "description", content: "Welcome to Kerja Praktek Teknik Informatika" },
    ];
}
