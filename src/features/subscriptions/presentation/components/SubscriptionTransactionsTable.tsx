import { Icon } from "@/components/icon";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";
import { cn } from "@/core/utils";
import type { SubscriptionTransactionEntity } from "../../domain/entities/SubscriptionEntity";
import type { SubscriptionMoneda } from "../../domain/entities/SubscriptionEntity";

function formatCurrency(value: number | undefined | null, moneda: SubscriptionMoneda = "COP"): string {
	const safeValue = value ?? 0;
	const safeMoneda = moneda || "COP";
	return `$ ${new Intl.NumberFormat(safeMoneda === "COP" ? "es-CO" : "en-US", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(safeValue)}`;
}

function formatShortDate(dateString: string | undefined | null): string {
	if (!dateString) return "—";
	try {
		const d = new Date(dateString);
		if (Number.isNaN(d.getTime())) return "—";
		return d.toLocaleString("es-CO", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		});
	} catch {
		return "—";
	}
}

export interface SubscriptionTransactionsTableProps {
	transactions: SubscriptionTransactionEntity[];
	isLoading: boolean;
	error: string | null;
	page: number;
	totalPages: number;
	total: number;
	limit: number;
	onRetry: () => void;
	onPageChange: (page: number) => void;
	onSelectTransaction: (transaction: SubscriptionTransactionEntity) => void;
	defaultMoneda?: SubscriptionMoneda;
}

export function SubscriptionTransactionsTable({
	transactions,
	isLoading,
	error,
	page,
	totalPages,
	total,
	limit,
	onRetry,
	onPageChange,
	onSelectTransaction,
	defaultMoneda = "COP",
}: SubscriptionTransactionsTableProps) {
	return (
		<div className="bg-card rounded-lg border p-6 mb-6">
			<h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
				Historial de transacciones
			</h3>
			{error && (
				<div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
					<span>{error}</span>
					<Button variant="outline" size="sm" onClick={onRetry}>
						Reintentar
					</Button>
				</div>
			)}
			{isLoading ? (
				<div className="flex items-center justify-center py-8">
					<Icon icon="lucide:loader-2" className="animate-spin mr-2" size={24} />
					<span className="text-muted-foreground">Cargando transacciones...</span>
				</div>
			) : transactions.length > 0 ? (
				<>
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b bg-muted/50">
									<th className="text-left p-3 font-medium text-muted-foreground text-sm">FECHA</th>
									<th className="text-left p-3 font-medium text-muted-foreground text-sm">REF.</th>
									<th className="text-left p-3 font-medium text-muted-foreground text-sm">FACTURA</th>
									<th className="text-left p-3 font-medium text-muted-foreground text-sm">DESCRIPCIÓN</th>
									<th className="text-left p-3 font-medium text-muted-foreground text-sm">PLAN</th>
									<th className="text-right p-3 font-medium text-muted-foreground text-sm">VALOR</th>
									<th className="text-left p-3 font-medium text-muted-foreground text-sm">CLIENTE</th>
									<th className="text-left p-3 font-medium text-muted-foreground text-sm">BANCO</th>
									<th className="text-left p-3 font-medium text-muted-foreground text-sm">DESCUENTOS</th>
									<th className="text-left p-3 font-medium text-muted-foreground text-sm">ESTADO</th>
									<th className="text-left p-3 font-medium text-muted-foreground text-sm">MÉTODO</th>
								</tr>
							</thead>
							<tbody>
								{transactions.map((tx) => (
									<tr key={tx.id} className="border-b last:border-b-0">
										<td className="p-3 text-sm text-muted-foreground">
											{formatShortDate(tx.fechaTransaccion || tx.createdAt)}
										</td>
										<td className="p-3">
											<button
												type="button"
												onClick={() => onSelectTransaction(tx)}
												className="text-sm font-mono text-primary underline-offset-2 hover:underline cursor-pointer"
											>
												{tx.referencia || "-"}
											</button>
										</td>
										<td className="p-3 text-sm font-mono">{tx.factura ?? "-"}</td>
										<td className="p-3 text-sm">{tx.descripcion || "-"}</td>
										<td className="p-3 text-sm">{tx.planName || "-"}</td>
										<td className="p-3 text-sm text-right font-medium">
											{formatCurrency(tx.valor, (tx.moneda as SubscriptionMoneda) || defaultMoneda)}
										</td>
										<td className="p-3 text-sm">
											{tx.clienteNombre ? (
												<span title={tx.clienteEmail}>{tx.clienteNombre}</span>
											) : (
												"-"
											)}
										</td>
										<td className="p-3 text-sm">{tx.bancoNombre ?? "-"}</td>
										<td className="p-3">
											<div className="flex flex-wrap gap-1">
												{tx.descuentoAnual && (
													<Badge
														variant="outline"
														className="text-xs bg-green-100 text-green-700 border-green-200 cursor-pointer"
														onClick={() => onSelectTransaction(tx)}
													>
														<Icon icon="lucide:tag" className="mr-1 h-3 w-3" />
														{tx.descuentoAnual.porcentaje}% OFF
													</Badge>
												)}
												{tx.prorrateo?.aplicaProrrateo && (
													<Badge
														variant="outline"
														className="text-xs bg-blue-100 text-blue-700 border-blue-200 cursor-pointer"
														onClick={() => onSelectTransaction(tx)}
													>
														<Icon icon="lucide:calendar-days" className="mr-1 h-3 w-3" />
														Prorrateo
													</Badge>
												)}
												{!tx.descuentoAnual && !tx.prorrateo?.aplicaProrrateo && (
													<span className="text-muted-foreground text-sm">-</span>
												)}
											</div>
										</td>
										<td className="p-3">
											<Badge
												variant="outline"
												className={cn(
													"text-xs",
													tx.estado?.toLowerCase() === "aprobada"
														? "bg-green-100 text-green-700 border-green-200"
														: tx.estado?.toLowerCase() === "rechazada" || tx.estado?.toLowerCase() === "fallida"
															? "bg-red-100 text-red-700 border-red-200"
															: tx.estado?.toLowerCase() === "pendiente"
																? "bg-orange-100 text-orange-700 border-orange-200"
																: "bg-gray-100 text-gray-700 border-gray-200"
												)}
											>
												{tx.estado || "-"}
											</Badge>
										</td>
										<td className="p-3 text-sm">{tx.metodoPago || "-"}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					{totalPages > 1 && (
						<div className="flex items-center justify-between mt-4 pt-4 border-t">
							<p className="text-sm text-muted-foreground">
								Mostrando {(page - 1) * limit + 1}–
								{Math.min(page * limit, total)} de {total}
							</p>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									disabled={page <= 1}
									onClick={() => onPageChange(page - 1)}
								>
									Anterior
								</Button>
								<Button
									variant="outline"
									size="sm"
									disabled={page >= totalPages}
									onClick={() => onPageChange(page + 1)}
								>
									Siguiente
								</Button>
							</div>
						</div>
					)}
				</>
			) : (
				<p className="text-muted-foreground text-center py-4">
					No hay transacciones registradas para este negocio
				</p>
			)}
		</div>
	);
}

export default SubscriptionTransactionsTable;
