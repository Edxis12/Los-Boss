import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Store,
    Tag,
} from "lucide-react";

const ADMIN_LINKS = [
    {
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Productos",
        href: "/admin/productos",
        icon: Package,
    },
    {
        label: "Pedidos",
        href: "/admin/pedidos",
        icon: ShoppingCart,
    },
    {
        label: "Categorías",
        href: "/admin/categorias",
        icon: Tag,
    },
];

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Navegación móvil */}
            <header className="sticky top-0 z-40 border-b border-zinc-800 bg-black/95 backdrop-blur md:hidden">
                <div className="flex items-center justify-between gap-4 px-4 py-4">
                    <div className="min-w-0">
                        <p className="truncate text-lg font-black tracking-tight text-white">
                            LOS BOSS
                        </p>

                        <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-600">
                            Administración
                        </p>
                    </div>

                    <Link
                        href="/"
                        aria-label="Volver a la tienda"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-zinc-400 transition hover:border-white/30 hover:bg-white/[0.05] hover:text-white"
                    >
                        <Store size={18} />
                    </Link>
                </div>

                <nav className="overflow-x-auto px-4 pb-3">
                    <div className="flex min-w-max gap-2">
                        {ADMIN_LINKS.map((link) => {
                            const Icon = link.icon;

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-4 text-sm font-medium text-zinc-300 transition hover:border-white/25 hover:bg-white/[0.06] hover:text-white"
                                >
                                    <Icon size={16} />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            </header>

            <div className="mx-auto flex min-h-screen w-full max-w-[1920px]">
                {/* Sidebar escritorio */}
                <aside className="hidden w-64 shrink-0 border-r border-zinc-800 bg-[#050505] p-6 md:flex md:flex-col lg:w-72 lg:p-8">
                    <div>
                        <p className="text-xl font-black tracking-tight text-white">
                            LOS BOSS
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                            Panel administrativo
                        </p>
                    </div>

                    <nav className="mt-8 flex flex-col gap-1.5">
                        {ADMIN_LINKS.map((link) => {
                            const Icon = link.icon;

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                                >
                                    <Icon size={18} className="shrink-0" />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-auto border-t border-zinc-800 pt-6">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-300"
                        >
                            <Store size={16} />
                            Volver a la tienda
                        </Link>
                    </div>
                </aside>

                {/* Contenido */}
                <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-10">
                    {children}
                </main>
            </div>
        </div>
    );
}