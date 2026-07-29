import ResetPasswordForm from "@/components/auth/forms/ResetPasswordForm";

export default function ResetPasswordPage() {
    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-10 sm:px-6">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,.08),transparent_60%)]" />

            <div className="relative flex w-full justify-center">
                <ResetPasswordForm />
            </div>
        </main>
    );
}