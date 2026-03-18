import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Icon } from "@/components/icon";
import { Button } from "@/core/ui/button";
import { Badge } from "@/core/ui/badge";
import { cn } from "@/core/utils";
import { usePlans } from "@/features/plans/presentation/hooks/usePlans";
import type {
	SubscriptionEntity,
	SubscriptionEstado,
	SubscriptionMetodoPagoTipo,
	SubscriptionMoneda,
} from "../../../domain/entities/SubscriptionEntity";
import { useSubscriptions } from "../../hooks/useSubscriptions";
import { useBusinessInfo } from "../../hooks/useBusinessInfo";
import { useSubscriptionTransactions } from "../../hooks/useSubscriptionTransactions";
import { ModalChangePlan } from "../../components/ModalChangePlan";
import { ModalRenewSubscription } from "../../components/ModalRenewSubscription";
import { ModalTransactionDetail } from "../../components/ModalTransactionDetail";
import { SubscriptionTransactionsTable } from "../../components/SubscriptionTransactionsTable";
import type { SubscriptionTransactionEntity } from "../../../domain/entities/SubscriptionEntity";

const statusColors: Record<SubscriptionEstado, string> = {
	activa: "bg-green-100 text-green-700 border-green-200",
	pendiente_pago: "bg-orange-100 text-orange-700 border-orange-200",
	vencida: "bg-yellow-100 text-yellow-700 border-yellow-200",
	suspendida: "bg-gray-100 text-gray-700 border-gray-200",
	cancelada: "bg-red-100 text-red-700 border-red-200",
};

const statusLabels: Record<SubscriptionEstado, string> = {
	activa: "Activa",
	pendiente_pago: "Pendiente Pago",
	vencida: "Vencida",
	suspendida: "Suspendida",
	cancelada: "Cancelada",
};

const paymentMethodLabels: Record<SubscriptionMetodoPagoTipo, string> = {
	tarjeta_credito: "Tarjeta de Crédito",
	tarjeta_debito: "Tarjeta de Débito",
	pse: "PSE",
	transferencia: "Transferencia",
	efectivo: "Efectivo",
};



function formatCurrency(value: number | undefined | null, moneda: SubscriptionMoneda = "COP"): string {
	const safeValue = value ?? 0;
	const safeMoneda = moneda || "COP";
	return `$ ${new Intl.NumberFormat(safeMoneda === "COP" ? "es-CO" : "en-US", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(safeValue)}`;
}

function formatDate(dateString: string | undefined | null): string {
	if (!dateString) return "No especificado";
	try {
		return new Date(dateString).toLocaleDateString("es-CO", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	} catch {
		return "Fecha inválida";
	}
}


interface ProgressBarProps {
	current: number | undefined;
	limit: number | undefined;
	label: string;
}

function ProgressBar({ current, limit, label }: ProgressBarProps) {
	const safeCurrent = current ?? 0;
	const safeLimit = limit ?? 1; // Avoid division by zero
	const percentage = Math.min((safeCurrent / safeLimit) * 100, 100);
	const isHigh = percentage > 80;
	const isCritical = percentage > 95;

	return (
		<div className="space-y-2">
			<div className="flex justify-between items-center">
				<span className="text-sm text-muted-foreground">{label}</span>
				<span
					className={cn(
						"text-sm font-medium",
						isCritical && "text-red-600",
						isHigh && !isCritical && "text-orange-600"
					)}
				>
					{safeCurrent} / {safeLimit}
				</span>
			</div>
			<div className="h-2 bg-muted rounded-full overflow-hidden">
				<div
					className={cn(
						"h-full rounded-full transition-all",
						isCritical ? "bg-red-500" : isHigh ? "bg-orange-500" : "bg-primary"
					)}
					style={{ width: `${percentage}%` }}
				/>
			</div>
		</div>
	);
}

export function SubscriptionDetailPage() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const [subscription, setSubscription] = useState<SubscriptionEntity | null>(null);
	const [isChangePlanModalOpen, setIsChangePlanModalOpen] = useState(false);
	const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
	const [selectedTransaction, setSelectedTransaction] = useState<SubscriptionTransactionEntity | null>(null);

	const {
		subscriptions,
		findSubscriptionById,
		updateSubscription,
		renewSubscription,
		changePlan,
		loadSubscriptions,
		isLoading,
		error,
	} = useSubscriptions();

	// Get all plans for the change plan modal
	const { plans, isLoading: isLoadingPlans } = usePlans();

	// Consulta información del negocio por negocioId (uso y datos para recordatorio)
	const {
		businessInfo,
		isLoading: isLoadingBusinessInfo,
		error: businessInfoError,
		fetchBusinessInfo,
		sendReminderEmail,
		isSendingReminder,
	} = useBusinessInfo();

	// Historial de transacciones del negocio (endpoint por negocioId)
	const {
		transactions,
		total: transactionsTotal,
		page: transactionsPage,
		limit: transactionsLimit,
		totalPages: transactionsTotalPages,
		isLoading: isLoadingTransactions,
		error: transactionsError,
		loadTransactions,
		setPage: setTransactionsPage,
	} = useSubscriptionTransactions(subscription?.negocioId, { limit: 10, enabled: !!subscription?.negocioId });

	// Find subscription from loaded list when subscriptions change or id changes
	useEffect(() => {
		if (id && subscriptions.length > 0) {
			const found = findSubscriptionById(id);
			setSubscription(found || null);
		}
	}, [id, subscriptions, findSubscriptionById]);

	// Fetch business info when subscription is loaded
	useEffect(() => {
		if (subscription?.negocioId) {
			fetchBusinessInfo(subscription.negocioId);
		}
	}, [subscription?.negocioId, fetchBusinessInfo]);

	// Get current plan to sync limits
	const currentPlan = plans.find((p) => p.id === subscription?.planId);

	// Get resource limits from plan with actual usage from business info o subscription.limitesActuales (API)
	const limites = subscription?.limitesActuales;
	const resourceLimits =
		currentPlan?.caracteristicas || limites
			? {
					maxUsuarios:
						currentPlan?.caracteristicas?.maxUsuarios ??
						limites?.maxUsuarios ??
						0,
					maxProductos:
						currentPlan?.caracteristicas?.maxProductos ??
						limites?.maxProductos ??
						0,
					maxCajasRegistradoras:
						currentPlan?.caracteristicas?.maxCajasRegistradoras ??
						limites?.maxCajasRegistradoras ??
						0,
					usuariosActivos:
						businessInfo?.totalUsuarios ??
						limites?.usuariosActivos ??
						0,
					productosCreados:
						businessInfo?.totalProductos ??
						limites?.productosCreados ??
						0,
					cajasActivas:
						businessInfo?.totalCajasRegistradoras ??
						limites?.cajasRegistradorasActivas ??
						limites?.cajasActivas ??
						0,
				}
			: null;

	// Handle status change
	const handleStatusChange = async (newStatus: SubscriptionEstado) => {
		if (!subscription) return;

		const statusMessages: Record<SubscriptionEstado, string> = {
			activa: "Suscripción activada correctamente",
			suspendida: "Suscripción suspendida correctamente",
			cancelada: "Suscripción cancelada correctamente",
			vencida: "Estado actualizado a vencida",
			pendiente_pago: "Estado actualizado a pendiente de pago",
		};

		// Determine if active should be set to false (for suspend or cancel)
		const shouldDeactivate = newStatus === "suspendida" || newStatus === "cancelada";
		// Determine if active should be set to true (for reactivation)
		const shouldActivate = newStatus === "activa";

		const updateData: Partial<SubscriptionEntity> = {
			estado: newStatus,
		};

		// Set active field based on status change
		if (shouldDeactivate) {
			updateData.active = false;
		} else if (shouldActivate) {
			updateData.active = true;
		}

		const updated = await updateSubscription(subscription.id, updateData);
		if (updated) {
			setSubscription(updated);
			toast.success(statusMessages[newStatus] || "Estado actualizado correctamente");
		} else {
			toast.error("Error al cambiar el estado de la suscripción");
		}
	};

	// Handle plan change: primero actualiza plan, luego renueva suscripción con fechas/pago (mismo payload que Renovar)
	const handleChangePlan = async (
		planId: string,
		planNombre: string,
		precio: number,
		_meses: number,
		monto: number,
		fechaInicio: string,
		fechaVencimiento: string
	) => {
		if (!subscription) return;

		// 1) Actualizar plan (planId, nombre, valorMensual, valorTotal)
		const changePlanData = {
			planId,
			nombrePlan: planNombre,
		};
		const updatedPlan = await changePlan(subscription.id, changePlanData);
		if (!updatedPlan) {
			toast.error(t("subscriptions.changePlan.error", "Error al cambiar el plan"));
			throw new Error("Failed to update subscription plan");
		}

		// 2) Renovar suscripción con los mismos datos (fechas, monto, pago) vía POST .../renew
		const renewPayload = {
			fechaInicio: new Date(fechaInicio).toISOString(),
			fechaVencimiento: new Date(fechaVencimiento).toISOString(),
			valorTotal: monto,
			valorMensual: precio,
			pago: {
				monto,
				metodoPago: {
					tipo: "manual",
					ultimosCuatroDigitos: "",
					proveedor: "manual",
				},
			},
			notas: "Actualización de plan",
		};
		const renewed = await renewSubscription(subscription.id, renewPayload);
		if (renewed) {
			setSubscription(renewed);
			toast.success(t("subscriptions.changePlan.success", "Plan actualizado correctamente"));
		} else {
			// Plan ya se actualizó; solo falló renew (fechas/pago)
			setSubscription(updatedPlan);
			toast.warning(
				t("subscriptions.changePlan.renewWarning", "Plan actualizado; no se pudieron aplicar las fechas de renovación.")
			);
		}
	};

	// Handle send reminder email
	const handleSendReminder = async () => {
		if (!subscription?.negocioId) return;

		try {
			const result = await sendReminderEmail(subscription.negocioId);
			if (result?.emailSent) {
				toast.success(
					t("subscriptions.detail.reminderSent", "Recordatorio enviado a {email}").replace(
						"{email}",
						result.recipientEmail
					)
				);
			} else {
				toast.error(t("subscriptions.detail.reminderError", "Error al enviar el recordatorio"));
			}
		} catch (error) {
			console.error("Error sending reminder:", error);
			toast.error(t("subscriptions.detail.reminderError", "Error al enviar el recordatorio"));
		}
	};

	// Handle subscription renewal
	const handleRenewSubscription = async (fechaInicio: string, fechaVencimiento: string, meses: number, monto: number) => {
		if (!subscription) return;

		const updated = await renewSubscription(subscription.id, {
			meses,
			fechaInicio: new Date(fechaInicio).toISOString(),
			fechaVencimiento: new Date(fechaVencimiento).toISOString(),
			valorTotal: monto,
			valorMensual: subscription.valorMensual ?? monto,
			pago: {
				monto,
				metodoPago: {
					tipo: "manual",
					ultimosCuatroDigitos: "",
					proveedor: "manual",
				},
			},
			notas: "Renovación manual",
		});

		if (updated) {
			setSubscription(updated);
			toast.success("Suscripcion renovada correctamente");
		} else {
			toast.error("Error al renovar la suscripcion");
			throw new Error("Failed to renew subscription");
		}
	};

	if (isLoading && subscriptions.length === 0) {
		return (
			<div className="p-6 flex items-center justify-center min-h-[400px]">
				<Icon icon="lucide:loader-2" className="animate-spin mr-2" size={24} />
				<span>{t("common.loading", "Cargando...")}</span>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-6">
				<Button
					variant="outline"
					size="sm"
					className="mb-6"
					onClick={() => navigate("/subscriptions")}
				>
					<Icon icon="lucide:arrow-left" className="mr-2 h-4 w-4" />
					Volver
				</Button>
				<div className="bg-card rounded-lg border p-8">
					<div className="flex items-start gap-4">
						<div className="flex-shrink-0 p-3 rounded-full bg-red-100">
							<Icon icon="lucide:alert-circle" size={24} className="text-red-600" />
						</div>
						<div className="flex-1">
							<h2 className="text-lg font-semibold mb-2">
								{t("subscriptions.detail.errorTitle", "Error al cargar la suscripción")}
							</h2>
							<p className="text-muted-foreground mb-4">{error}</p>
							<div className="flex gap-3">
								<Button onClick={loadSubscriptions}>
									<Icon icon="lucide:refresh-cw" className="mr-2 h-4 w-4" />
									{t("common.retry", "Reintentar")}
								</Button>
								<Button variant="outline" onClick={() => navigate("/subscriptions")}>
									{t("subscriptions.backToList", "Ver todas las suscripciones")}
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (!subscription && subscriptions.length > 0) {
		return (
			<div className="p-6">
				<Button
					variant="outline"
					size="sm"
					className="mb-6"
					onClick={() => navigate("/subscriptions")}
				>
					<Icon icon="lucide:arrow-left" className="mr-2 h-4 w-4" />
					Volver
				</Button>
				<div className="bg-card rounded-lg border p-8 text-center">
					<Icon icon="lucide:search-x" size={48} className="mx-auto text-muted-foreground mb-4" />
					<h2 className="text-xl font-semibold mb-2">
						{t("subscriptions.detail.notFound", "Suscripción no encontrada")}
					</h2>
					<p className="text-muted-foreground mb-6">
						{t("subscriptions.detail.notFoundDescription", "La suscripción que buscas no existe o ha sido eliminada.")}
					</p>
					<div className="flex justify-center gap-3">
						<Button variant="outline" onClick={loadSubscriptions}>
							<Icon icon="lucide:refresh-cw" className="mr-2 h-4 w-4" />
							{t("common.retry", "Reintentar")}
						</Button>
						<Button onClick={() => navigate("/subscriptions")}>
							{t("subscriptions.backToList", "Ver todas las suscripciones")}
						</Button>
					</div>
				</div>
			</div>
		);
	}

	if (!subscription) {
		return (
			<div className="p-6 flex items-center justify-center min-h-[400px]">
				<Icon icon="lucide:loader-2" className="animate-spin mr-2" size={24} />
				<span>{t("common.loading", "Cargando...")}</span>
			</div>
		);
	}

	const formatPaymentMethod = () => {
		const { metodoPago } = subscription;
		if (!metodoPago || !metodoPago.tipo) {
			return "No especificado";
		}
		let label = paymentMethodLabels[metodoPago.tipo] || metodoPago.tipo;
		if (metodoPago.ultimosCuatroDigitos) {
			label += ` (**** ${metodoPago.ultimosCuatroDigitos})`;
		}
		if (metodoPago.proveedor) {
			label += ` - ${metodoPago.proveedor}`;
		}
		return label;
	};

	return (
		<div className="p-6">
			{/* Back Button */}
			<Button
				variant="outline"
				size="sm"
				className="mb-6"
				onClick={() => navigate("/subscriptions")}
			>
				<Icon icon="lucide:arrow-left" className="mr-2 h-4 w-4" />
				Volver
			</Button>

			{/* Header */}
			<div className="flex items-start justify-between mb-6">
				<div>
					<h1 className="text-2xl font-bold">{subscription.nombreNegocio || "Sin nombre"}</h1>
					<p className="text-muted-foreground mt-1">
						Suscripción #{subscription.id} - Plan {subscription.nombrePlan || "Sin plan"}
					</p>
				</div>
				<div className="flex items-center gap-2">
					{subscription.renovacionAutomatica && (
						<Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
							<Icon icon="lucide:refresh-cw" className="mr-1 h-3 w-3" />
							Renovación Automática
						</Badge>
					)}
					<Badge
						variant="outline"
						className={cn("text-sm", subscription.estado ? statusColors[subscription.estado] : "bg-gray-100 text-gray-700 border-gray-200")}
					>
						{subscription.estado ? statusLabels[subscription.estado] : "Sin estado"}
					</Badge>
				</div>
			</div>
			{/* Actions */}
			<div className="bg-card rounded-lg border p-6">
				<h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
					{t("subscriptions.detail.actions", "Acciones")}
				</h3>
				<div className="flex flex-wrap gap-3">
					{/* Botón de actualizar plan - siempre visible */}
					<Button
						className="bg-primary hover:bg-primary/90"
						onClick={() => setIsChangePlanModalOpen(true)}
					>
						<Icon icon="lucide:arrow-up-circle" className="mr-2 h-4 w-4" />
						{t("subscriptions.detail.upgradePlan", "Actualizar Plan")}
					</Button>

					{/* Botón de renovar suscripción */}
					<Button
						variant="outline"
						className="border-green-300 text-green-600 hover:bg-green-50"
						onClick={() => setIsRenewModalOpen(true)}
					>
						<Icon icon="lucide:calendar-check" className="mr-2 h-4 w-4" />
						Renovar Suscripcion
					</Button>

					{/* Botones de estado */}
					{subscription.estado === "activa" && (
						<Button
							variant="outline"
							className="border-orange-300 text-orange-600 hover:bg-orange-50"
							onClick={() => handleStatusChange("suspendida")}
						>
							<Icon icon="lucide:pause-circle" className="mr-2 h-4 w-4" />
							{t("subscriptions.detail.suspend", "Suspender")}
						</Button>
					)}
					{subscription.estado === "suspendida" && (
						<Button
							variant="outline"
							className="border-green-300 text-green-600 hover:bg-green-50"
							onClick={() => handleStatusChange("activa")}
						>
							<Icon icon="lucide:play-circle" className="mr-2 h-4 w-4" />
							Reactivar
						</Button>
					)}
					{(subscription.estado === "vencida" || subscription.estado === "pendiente_pago") && (
						<Button
							variant="outline"
							className="border-green-300 text-green-600 hover:bg-green-50"
							onClick={() => handleStatusChange("activa")}
						>
							<Icon icon="lucide:play-circle" className="mr-2 h-4 w-4" />
							Activar
						</Button>
					)}
					{subscription.estado === "cancelada" && (
						<Button
							variant="outline"
							className="border-green-300 text-green-600 hover:bg-green-50"
							onClick={() => handleStatusChange("activa")}
						>
							<Icon icon="lucide:refresh-cw" className="mr-2 h-4 w-4" />
							Reactivar Suscripción
						</Button>
					)}
					{subscription.estado !== "cancelada" && (
						<Button
							variant="outline"
							className="border-red-300 text-red-600 hover:bg-red-50"
							onClick={() => handleStatusChange("cancelada")}
						>
							<Icon icon="lucide:x-circle" className="mr-2 h-4 w-4" />
							Cancelar Suscripción
						</Button>
					)}
					<Button
						variant="outline"
						onClick={handleSendReminder}
						disabled={isSendingReminder}
					>
						{isSendingReminder ? (
							<Icon icon="lucide:loader-2" className="mr-2 h-4 w-4 animate-spin" />
						) : (
							<Icon icon="lucide:mail" className="mr-2 h-4 w-4" />
						)}
						{isSendingReminder
							? t("subscriptions.detail.sendingReminder", "Enviando...")
							: t("subscriptions.detail.sendReminder", "Enviar Recordatorio")}
					</Button>
				</div>
			</div>

			{/* Content Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
				{/* General Info */}
				<div className="bg-card rounded-lg border p-6">
					<h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
						{t("subscriptions.detail.generalInfo", "Información General")}
					</h3>
					<div className="space-y-4">
						<div className="flex justify-between">
							<span className="text-muted-foreground">Plan</span>
							<span className="font-medium">{subscription.nombrePlan || "Sin plan"}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								{t("subscriptions.detail.startDate", "Fecha de Inicio")}
							</span>
							<span className="font-medium">{formatDate(subscription.fechaInicio)}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								{t("subscriptions.detail.endDate", "Fecha de Vencimiento")}
							</span>
							<span className="font-medium">{formatDate(subscription.fechaVencimiento)}</span>
						</div>
						{subscription.fechaCancelacion && (
							<div className="flex justify-between">
								<span className="text-muted-foreground">Fecha de Cancelación</span>
								<span className="font-medium text-red-600">
									{formatDate(subscription.fechaCancelacion)}
								</span>
							</div>
						)}
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								{t("subscriptions.detail.monthlyValue", "Valor Mensual")}
							</span>
							<span className="font-medium">
								{formatCurrency(subscription.valorMensual, subscription.moneda)}{" "}
								{subscription.moneda || "COP"}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Valor Total</span>
							<span className="font-medium">
								{formatCurrency(subscription.valorTotal, subscription.moneda)}{" "}
								{subscription.moneda || "COP"}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								{t("subscriptions.detail.paymentMethod", "Método de Pago")}
							</span>
							<span className="font-medium">{formatPaymentMethod()}</span>
						</div>
						{subscription.creadoPor && (
							<div className="flex justify-between">
								<span className="text-muted-foreground">Creado por</span>
								<span className="font-medium">{subscription.creadoPor}</span>
							</div>
						)}
					</div>
				</div>

				{/* Resource Usage */}
				<div className="bg-card rounded-lg border p-6">
					<h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
						{t("subscriptions.detail.resourceUsage", "Uso de Recursos")}
					</h3>
					{isLoadingPlans || isLoadingBusinessInfo ? (
						<div className="flex items-center justify-center py-4">
							<Icon icon="lucide:loader-2" className="animate-spin mr-2" size={20} />
							<span className="text-muted-foreground text-sm">Cargando recursos...</span>
						</div>
					) : resourceLimits ? (
						<div className="space-y-6">
							<ProgressBar
								label={t("subscriptions.detail.users", "Usuarios")}
								current={resourceLimits.usuariosActivos}
								limit={resourceLimits.maxUsuarios || 1}
							/>
							<ProgressBar
								label={t("subscriptions.detail.products", "Productos")}
								current={resourceLimits.productosCreados}
								limit={resourceLimits.maxProductos || 1}
							/>
							<ProgressBar
								label={t("subscriptions.detail.cashRegisters", "Cajas Registradoras")}
								current={resourceLimits.cajasActivas}
								limit={resourceLimits.maxCajasRegistradoras || 1}
							/>
						</div>
					) : (
						<p className="text-muted-foreground text-center py-4">
							No hay plan asociado para mostrar límites
						</p>
					)}
				</div>
			</div>

			{/* Datos del negocio y facturación (desde suscripción) */}
			{(subscription.datosFacturacion || subscription.nombreNegocio) && (
				<div className="bg-card rounded-lg border p-6 mb-6">
					<h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
						Datos del negocio y facturación
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-3">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Negocio</span>
								<span className="font-medium">{subscription.nombreNegocio || "—"}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">ID Negocio</span>
								<span className="font-mono text-xs">{subscription.negocioId || "—"}</span>
							</div>
						</div>
						{subscription.datosFacturacion && (
							<div className="space-y-3 md:col-span-2 border-t pt-4">
								<p className="text-xs font-medium text-muted-foreground uppercase mb-2">Contacto / Facturación</p>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
									{(subscription.datosFacturacion.name || subscription.datosFacturacion.last_name) && (
										<div className="flex justify-between sm:block">
											<span className="text-muted-foreground text-sm">Nombre</span>
											<span className="font-medium text-sm">
												{[subscription.datosFacturacion.name, subscription.datosFacturacion.last_name].filter(Boolean).join(" ")}
											</span>
										</div>
									)}
									{subscription.datosFacturacion.email && (
										<div className="flex justify-between sm:block">
											<span className="text-muted-foreground text-sm">Email</span>
											<span className="font-medium text-sm">{subscription.datosFacturacion.email}</span>
										</div>
									)}
									{(subscription.datosFacturacion.phone || subscription.datosFacturacion.cell_phone) && (
										<div className="flex justify-between sm:block">
											<span className="text-muted-foreground text-sm">Teléfono</span>
											<span className="font-medium text-sm">
												{subscription.datosFacturacion.phone || subscription.datosFacturacion.cell_phone}
												{subscription.datosFacturacion.phone && subscription.datosFacturacion.cell_phone && subscription.datosFacturacion.phone !== subscription.datosFacturacion.cell_phone
													? ` / ${subscription.datosFacturacion.cell_phone}`
													: ""}
											</span>
										</div>
									)}
									{(subscription.datosFacturacion.doc_type || subscription.datosFacturacion.doc_number) && (
										<div className="flex justify-between sm:block">
											<span className="text-muted-foreground text-sm">Documento</span>
											<span className="font-medium text-sm">
												{subscription.datosFacturacion.doc_type || ""} {subscription.datosFacturacion.doc_number || ""}
											</span>
										</div>
									)}
									{subscription.datosFacturacion.city && (
										<div className="flex justify-between sm:block">
											<span className="text-muted-foreground text-sm">Ciudad</span>
											<span className="font-medium text-sm">{subscription.datosFacturacion.city}</span>
										</div>
									)}
									{subscription.datosFacturacion.address && (
										<div className="flex justify-between sm:block sm:col-span-2">
											<span className="text-muted-foreground text-sm">Dirección</span>
											<span className="font-medium text-sm">{subscription.datosFacturacion.address}</span>
										</div>
									)}
								</div>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Notes */}
			{subscription.notas && (
				<div className="bg-card rounded-lg border p-6 mb-6">
					<h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
						Notas
					</h3>
					<p className="text-sm">{subscription.notas}</p>
				</div>
			)}

			

			<SubscriptionTransactionsTable
				transactions={transactions}
				isLoading={isLoadingTransactions}
				error={transactionsError ?? null}
				page={transactionsPage}
				totalPages={transactionsTotalPages}
				total={transactionsTotal}
				limit={transactionsLimit}
				onRetry={() => loadTransactions(transactionsPage)}
				onPageChange={setTransactionsPage}
				onSelectTransaction={setSelectedTransaction}
				defaultMoneda={subscription.moneda}
			/>

			{/* Modal para cambiar plan */}
			<ModalChangePlan
				isOpen={isChangePlanModalOpen}
				onClose={() => setIsChangePlanModalOpen(false)}
				onConfirm={handleChangePlan}
				subscription={subscription}
				plans={plans}
				isLoading={isLoadingPlans}
			/>

			{/* Modal para renovar suscripción */}
			<ModalRenewSubscription
				isOpen={isRenewModalOpen}
				onClose={() => setIsRenewModalOpen(false)}
				onConfirm={handleRenewSubscription}
				subscription={subscription}
			/>

			{/* Modal detalle de transacción */}
			<ModalTransactionDetail
				isOpen={!!selectedTransaction}
				onClose={() => setSelectedTransaction(null)}
				transaction={selectedTransaction}
			/>
		</div>
	);
}

export default SubscriptionDetailPage;
