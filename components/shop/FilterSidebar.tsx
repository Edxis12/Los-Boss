import Link from "next/link";

type Categoria = { name: string; slug: string };

export default function FilterSidebar({
    categorias,
    categoriaActiva,
}: {
    categorias: Categoria[];
    categoriaActiva?: string;
}) {
    return (
        <aside className="w-full md:w-56 shrink-0">
            <h3 className="text-sm font-semibold text-white mb-3">Categorías</h3>
            <nav className="flex flex-col gap-1">
                <Link
                    href="/productos"
                    className={`text-sm px-3 py-2 rounded-lg transition ${!categoriaActiva
                            ? "bg-white text-black font-medium"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                        }`}
                >
                    Todas
                </Link>
                {categorias.map((cat) => (
                    <Link
                        key={cat.slug}
                        href={`/productos?categoria=${cat.slug}`}
                        className={`text-sm px-3 py-2 rounded-lg transition ${categoriaActiva === cat.slug
                                ? "bg-white text-black font-medium"
                                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                            }`}
                    >
                        {cat.name}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}