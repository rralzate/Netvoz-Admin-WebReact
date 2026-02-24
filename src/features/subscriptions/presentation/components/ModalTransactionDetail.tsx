import { Icon } from "@/components/icon";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/core/ui/dialog";
import { cn } from "@/core/utils";
import type { SubscriptionTransactionEntity } from "../../domain/entities/SubscriptionEntity";

interface ModalTransactionDetailProps {
	isOpen: boolean;
	onClose: () => void;
	transaction: SubscriptionTransactionEntity | null;
}

const metodoPagoLabels: Record<string, string> = {
	tarjeta_credito: "Tarjeta de Crédito",
	tarjeta_debito: "Tarjeta de Débito",
	pse: "PSE",
	transferencia: "Transferencia",
	efectivo: "Efectivo",
};

function formatCurrency(value: number, moneda = "COP"): string {
	return `$ ${new Intl.NumberFormat(moneda === "COP" ? "es-CO" : "en-US", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value)}`;
}

function formatDate(dateString: string | undefined | null): string {
	if (!dateString) return "—";
	return new Date(dateString).toLocaleDateString("es-CO", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

interface DetailRowProps {
	label: string;
	value: React.ReactNode;
	icon?: string;
}

function DetailRow({ label, value, icon }: DetailRowProps) {
	return (
		<div className="flex items-start justify-between gap-4 py-2.5 border-b last:border-0">
			<span className="flex items-center gap-1.5 text-sm text-muted-foreground shrink-0">
				{icon && <Icon icon={icon} className="h-3.5 w-3.5" />}
				{label}
			</span>
			<span className="text-sm font-medium text-right">{value ?? "—"}</span>
		</div>
	);
}

export function ModalTransactionDetail({
	isOpen,
	onClose,
	transaction,
}: ModalTransactionDetailProps) {
	if (!transaction) return null;

	const isApproved = transaction.estado === "aprobada";

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Icon icon="lucide:receipt" className="h-5 w-5 text-primary" />
						Detalle de Transacción
					</DialogTitle>
					<DialogDescription>
						Referencia:{" "}
						<span className="font-mono font-semibold text-foreground">
							{transaction.referencia}
						</span>
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-2">
					{/* Estado destacado */}
					<div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
						<span className="text-sm text-muted-foreground">Estado</span>
						<Badge
							variant="outline"
							className={cn(
								"text-sm px-3 py-1",
								isApproved
									? "bg-green-100 text-green-700 border-green-200"
									: "bg-gray-100 text-gray-700 border-gray-200"
							)}
						>
							{isApproved && (
								<Icon icon="lucide:check-circle" className="mr-1.5 h-3.5 w-3.5" />
							)}
							{transaction.estado}
						</Badge>
					</div>

					{/* Monto */}
					<div className="flex items-center justify-between rounded-lg bg-primary/5 px-4 py-3">
						<span className="text-sm text-muted-foreground">Valor</span>
						<span className="text-xl font-bold text-primary">
							{formatCurrency(transaction.valor, transaction.moneda)} {transaction.moneda}
						</span>
					</div>

					{/* Información de la transacción */}
					<div>
						<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
							Información de Pago
						</p>
						<div className="rounded-lg border px-4">
							<DetailRow
								label="Método de pago"
								icon="lucide:credit-card"
								value={metodoPagoLabels[transaction.metodoPago] ?? transaction.metodoPago}
							/>
							<DetailRow
								label="ID Transacción"
								icon="lucide:hash"
								value={
									transaction.transaccionId ? (
										<span className="font-mono text-xs">{transaction.transaccionId}</span>
									) : null
								}
							/>
							<DetailRow
								label="Plan"
								icon="lucide:package"
								value={transaction.planName}
							/>
							<DetailRow
								label="Descripción"
								icon="lucide:file-text"
								value={transaction.descripcion}
							/>
						</div>
					</div>

					{/* Información del cliente */}
					<div>
						<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
							Cliente
						</p>
						<div className="rounded-lg border px-4">
							<DetailRow
								label="Nombre"
								icon="lucide:user"
								value={transaction.clienteNombre}
							/>
							<DetailRow
								label="Email"
								icon="lucide:mail"
								value={transaction.clienteEmail}
							/>
						</div>
					</div>

					{/* Fechas */}
					<div>
						<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
							Fechas
						</p>
						<div className="rounded-lg border px-4">
							<DetailRow
								label="Creada"
								icon="lucide:calendar"
								value={formatDate(transaction.createdAt)}
							/>
							<DetailRow
								label="Actualizada"
								icon="lucide:clock"
								value={formatDate(transaction.updatedAt)}
							/>
						</div>
					</div>

					{/* IDs técnicos */}
					<div>
						<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
							Identificadores
						</p>
						<div className="rounded-lg border px-4">
							<DetailRow
								label="ID"
								value={<span className="font-mono text-xs">{transaction.id}</span>}
							/>
							{transaction.subscriptionId && (
								<DetailRow
									label="Suscripción"
									value={<span className="font-mono text-xs">{transaction.subscriptionId}</span>}
								/>
							)}
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Cerrar
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default ModalTransactionDetail;
