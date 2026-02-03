import type React from "react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/core/ui/dialog";
import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Textarea } from "@/core/ui/textarea";
import { Switch } from "@/core/ui/switch";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/core/ui/select";
import { Icon } from "@/components/icon";
import type { PlanEntity, PlanCaracteristicas, PlanMoneda } from "../../domain/entities/PlanEntity";

interface ModalFormPlanProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (plan: Omit<PlanEntity, "id"> | PlanEntity) => Promise<void>;
	plan?: PlanEntity | null;
	isLoading?: boolean;
}

const defaultCaracteristicas: PlanCaracteristicas = {
	maxUsuarios: 1,
	maxProductos: 100,
	maxFacturasPorMes: 500,
	maxCajasRegistradoras: 1,
	soporteTecnico: false,
	reportesAvanzados: false,
	integracionContabilidad: false,
	backup: false,
};

export const ModalFormPlan: React.FC<ModalFormPlanProps> = ({
	isOpen,
	onClose,
	onSubmit,
	plan,
	isLoading = false,
}) => {
	const { t } = useTranslation();
	const isEditMode = !!plan;

	// Form state
	const [formData, setFormData] = useState<{
		nombre: string;
		descripcion: string;
		precio: number;
		moneda: PlanMoneda;
		duracionMeses: number;
		caracteristicas: PlanCaracteristicas;
		activo: boolean;
		popular: boolean;
	}>({
		nombre: "",
		descripcion: "",
		precio: 0,
		moneda: "COP",
		duracionMeses: 1,
		caracteristicas: defaultCaracteristicas,
		activo: true,
		popular: false,
	});

	const [errors, setErrors] = useState<Record<string, string>>({});

	// Reset form when plan changes or modal opens
	useEffect(() => {
		if (plan) {
			setFormData({
				nombre: plan.nombre,
				descripcion: plan.descripcion,
				precio: plan.precio,
				moneda: plan.moneda,
				duracionMeses: plan.duracionMeses,
				caracteristicas: { ...plan.caracteristicas },
				activo: plan.activo,
				popular: plan.popular || false,
			});
		} else {
			setFormData({
				nombre: "",
				descripcion: "",
				precio: 0,
				moneda: "COP",
				duracionMeses: 1,
				caracteristicas: { ...defaultCaracteristicas },
				activo: true,
				popular: false,
			});
		}
		setErrors({});
	}, [plan, isOpen]);

	// Validation
	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		if (!formData.nombre.trim()) {
			newErrors.nombre = t("plans.form.errors.nombreRequired", "El nombre es requerido");
		}

		if (!formData.descripcion.trim()) {
			newErrors.descripcion = t("plans.form.errors.descripcionRequired", "La descripción es requerida");
		}

		if (formData.precio < 0) {
			newErrors.precio = t("plans.form.errors.precioInvalid", "El precio no puede ser negativo");
		}

		if (formData.duracionMeses < 1 || formData.duracionMeses > 24) {
			newErrors.duracionMeses = t("plans.form.errors.duracionInvalid", "La duración debe estar entre 1 y 24 meses");
		}

		if (formData.caracteristicas.maxUsuarios < 1) {
			newErrors.maxUsuarios = t("plans.form.errors.maxUsuariosInvalid", "Debe permitir al menos 1 usuario");
		}

		if (formData.caracteristicas.maxProductos < 1) {
			newErrors.maxProductos = t("plans.form.errors.maxProductosInvalid", "Debe permitir al menos 1 producto");
		}

		if (formData.caracteristicas.maxFacturasPorMes < 1) {
			newErrors.maxFacturasPorMes = t("plans.form.errors.maxFacturasInvalid", "Debe permitir al menos 1 factura");
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Handle submit
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		const planData = isEditMode && plan
			? { ...formData, id: plan.id }
			: formData;

		await onSubmit(planData);
	};

	// Handle input change
	const handleInputChange = (field: string, value: string | number | boolean) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
		// Clear error when user types
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	// Handle caracteristicas change
	const handleCaracteristicaChange = (field: keyof PlanCaracteristicas, value: number | boolean) => {
		setFormData((prev) => ({
			...prev,
			caracteristicas: {
				...prev.caracteristicas,
				[field]: value,
			},
		}));
		// Clear error when user types
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{isEditMode
							? t("plans.form.editTitle", "Editar Plan")
							: t("plans.form.createTitle", "Crear Nuevo Plan")}
					</DialogTitle>
					<DialogDescription>
						{isEditMode
							? t("plans.form.editDescription", "Modifica los datos del plan")
							: t("plans.form.createDescription", "Completa los datos para crear un nuevo plan")}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Información básica */}
					<div className="space-y-4">
						<h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
							{t("plans.form.basicInfo", "Información Básica")}
						</h3>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="nombre">{t("plans.form.nombre", "Nombre")} *</Label>
								<Input
									id="nombre"
									value={formData.nombre}
									onChange={(e) => handleInputChange("nombre", e.target.value)}
									placeholder={t("plans.form.nombrePlaceholder", "Ej: Plan Profesional")}
									className={errors.nombre ? "border-red-500" : ""}
								/>
								{errors.nombre && (
									<p className="text-xs text-red-500">{errors.nombre}</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="duracionMeses">{t("plans.form.duracion", "Duración (meses)")} *</Label>
								<Input
									id="duracionMeses"
									type="number"
									min={1}
									max={24}
									value={formData.duracionMeses}
									onChange={(e) => handleInputChange("duracionMeses", parseInt(e.target.value) || 1)}
									className={errors.duracionMeses ? "border-red-500" : ""}
								/>
								{errors.duracionMeses && (
									<p className="text-xs text-red-500">{errors.duracionMeses}</p>
								)}
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="descripcion">{t("plans.form.descripcion", "Descripción")} *</Label>
							<Textarea
								id="descripcion"
								value={formData.descripcion}
								onChange={(e) => handleInputChange("descripcion", e.target.value)}
								placeholder={t("plans.form.descripcionPlaceholder", "Describe las características del plan...")}
								rows={3}
								className={errors.descripcion ? "border-red-500" : ""}
							/>
							{errors.descripcion && (
								<p className="text-xs text-red-500">{errors.descripcion}</p>
							)}
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="precio">{t("plans.form.precio", "Precio")} *</Label>
								<Input
									id="precio"
									type="number"
									min={0}
									value={formData.precio}
									onChange={(e) => handleInputChange("precio", parseFloat(e.target.value) || 0)}
									className={errors.precio ? "border-red-500" : ""}
								/>
								{errors.precio && (
									<p className="text-xs text-red-500">{errors.precio}</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="moneda">{t("plans.form.moneda", "Moneda")}</Label>
								<Select
									value={formData.moneda}
									onValueChange={(value: PlanMoneda) => handleInputChange("moneda", value)}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="COP">COP - Peso Colombiano</SelectItem>
										<SelectItem value="USD">USD - Dólar Americano</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>

					{/* Límites */}
					<div className="space-y-4">
						<h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
							{t("plans.form.limits", "Límites")}
						</h3>

						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<div className="space-y-2">
								<Label htmlFor="maxUsuarios">{t("plans.form.maxUsuarios", "Max. Usuarios")} *</Label>
								<Input
									id="maxUsuarios"
									type="number"
									min={1}
									value={formData.caracteristicas.maxUsuarios}
									onChange={(e) => handleCaracteristicaChange("maxUsuarios", parseInt(e.target.value) || 1)}
									className={errors.maxUsuarios ? "border-red-500" : ""}
								/>
								{errors.maxUsuarios && (
									<p className="text-xs text-red-500">{errors.maxUsuarios}</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="maxProductos">{t("plans.form.maxProductos", "Max. Productos")} *</Label>
								<Input
									id="maxProductos"
									type="number"
									min={1}
									value={formData.caracteristicas.maxProductos}
									onChange={(e) => handleCaracteristicaChange("maxProductos", parseInt(e.target.value) || 1)}
									className={errors.maxProductos ? "border-red-500" : ""}
								/>
								{errors.maxProductos && (
									<p className="text-xs text-red-500">{errors.maxProductos}</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="maxFacturasPorMes">{t("plans.form.maxFacturas", "Max. Facturas/mes")} *</Label>
								<Input
									id="maxFacturasPorMes"
									type="number"
									min={1}
									value={formData.caracteristicas.maxFacturasPorMes}
									onChange={(e) => handleCaracteristicaChange("maxFacturasPorMes", parseInt(e.target.value) || 1)}
									className={errors.maxFacturasPorMes ? "border-red-500" : ""}
								/>
								{errors.maxFacturasPorMes && (
									<p className="text-xs text-red-500">{errors.maxFacturasPorMes}</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="maxCajasRegistradoras">{t("plans.form.maxCajas", "Max. Cajas")} *</Label>
								<Input
									id="maxCajasRegistradoras"
									type="number"
									min={1}
									value={formData.caracteristicas.maxCajasRegistradoras}
									onChange={(e) => handleCaracteristicaChange("maxCajasRegistradoras", parseInt(e.target.value) || 1)}
									className={errors.maxCajasRegistradoras ? "border-red-500" : ""}
								/>
								{errors.maxCajasRegistradoras && (
									<p className="text-xs text-red-500">{errors.maxCajasRegistradoras}</p>
								)}
							</div>
						</div>
					</div>

					{/* Características */}
					<div className="space-y-4">
						<h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
							{t("plans.form.features", "Características")}
						</h3>

						<div className="grid grid-cols-2 gap-4">
							<div className="flex items-center justify-between p-3 border rounded-lg">
								<div className="flex items-center gap-2">
									<Icon icon="lucide:headphones" size={18} className="text-muted-foreground" />
									<Label htmlFor="soporteTecnico" className="cursor-pointer">
										{t("plans.form.soporteTecnico", "Soporte Técnico")}
									</Label>
								</div>
								<Switch
									id="soporteTecnico"
									checked={formData.caracteristicas.soporteTecnico}
									onCheckedChange={(checked) => handleCaracteristicaChange("soporteTecnico", checked)}
								/>
							</div>

							<div className="flex items-center justify-between p-3 border rounded-lg">
								<div className="flex items-center gap-2">
									<Icon icon="lucide:bar-chart-2" size={18} className="text-muted-foreground" />
									<Label htmlFor="reportesAvanzados" className="cursor-pointer">
										{t("plans.form.reportesAvanzados", "Reportes Avanzados")}
									</Label>
								</div>
								<Switch
									id="reportesAvanzados"
									checked={formData.caracteristicas.reportesAvanzados}
									onCheckedChange={(checked) => handleCaracteristicaChange("reportesAvanzados", checked)}
								/>
							</div>

							<div className="flex items-center justify-between p-3 border rounded-lg">
								<div className="flex items-center gap-2">
									<Icon icon="lucide:calculator" size={18} className="text-muted-foreground" />
									<Label htmlFor="integracionContabilidad" className="cursor-pointer">
										{t("plans.form.integracionContabilidad", "Integración Contabilidad")}
									</Label>
								</div>
								<Switch
									id="integracionContabilidad"
									checked={formData.caracteristicas.integracionContabilidad}
									onCheckedChange={(checked) => handleCaracteristicaChange("integracionContabilidad", checked)}
								/>
							</div>

							<div className="flex items-center justify-between p-3 border rounded-lg">
								<div className="flex items-center gap-2">
									<Icon icon="lucide:cloud-upload" size={18} className="text-muted-foreground" />
									<Label htmlFor="backup" className="cursor-pointer">
										{t("plans.form.backup", "Backup Automático")}
									</Label>
								</div>
								<Switch
									id="backup"
									checked={formData.caracteristicas.backup}
									onCheckedChange={(checked) => handleCaracteristicaChange("backup", checked)}
								/>
							</div>
						</div>
					</div>

					{/* Estado */}
					<div className="space-y-4">
						<h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
							{t("plans.form.status", "Estado")}
						</h3>

						<div className="grid grid-cols-2 gap-4">
							<div className="flex items-center justify-between p-3 border rounded-lg">
								<div className="flex items-center gap-2">
									<Icon icon="lucide:check-circle" size={18} className="text-muted-foreground" />
									<Label htmlFor="activo" className="cursor-pointer">
										{t("plans.form.activo", "Plan Activo")}
									</Label>
								</div>
								<Switch
									id="activo"
									checked={formData.activo}
									onCheckedChange={(checked) => handleInputChange("activo", checked)}
								/>
							</div>

							<div className="flex items-center justify-between p-3 border rounded-lg">
								<div className="flex items-center gap-2">
									<Icon icon="lucide:star" size={18} className="text-muted-foreground" />
									<Label htmlFor="popular" className="cursor-pointer">
										{t("plans.form.popular", "Marcar como Popular")}
									</Label>
								</div>
								<Switch
									id="popular"
									checked={formData.popular}
									onCheckedChange={(checked) => handleInputChange("popular", checked)}
								/>
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
							{t("common.cancel", "Cancelar")}
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? (
								<>
									<Icon icon="lucide:loader-2" className="mr-2 h-4 w-4 animate-spin" />
									{t("common.saving", "Guardando...")}
								</>
							) : isEditMode ? (
								t("common.save", "Guardar Cambios")
							) : (
								t("common.create", "Crear Plan")
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default ModalFormPlan;
