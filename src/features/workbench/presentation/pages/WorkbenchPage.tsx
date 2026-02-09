import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Icon } from "@/components/icon";
import { Button } from "@/core/ui/button";
import { cn } from "@/core/utils";
import { useWorkbench } from "../hooks/useWorkbench";
import type { RecentSubscription, WorkbenchKPIs } from "../../domain/entities/WorkbenchEntity";

// Types
interface MetricCard {
	label: string;
	value: number;
	target: number;
	color: string;
}

interface StatCard {
	label: string;
	value: number;
	icon: string;
	iconBg: string;
	route?: string;
}

// Helper functions
function formatCurrencyShort(value: number): string {
	return `$ ${new Intl.NumberFormat("es-CO", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value)}`;
}

function formatDate(dateString: string): string {
	try {
		return new Date(dateString).toLocaleDateString("es-CO", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		});
	} catch {
		return dateString;
	}
}

// Components
function CircularProgress({ percentage, color }: { percentage: number; color: string }) {
	const radius = 20;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset = circumference - (percentage / 100) * circumference;

	return (
		<div className="relative w-14 h-14">
			<svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 50 50">
				<circle
					cx="25"
					cy="25"
					r={radius}
					fill="none"
					stroke="currentColor"
					strokeWidth="4"
					className="text-gray-200"
				/>
				<circle
					cx="25"
					cy="25"
					r={radius}
					fill="none"
					stroke="currentColor"
					strokeWidth="4"
					strokeDasharray={circumference}
					strokeDashoffset={strokeDashoffset}
					strokeLinecap="round"
					className={color}
				/>
			</svg>
			<div className="absolute inset-0 flex items-center justify-center">
				<span className="text-xs font-semibold">{percentage.toFixed(0)}%</span>
			</div>
		</div>
	);
}

function MetricCardComponent({ metric }: { metric: MetricCard }) {
	return (
		<div className="bg-card rounded-xl border p-5 flex items-center justify-between">
			<div>
				<div className="flex items-center gap-2 mb-1">
					<span className={cn("w-2 h-2 rounded-full", metric.color.replace("text-", "bg-"))} />
					<span className="text-sm text-muted-foreground">{metric.label}</span>
				</div>
				<p className={cn("text-2xl font-bold", metric.color)}>{formatCurrencyShort(metric.value)}</p>
				<p className="text-xs text-muted-foreground mt-1">
					Objetivo {formatCurrencyShort(metric.target)}
				</p>
			</div>
			<CircularProgress percentage={metric.target > 0 ? Math.min((metric.value / metric.target) * 100, 100) : 0} color={metric.color} />
		</div>
	);
}

function StatCardComponent({ stat, onClick }: { stat: StatCard; onClick?: () => void }) {
	return (
		<div
			className={cn(
				"bg-card rounded-xl border p-4 flex items-center gap-3",
				onClick && "cursor-pointer hover:bg-muted/50 transition-colors"
			)}
			onClick={onClick}
		>
			<div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stat.iconBg)}>
				<Icon icon={stat.icon} size={20} className="text-gray-600" />
			</div>
			<div>
				<p className="text-xs text-muted-foreground">{stat.label}</p>
				<p className="text-xl font-bold">{stat.value}</p>
			</div>
		</div>
	);
}

const subscriptionStatusConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
	activa: { label: "Activa", color: "text-green-600", bg: "bg-green-100", icon: "lucide:check-circle" },
	suspendida: { label: "Suspendida", color: "text-gray-600", bg: "bg-gray-100", icon: "lucide:pause-circle" },
	cancelada: { label: "Cancelada", color: "text-gray-600", bg: "bg-gray-100", icon: "lucide:x-circle" },
	vencida: { label: "Vencida", color: "text-red-600", bg: "bg-red-100", icon: "lucide:alert-circle" },
	pendiente_pago: { label: "Pendiente", color: "text-orange-600", bg: "bg-orange-100", icon: "lucide:clock" },
};

function SubscriptionListItemComponent({ item, onClick }: { item: RecentSubscription; onClick?: () => void }) {
	const status = subscriptionStatusConfig[item.estado] || subscriptionStatusConfig.activa;

	return (
		<div
			className={cn(
				"flex items-center justify-between py-3 border-b last:border-b-0",
				onClick && "cursor-pointer hover:bg-muted/50 transition-colors rounded-lg px-2 -mx-2"
			)}
			onClick={onClick}
		>
			<div className="flex items-center gap-3">
				<div className={cn("w-8 h-8 rounded-full flex items-center justify-center", status.bg)}>
					<Icon icon={status.icon} size={16} className={status.color} />
				</div>
				<div>
					<p className="font-medium text-sm">{item.nombreNegocio}</p>
					<p className="text-xs text-muted-foreground">
						{item.nombrePlan} • {formatDate(item.fecha)}
					</p>
				</div>
			</div>
			<div className="text-right">
				<p className="font-semibold text-sm">{formatCurrencyShort(item.valorMensual)}</p>
				<p className={cn("text-xs font-medium", status.color)}>{status.label}</p>
			</div>
		</div>
	);
}

function LoadingSkeleton() {
	return (
		<div className="animate-pulse space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{[1, 2, 3].map((i) => (
					<div key={i} className="bg-card rounded-xl border p-5 h-28" />
				))}
			</div>
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				{[1, 2, 3, 4].map((i) => (
					<div key={i} className="bg-card rounded-xl border p-4 h-20" />
				))}
			</div>
		</div>
	);
}

function buildMetricCards(kpis: WorkbenchKPIs): MetricCard[] {
	return [
		{
			label: "Facturado hoy",
			value: kpis.facturadoHoy.amount,
			target: kpis.facturadoHoy.objective,
			color: "text-blue-600",
		},
		{
			label: "Ultimos 7 dias",
			value: kpis.ultimos7Dias.amount,
			target: kpis.ultimos7Dias.objective,
			color: "text-green-600",
		},
		{
			label: "Ultimos 30 dias",
			value: kpis.ultimos30Dias.amount,
			target: kpis.ultimos30Dias.objective,
			color: "text-red-500",
		},
	];
}

export function WorkbenchPage() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { data: workbenchData, isLoading, error, refetch, isRefetching } = useWorkbench();


	// Build metric cards from KPIs
	const metricCards = workbenchData?.kpis ? buildMetricCards(workbenchData.kpis) : [];

	// Build stat cards from summary
	const statCards: StatCard[] = workbenchData?.summary
		? [
				{
					label: "Total Suscripciones",
					value: workbenchData.summary.total,
					icon: "lucide:file-text",
					iconBg: "bg-gray-100",
					route: "/subscriptions",
				},
				{
					label: "Suscripciones Activas",
					value: workbenchData.summary.activas,
					icon: "lucide:check-square",
					iconBg: "bg-green-100",
					route: "/subscriptions?estado=activa",
				},
				{
					label: "Pendientes de Pago",
					value: workbenchData.summary.pendientesPago,
					icon: "lucide:clock",
					iconBg: "bg-orange-100",
					route: "/subscriptions?estado=pendiente_pago",
				},
				{
					label: "Vencidas",
					value: workbenchData.summary.vencidas,
					icon: "lucide:alert-triangle",
					iconBg: "bg-yellow-100",
					route: "/subscriptions?estado=vencida",
				},
			]
		: [];

	if (isLoading && !workbenchData) {
		return (
			<div className="p-6 space-y-6">
				<div>
					<h1 className="text-2xl font-bold">{t("workbench.title")}</h1>
					<p className="text-muted-foreground">{t("workbench.description")}</p>
				</div>
				<LoadingSkeleton />
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-6 space-y-6">
				<div>
					<h1 className="text-2xl font-bold">{t("workbench.title")}</h1>
					<p className="text-muted-foreground">{t("workbench.description")}</p>
				</div>
				<div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
					<p className="mb-2">Error al cargar los datos del dashboard</p>
					<Button variant="outline" size="sm" onClick={() => refetch()}>
						<Icon icon="lucide:refresh-cw" className="mr-2 h-4 w-4" />
						Reintentar
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">{t("workbench.title")}</h1>
					<p className="text-muted-foreground">{t("workbench.description")}</p>
				</div>
				<Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
					<Icon icon={isRefetching ? "lucide:loader-2" : "lucide:refresh-cw"} className={cn("mr-2 h-4 w-4", isRefetching && "animate-spin")} />
					{isRefetching ? "Actualizando..." : "Actualizar"}
				</Button>
			</div>

			{/* Metric Cards - KPIs */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{metricCards.map((metric, index) => (
					<MetricCardComponent key={index} metric={metric} />
				))}
			</div>

			{/* Stat Cards */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				{statCards.map((stat, index) => (
					<StatCardComponent
						key={index}
						stat={stat}
						onClick={stat.route ? () => navigate(stat.route!) : undefined}
					/>
				))}
			</div>

			{/* Subscription Lists */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
				{/* Recent Subscriptions */}
				<div className="bg-card rounded-xl border p-5">
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-2">
							<span className="w-2 h-2 rounded-full bg-blue-500" />
							<h2 className="font-semibold text-sm uppercase tracking-wide">Nuevas (7 dias)</h2>
						</div>
						{(workbenchData?.recentSubscriptions?.length ?? 0) > 0 && (
							<Button variant="ghost" size="sm" onClick={() => navigate("/subscriptions")}>
								<Icon icon="lucide:chevron-right" className="h-4 w-4" />
							</Button>
						)}
					</div>
					{(workbenchData?.recentSubscriptions?.length ?? 0) > 0 ? (
						<div>
							{workbenchData?.recentSubscriptions.map((item) => (
								<SubscriptionListItemComponent
									key={item.id}
									item={item}
									onClick={() => navigate(`/subscriptions/${item.id}`)}
								/>
							))}
						</div>
					) : (
						<div className="text-center py-6 text-muted-foreground">
							<Icon icon="lucide:inbox" size={32} className="mx-auto mb-2 opacity-50" />
							<p className="text-sm">Sin nuevas en 7 dias</p>
						</div>
					)}
				</div>

				{/* Expired Subscriptions */}
				<div className="bg-card rounded-xl border p-5">
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-2">
							<span className="w-2 h-2 rounded-full bg-red-500" />
							<h2 className="font-semibold text-sm uppercase tracking-wide">Vencidas (7 dias)</h2>
						</div>
						{(workbenchData?.expiredSubscriptions?.length ?? 0) > 0 && (
							<Button variant="ghost" size="sm" onClick={() => navigate("/subscriptions?estado=vencida")}>
								<Icon icon="lucide:chevron-right" className="h-4 w-4" />
							</Button>
						)}
					</div>
					{(workbenchData?.expiredSubscriptions?.length ?? 0) > 0 ? (
						<div>
							{workbenchData?.expiredSubscriptions.map((item) => (
								<SubscriptionListItemComponent
									key={item.id}
									item={item}
									onClick={() => navigate(`/subscriptions/${item.id}`)}
								/>
							))}
						</div>
					) : (
						<div className="text-center py-6 text-muted-foreground">
							<Icon icon="lucide:check-circle" size={32} className="mx-auto mb-2 opacity-50" />
							<p className="text-sm">Sin vencimientos en 7 dias</p>
						</div>
					)}
				</div>

				{/* Pending Payment Subscriptions */}
				<div className="bg-card rounded-xl border p-5">
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-2">
							<span className="w-2 h-2 rounded-full bg-orange-500" />
							<h2 className="font-semibold text-sm uppercase tracking-wide">Pendientes (7 dias)</h2>
						</div>
						{(workbenchData?.pendingPaymentSubscriptions?.length ?? 0) > 0 && (
							<Button variant="ghost" size="sm" onClick={() => navigate("/subscriptions?estado=pendiente_pago")}>
								<Icon icon="lucide:chevron-right" className="h-4 w-4" />
							</Button>
						)}
					</div>
					{(workbenchData?.pendingPaymentSubscriptions?.length ?? 0) > 0 ? (
						<div>
							{workbenchData?.pendingPaymentSubscriptions.map((item) => (
								<SubscriptionListItemComponent
									key={item.id}
									item={item}
									onClick={() => navigate(`/subscriptions/${item.id}`)}
								/>
							))}
						</div>
					) : (
						<div className="text-center py-6 text-muted-foreground">
							<Icon icon="lucide:check-circle" size={32} className="mx-auto mb-2 opacity-50" />
							<p className="text-sm">Sin pendientes en 7 dias</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default WorkbenchPage;
