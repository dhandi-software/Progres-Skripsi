import { Outlet, useRouteLoaderData, useLocation } from "react-router";
import type { ContextType } from "~/root";
import Header from "~/components/template/Header";
import Footer from "~/components/template/footer";
import Navbar from "~/components/template/navbar";

export default function LandingLayout() {
    const { isMobile } = useRouteLoaderData("root");
    const location = useLocation();

    // Hide navbar on article detail pages
    const isArticlePage = location.pathname.startsWith("/article/");

    return (
        <>
            <Header isMobile={isMobile} />
            {!isArticlePage && <Navbar />}
            <main>
                <Outlet
                    context={{ isMobile: isMobile } satisfies ContextType}
                />
            </main>
            <Footer isMobile={isMobile} />
        </>
    );
}
