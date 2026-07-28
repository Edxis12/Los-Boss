"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, MapPin } from "lucide-react";
import { City, State as CountryState } from "country-state-city";
import { crearDireccion } from "@/lib/actions/address-actions";

export default function NuevaDireccionPage() {
    const router = useRouter();

    const [label, setLabel] = useState("");
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [street, setStreet] = useState("");
    const [stateCode, setStateCode] = useState("");
    const [stateValue, setStateValue] = useState("");
    const [city, setCity] = useState("");
    const [postalCode, setPostalCode] = useState("");

    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");

    const estadosMexico = useMemo(() => {
        return CountryState.getStatesOfCountry("MX").sort((a, b) =>
            a.name.localeCompare(b.name, "es")
        );
    }, []);

    const ciudadesEstado = useMemo(() => {
        if (!stateCode) return [];

        return City.getCitiesOfState("MX", stateCode).sort((a, b) =>
            a.name.localeCompare(b.name, "es")
        );
    }, [stateCode]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (phone.length !== 10) {
            setError("El teléfono debe contener exactamente 10 números");
            return;
        }

        if (postalCode.length !== 5) {
            setError("El código postal debe contener exactamente 5 números");
            return;
        }

        if (
            !fullName.trim() ||
            !street.trim() ||
            !stateValue ||
            !city ||
            !postalCode
        ) {
            setError("Completa todos los campos requeridos");
            return;
        }

        setGuardando(true);

        const resultado = await crearDireccion({
            label,
            fullName,
            phone,
            street,
            city,
            state: stateValue,
            postalCode,
        });

        setGuardando(false);

        if (resultado.error) {
            setError(resultado.error);
            return;
        }

        router.push("/cuenta/direcciones");
        router.refresh();
    }

    return (
        <main className="min-h-screen bg-black">
            <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
                <Link
                    href="/cuenta/direcciones"
                    className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
                >
                    <ArrowLeft size={16} />
                    Volver a mis direcciones
                </Link>

                <div className="mt-5 sm:mt-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-zinc-500">
                        Tu cuenta
                    </p>

                    <h1 className="mt-3 text-[30px] font-black tracking-tight text-white min-[430px]:text-4xl sm:text-5xl">
                        Nueva dirección
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 sm:mt-3 sm:text-base sm:leading-7">
                        Guarda una dirección para completar tus compras más rápido.
                        La primera dirección se establecerá automáticamente como
                        principal.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="mt-8 space-y-7 rounded-2xl border border-white/10 bg-[#0d0d0d] p-4 shadow-[0_30px_80px_rgba(0,0,0,.35)] min-[430px]:rounded-3xl min-[430px]:p-5"
                >
                    <div className="flex items-start gap-3 sm:gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-black sm:h-11 sm:w-11">
                            <MapPin size={20} />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-white min-[430px]:text-xl sm:text-2xl">
                                Datos de entrega
                            </h2>

                            <p className="mt-1 text-sm text-zinc-500">
                                Ingresa la información de la persona que recibirá
                                los pedidos.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                            <p className="text-sm text-red-300">{error}</p>
                        </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                        <div className="sm:col-span-2">
                            <label className="text-sm font-medium text-zinc-300">
                                Nombre de la dirección
                            </label>

                            <input
                                type="text"
                                value={label}
                                onChange={(event) => setLabel(event.target.value)}
                                maxLength={40}
                                placeholder="Ej. Casa, Trabajo, Oficina"
                                className="
                                    mt-2
                                    h-14
                                    w-full
                                    rounded-xl
                                    border
                                    border-white/10
                                    bg-black/30
                                    px-4
                                    text-white
                                    outline-none
                                    transition
                                    placeholder:text-zinc-700
                                    focus:border-white
                                    focus:ring-4
                                    focus:ring-white/10
                                "
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="text-sm font-medium text-zinc-300">
                                Nombre completo
                            </label>

                            <input
                                type="text"
                                required
                                autoComplete="name"
                                value={fullName}
                                onChange={(event) =>
                                    setFullName(event.target.value)
                                }
                                placeholder="Nombre de quien recibe"
                                className="
                                    mt-2
                                    h-14
                                    w-full
                                    rounded-xl
                                    border
                                    border-white/10
                                    bg-black/30
                                    px-4
                                    text-white
                                    outline-none
                                    transition
                                    placeholder:text-zinc-700
                                    focus:border-white
                                    focus:ring-4
                                    focus:ring-white/10
                                "
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="text-sm font-medium text-zinc-300">
                                Teléfono
                            </label>

                            <input
                                type="tel"
                                required
                                inputMode="numeric"
                                autoComplete="tel"
                                minLength={10}
                                maxLength={10}
                                pattern="[0-9]{10}"
                                value={phone}
                                onChange={(event) => {
                                    const soloNumeros = event.target.value
                                        .replace(/\D/g, "")
                                        .slice(0, 10);

                                    setPhone(soloNumeros);
                                }}
                                placeholder="6671234567"
                                className="
                                    mt-2
                                    h-14
                                    w-full
                                    rounded-xl
                                    border
                                    border-white/10
                                    bg-black/30
                                    px-4
                                    text-white
                                    outline-none
                                    transition
                                    placeholder:text-zinc-700
                                    focus:border-white
                                    focus:ring-4
                                    focus:ring-white/10
                                "
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="text-sm font-medium text-zinc-300">
                                Calle, número y colonia
                            </label>

                            <input
                                type="text"
                                required
                                autoComplete="street-address"
                                value={street}
                                onChange={(event) =>
                                    setStreet(event.target.value)
                                }
                                placeholder="Ej. Av. Central 123, Col. Centro"
                                className="
                                    mt-2
                                    h-14
                                    w-full
                                    rounded-xl
                                    border
                                    border-white/10
                                    bg-black/30
                                    px-4
                                    text-white
                                    outline-none
                                    transition
                                    placeholder:text-zinc-700
                                    focus:border-white
                                    focus:ring-4
                                    focus:ring-white/10
                                "
                            />
                        </div>

                        <div className="min-w-0">
                            <label className="text-sm font-medium text-zinc-300">
                                Estado
                            </label>

                            <select
                                required
                                value={stateCode}
                                onChange={(event) => {
                                    const codigo = event.target.value;

                                    const estadoSeleccionado =
                                        estadosMexico.find(
                                            (estado) =>
                                                estado.isoCode === codigo
                                        );

                                    setStateCode(codigo);
                                    setStateValue(
                                        estadoSeleccionado?.name ?? ""
                                    );
                                    setCity("");
                                }}
                                className="
                                    mt-2
                                    h-14
                                    w-full
                                    truncate
                                    rounded-xl
                                    border
                                    border-white/10
                                    bg-[#090909]
                                    px-4
                                    text-white
                                    outline-none
                                    transition
                                    focus:border-white
                                    focus:ring-4
                                    focus:ring-white/10
                                "
                            >
                                <option value="">
                                    Selecciona un estado
                                </option>

                                {estadosMexico.map((estado) => (
                                    <option
                                        key={estado.isoCode}
                                        value={estado.isoCode}
                                    >
                                        {estado.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="min-w-0">
                            <label className="text-sm font-medium text-zinc-300">
                                Ciudad
                            </label>

                            <select
                                required
                                value={city}
                                disabled={!stateCode}
                                onChange={(event) =>
                                    setCity(event.target.value)
                                }
                                className="
                                    mt-2
                                    h-14
                                    w-full
                                    truncate
                                    rounded-xl
                                    border
                                    border-white/10
                                    bg-[#090909]
                                    px-4
                                    text-white
                                    outline-none
                                    transition
                                    focus:border-white
                                    focus:ring-4
                                    focus:ring-white/10
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                "
                            >
                                <option value="">
                                    {stateCode
                                        ? "Selecciona una ciudad"
                                        : "Primero selecciona un estado"}
                                </option>

                                {ciudadesEstado.map((ciudad, index) => (
                                    <option
                                        key={`${ciudad.name}-${index}`}
                                        value={ciudad.name}
                                    >
                                        {ciudad.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="text-sm font-medium text-zinc-300">
                                Código postal
                            </label>

                            <input
                                type="text"
                                required
                                inputMode="numeric"
                                autoComplete="postal-code"
                                minLength={5}
                                maxLength={5}
                                value={postalCode}
                                onChange={(event) => {
                                    const soloNumeros = event.target.value
                                        .replace(/\D/g, "")
                                        .slice(0, 5);

                                    setPostalCode(soloNumeros);
                                }}
                                placeholder="80000"
                                className="
                                    mt-2
                                    h-14
                                    w-full
                                    rounded-xl
                                    border
                                    border-white/10
                                    bg-black/30
                                    px-4
                                    text-white
                                    outline-none
                                    transition
                                    placeholder:text-zinc-700
                                    focus:border-white
                                    focus:ring-4
                                    focus:ring-white/10
                                "
                            />
                        </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4 sm:rounded-2xl sm:p-5">
                        <div className="flex items-start gap-3">
                            <CheckCircle2
                                size={19}
                                className="mt-0.5 shrink-0 text-emerald-400"
                            />

                            <div>
                                <p className="text-sm font-semibold text-white">
                                    Dirección guardada
                                </p>

                                <p className="mt-1 text-xs leading-5 text-zinc-500 sm:text-sm sm:leading-6">
                                    Podrás seleccionarla rápidamente durante el
                                    checkout y editarla desde tu cuenta.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Link
                            href="/cuenta/direcciones"
                            className="flex min-h-12 w-full items-center justify-center rounded-xl border border-white/10 px-6 text-center text-sm font-semibold text-zinc-300 transition hover:border-white/30 hover:bg-white/[0.04] hover:text-white sm:min-h-14 sm:w-auto sm:rounded-2xl"
                        >
                            Cancelar
                        </Link>

                        <button
                            type="submit"
                            disabled={guardando}
                            className="
                                min-h-12
                                w-full
                                rounded-xl
                                bg-white
                                px-6
                                py-3
                                text-sm
                                font-bold
                                text-black
                                shadow-[0_18px_40px_rgba(255,255,255,.15)]
                                transition-all
                                hover:-translate-y-0.5
                                hover:bg-zinc-200
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                                disabled:hover:translate-y-0
                                sm:min-h-14
                                sm:w-auto
                                sm:rounded-2xl
                                sm:px-7
                                sm:text-base
                            "
                        >
                            {guardando
                                ? "Guardando dirección..."
                                : "Guardar dirección"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}