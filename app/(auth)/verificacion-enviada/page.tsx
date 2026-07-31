import { Suspense } from "react";
import VerificacionEnviadaClient from "./VerificacionEnviadaClient";

export default function Page() {
    return (
        <Suspense fallback={null}>
            <VerificacionEnviadaClient />
        </Suspense>
    );
}