import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";

export default async function NuevoProductoPage() {
    const categorias = await prisma.category.findMany({
        orderBy: { name: "asc" },
    });

    return (
        <div className="text-2xl font-bold text-white mb-1">
            <h1 className="text-2x1 font-bold text-white mb-1">Nuevo producto</h1>
            <p className="text-zinc-400 text-sm mb-8">
                Llena los datos para agregarlo al catálogo
            </p>

            <ProductForm  categorias={categorias}/>
        </div>
    );
}