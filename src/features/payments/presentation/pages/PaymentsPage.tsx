import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/icon";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";
import { cn } from "@/core/utils";
import { container } from "@/core/di/DIContainer";
import { PAYMENT_TOKENS } from "../../di/payments.container.config";
import type { GetPaymentsUseCase } from "../../domain/usecases";
import type {
	PaymentEntity,
	PaymentStats,
	PaymentStatus,
	PaymentMethod,
} from "../../domain/entities/PaymentEntity";

function formatCurrency(value: number): string {
	return `$ ${new Intl.NumberFormat("es-CO", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value)}`;
}

function formatDate(dateString: string): string {
	if (!dateString) return "—";
	try {
		const d = new Date(dateString);
		if (Number.isNaN(d.getTime())) return dateString;
		return d.toLocaleString("es-CO", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		});
	} catch {
		return dateString;
	}
}

function getMethodLabel(method: PaymentMethod): string {
	const labels: Record<PaymentMethod, string> = {
		transferencia: "Transferencia",
		tarjeta: "Tarjeta ****4532",
		pse: "PSE",
	};
	return labels[method] || method;
}

interface StatCardProps {
	title: string;
	count: number;
	total: number;
	variant: "success" | "warning" | "danger";
}

function StatCard({ title, count, total, variant }: StatCardProps) {
	const dotColors = {
		success: "bg-green-500",
		warning: "bg-yellow-500",
		danger: "bg-red-500",
	};

	return (
		<div className="bg-card rounded-lg border p-4">
			<div className="flex items-center gap-2 mb-2">
				<span className={cn("w-2 h-2 rounded-full", dotColors[variant])} />
				<span className="text-sm text-muted-foreground">{title}</span>
			</div>
			<div className="text-3xl font-bold mb-1">{count}</div>
			<div className="text-sm text-muted-foreground">
				Total: {formatCurrency(total)}
			</div>
		</div>
	);
}

interface StatusBadgeProps {
	status: PaymentStatus;
}

function StatusBadge({ status }: StatusBadgeProps) {
	const config: Record<
		PaymentStatus,
		{ label: string; className: string }
	> = {
		exitoso: {
			label: "Exitoso",
			className: "bg-green-100 text-green-700 border-green-200",
		},
		pendiente: {
			label: "Pendiente",
			className: "bg-yellow-100 text-yellow-700 border-yellow-200",
		},
		fallido: {
			label: "Fallido",
			className: "bg-red-100 text-red-700 border-red-200",
		},
	};

	const { label, className } = config[status];

	return (
		<Badge variant="outline" className={className}>
			{label}
		</Badge>
	);
}




const PAGE_SIZE = 10;
const RANGO_OPTIONS = [
	{ value: "", label: "Todos" },
	{ value: "hoy", label: "Hoy" },
	{ value: "esta_semana", label: "Esta semana" },
	{ value: "este_mes", label: "Este mes" },
	{ value: "ultimos_7_dias", label: "Últimos 7 días" },
	{ value: "ultimos_30_dias", label: "Últimos 30 días" },
] as const;

export function PaymentsPage() {
	const { t } = useTranslation();
	const [payments, setPayments] = useState<PaymentEntity[]>([]);
	const [stats, setStats] = useState<PaymentStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);
	const [rango, setRango] = useState("");
	const [statusFilter, setStatusFilter] = useState<PaymentStatus | undefined>(undefined);

	const loadPayments = async (pageNum?: number) => {
		try {
			setLoading(true);
			const useCase = container.get<GetPaymentsUseCase>(
				PAYMENT_TOKENS.GetPaymentsUseCase
			);
			const response = await useCase.execute({
				page: pageNum ?? page,
				pageSize: PAGE_SIZE,
				status: statusFilter,
				rango: rango || undefined,
			});
			setPayments(response.data);
			setStats(response.stats);
			setTotal(response.total);
			setPage(response.page);
		} catch (error) {
			console.error("Error loading payments:", error);
		} finally {
			setLoading(false);
		}
	};

	// Al cambiar filtros, volver a página 1
	useEffect(() => {
		setPage(1);
	}, [rango, statusFilter]);

	useEffect(() => {
		loadPayments(page);
	}, [page, rango, statusFilter]);



	return (
		<div className="p-6">
			{/* Header */}
			<div className="mb-6">
				<h1 className="text-2xl font-bold">{t("payments.title")}</h1>
				<p className="text-muted-foreground mt-1">
					{t("payments.description")}
				</p>
			</div>

			{/* Filtros: rango y estado */}
			<div className="flex flex-wrap gap-3 mb-4">
				<div className="flex items-center gap-2">
					<label className="text-sm text-muted-foreground">Rango:</label>
					<select
						className="border rounded-md px-3 py-1.5 text-sm bg-background"
						value={rango}
						onChange={(e) => setRango(e.target.value)}
					>
						{RANGO_OPTIONS.map((opt) => (
							<option key={opt.value || "all"} value={opt.value}>{opt.label}</option>
						))}
					</select>
				</div>
				<div className="flex items-center gap-2">
					<label className="text-sm text-muted-foreground">Estado:</label>
					<select
						className="border rounded-md px-3 py-1.5 text-sm bg-background"
						value={statusFilter ?? ""}
						onChange={(e) => setStatusFilter((e.target.value || undefined) as PaymentStatus | undefined)}
					>
						<option value="">Todos</option>
						<option value="exitoso">Exitoso</option>
						<option value="pendiente">Pendiente</option>
						<option value="fallido">Fallido</option>
					</select>
				</div>
			</div>

			{/* Stats Cards */}
			{stats && (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
					<StatCard
						title={t("payments.stats.successful")}
						count={stats.exitosos.count}
						total={stats.exitosos.total}
						variant="success"
					/>
					<StatCard
						title={t("payments.stats.pending")}
						count={stats.pendientes.count}
						total={stats.pendientes.total}
						variant="warning"
					/>
					<StatCard
						title={t("payments.stats.failed")}
						count={stats.fallidos.count}
						total={stats.fallidos.total}
						variant="danger"
					/>
				</div>
			)}

			{/* Payments Table */}
			<div className="bg-card rounded-lg border overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="border-b bg-muted/30">
								<th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
									{t("payments.table.date")}
								</th>
								<th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
									{t("payments.table.business")}
								</th>
								<th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
									{t("payments.table.amount")}
								</th>
								<th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
									{t("payments.table.method")}
								</th>
								<th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
									{t("payments.table.transaction")}
								</th>
								<th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
									{t("payments.table.status")}
								</th>

							</tr>
						</thead>
						<tbody>
							{loading ? (
								<tr>
									<td colSpan={7} className="p-8 text-center">
										<Icon
											icon="lucide:loader-2"
											className="animate-spin mx-auto"
											size={24}
										/>
									</td>
								</tr>
							) : payments.length === 0 ? (
								<tr>
									<td
										colSpan={7}
										className="p-8 text-center text-muted-foreground"
									>
										{t("payments.noPayments")}
									</td>
								</tr>
							) : (
								payments.map((payment) => (
									<tr
										key={payment.id}
										className="border-b last:border-b-0 hover:bg-muted/20"
									>
										<td className="p-4 text-sm">
											{formatDate(payment.fecha)}
										</td>
										<td className="p-4 text-sm font-medium">
											{payment.negocioNombre}
										</td>
										<td className="p-4 text-sm font-semibold">
											{formatCurrency(payment.monto)}
										</td>
										<td className="p-4 text-sm">
											{getMethodLabel(payment.metodo)}
										</td>
										<td className="p-4 text-sm text-muted-foreground">
											{payment.transaccionId}
										</td>
										<td className="p-4">
											<StatusBadge status={payment.estado} />
										</td>

									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
				{/* Paginación */}
				{total > 0 && (
					<div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
						<span>
							{((page - 1) * PAGE_SIZE) + 1}-{Math.min(page * PAGE_SIZE, total)} de {total}
						</span>
						<div className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								disabled={page <= 1 || loading}
								onClick={() => setPage((p) => Math.max(1, p - 1))}
							>
								Anterior
							</Button>
							<Button
								variant="outline"
								size="sm"
								disabled={page * PAGE_SIZE >= total || loading}
								onClick={() => setPage((p) => p + 1)}
							>
								Siguiente
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default PaymentsPage;
