import { Outlet, useRouteLoaderData, useLocation } from "react-router";
import type { ContextType } from "~/root";
import Header from "~/components/template/Header";
import Footer from "~/components/template/footer";
import Navbar from "~/components/template/navbar";
import LandingChat from "~/components/template/LandingChat";

export default function LandingLayout() {
    const { isMobile } = useRouteLoaderData("root");
    const location = useLocation();

    // Hide navbar on article detail pages
    const isArticlePage = location.pathname.startsWith("/article/");

    return (
        <>
            <div className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all border-b border-border/40">
                <Header isMobile={isMobile} />
                {!isArticlePage && <Navbar />}
            </div>
            <main>
                <Outlet
                    context={{ isMobile: isMobile } satisfies ContextType}
                />
            </main>
            <Footer isMobile={isMobile} />
            <LandingChat />
        </>
    );
}
