"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useFavoritesCountStore } from "@/store/favorites-count-store";
import { getFavoriteIds } from "@/lib/actions/favorite-actions";

// Componente invisible: al montar, si hay sesion, carga el conteo real de favortios
// desde la base de datos y lo guarda en el store del navbar
export default function FavoritesSync() {
    const { data: session, status } = useSession();
    const setCount = useFavoritesCountStore((state) => state.setCount);

    useEffect(() => {
        if (status === "authenticated" && session) {
            getFavoriteIds().then((ids) => setCount(ids.length));
        } else if (status === "unauthenticated") {
            setCount(0);
        }
    }, [status, session, setCount]);

    return null;
}