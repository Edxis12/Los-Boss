import {
    BadgeCheck,
    CheckCircle2,
    Clock3,
    Package,
    Phone,
    Truck,
    XCircle,
} from "lucide-react";

export type OrderStatus =
    | "PENDING"
    | "CONTACTED"
    | "PAYMENT_CONFIRMED"
    | "PREPARING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";

type Props = {
    status: OrderStatus;
};

const STATUS_CONFIG = {
    PENDING: {
        label: "Pendiente",
        color:
            "border-amber-500/20 bg-amber-500/10 text-amber-400",
        icon: Clock3,
    },
    CONTACTED: {
        label: "Contactado",
        color:
            "border-sky-500/20 bg-sky-500/10 text-sky-400",
        icon: Phone,
    },
    PAYMENT_CONFIRMED: {
        label: "Pago confirmado",
        color:
            "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
        icon: BadgeCheck,
    },
    PREPARING: {
        label: "Preparando",
        color:
            "border-orange-500/20 bg-orange-500/10 text-orange-400",
        icon: Package,
    },
    SHIPPED: {
        label: "Enviado",
        color:
            "border-indigo-500/20 bg-indigo-500/10 text-indigo-400",
        icon: Truck,
    },
    DELIVERED: {
        label: "Entregado",
        color:
            "border-green-500/20 bg-green-500/10 text-green-400",
        icon: CheckCircle2,
    },
    CANCELLED: {
        label: "Cancelado",
        color:
            "border-red-500/20 bg-red-500/10 text-red-400",
        icon: XCircle,
    },
} satisfies Record<
    OrderStatus,
    {
        label: string;
        color: string;
        icon: typeof Clock3;
    }
>;

export default function OrderStatusBadge({ status }: Props) {
    const config = STATUS_CONFIG[status];
    const Icon = config.icon;

    return (
        <span
            className={`
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                px-3
                py-1.5
                text-xs
                font-semibold
                ${config.color}
            `}
        >
            <Icon size={14} />
            {config.label}
        </span>
    );
}