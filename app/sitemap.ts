import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const productos = await prisma.product.findMany({
        where: {
            isActive: true,
        },
        select: {
            slug: true,
            updatedAt: true,
        },
    });

    const productosUrls = productos.map((producto) => ({
        url: `${appUrl}/productos/${producto.slug}`,
        lastModified: producto.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
    }));

    return [
        {
            url: appUrl,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },

        {
            url: `${appUrl}/productos`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },

        ...productosUrls,
    ];
}