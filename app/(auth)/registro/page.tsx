import {
    AuthLayout,
    RegisterForm,
} from "@/components/auth";

export default function RegisterPage() {
    return (
        <AuthLayout
            badge="Únete a Los Boss"
            title={"Crea tu cuenta\ny encuentra tu estilo."}
            description="Regístrate para guardar favoritos, realizar pedidos y administrar tu perfil."
        >
            <RegisterForm />
        </AuthLayout>
    );
}