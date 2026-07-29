import { AuthLayout } from "@/components/auth";
import LoginForm from "@/components/auth/forms/LoginForm";

export default function LoginPage() {
    return (
        <AuthLayout
            badge="Tu estilo, tu cuenta"
            title="Todo lo que te gusta,"
            description="Accede a tus pedidos, direcciones, favoritos y carrito desde una experiencia diseñada para ti."
        >
            <LoginForm />
        </AuthLayout>
    );
}