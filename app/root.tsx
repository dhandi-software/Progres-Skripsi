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
import { UAParser } from "ua-parser-js";
import type { Route } from "./+types/root";
import { useChangeLanguage } from "remix-i18next/react";
import {
    getLocale,
    i18nextMiddleware,
    localeCookie,
} from "~/middleware/i18next";
import { useTranslation } from "react-i18next";
import { MediaProvider as WriterMediaProvider } from "~/context/MediaContext";
import { MediaProvider as EditorMediaProvider } from "./features/Editor/media/MediaContext";
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
    let message = "Oops!";
    let details = "An unexpected error occurred.";
    let stack: string | undefined;

    if (isRouteErrorResponse(error)) {
        message = error.status === 404 ? "404" : "Error";
        details =
            error.status === 404
                ? "The requested page could not be found."
                : error.statusText || details;
    } else if (import.meta.env.DEV && error && error instanceof Error) {
        details = error.message;
        stack = error.stack;
    }

    return (
        <main className="pt-16 p-4 container mx-auto">
            <h1>{message}</h1>
            <p>{details}</p>
            {stack && (
                <pre className="w-full p-4 overflow-x-auto">
                    <code>{stack}</code>
                </pre>
            )}
        </main>
    );
}
