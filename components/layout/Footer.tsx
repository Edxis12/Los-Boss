import Link from "next/link";
import {
    Heart,
    Camera,
    MapPin,
    Package,
    ShieldCheck,
    ShoppingBag,
    Truck,
    UserRound,
} from "lucide-react";

const ENLACES_TIENDA = [
    { href: "/productos", label: "Catálogo" },
    { href: "/productos?isFeatured=true", label: "Destacados" },
    { href: "/favoritos", label: "Favoritos" },
    { href: "/carrito", label: "Carrito" },
];


const ENLACES_CUENTA = [
    { href: "/cuenta", label: "Mi cuenta" },
    { href: "/cuenta/pedidos", label: "Mis pedidos" },
    { href: "/cuenta/direcciones", label: "Mis direcciones" },
    { href: "/login", label: "Iniciar sesión" },
];

const BENEFICIOS = [
    {
        icon: ShieldCheck,
        title: "Productos originales",
        description: "Piezas seleccionadas y verificadas.",
    },
    {
        icon: Truck,
        title: "Envíos nacionales",
        description: "Entregas disponibles en todo México.",
    },
    {
        icon: Package,
        title: "Compra segura",
        description: "Seguimiento completo de cada pedido.",
    },
];

export default function Footer() {
    return (
        <footer className="border-t border-white/10 bg-[#050505]">
            <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
                <div className="grid gap-12 lg:grid-cols-[1.25fr_.75fr_.75fr]">
                    <div className="max-w-md">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-3"
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black">
                                <ShoppingBag size={20} />
                            </div>

                            <div>
                                <p className="font-display text-2xl leading-none text-white">
                                    LOS BOSS
                                </p>

                                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-600">
                                    Hype &amp; Luxury
                                </p>
                            </div>
                        </Link>

                        <p className="mt-6 text-sm leading-7 text-zinc-500">
                            Boutique de ropa y accesorios originales para quienes buscan
                            piezas con personalidad, presencia y estilo.
                        </p>

                        <div className="mt-6 flex items-center gap-2 text-sm text-zinc-500">
                            <MapPin size={16} className="shrink-0 text-zinc-400" />
                            Tuxtla Gutiérrez, Chiapas
                        </div>

                        <a
                            href="https://www.instagram.com/los_boss_tgz/?hl=es"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Instagram de Los Boss"
                            className="mt-6 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.025] text-zinc-400 transition hover:border-white/30 hover:bg-white/[0.06] hover:text-white"
                        >
                            <Camera size={18} />
                        </a>
                    </div>

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                            Tienda
                        </p>

                        <nav className="mt-5 space-y-3">
                            {ENLACES_TIENDA.map((enlace) => (
                                <Link
                                    key={enlace.href}
                                    href={enlace.href}
                                    className="block text-sm text-zinc-400 transition hover:translate-x-1 hover:text-white"
                                >
                                    {enlace.label}
                                </Link>
                            ))};
                        </nav>
                    </div>

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                            Tu cuenta
                        </p>

                        <nav className="mt-5 space-y-3">
                            {ENLACES_CUENTA.map((enlace) => (
                                <Link
                                    key={enlace.href}
                                    href={enlace.href}
                                    className="block text-sm text-zinc-400 transition hover:translate-x-1 hover:text-white"
                                >
                                    {enlace.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>

                <div className="mt-12 grid gap-4 border-t border-white/10 pt-8 md:grid-cols-3">
                    {BENEFICIOS.map((beneficio) => {
                        const Icon = beneficio.icon;

                        return (
                            <div
                                key={beneficio.title}
                                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-zinc-300">
                                    <Icon size={18} />
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-white">
                                        {beneficio.title}
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-zinc-600">
                                        {beneficio.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="border-t border-white/10 bg-black">
                <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-zinc-600 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
                    <p>
                        © {new Date().getFullYear()} Los Boss. Todos los derechos
                        reservados.
                    </p>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                        <span className="inline-flex items-center gap-1.5">
                            <Heart size={13} />
                            Diseñado para destacar
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                            <UserRound size={13} />
                            Atención personalizada
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    )
}