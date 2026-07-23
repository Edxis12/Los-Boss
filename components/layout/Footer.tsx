import Link from "next/link";
import {
    Camera,
    Heart,
    MapPin,
    Package,
    ShieldCheck,
    ShoppingBag,
    Truck,
    UserRound,
} from "lucide-react";

const ENLACES_TIENDA = [
    { href: "/productos", label: "Catálogo" },
    { href: "/productos?destacados=true", label: "Destacados" },
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
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_.7fr_.7fr] lg:gap-14">
                    {/* Marca */}
                    <div className="sm:col-span-2 lg:col-span-1">
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

                        <p className="mt-5 max-w-md text-sm leading-7 text-zinc-500 sm:mt-6">
                            Boutique de ropa y accesorios originales para quienes
                            buscan piezas con personalidad, presencia y estilo.
                        </p>

                        <div className="mt-5 flex items-start gap-2 text-sm text-zinc-500 sm:mt-6">
                            <MapPin
                                size={16}
                                className="mt-0.5 shrink-0 text-zinc-400"
                            />
                            <span>Tuxtla Gutiérrez, Chiapas</span>
                        </div>

                        <a
                            href="https://www.instagram.com/los_boss_tgz/?hl=es"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Instagram de Los Boss"
                            className="mt-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.025] text-zinc-400 transition hover:border-white/30 hover:bg-white/[0.06] hover:text-white sm:mt-6"
                        >
                            <Camera size={18} />
                        </a>
                    </div>

                    {/* Tienda */}
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                            Tienda
                        </p>

                        <nav className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3 sm:mt-5 sm:block sm:space-y-3">
                            {ENLACES_TIENDA.map((enlace) => (
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

                    {/* Cuenta */}
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                            Tu cuenta
                        </p>

                        <nav className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3 sm:mt-5 sm:block sm:space-y-3">
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

                {/* Beneficios */}
                <div className="mt-10 grid gap-3 border-t border-white/10 pt-7 sm:mt-12 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
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

                                <div className="min-w-0">
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

            {/* Barra inferior */}
            <div className="border-t border-white/10 bg-black">
                <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-4 py-5 text-xs text-zinc-600 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
                    <p className="leading-5">
                        © {new Date().getFullYear()} Los Boss. Todos los derechos
                        reservados.
                    </p>

                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
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
    );
}