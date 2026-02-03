import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Icon } from "@/components/icon";
import { Button } from "@/core/ui/button";
import { cn } from "@/core/utils";
import { useSubscriptions } from "@/features/subscriptions/presentation/hooks/useSubscriptions";
import type { SubscriptionHistorialPago } from "@/features/subscriptions/domain/entities/SubscriptionEntity";

// Types
type ActivityStatus = "exitoso" | "pendiente" | "fallido";

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

interface ActivityItem {
	id: string;
	businessName: string;
	paymentMethod: string;
	date: string;
	amount: number;
	status: ActivityStatus;
}

// Helper functions
function formatCurrencyShort(value: number): string {
	return `$ ${new Intl.NumberFormat("es-CO", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value)}`;
}

function calculatePercentage(value: number, target: number): number {
	if (target === 0) return 0;
	return Math.min(Math.round((value / target) * 100), 100);
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
				<span className="text-xs font-semibold">{percentage}%</span>
			</div>
		</div>
	);
}

function MetricCardComponent({ metric }: { metric: MetricCard }) {
	const percentage = calculatePercentage(metric.value, metric.target);

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
			<CircularProgress percentage={percentage} color={metric.color} />
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

const statusConfig: Record<ActivityStatus, { label: string; color: string; bg: string }> = {
	exitoso: { label: "Exitoso", color: "text-green-600", bg: "bg-green-100" },
	pendiente: { label: "Pendiente", color: "text-orange-600", bg: "bg-orange-100" },
	fallido: { label: "Fallido", color: "text-red-600", bg: "bg-red-100" },
};

const statusIcons: Record<ActivityStatus, string> = {
	exitoso: "lucide:check",
	pendiente: "lucide:clock",
	fallido: "lucide:x",
};

function ActivityItemComponent({ item }: { item: ActivityItem }) {
	const status = statusConfig[item.status];

	return (
		<div className="flex items-center justify-between py-4 border-b last:border-b-0">
			<div className="flex items-center gap-3">
				<div className={cn("w-8 h-8 rounded-full flex items-center justify-center", status.bg)}>
					<Icon icon={statusIcons[item.status]} size={16} className={status.color} />
				</div>
				<div>
					<p className="font-medium">{item.businessName}</p>
					<p className="text-sm text-muted-foreground">
						{item.paymentMethod} • {item.date}
					</p>
				</div>
			</div>
			<div className="text-right">
				<p className="font-semibold">{formatCurrencyShort(item.amount)}</p>
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

export function WorkbenchPage() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { subscriptions, isLoading, error, loadSubscriptions } = useSubscriptions();

	// Calculate stats from subscriptions
	const stats = useMemo(() => {
		const totalNegocios = new Set(subscriptions.map((s) => s.negocioId)).size;
		const activas = subscriptions.filter((s) => s.estado === "activa").length;
		const pendientesPago = subscriptions.filter((s) => s.estado === "pendiente_pago").length;
		const vencidas = subscriptions.filter((s) => s.estado === "vencida").length;
		const suspendidas = subscriptions.filter((s) => s.estado === "suspendida").length;
		const canceladas = subscriptions.filter((s) => s.estado === "cancelada").length;

		return {
			totalNegocios,
			activas,
			pendientesPago,
			vencidas,
			suspendidas,
			canceladas,
			total: subscriptions.length,
		};
	}, [subscriptions]);

	// Calculate billing metrics from payment history
	const billingMetrics = useMemo(() => {
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
		const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

		let todayTotal = 0;
		let weekTotal = 0;
		let monthTotal = 0;

		subscriptions.forEach((sub) => {
			if (sub.historialPagos) {
				sub.historialPagos.forEach((pago) => {
					if (pago.estado === "exitoso") {
						const pagoDate = new Date(pago.fechaPago);
						if (pagoDate >= today) {
							todayTotal += pago.monto;
						}
						if (pagoDate >= sevenDaysAgo) {
							weekTotal += pago.monto;
						}
						if (pagoDate >= thirtyDaysAgo) {
							monthTotal += pago.monto;
						}
					}
				});
			}
		});

		// Calculate monthly recurring revenue (MRR) for targets
		const mrr = subscriptions
			.filter((s) => s.estado === "activa")
			.reduce((sum, s) => sum + (s.valorMensual || 0), 0);

		return {
			today: todayTotal,
			week: weekTotal,
			month: monthTotal,
			targetToday: mrr / 30, // Daily target based on MRR
			targetWeek: (mrr / 30) * 7,
			targetMonth: mrr,
		};
	}, [subscriptions]);

	// Get recent activity from payment history
	const recentActivity = useMemo((): ActivityItem[] => {
		const allPayments: (SubscriptionHistorialPago & { businessName: string })[] = [];

		subscriptions.forEach((sub) => {
			if (sub.historialPagos) {
				sub.historialPagos.forEach((pago) => {
					allPayments.push({
						...pago,
						businessName: sub.nombreNegocio || "Negocio sin nombre",
					});
				});
			}
		});

		// Sort by date descending and take last 10
		return allPayments
			.sort((a, b) => new Date(b.fechaPago).getTime() - new Date(a.fechaPago).getTime())
			.slice(0, 10)
			.map((pago) => ({
				id: pago.transaccionId,
				businessName: pago.businessName,
				paymentMethod: pago.metodoPago || "No especificado",
				date: formatDate(pago.fechaPago),
				amount: pago.monto,
				status: pago.estado as ActivityStatus,
			}));
	}, [subscriptions]);

	// Build metric cards
	const metricCards: MetricCard[] = [
		{
			label: "Facturado hoy",
			value: billingMetrics.today,
			target: Math.max(billingMetrics.targetToday, 100000),
			color: "text-blue-600",
		},
		{
			label: "Últimos 7 días",
			value: billingMetrics.week,
			target: Math.max(billingMetrics.targetWeek, 500000),
			color: "text-green-600",
		},
		{
			label: "Últimos 30 días",
			value: billingMetrics.month,
			target: Math.max(billingMetrics.targetMonth, 2000000),
			color: "text-red-500",
		},
	];

	// Build stat cards
	const statCards: StatCard[] = [
		{
			label: "Total Suscripciones",
			value: stats.total,
			icon: "lucide:file-text",
			iconBg: "bg-gray-100",
			route: "/subscriptions",
		},
		{
			label: "Suscripciones Activas",
			value: stats.activas,
			icon: "lucide:check-square",
			iconBg: "bg-green-100",
			route: "/subscriptions?estado=activa",
		},
		{
			label: "Pendientes de Pago",
			value: stats.pendientesPago,
			icon: "lucide:clock",
			iconBg: "bg-orange-100",
			route: "/subscriptions?estado=pendiente_pago",
		},
		{
			label: "Vencidas",
			value: stats.vencidas,
			icon: "lucide:alert-triangle",
			iconBg: "bg-yellow-100",
			route: "/subscriptions?estado=vencida",
		},
	];

	if (isLoading && subscriptions.length === 0) {
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
					<Button variant="outline" size="sm" onClick={loadSubscriptions}>
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
				<Button variant="outline" size="sm" onClick={loadSubscriptions}>
					<Icon icon="lucide:refresh-cw" className="mr-2 h-4 w-4" />
					Actualizar
				</Button>
			</div>

			{/* Metric Cards */}
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

			{/* Recent Activity */}
			<div className="bg-card rounded-xl border p-5">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-2">
						<span className="w-2 h-2 rounded-full bg-green-500" />
						<h2 className="font-semibold text-sm uppercase tracking-wide">ACTIVIDAD RECIENTE</h2>
					</div>
					{recentActivity.length > 0 && (
						<Button variant="ghost" size="sm" onClick={() => navigate("/subscriptions")}>
							Ver todo
							<Icon icon="lucide:chevron-right" className="ml-1 h-4 w-4" />
						</Button>
					)}
				</div>
				{recentActivity.length > 0 ? (
					<div>
						{recentActivity.map((item) => (
							<ActivityItemComponent key={item.id} item={item} />
						))}
					</div>
				) : (
					<div className="text-center py-8 text-muted-foreground">
						<Icon icon="lucide:inbox" size={40} className="mx-auto mb-2 opacity-50" />
						<p>No hay actividad reciente</p>
					</div>
				)}
			</div>
		</div>
	);
}

export default WorkbenchPage;
