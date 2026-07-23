import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EditarDireccionForm from "@/components/account/EditarDireccionForm";

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EditarDireccionPage({
    params,
}: PageProps) {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const direccion = await prisma.address.findFirst({
        where: {
            id,
            userId: session.user.id,
            isSaved: true,
        },
        select: {
            id: true,
            label: true,
            fullName: true,
            phone: true,
            street: true,
            city: true,
            state: true,
            postalCode: true,
            isDefault: true,
        },
    });

    if (!direccion) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-black">
            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
                <Link
                    href="/cuenta/direcciones"
                    className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
                >
                    <ArrowLeft size={16} />
                    Volver a mis direcciones
                </Link>

                <div className="mt-6 sm:mt-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-zinc-500">
                        Tu cuenta
                    </p>

                    <h1 className="mt-3 text-3xl font-black tracking-tight text-white min-[430px]:text-4xl sm:text-5xl">
                        Editar dirección
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-500 sm:text-base">
                        Modifica los datos que utilizarás en tus próximas compras.
                    </p>
                </div>

                <EditarDireccionForm direccion={direccion} />
            </div>
        </main>
    );
}