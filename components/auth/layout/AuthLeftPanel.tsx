import AuthLogo from "./AuthLogo";

interface AuthLeftPanelProps {
    badge: string;
    title: string;
    description: string;
}

export default function AuthLeftPanel({
    badge,
    title,
    description,
}: AuthLeftPanelProps) {
    return (
        <div className="relative hidden overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 lg:flex lg:flex-col lg:justify-between">

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,.12),transparent_45%)]" />

            <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

            <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

            <div className="relative p-10">
                <AuthLogo />

                <span className="mt-10 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-widest text-zinc-300">
                    {badge}
                </span>

                <h1 className="mt-8 text-5xl font-black leading-tight text-white">
                    {title}
                </h1>

                <p className="mt-6 max-w-md text-lg leading-8 text-zinc-400">
                    {description}
                </p>
            </div>

            <div className="relative p-10">
                <div className="rounded-3xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm">

                    <p className="text-sm font-semibold text-white">
                        Compra con confianza
                    </p>

                    <p className="mt-2 text-sm leading-7 text-zinc-400">
                        Guarda tus favoritos, consulta tus pedidos y administra
                        tu cuenta desde cualquier dispositivo.
                    </p>

                </div>
            </div>

        </div>
    );
}