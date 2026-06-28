import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Crea el producto solo si no existe ya (evita el bug de upsert + nested writes en Prisma 7)
async function crearProductoSiNoExiste(data: Prisma.ProductCreateInput) {
    const existente = await prisma.product.findUnique({
        where: { slug: data.slug },
    });

    if (existente) {
        console.log(`↪ Ya existe, se omite: ${data.name}`);
        return existente;
    }

    const creado = await prisma.product.create({ data });
    console.log(`✓ Creado: ${creado.name}`);
    return creado;
}

async function main() {
    console.log("🌱 Iniciando seed...");

    // 1. Categorías
    const categorias = [
        { name: "Tenis", slug: "tenis" },
        { name: "Hoodies", slug: "hoodies" },
        { name: "Tops", slug: "tops" },
        { name: "Accesorios", slug: "accesorios" },
        { name: "Perfumes", slug: "perfumes" },
        { name: "Playeras", slug: "playeras" },
    ];

    for (const cat of categorias) {
        const existe = await prisma.category.findUnique({
            where: { slug: cat.slug },
        });
        if (!existe) {
            await prisma.category.create({ data: cat });
        }
    }
    console.log(`✓ Categorías listas (${categorias.length})`);

    async function getCategoria(slug: string) {
        const cat = await prisma.category.findUnique({ where: { slug } });
        if (!cat) throw new Error(`No se encontró la categoría: ${slug}`);
        return cat;
    }

    const categoriaTenis = await getCategoria("tenis");
    const categoriaAccesorios = await getCategoria("accesorios");
    const categoriaPerfumes = await getCategoria("perfumes");
    const categoriaPlayeras = await getCategoria("playeras");

    // 2. On Cloudmonster 2
    await crearProductoSiNoExiste({
        name: "On Cloudmonster 2",
        slug: "on-cloudmonster-2-negro",
        description:
            "Las Cloudmonster 2 son perfectas para carreras de entrenamiento o esfuerzos dinámicos al aportar más amortiguación en cada zancada. Encontrarás el ritmo perfecto con estas zapatillas gracias a su rápida transición de talón a puntera. Solo tienes que calzarte y sentir el impulso del rocker delantero.",
        price: 2000.0,
        brand: "On Running",
        isFeatured: true,
        category: { connect: { id: categoriaTenis.id } },
        images: {
            create: [
                {
                    url: "https://snkrsmayoreo.mx/cdn/shop/files/TENISONCLOUDMONSTER2NEGROIMPORTADO_909d8b0b-bafb-4ec8-9d6a-defd4a96bc3c.jpg?v=1758139474&width=1214",
                    altText: "On Cloudmonster 2 Negro",
                    position: 0,
                },
            ],
        },
        variants: {
            create: [
                { sku: "ONCM2-NEG-26", size: "26", color: "Negro", stock: 1 },
                { sku: "ONCM2-NEG-27", size: "27", color: "Negro", stock: 1 },
                { sku: "ONCM2-NEG-28", size: "28", color: "Negro", stock: 2 },
            ],
        },
    });

    // 3. Legend de Montblanc
    await crearProductoSiNoExiste({
        name: "Legend de Montblanc",
        slug: "legend-montblanc",
        description:
            "Legend está dedicada a hombres inspiradores, virtuosos y seguros de sí mismos que son valientes, apasionados y auténticos. Su fragancia es sutil pero llamativa y masculina.",
        price: 1500.0,
        brand: "Montblanc",
        category: { connect: { id: categoriaPerfumes.id } },
        images: {
            create: [
                {
                    url: "https://cdn11.bigcommerce.com/s-2vt02okold/images/stencil/1280x1280/products/2868/5674/HMONBL6__48409.1731099886.jpg?c=1",
                    altText: "Legend de Montblanc",
                    position: 0,
                },
            ],
        },
        variants: {
            create: [{ sku: "MONTBLANC-LEGEND-001", stock: 5 }],
        },
    });

    // 4. VCA AM
    await crearProductoSiNoExiste({
        name: "Van Cleef & Arpels Alhambra (VCA AM)",
        slug: "vca-am-oro-18k",
        description: "Oro 18K, full set.",
        price: 16000.0,
        brand: "Van Cleef & Arpels",
        isFeatured: true,
        category: { connect: { id: categoriaAccesorios.id } },
        images: {
            create: [
                {
                    url: "https://www.fashionphile.com/cdn/shop/files/28466ae239156d28b1d9d0bee503c9aa_c84234d7-b548-470a-a842-788efb93f02a.jpg?v=1755794083&width=1946",
                    altText: "Van Cleef & Arpels Oro 18K",
                    position: 0,
                },
            ],
        },
        variants: {
            create: [{ sku: "VCA-AM-ORO18K-001", stock: 1 }],
        },
    });

    // 5. Playera Hugo Boss
    await crearProductoSiNoExiste({
        name: "HUGO BOSS Camiseta de Punto con Gran Logo Estampado",
        slug: "hugo-boss-camiseta-logo-azul",
        description:
            "Esta camiseta BOSS Hombre regular fit de estilo casual presenta un logo de diseño estampado con detalles reflectantes decorativos. Confección en cómodo punto de algodón elástico.",
        price: 1500.0,
        brand: "Hugo Boss",
        category: { connect: { id: categoriaPlayeras.id } },
        images: {
            create: [
                {
                    url: "https://m.media-amazon.com/images/I/51Av3VsuYiL._AC_SX385_.jpg",
                    altText: "Playera Hugo Boss Azul",
                    position: 0,
                },
            ],
        },
        variants: {
            create: [
                { sku: "HB-AZUL-CH", size: "CH", color: "Azul", stock: 3 },
                { sku: "HB-AZUL-M", size: "M", color: "Azul", stock: 3 },
                { sku: "HB-AZUL-G", size: "G", color: "Azul", stock: 3 },
            ],
        },
    });

    console.log("🎉 Seed completado");
}

main()
    .catch((e) => {
        console.error("❌ Error en el seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });