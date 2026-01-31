import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/icon";
import { Button } from "@/core/ui/button";
import { Badge } from "@/core/ui/badge";
import { cn } from "@/core/utils";
import type { PlanType, SubscriptionEntity, SubscriptionStatus } from "../../../domain/entities/SubscriptionEntity";

// Mock data for demonstration - replace with useSubscriptions hook when API is ready
const mockSubscriptions: SubscriptionEntity[] = [
	{
		id: "neg1",
		negocioId: "neg1",
		negocioNombre: "Restaurante El Buen Sabor",
		plan: "profesional",
		estado: "activa",
		fechaVencimiento: "2025-02-15",
		valorMensual: 99900,
	},
	{
		id: "neg2",
		negocioId: "neg2",
		negocioNombre: "Tienda Moda Express",
		plan: "basico",
		estado: "pendiente",
		fechaVencimiento: "2025-01-01",
		valorMensual: 49900,
	},
	{
		id: "neg3",
		negocioId: "neg3",
		negocioNombre: "Farmacia Salud Total",
		plan: "enterprise",
		estado: "activa",
		fechaVencimiento: "2025-03-10",
		valorMensual: 199900,
	},
	{
		id: "neg4",
		negocioId: "neg4",
		negocioNombre: "Café Aroma",
		plan: "basico",
		estado: "vencida",
		fechaVencimiento: "2025-01-01",
		valorMensual: 49900,
	},
	{
		id: "neg5",
		negocioId: "neg5",
		negocioNombre: "Supermercado Don Pedro",
		plan: "profesional",
		estado: "suspendida",
		fechaVencimiento: "2025-02-15",
		valorMensual: 99900,
	},
];

type FilterTab = "todos" | SubscriptionStatus;

const filterTabs: { key: FilterTab; label: string }[] = [
	{ key: "todos", label: "Todos" },
	{ key: "activa", label: "Activas" },
	{ key: "pendiente", label: "Pendientes" },
	{ key: "vencida", label: "Vencidas" },
	{ key: "suspendida", label: "Suspendidas" },
];

const planColors: Record<PlanType, string> = {
	basico: "bg-yellow-100 text-yellow-800 border-yellow-200",
	profesional: "bg-pink-100 text-pink-800 border-pink-200",
	enterprise: "bg-purple-100 text-purple-800 border-purple-200",
};

const planLabels: Record<PlanType, string> = {
	basico: "Básico",
	profesional: "Profesional",
	enterprise: "Enterprise",
};

const statusColors: Record<SubscriptionStatus, string> = {
	activa: "bg-green-100 text-green-800 border-green-200",
	pendiente: "bg-orange-100 text-orange-800 border-orange-200",
	vencida: "bg-yellow-100 text-yellow-800 border-yellow-200",
	suspendida: "bg-gray-100 text-gray-800 border-gray-200",
};

const statusLabels: Record<SubscriptionStatus, string> = {
	activa: "Activa",
	pendiente: "Pendiente",
	vencida: "Vencida",
	suspendida: "Suspendida",
};

function formatCurrency(value: number): string {
	return new Intl.NumberFormat("es-CO", {
		style: "currency",
		currency: "COP",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value);
}

function formatDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString("es-CO", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
}

export function SubscriptionsPage() {
	const { t } = useTranslation();
	const [activeFilter, setActiveFilter] = useState<FilterTab>("todos");

	// Filter subscriptions based on active tab
	const filteredSubscriptions = mockSubscriptions.filter((sub) => {
		if (activeFilter === "todos") return true;
		return sub.estado === activeFilter;
	});

	return (
		<div className="p-6">
			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 className="text-2xl font-bold">{t("subscriptions.title")}</h1>
					<p className="text-muted-foreground mt-1">{t("subscriptions.description")}</p>
				</div>
				<Button className="bg-primary hover:bg-primary/90 text-white text-xs font-medium py-1.5 px-3 rounded-md transition-colors duration-200">
					<Icon icon="lucide:plus" className="mr-2 h-4 w-4" />
					Nueva Suscripción
				</Button>
			</div>

			{/* Filter Tabs */}
			<div className="flex gap-2 mb-6">
				{filterTabs.map((tab) => (
					<button
						key={tab.key}
						type="button"
						onClick={() => setActiveFilter(tab.key)}
						className={cn(
							"px-4 py-2 rounded-full text-sm font-medium transition-colors",
							activeFilter === tab.key
								? "bg-primary text-primary-foreground"
								: "bg-muted hover:bg-muted/80 text-muted-foreground"
						)}
					>
						{tab.label}
					</button>
				))}
			</div>

			{/* Table */}
			<div className="bg-card rounded-lg border shadow-sm overflow-hidden">
				<table className="w-full">
					<thead>
						<tr className="border-b bg-muted/50">
							<th className="text-left p-4 font-medium text-muted-foreground text-sm">NEGOCIO</th>
							<th className="text-left p-4 font-medium text-muted-foreground text-sm">PLAN</th>
							<th className="text-left p-4 font-medium text-muted-foreground text-sm">ESTADO</th>
							<th className="text-left p-4 font-medium text-muted-foreground text-sm">VENCIMIENTO</th>
							<th className="text-left p-4 font-medium text-muted-foreground text-sm">VALOR MENSUAL</th>
							<th className="text-left p-4 font-medium text-muted-foreground text-sm">ACCIONES</th>
						</tr>
					</thead>
					<tbody>
						{filteredSubscriptions.map((subscription) => (
							<tr key={subscription.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
								<td className="p-4">
									<div>
										<p className="font-medium">{subscription.negocioNombre}</p>
										<p className="text-sm text-muted-foreground">ID: {subscription.negocioId}</p>
									</div>
								</td>
								<td className="p-4">
									<Badge variant="outline" className={cn("font-medium", planColors[subscription.plan])}>
										{planLabels[subscription.plan]}
									</Badge>
								</td>
								<td className="p-4">
									<Badge variant="outline" className={cn("font-medium", statusColors[subscription.estado])}>
										{statusLabels[subscription.estado]}
									</Badge>
								</td>
								<td className="p-4 text-sm">{formatDate(subscription.fechaVencimiento)}</td>
								<td className="p-4 font-medium">{formatCurrency(subscription.valorMensual)}</td>
								<td className="p-4">
									<Button variant="outline" size="sm">
										Ver Detalle
									</Button>
								</td>
							</tr>
						))}
						{filteredSubscriptions.length === 0 && (
							<tr>
								<td colSpan={6} className="p-8 text-center text-muted-foreground">
									No se encontraron suscripciones
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default SubscriptionsPage;
