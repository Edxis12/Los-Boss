import { Clock3, Phone, BadgeCheck, Package, Truck, CheckCircle2, XCircle, } from "lucide-react";

type Props = {
    status:
    | "PENDING"
    | "CONTACTED"
    | "PAYMENT_CONFIRMED"
    | "PREPARING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";
};

const STATUS_CONFIG = {
    PENDING: {
        label: "Pendiente",
        color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        icon: Clock3,
    },
    CONTACTED: {
        label: "Contactado",
        color: "bg-sky-500/10 text-sky-400 border-sky-500/20",
        icon: Phone,
    },
    PAYMENT_CONFIRMED: {
        label: "Pago confirmado",
        color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        icon: BadgeCheck,
    },
    PREPARING: {
        label: "Preparando",
        color: "bg-orange-500/10 text-orange 400 border-orange-500/20",
        icon: Package,
    },
    SHIPPED: {
        label: "Enviado",
        color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
        icon: Truck,
    },
    DELIVERED: {
        label: "Entregado",
        color: "bg-green-500/10 text-green-400 border-green-500/20",
        icon: CheckCircle2,
    },
    CANCELLED: {
        label: "Cancelado",
        color: "bg-red-500/10 text-red-400 border-red-500/20",
        icon: XCircle,
    },
} as const;

export default function OrderStatusBadge({ status }: Props) {
    const config = STATUS_CONFIG[status];
    const Icon = config.icon;

    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${config.color}`}
        >
            <Icon size={14} />
            {config.label}
        </span>
    )
}