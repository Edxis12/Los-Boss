import { ReactNode } from "react";
import AuthLeftPanel from "./AuthLeftPanel";

interface AuthLayoutProps {
    badge: string;
    title: string;
    description: string;
    children: ReactNode;
}

export default function AuthLayout({
    badge,
    title,
    description,
    children,
}: AuthLayoutProps) {
    return (
        <main className="relative min-h-screen overflow-hidden bg-black">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-white/[0.045] blur-[140px]" />

                <div className="absolute bottom-0 right-0 h-[340px] w-[340px] rounded-full bg-white/[0.025] blur-[120px]" />

                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:42px_42px]" />
            </div>

            <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
                <div className="grid w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b] shadow-[0_40px_120px_rgba(0,0,0,.7)] min-[430px]:rounded-3xl lg:grid-cols-[0.9fr_1.1fr]">
                    <AuthLeftPanel
                        badge={badge}
                        title={title}
                        description={description}
                    />

                    <section className="flex items-center justify-center p-4 min-[430px]:p-6 sm:p-10 lg:p-14 xl:p-20">
                        {children}
                    </section>
                </div>
            </div>
        </main>
    );
}