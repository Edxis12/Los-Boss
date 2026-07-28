import Link from "next/link";

interface AuthLogoProps {
    href?: string;
}

export default function AuthLogo({
    href = "/",
}: AuthLogoProps) {
    return (
        <Link
            href={href}
            className="inline-flex items-center gap-3"
        >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-lg font-black text-black shadow-lg">
                LB
            </div>

            <div>
                <p className="text-lg font-black tracking-wide text-white">
                    LOS BOSS
                </p>

                <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                    Fashion Store
                </p>
            </div>
        </Link>
    );
}