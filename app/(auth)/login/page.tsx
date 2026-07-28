"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        const isNotVerified =
          result.error.includes("EMAIL_NOT_VERIFIED") ||
          result.code === "EMAIL_NOT_VERIFIED";

        if (isNotVerified) {
          setError(
            "Debes verificar tu correo electrónico antes de iniciar sesión."
          );
          setLoading(false);
          return;
        }

        setError("El correo o la contraseña son incorrectos.");
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("No fue posible iniciar sesión. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setGoogleLoading(true);

    await signIn("google", {
      callbackUrl: "/",
    });
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-white/[0.045] blur-[140px]" />

        <div className="absolute bottom-0 right-0 h-[340px] w-[340px] rounded-full bg-white/[0.025] blur-[120px]" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:42px_42px]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b] shadow-[0_40px_120px_rgba(0,0,0,.7)] min-[430px]:rounded-3xl lg:grid-cols-[0.9fr_1.1fr]">
          {/* Panel de presentación */}
          <section className="relative hidden min-h-[680px] overflow-hidden border-r border-white/10 bg-[#080808] p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-28 top-20 h-80 w-80 rounded-full border border-white/[0.06]" />

              <div className="absolute -left-10 top-40 h-56 w-56 rounded-full border border-white/[0.05]" />

              <div className="absolute bottom-[-120px] right-[-80px] h-96 w-96 rounded-full bg-white/[0.035] blur-3xl" />
            </div>

            <div className="relative">
              <Link
                href="/"
                className="inline-flex items-center gap-3 text-white"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sm font-black text-black">
                  LB
                </span>

                <span className="text-xl font-black tracking-[-0.04em]">
                  LOS BOSS
                </span>
              </Link>
            </div>

            <div className="relative max-w-lg">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                <Sparkles size={14} className="text-zinc-300" />

                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                  Tu estilo, tu cuenta
                </span>
              </div>

              <h2 className="mt-7 text-5xl font-black leading-[0.95] tracking-[-0.055em] text-white xl:text-6xl">
                Todo lo que te gusta,
                <span className="block text-zinc-500">
                  en un solo lugar.
                </span>
              </h2>

              <p className="mt-6 max-w-md text-base leading-7 text-zinc-500">
                Accede a tus pedidos, direcciones, favoritos y
                carrito desde una experiencia diseñada para ti.
              </p>
            </div>

            <div className="relative grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <ShieldCheck
                  size={21}
                  className="text-zinc-300"
                />

                <p className="mt-4 text-sm font-bold text-white">
                  Acceso seguro
                </p>

                <p className="mt-1 text-xs leading-5 text-zinc-600">
                  Tu información permanece protegida.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <Sparkles
                  size={21}
                  className="text-zinc-300"
                />

                <p className="mt-4 text-sm font-bold text-white">
                  Compra más rápido
                </p>

                <p className="mt-1 text-xs leading-5 text-zinc-600">
                  Guarda favoritos, pedidos y direcciones.
                </p>
              </div>
            </div>
          </section>

          {/* Formulario */}
          <section className="flex items-center justify-center p-4 min-[430px]:p-6 sm:p-10 lg:p-14 xl:p-20">
            <div className="w-full max-w-md">
              <Link
                href="/"
                className="mb-10 inline-flex items-center gap-3 text-white lg:hidden"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xs font-black text-black">
                  LB
                </span>

                <span className="text-lg font-black tracking-[-0.04em]">
                  LOS BOSS
                </span>
              </Link>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-zinc-500">
                  Bienvenido de nuevo
                </p>

                <h1 className="mt-3 text-[32px] font-black tracking-[-0.045em] text-white min-[430px]:text-4xl sm:text-5xl">
                  Inicia sesión
                </h1>

                <p className="mt-2 text-sm leading-6 text-zinc-500 sm:mt-3 sm:text-base sm:leading-7">
                  Ingresa tus datos para acceder a tu cuenta de
                  Los Boss.
                </p>
              </div>

              {error && (
                <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                  <p className="text-sm text-red-300">
                    {error}
                  </p>

                  {error.includes("verificar tu correo") && (
                    <Link
                      href={`/reenviar-verificacion?email=${encodeURIComponent(email)}`}
                      className="mt-4 inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
                    >
                      Reenviar correo de verificación
                    </Link>
                  )}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="mt-7 space-y-5 sm:mt-8"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-zinc-300"
                  >
                    Correo electrónico
                  </label>

                  <div className="relative mt-2">
                    <Mail
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                    />

                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      placeholder="tu@correo.com"
                      className="h-14 w-full rounded-xl border border-white/10 bg-black/30 pl-11 pr-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-white focus:ring-4 focus:ring-white/10"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-4">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-zinc-300"
                    >
                      Contraseña
                    </label>

                    <Link
                      href="/recuperar-password"
                      className="text-xs font-medium text-zinc-500 transition hover:text-white"
                    >
                      ¿La olvidaste?
                    </Link>
                  </div>

                  <div className="relative mt-2">
                    <LockKeyhole
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                    />

                    <input
                      id="password"
                      type={
                        mostrarPassword
                          ? "text"
                          : "password"
                      }
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="••••••••"
                      className="h-14 w-full rounded-xl border border-white/10 bg-black/30 pl-11 pr-12 text-white outline-none transition placeholder:text-zinc-700 focus:border-white focus:ring-4 focus:ring-white/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setMostrarPassword(
                          (valor) => !valor
                        )
                      }
                      aria-label={
                        mostrarPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                      className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/[0.05] hover:text-white"
                    >
                      {mostrarPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-black shadow-[0_18px_40px_rgba(255,255,255,.12)] transition-all hover:-translate-y-0.5 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:min-h-14 sm:rounded-2xl sm:text-base"
                >
                  {loading
                    ? "Iniciando sesión..."
                    : "Iniciar sesión"}

                  {!loading && (
                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  )}
                </button>
              </form>

              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-white/10" />

                <span className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-600">
                  o continúa con
                </span>

                <div className="h-px flex-1 bg-white/10" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading || googleLoading}
                className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-6 text-sm font-semibold text-zinc-200 transition hover:border-white/25 hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-14 sm:rounded-2xl"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-black text-black">
                  G
                </span>

                {googleLoading
                  ? "Conectando con Google..."
                  : "Continuar con Google"}
              </button>

              <p className="mt-8 text-center text-sm leading-6 text-zinc-500">
                ¿Todavía no tienes una cuenta?{" "}
                <Link
                  href="/registro"
                  className="font-semibold text-white underline decoration-white/30 underline-offset-4 transition hover:decoration-white"
                >
                  Crear cuenta
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}