import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { LayoutDashboard, Package, ShoppingCart, Tag } from "lucide-react";

const ADMIN_LINKS = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Productos", href: "/admin/productos", icon: Package },
    { label: "Pedidos", href: "/admin/pedidos", icon: ShoppingCart },
    { label: "Categorías", href: "/admin/categorias", icon: Tag },
];

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // Proteccion': si no hay sesion, o el usuario no es ADMIN, lo mandamos fuera.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-black flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-zinc-800 p-6 hidden md:block">
                <p className="text-x1 font-bold text-white mb-1">LOS BOSS</p>
                <p className="text-xs text-zinc-500 mb-8">Panel administrativo</p>

                <nav className="flex flex-col gap-1">
                    {ADMIN_LINKS.map((link) => {
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white transition"
                            >
                                <Icon size={18} />
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                <Link
                    href="/"
                    className="block text-xs text-zinc-500 hover:text-zinc-300 mt-10"
                >
                    ← Volver a la tienda
                </Link>
            </aside>

            {/* Contenido */}
            <main className="flex-1 p-6 md:p-10 overflow-x-auto">{children}</main>
        </div>
    );
}