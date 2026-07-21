"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, MapPin } from "lucide-react";
import { City, State as CountryState } from "country-state-city";
import { actualizarDireccion } from "@/lib/actions/address-actions";

type Direccion = {
    id: string;
    label: string | null;
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    isDefault: boolean;
};

export default function EditarDireccionForm({
    direccion,
}: {
    direccion: Direccion;
}) {
    const router = useRouter();

    const estadosMexico = useMemo(() => {
        return CountryState.getStatesOfCountry("MX").sort(
            (a, b) => a.name.localeCompare(b.name, "es")
        );
    }, []);

    const estadoInicial = estadosMexico.find(
        (estado) => estado.name === direccion.state
    );

    const [label, setLabel] = useState(direccion.label ?? "");
    const [fullName, setFullName] = useState(direccion.fullName);
    const [phone, setPhone] = useState(direccion.phone);
    const [street, setStreet] = useState(direccion.street);
    const [stateCode, setStateCode] = useState(
        estadoInicial?.isoCode ?? ""
    );
    const [stateValue, setStateValue] = useState(direccion.state);
    const [city, setCity] = useState(direccion.city);
    const [postalCode, setPostalCode] = useState(
        direccion.postalCode
    );

    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");

    const ciudadesEstado = useMemo(() => {
        if (!stateCode) return [];

        return City.getCitiesOfState("MX", stateCode).sort(
            (a, b) => a.name.localeCompare(b.name, "es")
        );
    }, [stateCode]);

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();
        setError("");

        if (phone.length !== 10) {
            setError(
                "El teléfono debe contener exactamente 10 números"
            );
            return;
        }

        if (postalCode.length !== 5) {
            setError(
                "El código postal debe contener exactamente 5 números"
            );
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

        const resultado = await actualizarDireccion(
            direccion.id,
            {
                label,
                fullName,
                phone,
                street,
                city,
                state: stateValue,
                postalCode,
            }
        );

        setGuardando(false);

        if (resultado.error) {
            setError(resultado.error);
            return;
        }

        router.push("/cuenta/direcciones");
        router.refresh();
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-10 space-y-8 rounded-3xl border border-white/10 bg-[#0d0d0d] p-5 shadow-[0_30px_80px_rgba(0,0,0,.35)] sm:p-8"
        >
            <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-black">
                    <MapPin size={20} />
                </div>

                <div>
                    <h2 className="text-xl font-bold text-white sm:text-2xl">
                        Datos de entrega
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                        Los cambios solo se aplicarán a compras futuras.
                    </p>
                </div>
            </div>

            {direccion.isDefault && (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-300">
                    Esta es tu dirección principal.
                </div>
            )}

            {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                    <p className="text-sm text-red-300">
                        {error}
                    </p>
                </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-zinc-300">
                        Nombre de la dirección
                    </label>

                    <input
                        type="text"
                        value={label}
                        onChange={(event) =>
                            setLabel(event.target.value)
                        }
                        maxLength={40}
                        placeholder="Ej. Casa, Trabajo, Oficina"
                        className="mt-2 h-14 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-white focus:ring-4 focus:ring-white/10"
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
                        className="mt-2 h-14 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-white outline-none transition focus:border-white focus:ring-4 focus:ring-white/10"
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
                            setPhone(
                                event.target.value
                                    .replace(/\D/g, "")
                                    .slice(0, 10)
                            );
                        }}
                        className="mt-2 h-14 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-white outline-none transition focus:border-white focus:ring-4 focus:ring-white/10"
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
                        className="mt-2 h-14 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-white outline-none transition focus:border-white focus:ring-4 focus:ring-white/10"
                    />
                </div>

                <div>
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
                        className="mt-2 h-14 w-full rounded-xl border border-white/10 bg-[#090909] px-4 text-white outline-none transition focus:border-white focus:ring-4 focus:ring-white/10"
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

                <div>
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
                        className="mt-2 h-14 w-full rounded-xl border border-white/10 bg-[#090909] px-4 text-white outline-none transition focus:border-white focus:ring-4 focus:ring-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <option value="">
                            Selecciona una ciudad
                        </option>

                        {ciudadesEstado.map(
                            (ciudadItem, index) => (
                                <option
                                    key={`${ciudadItem.name}-${index}`}
                                    value={ciudadItem.name}
                                >
                                    {ciudadItem.name}
                                </option>
                            )
                        )}
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
                            setPostalCode(
                                event.target.value
                                    .replace(/\D/g, "")
                                    .slice(0, 5)
                            );
                        }}
                        className="mt-2 h-14 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-white outline-none transition focus:border-white focus:ring-4 focus:ring-white/10"
                    />
                </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <div className="flex items-start gap-3">
                    <CheckCircle2
                        size={19}
                        className="mt-0.5 shrink-0 text-emerald-400"
                    />

                    <p className="text-sm leading-6 text-zinc-500">
                        Editar esta dirección no modificará la información
                        de pedidos anteriores.
                    </p>
                </div>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Link
                    href="/cuenta/direcciones"
                    className="rounded-2xl border border-white/10 px-6 py-4 text-center font-semibold text-zinc-300 transition hover:border-white/30 hover:bg-white/[0.04] hover:text-white"
                >
                    Cancelar
                </Link>

                <button
                    type="submit"
                    disabled={guardando}
                    className="rounded-2xl bg-white px-7 py-4 font-bold text-black shadow-[0_18px_40px_rgba(255,255,255,.15)] transition-all hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {guardando
                        ? "Guardando cambios..."
                        : "Guardar cambios"}
                </button>
            </div>
        </form>
    );
}