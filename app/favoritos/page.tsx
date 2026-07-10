import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/shop/ProductCard";

export default async function FavoritosPage() {
    const session = await auth();

    if (!session?.user?.id) {
        return (
            <div className="max-w-3x1 mx-auto px-4 py-24 text-center">
                <h1 className="text-2x1 font-bold text-white mb-2">
                    Inicia sesión para ver tus favoritos
                </h1>
                <p className="text-zinc-400 mb-6">
                    Guarda los productos que más te gusten y encuéntralos aquí.
                </p>
                <Link
                    href="/login"
                    className="inline-block bg-white text-black font-semibold px-6 py-3 rounded-lg hover:bg-zinc-200 transition"
                >
                    Iniciar sesión
                </Link>
            </div>
        );
    }

    const favoritos = await prisma.favorite.findMany({
        where: { userId: session.user.id },
        include: {
            product: {
                include: {
                    images: { orderBy: { position: "asc" }, take: 1 },
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="max-w-7x1 mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-2x1 font-bold text-white mb-2">Tus favoritos</h1>
            <p className="text-zinc-400 text-sm mb-8">
                {favoritos.length}{" "}
                {favoritos.length === 1 ? "producto guardado" : "productos guardados"}
            </p>

            {favoritos.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-zinc-400 mb-6">
                        Todavía no has guardado ningún producto.
                    </p>
                    <Link
                        href="/productos"
                        className="inline-block bg-white text-black font-semibold px-6 py-3 rounded-lg hover:bg-zinc-200 transition"
                    >
                        Ver productos
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
                    {favoritos.map((fav: typeof favoritos[number]) => (
                        <ProductCard
                            key={fav.product.id}
                            id={fav.product.id}
                            slug={fav.product.slug}
                            name={fav.product.name}
                            price={Number(fav.product.price)}
                            brand={fav.product.brand}
                            imageUrl={fav.product.images[0]?.url}
                            esFavorito={true}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}