import {
    AuthLayout,
    ForgotPasswordForm,
} from "@/components/auth";

export default function ForgotPasswordPage() {
    return (
        <AuthLayout
            badge="Recupera tu cuenta"
            title={"Vuelve a tener acceso\na tu cuenta."}
            description="Te enviaremos un enlace seguro para que puedas crear una nueva contraseña."
        >
            <ForgotPasswordForm />
        </AuthLayout>
    );
}