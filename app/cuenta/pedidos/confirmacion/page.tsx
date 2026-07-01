import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

type PageProps = {
    searchParams: Promise<{ orden?: string }>;
};

export default async function ConfirmacionPedidoPage({
    searchParams,
}: PageProps) {
    const { orden } = await searchParams;

    return (
        <div className="max-w-md mx-auto px-4 py-24 text-center" >
            <CheckCircle2 size={56} className="text-green-400 mx-auto mb-4" />
            <h1 className="text-2x1 font-bold text-white mb-2">
                ¡Pedido confirmado!
            </h1>
            {orden && (
                <p className="text-zinc-300 mb-2">
                    Número de orden: <span className="font-semibold">{orden}</span>
                </p>
            )}
            <p className="text-zinc-400 mb-8">
                Te contactaremos pronto para coordinar el pago y la entrega.
            </p>

            <div className="flex flex-col gap-3">
                <Link
                    href="/cuenta/pedidos"
                    className="bg-white text-black font-semibold rounded-lg py-3 hover:bg-zinc-200 transition"
                >
                    Ver mis pedidos
                </Link>
                <Link
                    href="/productos"
                    className="border border-zinc-700 text-white rounded-lg py-3 hover:bg-zinc-900 transition"
                >
                    Seguir comprando
                </Link>
            </div>
        </div>
    );
}