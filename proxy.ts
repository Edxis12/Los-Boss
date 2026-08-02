import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const RUTAS_CUENTA = [
    "/cuenta",
    "/checkout",
    "/favoritos",
];

function esRutaProtegida(pathname: string) {
    return RUTAS_CUENTA.some(
        (ruta) =>
            pathname === ruta ||
            pathname.startsWith(`${ruta}/`)
    );
}

export default auth((request) => {
    const { pathname, search } =
        request.nextUrl;

    const usuario = request.auth?.user;

    const estaAutenticado =
        Boolean(usuario);

    const role = (
        usuario as {
            role?: string;
        } | undefined
    )?.role;

    /*
     * Administración:
     * requiere sesión y rol ADMIN.
     */
    if (pathname.startsWith("/admin")) {
        if (!estaAutenticado) {
            const loginUrl = new URL(
                "/login",
                request.url
            );

            loginUrl.searchParams.set(
                "callbackUrl",
                `${pathname}${search}`
            );

            return NextResponse.redirect(
                loginUrl
            );
        }

        if (role !== "ADMIN") {
            return NextResponse.redirect(
                new URL("/", request.url)
            );
        }

        return NextResponse.next();
    }

    /*
     * Cuenta, favoritos y checkout:
     * requieren una sesión iniciada.
     */
    if (
        esRutaProtegida(pathname) &&
        !estaAutenticado
    ) {
        const loginUrl = new URL(
            "/login",
            request.url
        );

        loginUrl.searchParams.set(
            "callbackUrl",
            `${pathname}${search}`
        );

        return NextResponse.redirect(
            loginUrl
        );
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        "/admin/:path*",
        "/cuenta/:path*",
        "/checkout",
        "/favoritos",
    ],
};