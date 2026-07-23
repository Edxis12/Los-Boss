import Link from "next/link";
import { Heart, LogIn, ShoppingBag } from "lucide-react";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/shop/ProductCard";

export default async function FavoritosPage() {
    const session = await auth();

    if (!session?.user?.id) {
        return (
            <main className="min-h-screen bg-black">
                <div className="mx-auto flex min-h-[65vh] max-w-lg items-center px-4 py-14 sm:px-6 sm:py-20">
                    <div className="w-full rounded-3xl border border-white/10 bg-[#0d0d0d] px-5 py-10 text-center shadow-[0_25px_80px_rgba(0,0,0,.35)] sm:px-8 sm:py-14">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                            <LogIn size={27} className="text-zinc-400" />
                        </div>

                        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                            Tus favoritos
                        </p>

                        <h1 className="mt-3 text-2xl font-black tracking-tight text-white min-[430px]:text-3xl sm:text-4xl">
                            Inicia sesión para ver tus favoritos
                        </h1>

                        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-zinc-500 sm:text-base">
                            Guarda los productos que más te gusten y
                            encuéntralos rápidamente desde tu cuenta.
                        </p>

                        <Link
                            href="/login"
                            className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-white px-6 text-sm font-bold text-black transition hover:bg-zinc-200 sm:w-auto"
                        >
                            Iniciar sesión
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    const favoritos = await prisma.favorite.findMany({
        where: {
            userId: session.user.id,
        },
        include: {
            product: {
                include: {
                    images: {
                        orderBy: {
                            position: "asc",
                        },
                        take: 1,
                    },
                    variants: {
                        select: {
                            stock: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <main className="min-h-screen bg-black">
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
                <div className="mb-10 flex flex-col gap-5 sm:mb-12 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                            Colección personal
                        </p>

                        <h1 className="mt-3 text-3xl font-black tracking-tight text-white min-[430px]:text-4xl sm:text-5xl">
                            Tus favoritos
                        </h1>

                        <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-500 sm:text-base">
                            Revisa los productos que guardaste y vuelve a
                            encontrarlos fácilmente cuando quieras.
                        </p>
                    </div>

                    <div className="flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-400">
                        <Heart size={15} />

                        {favoritos.length}{" "}
                        {favoritos.length === 1
                            ? "producto guardado"
                            : "productos guardados"}
                    </div>
                </div>

                {favoritos.length === 0 ? (
                    <div className="rounded-3xl border border-white/10 bg-[#0d0d0d] px-5 py-14 text-center shadow-[0_25px_80px_rgba(0,0,0,.25)] sm:px-8 sm:py-20">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                            <Heart size={27} className="text-zinc-500" />
                        </div>

                        <h2 className="mt-6 text-2xl font-bold text-white sm:text-3xl">
                            Todavía no tienes favoritos
                        </h2>

                        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-zinc-500 sm:text-base">
                            Guarda las piezas que más te gusten y aparecerán
                            aquí para que puedas encontrarlas rápidamente.
                        </p>

                        <Link
                            href="/productos"
                            className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 text-sm font-bold text-black transition hover:bg-zinc-200 sm:w-auto"
                        >
                            <ShoppingBag size={17} />
                            Explorar productos
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-x-5 gap-y-10 min-[430px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-14">
                        {favoritos.map(
                            (fav: typeof favoritos[number]) => {
                                const stockTotal =
                                    fav.product.variants.reduce(
                                        (
                                            total: number,
                                            variante: typeof fav.product.variants[number]
                                        ) => total + variante.stock,
                                        0
                                    );

                                return (
                                    <ProductCard
                                        key={fav.product.id}
                                        id={fav.product.id}
                                        slug={fav.product.slug}
                                        name={fav.product.name}
                                        price={Number(fav.product.price)}
                                        comparePrice={
                                            fav.product.comparePrice
                                                ? Number(
                                                    fav.product.comparePrice
                                                )
                                                : null
                                        }
                                        brand={fav.product.brand}
                                        imageUrl={
                                            fav.product.images[0]?.url
                                        }
                                        esFavorito={true}
                                        stockTotal={stockTotal}
                                        isFeatured={
                                            fav.product.isFeatured
                                        }
                                        createdAt={fav.product.createdAt.toISOString()}
                                    />
                                );
                            }
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}