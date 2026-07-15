import {
    data,
    isRouteErrorResponse,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useLoaderData,
} from "react-router";
import { AlertCircle, Home } from "lucide-react";
import { UAParser } from "ua-parser-js";
import type { Route } from "./+types/root";
import { useChangeLanguage } from "remix-i18next/react";
import {
    getLocale,
    i18nextMiddleware,
    localeCookie,
} from "~/middleware/i18next";
import { useTranslation } from "react-i18next";
import { AuthProvider } from "~/context/AuthContext";
// Tambahkan import PasswordProvider
import { PasswordProvider } from "~/context/PasswordContext";

import "~/app.css";

export const unstable_middleware = [i18nextMiddleware];

export const links: Route.LinksFunction = () => [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
    },
    {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap",
    },
    { rel: "icon", href: "/logo_up.png" },
];

export async function loader({ context, request }: Route.LoaderArgs) {
    const locale = getLocale(context);
    const userAgent = request.headers.get("user-agent");
    const ua = new UAParser(userAgent || "");
    const isMobile = ua.getDevice().type === "mobile";
    return data(
        { locale, isMobile },
        { headers: { "Set-Cookie": await localeCookie.serialize(locale) } },
    );
}

export function Layout({ children }: { children: React.ReactNode }) {
    let { i18n } = useTranslation();
    return (
        <html lang={i18n.language} dir={i18n.dir(i18n.language)}>
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <title>Universitas Pancasila - Kerja Praktik</title>
                <link rel="icon" href="/logo_up.png?v=2" type="image/png" />
                <Meta />
                <Links />
            </head>
            <body>
                {/* <Header isMobile={isMobile} /> */}
                {children}
                {/* <Footer isMobile={isMobile} /> */}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export type ContextType = { isMobile: boolean | false };

export default function App() {
    const { isMobile, locale } = useLoaderData<typeof loader>();
    useChangeLanguage(locale);

    return (
        <AuthProvider>
            {/* Tambahkan PasswordProvider di sini */}
            <PasswordProvider>
                <Outlet context={{ isMobile } satisfies ContextType} />
            </PasswordProvider>
        </AuthProvider>
    );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    let message = "Mohon Maaf, Terjadi Kesalahan";
    let details = "Website sedang mengalami masalah. Tim kami sedang menanganinya.";
    let stack: string | undefined;

    if (isRouteErrorResponse(error)) {
        if (error.status === 404) {
            message = "Halaman Tidak Ditemukan";
            details = "Maaf, halaman yang Anda tuju tidak tersedia atau telah dipindahkan.";
        } else {
            message = `Error ${error.status}`;
            details = error.statusText || details;
        }
    } else if (import.meta.env.DEV && error && error instanceof Error) {
        details = error.message;
        stack = error.stack;
    }

    return (
        <main className="w-screen min-h-screen grid place-items-center bg-slate-50 p-4 font-geist" style={{ width: "100vw" }}>
            <div className="bg-white rounded-3xl p-8 text-center shadow-xl shadow-slate-200/50 border border-slate-100 mx-auto" style={{ width: "100%", maxWidth: "450px", minWidth: "320px" }}>
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 mb-3">{message}</h1>
                <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">
                    {details}
                </p>
                <div className="flex flex-col gap-3">
                    <a href="/" className="inline-flex items-center justify-center gap-2 bg-[#119DA4] hover:bg-[#0c7a80] text-white rounded-xl h-12 px-6 font-bold transition-all shadow-lg shadow-[#119DA4]/30">
                        <Home size={18} />
                        Kembali ke Beranda
                    </a>
                </div>
                {stack && (
                    <div className="mt-8 text-left">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Error Stack (Dev Only)</p>
                        <pre className="w-full p-4 bg-slate-900 text-red-400 rounded-xl overflow-x-auto text-[10px]">
                            <code>{stack}</code>
                        </pre>
                    </div>
                )}
            </div>
        </main>
    );
}
