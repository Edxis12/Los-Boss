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

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,.08),transparent_45%)]" />

            <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-white/5 blur-[160px]" />

            <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-6 py-10 lg:grid-cols-2">

                <AuthLeftPanel
                    badge={badge}
                    title={title}
                    description={description}
                />

                <div className="flex justify-center">
                    {children}
                </div>

            </div>

        </main>
    );
}