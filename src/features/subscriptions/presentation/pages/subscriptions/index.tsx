import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Icon } from "@/components/icon";
import { Button } from "@/core/ui/button";
import { Badge } from "@/core/ui/badge";
import { Input } from "@/core/ui/input";
import { cn } from "@/core/utils";
import type {
	SubscriptionEstado,
	SubscriptionMoneda,
} from "../../../domain/entities/SubscriptionEntity";
import { useSubscriptions } from "../../hooks/useSubscriptions";

const PAGE_SIZE = 20;

type FilterTab = "todos" | SubscriptionEstado;

const filterTabs: { key: FilterTab; label: string }[] = [
	{ key: "todos", label: "Todos" },
	{ key: "activa", label: "Activas" },
	{ key: "pendiente_pago", label: "Pendientes" },
	{ key: "vencida", label: "Vencidas" },
	{ key: "suspendida", label: "Suspendidas" },
	{ key: "cancelada", label: "Canceladas" },
];

const statusColors: Record<SubscriptionEstado, string> = {
	activa: "bg-green-100 text-green-800 border-green-200",
	pendiente_pago: "bg-orange-100 text-orange-800 border-orange-200",
	vencida: "bg-yellow-100 text-yellow-800 border-yellow-200",
	suspendida: "bg-gray-100 text-gray-800 border-gray-200",
	cancelada: "bg-red-100 text-red-800 border-red-200",
};

const statusLabels: Record<SubscriptionEstado, string> = {
	activa: "Activa",
	pendiente_pago: "Pendiente Pago",
	vencida: "Vencida",
	suspendida: "Suspendida",
	cancelada: "Cancelada",
};

function formatCurrency(value: number, moneda: SubscriptionMoneda = "COP"): string {
	return new Intl.NumberFormat(moneda === "COP" ? "es-CO" : "en-US", {
		style: "currency",
		currency: moneda,
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
	const navigate = useNavigate();
	const [activeFilter, setActiveFilter] = useState<FilterTab>("todos");
	const [currentPage, setCurrentPage] = useState(1);

	const {
		filteredSubscriptions,
		isLoading,
		error,
		searchTerm,
		setSearchTerm,
		setFilterEstado,
		loadSubscriptions,
	} = useSubscriptions();

	const totalPages = Math.max(1, Math.ceil(filteredSubscriptions.length / PAGE_SIZE));
	const paginatedSubscriptions = filteredSubscriptions.slice(
		(currentPage - 1) * PAGE_SIZE,
		currentPage * PAGE_SIZE,
	);

	// Reset to page 1 when filter/search changes
	useEffect(() => {
		setCurrentPage(1);
	}, [filteredSubscriptions.length]);

	// Handle filter change
	const handleFilterChange = (filter: FilterTab) => {
		setActiveFilter(filter);
		setFilterEstado(filter === "todos" ? null : filter);
	};

	// Show loading state
	if (isLoading && filteredSubscriptions.length === 0) {
		return (
			<div className="p-6 flex items-center justify-center min-h-[400px]">
				<Icon icon="lucide:loader-2" className="animate-spin mr-2" size={24} />
				<span>{t("common.loading", "Cargando...")}</span>
			</div>
		);
	}

	// Show error state
	if (error) {
		return (
			<div className="p-6">
				<div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
					<p>{error}</p>
					<Button variant="outline" className="mt-2" onClick={loadSubscriptions}>
						{t("common.retry", "Reintentar")}
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6">
			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 className="text-2xl font-bold">{t("subscriptions.title", "Suscripciones")}</h1>
					<p className="text-muted-foreground mt-1">
						{t("subscriptions.description", "Gestiona las suscripciones de los negocios")}
					</p>
				</div>
			</div>

			{/* Search */}
			<div className="mb-4">
				<div className="relative max-w-md">
					<Icon
						icon="lucide:search"
						className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
						size={18}
					/>
					<Input
						placeholder={t("subscriptions.search", "Buscar por negocio o plan...")}
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10"
					/>
				</div>
			</div>

			{/* Filter Tabs */}
			<div className="flex gap-2 mb-6 flex-wrap">
				{filterTabs.map((tab) => (
					<button
						key={tab.key}
						type="button"
						onClick={() => handleFilterChange(tab.key)}
						className={cn(
							"px-4 py-2 rounded-full text-sm font-medium transition-colors",
							activeFilter === tab.key
								? "bg-primary text-white"
								: "bg-muted hover:bg-muted/80 text-muted-foreground"
						)}
					>
						{tab.label}
					</button>
				))}
			</div>

			{/* Table */}
			<div className="bg-card rounded-lg border shadow-sm overflow-hidden">
				<div className="overflow-x-auto">
				<table className="w-full min-w-[800px]">
					<thead>
						<tr className="border-b bg-muted/50">
							<th className="text-left p-4 font-medium text-muted-foreground text-sm">NEGOCIO</th>
							<th className="text-left p-4 font-medium text-muted-foreground text-sm">PLAN</th>
							<th className="text-left p-4 font-medium text-muted-foreground text-sm">ESTADO</th>
							<th className="text-left p-4 font-medium text-muted-foreground text-sm">VENCIMIENTO</th>
							<th className="text-left p-4 font-medium text-muted-foreground text-sm">VALOR MENSUAL</th>
							<th className="text-left p-4 font-medium text-muted-foreground text-sm">RENOVACIÓN</th>
							<th className="text-left p-4 font-medium text-muted-foreground text-sm">ACCIONES</th>
						</tr>
					</thead>
					<tbody>
						{paginatedSubscriptions.map((subscription) => (
							<tr
								key={subscription.id}
								className="border-b last:border-b-0 hover:bg-muted/30 transition-colors"
							>
								<td className="p-4">
									<div>
										<p className="font-medium">{subscription.nombreNegocio || "Sin nombre"}</p>
										<p className="text-sm text-muted-foreground">
											{subscription.datosFacturacion?.email
												? subscription.datosFacturacion.email
												: subscription.negocioId}
										</p>
									</div>
								</td>
								<td className="p-4">
									<span className="font-medium">{subscription.nombrePlan || "Sin plan"}</span>
								</td>
								<td className="p-4">
									<Badge
										variant="outline"
										className={cn("font-medium", statusColors[subscription.estado])}
									>
										{statusLabels[subscription.estado]}
									</Badge>
								</td>
								<td className="p-4 text-sm">{formatDate(subscription.fechaVencimiento)}</td>
								<td className="p-4 font-medium">
									{formatCurrency(subscription.valorMensual, subscription.moneda)}
								</td>
								<td className="p-4">
									{subscription.renovacionAutomatica ? (
										<Badge
											variant="outline"
											className="bg-blue-50 text-blue-700 border-blue-200"
										>
											<Icon icon="lucide:refresh-cw" className="mr-1 h-3 w-3" />
											Auto
										</Badge>
									) : (
										<span className="text-muted-foreground text-sm">Manual</span>
									)}
								</td>
								<td className="p-4">
									<Button
										variant="outline"
										size="sm"
										onClick={() => navigate(`/subscriptions/${subscription.id}`)}
									>
										Ver Detalle
									</Button>
								</td>
							</tr>
						))}
						{filteredSubscriptions.length === 0 && (
							<tr>
								<td colSpan={7} className="p-8 text-center text-muted-foreground">
									{searchTerm
										? t("subscriptions.noResults", "No se encontraron suscripciones")
										: t("subscriptions.empty", "No hay suscripciones registradas")}
								</td>
							</tr>
						)}
					</tbody>
				</table>
				</div>

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="flex items-center justify-between px-4 py-3 border-t">
						<span className="text-sm text-muted-foreground">
							Mostrando {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredSubscriptions.length)} de {filteredSubscriptions.length}
						</span>
						<div className="flex items-center gap-1">
							<Button
								variant="outline"
								size="sm"
								disabled={currentPage === 1}
								onClick={() => setCurrentPage((p) => p - 1)}
							>
								<Icon icon="lucide:chevron-left" size={16} />
							</Button>
							{Array.from({ length: totalPages }, (_, i) => i + 1)
								.filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
								.reduce<(number | "...")[]>((acc, p, idx, arr) => {
									if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
									acc.push(p);
									return acc;
								}, [])
								.map((item, idx) =>
									item === "..." ? (
										<span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground text-sm">…</span>
									) : (
										<Button
											key={item}
											variant={currentPage === item ? "default" : "outline"}
											size="sm"
											className="w-8 h-8 p-0"
											onClick={() => setCurrentPage(item as number)}
										>
											{item}
										</Button>
									)
								)}
							<Button
								variant="outline"
								size="sm"
								disabled={currentPage === totalPages}
								onClick={() => setCurrentPage((p) => p + 1)}
							>
								<Icon icon="lucide:chevron-right" size={16} />
							</Button>
						</div>
					</div>
				)}
			</div>

			{/* Loading overlay */}
			{isLoading && filteredSubscriptions.length > 0 && (
				<div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-4 flex items-center gap-2">
						<Icon icon="lucide:loader-2" className="animate-spin" size={20} />
						<span>{t("common.loading", "Cargando...")}</span>
					</div>
				</div>
			)}
		</div>
	);
}

export default SubscriptionsPage;
