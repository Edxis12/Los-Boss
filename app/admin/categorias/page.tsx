import { prisma } from "@/lib/prisma";
import CategoriasManager from "@/components/admin/CategoriasManager";

export default async function AdminCategoriasPage() {
    const categorias = await prisma.category.findMany({
        orderBy: { name: "asc" },
        include: {
            _count: { select: { products: true } },
        },
    });

    return (
        <div>
            <h1 className="text-2xl font-bold text-white mb-1">Categorías</h1>
            <p className="text-zinc-400 text-sm mb-8">
                Organiza los productos de tu tienda
            </p>

            <CategoriasManager categorias={categorias} />
        </div>
    );
}