import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/icon";
import { Button } from "@/core/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/core/ui/dialog";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import type { SubscriptionEntity } from "../../domain/entities/SubscriptionEntity";

interface ModalRenewSubscriptionProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (fechaInicio: string, fechaVencimiento: string, meses: number, monto: number) => Promise<void>;
	subscription: SubscriptionEntity;
}

function formatDateForInput(dateString: string | undefined | null): string {
	if (!dateString) return "";
	try {
		return new Date(dateString).toISOString().split("T")[0];
	} catch {
		return "";
	}
}

function formatDisplayDate(dateString: string | undefined | null): string {
	if (!dateString) return "No especificado";
	try {
		return new Date(dateString).toLocaleDateString("es-CO", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	} catch {
		return "Fecha invalida";
	}
}

export function ModalRenewSubscription({
	isOpen,
	onClose,
	onConfirm,
	subscription,
}: ModalRenewSubscriptionProps) {
	const { t } = useTranslation();
	const [fechaInicio, setFechaInicio] = useState("");
	const [fechaVencimiento, setFechaVencimiento] = useState("");
	const [meses, setMeses] = useState<number>(1);
	const [monto, setMonto] = useState<number>(0);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Recalculate amount when months or modal state change
	useEffect(() => {
		const valorBase = subscription.valorMensual ?? subscription.valorTotal ?? 0;
		setMonto(valorBase * meses);
	}, [isOpen, meses, subscription.valorMensual, subscription.valorTotal]);

	// Set default dates when modal opens: start = current expiration, end = +1 month from expiration
	useEffect(() => {
		if (isOpen && subscription.fechaVencimiento) {
			const startDate = new Date(subscription.fechaVencimiento);
			const endDate = new Date(subscription.fechaVencimiento);
			endDate.setMonth(endDate.getMonth() + 1);

			setFechaInicio(startDate.toISOString().split("T")[0]);
			setFechaVencimiento(endDate.toISOString().split("T")[0]);
		}
	}, [isOpen, subscription.fechaVencimiento]);

	const handleConfirm = async () => {
		if (!fechaInicio || !fechaVencimiento) return;

		setIsSubmitting(true);
		try {
			await onConfirm(fechaInicio, fechaVencimiento, meses, monto);
			onClose();
		} catch (error) {
			console.error("Error renewing subscription:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		setFechaInicio("");
		setFechaVencimiento("");
		setMeses(1);
		setMonto(0);
		onClose();
	};

	// Validate that end date is after start date
	const isValid =
		fechaInicio &&
		fechaVencimiento &&
		new Date(fechaVencimiento) > new Date(fechaInicio);

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Icon icon="lucide:calendar-check" className="h-5 w-5 text-green-600" />
						Renovar Suscripcion
					</DialogTitle>
					<DialogDescription>
						Establece las nuevas fechas de inicio y vencimiento para renovar la
						suscripcion de{" "}
						<strong>{subscription.nombreNegocio || "este negocio"}</strong>.
					</DialogDescription>
				</DialogHeader>

				{/* Current dates info */}
				<div className="bg-muted/50 rounded-lg p-4 space-y-2">
					<p className="text-sm font-medium text-muted-foreground">Fechas actuales</p>
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">Inicio:</span>
						<span className="font-medium">
							{formatDisplayDate(subscription.fechaInicio)}
						</span>
					</div>
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">Vencimiento:</span>
						<span className="font-medium">
							{formatDisplayDate(subscription.fechaVencimiento)}
						</span>
					</div>
				</div>

				{/* Month selection */}
				<div className="space-y-2 mt-2">
					<Label>Periodo de renovacion</Label>
					<div className="grid grid-cols-2 gap-3">
						<button
							type="button"
							onClick={() => setMeses(1)}
							className={`flex flex-col items-center justify-center rounded-lg border-2 p-3 transition-all ${
								meses === 1
									? "border-green-600 bg-green-50 dark:bg-green-950"
									: "border-muted hover:border-muted-foreground/30"
							}`}
						>
							<span className="text-xl font-bold">1</span>
							<span className="text-sm text-muted-foreground">Mes</span>
						</button>
						<button
							type="button"
							onClick={() => setMeses(12)}
							className={`flex flex-col items-center justify-center rounded-lg border-2 p-3 transition-all ${
								meses === 12
									? "border-green-600 bg-green-50 dark:bg-green-950"
									: "border-muted hover:border-muted-foreground/30"
							}`}
						>
							<span className="text-xl font-bold">12</span>
							<span className="text-sm text-muted-foreground">Meses</span>
						</button>
					</div>
				</div>

				{/* Renewal cost summary */}
				<div className="bg-muted/50 rounded-lg p-4 space-y-2">
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">Valor mensual:</span>
						<span className="font-medium">${(subscription.valorMensual ?? subscription.valorTotal ?? 0).toLocaleString()}</span>
					</div>
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">Meses:</span>
						<span className="font-medium">{meses}</span>
					</div>
					<div className="flex justify-between items-center text-sm border-t pt-2">
						<Label htmlFor="monto" className="font-medium">Total a cobrar:</Label>
						<div className="flex items-center gap-1">
							<span className="text-green-600 font-bold">$</span>
							<Input
								id="monto"
								type="number"
								min={0}
								value={monto}
								onChange={(e) => setMonto(Number(e.target.value))}
								className="w-28 h-8 text-right font-bold text-green-600"
							/>
						</div>
					</div>
				</div>

				{/* New dates form */}
				<div className="space-y-4 mt-2">
					<div className="space-y-2">
						<Label htmlFor="fechaInicio">Nueva Fecha de Inicio</Label>
						<Input
							id="fechaInicio"
							type="date"
							value={fechaInicio}
							onChange={(e) => setFechaInicio(e.target.value)}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="fechaVencimiento">Nueva Fecha de Vencimiento</Label>
						<Input
							id="fechaVencimiento"
							type="date"
							value={fechaVencimiento}
							onChange={(e) => setFechaVencimiento(e.target.value)}
							min={fechaInicio || undefined}
						/>
					</div>

					{fechaInicio && fechaVencimiento && !isValid && (
						<p className="text-sm text-red-600 flex items-center gap-1">
							<Icon icon="lucide:alert-circle" className="h-4 w-4" />
							La fecha de vencimiento debe ser posterior a la fecha de inicio.
						</p>
					)}
				</div>

				<DialogFooter className="mt-4">
					<Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
						{t("common.cancel", "Cancelar")}
					</Button>
					<Button
						onClick={handleConfirm}
						disabled={!isValid || isSubmitting}
						className="bg-green-600 hover:bg-green-700 text-white"
					>
						{isSubmitting ? (
							<>
								<Icon icon="lucide:loader-2" className="mr-2 h-4 w-4 animate-spin" />
								Renovando...
							</>
						) : (
							<>
								<Icon icon="lucide:calendar-check" className="mr-2 h-4 w-4" />
								Renovar Suscripcion
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default ModalRenewSubscription;
