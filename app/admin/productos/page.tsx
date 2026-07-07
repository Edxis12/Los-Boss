import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Plus } from "lucide-react";
import ProductRowActions from "@/components/admin/ProductRowActions";

export default async function AdminProductosPage() {
    const productos = await prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            category: true,
            images: { orderBy: { position: "asc" }, take: 1 },
            variants: true,
        },
    });

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Productos</h1>
                    <p className="text-zinc-400 text-sm mt-1">
                        {productos.length} productos en total
                    </p>
                </div>
                <Link
                    href="/admin/productos/nuevo"
                    className="flex items-center gap-2 bg-white text-black font-semibold px-4 py-2.5 rounded-lg hover:bg-zinc-200 transition text-sm"
                >
                    <Plus size={16} />
                    Nuevo producto
                </Link>
            </div>

            <div className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-zinc-800 text-zinc-400 text-left">
                            <th className="px-4 py-3 font-medium">Producto</th>
                            <th className="px-4 py-3 font-medium">Categoría</th>
                            <th className="px-4 py-3 font-medium">Precio</th>
                            <th className="px-4 py-3 font-medium">Stock total</th>
                            <th className="px-4 py-3 font-medium">Estado</th>
                            <th className="px-4 py-3 font-medium text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productos.map((producto) => {
                            const stockTotal = producto.variants.reduce(
                                (acc, v) => acc + v.stock,
                                0
                            );
                            return (
                                <tr
                                    key={producto.id}
                                    className="border-b border-zinc-800 last:border-0"
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-10 h-10 bg-zinc-800 rounded-md overflow-hidden shrink-0">
                                                {producto.images[0]?.url && (
                                                    <Image
                                                        src={producto.images[0].url}
                                                        alt={producto.name}
                                                        fill
                                                        className="object-cover"
                                                        sizes="40px"
                                                    />
                                                )}
                                            </div>
                                            <span className="text-white font-medium line-clamp-1">
                                                {producto.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-zinc-300">
                                        {producto.category.name}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="text-zinc-300">
                                                ${Number(producto.price).toLocaleString("es-MX")}
                                            </p>

                                            {producto.comparePrice && (
                                                <p className="text-xs text-red-400 line-through">
                                                    ${Number(producto.comparePrice).toLocaleString("es-MX")}
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={
                                                stockTotal <= 3
                                                    ? "text-amber-400 font-medium"
                                                    : "text-zinc-300"
                                            }
                                        >
                                            {stockTotal}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`text-xs px-2 py-1 rounded-full ${producto.isActive ? "bg-green-500/10 text-green-400" : "bg-zinc-700/40 text-zinc-400"}`}
                                        >
                                            {producto.isActive ? "Activo" : "Inactivo"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <ProductRowActions
                                            productId={producto.id}
                                            isActive={producto.isActive}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}