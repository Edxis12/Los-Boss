import { prisma } from "@/lib/prisma";
import CategoriasManager from "@/components/admin/CategoriasManager";

export default async function AdminCategoriasPage() {
    const categorias = await prisma.category.findMany({
        orderBy: {
            name: "asc",
        },
        include: {
            _count: {
                select: {
                    products: true,
                },
            },
        },
    });

    return (
        <div className="space-y-6 sm:space-y-8">
            <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-600 sm:text-xs sm:tracking-[0.3em]">
                    Administración
                </p>

                <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-white min-[430px]:text-4xl">
                            Categorías
                        </h1>

                        <p className="mt-2 max-w-xl text-sm leading-7 text-zinc-500 sm:text-base">
                            Organiza las categorías y controla cómo se agrupan los
                            productos de tu tienda.
                        </p>
                    </div>

                    <div className="w-fit rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-400">
                        {categorias.length}{" "}
                        {categorias.length === 1
                            ? "categoría registrada"
                            : "categorías registradas"}
                    </div>
                </div>
            </div>

            <div className="min-w-0">
                <CategoriasManager categorias={categorias} />
            </div>
        </div>
    );
}