import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/icon";
import { Button } from "@/core/ui/button";
import { Badge } from "@/core/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/core/ui/dialog";
import { cn } from "@/core/utils";
import type { PlanEntity } from "@/features/plans/domain/entities/PlanEntity";
import type { SubscriptionEntity } from "../../domain/entities/SubscriptionEntity";

interface ModalChangePlanProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (planId: string, planNombre: string, precio: number) => Promise<void>;
	subscription: SubscriptionEntity;
	plans: PlanEntity[];
	isLoading?: boolean;
}

function formatCurrency(value: number | undefined | null, moneda: "COP" | "USD" | undefined = "COP"): string {
	const safeValue = value ?? 0;
	const safeMoneda = moneda || "COP";
	return `$ ${new Intl.NumberFormat(safeMoneda === "COP" ? "es-CO" : "en-US", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(safeValue)}`;
}

export function ModalChangePlan({
	isOpen,
	onClose,
	onConfirm,
	subscription,
	plans,
	isLoading = false,
}: ModalChangePlanProps) {
	const { t } = useTranslation();
	const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Filter only active plans
	const activePlans = plans.filter((plan) => plan.activo !== false);

	const selectedPlan = activePlans.find((p) => p.id === selectedPlanId);

	const handleConfirm = async () => {
		if (!selectedPlan) return;

		console.log("ModalChangePlan - Selected plan:", selectedPlan);
		console.log("ModalChangePlan - Sending to onConfirm:", {
			planId: selectedPlan.id,
			planNombre: selectedPlan.nombre || "Plan",
			precio: selectedPlan.precio ?? 0,
		});

		setIsSubmitting(true);
		try {
			await onConfirm(
				selectedPlan.id,
				selectedPlan.nombre || "Plan",
				selectedPlan.precio ?? 0
			);
			setSelectedPlanId(null);
			onClose();
		} catch (error) {
			console.error("Error changing plan:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		setSelectedPlanId(null);
		onClose();
	};

	// Calculate price difference
	const getPriceDifference = (plan: PlanEntity) => {
		const planPrecio = plan.precio ?? 0;
		const currentValue = subscription.valorMensual ?? 0;
		const diff = planPrecio - currentValue;
		if (diff > 0) return { type: "increase", amount: diff };
		if (diff < 0) return { type: "decrease", amount: Math.abs(diff) };
		return { type: "same", amount: 0 };
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Icon icon="lucide:arrow-up-circle" className="h-5 w-5 text-primary" />
						{t("subscriptions.changePlan.title", "Cambiar Plan de Suscripción")}
					</DialogTitle>
					<DialogDescription>
						{t(
							"subscriptions.changePlan.description",
							"Selecciona el nuevo plan para la suscripción de {business}"
						).replace("{business}", subscription.nombreNegocio || "este negocio")}
					</DialogDescription>
				</DialogHeader>

				{/* Current Plan Info */}
				<div className="bg-muted/50 rounded-lg p-4 mb-4">
					<p className="text-sm text-muted-foreground mb-1">Plan actual</p>
					<div className="flex items-center justify-between">
						<span className="font-semibold">{subscription.nombrePlan || "Sin plan"}</span>
						<span className="font-semibold text-primary">
							{formatCurrency(subscription.valorMensual, subscription.moneda)}/mes
						</span>
					</div>
				</div>

				{/* Plans Grid */}
				{isLoading ? (
					<div className="flex items-center justify-center py-12">
						<Icon icon="lucide:loader-2" className="animate-spin mr-2" size={24} />
						<span>{t("common.loading", "Cargando planes...")}</span>
					</div>
				) : activePlans.length === 0 ? (
					<div className="text-center py-12">
						<Icon icon="lucide:package-x" size={48} className="mx-auto text-muted-foreground mb-4" />
						<p className="text-muted-foreground">
							{t("subscriptions.changePlan.noPlans", "No hay planes disponibles")}
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{activePlans.map((plan) => {
							const isSelected = selectedPlanId === plan.id;
							const isCurrentPlan = plan.id === subscription.planId;
							const priceDiff = getPriceDifference(plan);
							const caracteristicas = plan.caracteristicas || {};

							return (
								<button
									key={plan.id}
									type="button"
									onClick={() => !isCurrentPlan && setSelectedPlanId(plan.id)}
									disabled={isCurrentPlan}
									className={cn(
										"relative text-left p-4 rounded-lg border-2 transition-all",
										isSelected && "border-primary bg-primary/5",
										isCurrentPlan && "border-muted bg-muted/30 cursor-not-allowed opacity-60",
										!isSelected && !isCurrentPlan && "border-border hover:border-primary/50 hover:bg-muted/30"
									)}
								>
									{/* Popular badge */}
									{plan.popular && (
										<Badge className="absolute -top-2 right-2 bg-primary text-primary-foreground text-xs">
											Popular
										</Badge>
									)}

									{/* Current plan badge */}
									{isCurrentPlan && (
										<Badge variant="outline" className="absolute -top-2 left-2 text-xs">
											Plan Actual
										</Badge>
									)}

									{/* Plan name and price */}
									<h4 className="font-semibold mb-1">{plan.nombre || "Sin nombre"}</h4>
									<p className="text-2xl font-bold text-primary mb-2">
										{formatCurrency(plan.precio, plan.moneda)}
										<span className="text-sm font-normal text-muted-foreground">/mes</span>
									</p>

									{/* Price difference */}
									{!isCurrentPlan && priceDiff.type !== "same" && (
										<div className={cn(
											"text-xs mb-3",
											priceDiff.type === "increase" ? "text-orange-600" : "text-green-600"
										)}>
											{priceDiff.type === "increase" ? (
												<span className="flex items-center gap-1">
													<Icon icon="lucide:trending-up" size={12} />
													+{formatCurrency(priceDiff.amount, plan.moneda || "COP")}
												</span>
											) : (
												<span className="flex items-center gap-1">
													<Icon icon="lucide:trending-down" size={12} />
													-{formatCurrency(priceDiff.amount, plan.moneda || "COP")}
												</span>
											)}
										</div>
									)}

									{/* Plan features */}
									<div className="text-xs text-muted-foreground space-y-1">
										<div className="flex justify-between">
											<span>Usuarios:</span>
											<span className="font-medium">{caracteristicas.maxUsuarios ?? 0}</span>
										</div>
										<div className="flex justify-between">
											<span>Productos:</span>
											<span className="font-medium">{(caracteristicas.maxProductos ?? 0).toLocaleString()}</span>
										</div>
										<div className="flex justify-between">
											<span>Facturas/mes:</span>
											<span className="font-medium">{(caracteristicas.maxFacturasPorMes ?? 0).toLocaleString()}</span>
										</div>
									</div>

									{/* Feature badges */}
									<div className="flex flex-wrap gap-1 mt-3">
										{caracteristicas.soporteTecnico && (
											<Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
												Soporte
											</Badge>
										)}
										{caracteristicas.reportesAvanzados && (
											<Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
												Reportes
											</Badge>
										)}
										{caracteristicas.backup && (
											<Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
												Backup
											</Badge>
										)}
									</div>

									{/* Selection indicator */}
									{isSelected && (
										<div className="absolute top-2 right-2">
											<Icon icon="lucide:check-circle-2" className="h-5 w-5 text-primary" />
										</div>
									)}
								</button>
							);
						})}
					</div>
				)}

				<DialogFooter className="mt-6">
					<Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
						{t("common.cancel", "Cancelar")}
					</Button>
					<Button
						onClick={handleConfirm}
						disabled={!selectedPlanId || isSubmitting}
						className="bg-primary hover:bg-primary/90"
					>
						{isSubmitting ? (
							<>
								<Icon icon="lucide:loader-2" className="mr-2 h-4 w-4 animate-spin" />
								{t("common.saving", "Guardando...")}
							</>
						) : (
							<>
								<Icon icon="lucide:check" className="mr-2 h-4 w-4" />
								{t("subscriptions.changePlan.confirm", "Confirmar Cambio")}
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default ModalChangePlan;
