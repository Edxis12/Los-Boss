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
                    <div className="w-full rounded-2xl border border-white/10 bg-[#0d0d0d] px-5 py-9 text-center shadow-[0_25px_80px_rgba(0,0,0,.35)] min-[430px]:rounded-3xl sm:px-8 sm:py-14">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                            <LogIn size={27} className="text-zinc-400" />
                        </div>

                        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                            Tus favoritos
                        </p>

                        <h1 className="mt-3 text-[25px] font-black leading-tight tracking-tight text-white min-[430px]:text-3xl sm:text-4xl">
                            Inicia sesión para ver tus favoritos
                        </h1>

                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500 sm:mt-4 sm:text-base sm:leading-7">
                            Guarda los productos que más te gusten y
                            encuéntralos rápidamente desde tu cuenta.
                        </p>

                        <Link
                            href="/login"
                            className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-white px-6 text-sm font-bold text-black transition hover:bg-zinc-200 sm:mt-7 sm:w-auto sm:rounded-2xl"
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
            <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
                <div className="mb-8 flex flex-col gap-4 sm:mb-12 sm:gap-5 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                            Colección personal
                        </p>

                        <h1 className="mt-2 text-[30px] font-black tracking-tight text-white min-[430px]:text-[36px] sm:mt-3 sm:text-5xl">
                            Tus favoritos
                        </h1>

                        <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500 sm:mt-3 sm:text-base sm:leading-7">
                            Revisa los productos que guardaste y vuelve a
                            encontrarlos fácilmente cuando quieras.
                        </p>
                    </div>

                    <div className="flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs text-zinc-400 sm:px-4 sm:text-sm">
                        <Heart size={15} />

                        {favoritos.length}{" "}
                        {favoritos.length === 1
                            ? "producto guardado"
                            : "productos guardados"}
                    </div>
                </div>

                {favoritos.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] px-5 py-10 text-center shadow-[0_25px_80px_rgba(0,0,0,.25)] min-[430px]:rounded-3xl min-[430px]:py-14 sm:px-8 sm:py-20">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                            <Heart size={27} className="text-zinc-500" />
                        </div>

                        <h2 className="mt-5 text-[24px] font-bold leading-tight text-white sm:mt-6 sm:text-3xl">
                            Todavía no tienes favoritos
                        </h2>

                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500 sm:text-base sm:leading-7">
                            Guarda las piezas que más te gusten y aparecerán
                            aquí para que puedas encontrarlas rápidamente.
                        </p>

                        <Link
                            href="/productos"
                            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-black transition hover:bg-zinc-200 sm:mt-7 sm:w-auto sm:rounded-2xl"
                        >
                            <ShoppingBag size={17} />
                            Explorar productos
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-x-5 gap-y-8 min-[430px]:grid-cols-2 min-[430px]:gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-14">
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