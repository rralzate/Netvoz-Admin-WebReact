import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/icon";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";
import { cn } from "@/core/utils";
import type { PlanEntity } from "../../domain/entities/PlanEntity";
import { usePlans } from "../hooks/usePlans";
import { ModalFormPlan } from "../components/modalFormPlan";

function formatCurrency(value: number, moneda: "COP" | "USD" = "COP"): string {
	return `$ ${new Intl.NumberFormat(moneda === "COP" ? "es-CO" : "en-US", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value)}`;
}

interface FeatureItem {
	nombre: string;
	incluido: boolean;
}

function FeatureBadge({ feature }: { feature: FeatureItem }) {
	return (
		<Badge
			variant="outline"
			className={cn(
				"text-xs",
				feature.incluido
					? "bg-green-50 text-green-700 border-green-200"
					: "bg-gray-50 text-gray-500 border-gray-200"
			)}
		>
			{feature.incluido ? (
				<Icon icon="lucide:check" size={12} className="mr-1" />
			) : (
				<Icon icon="lucide:x" size={12} className="mr-1" />
			)}
			{feature.nombre}
		</Badge>
	);
}

interface PlanCardProps {
	plan: PlanEntity;
	onEdit: (plan: PlanEntity) => void;
}

function PlanCard({ plan, onEdit }: PlanCardProps) {
	// Defensive access to caracteristicas with defaults
	const caracteristicas = plan.caracteristicas || {};
	const maxUsuarios = caracteristicas.maxUsuarios ?? 0;
	const maxProductos = caracteristicas.maxProductos ?? 0;
	const maxCajasRegistradoras = caracteristicas.maxCajasRegistradoras ?? 0;

	const features: FeatureItem[] = [
		{ nombre: "Soporte", incluido: caracteristicas.soporteTecnico ?? false },
		{ nombre: "Reportes", incluido: caracteristicas.reportesAvanzados ?? false },
		{ nombre: "Contabilidad", incluido: caracteristicas.integracionContabilidad ?? false },
		{ nombre: "Backup", incluido: caracteristicas.backup ?? false },
	];

	return (
		<div
			className={cn(
				"bg-card rounded-xl border p-6 relative",
				plan.popular && "border-primary border-2"
			)}
		>
			{plan.popular && (
				<Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
					POPULAR
				</Badge>
			)}

			<h3 className="text-xl font-semibold mb-2">{plan.nombre || "Sin nombre"}</h3>
			<p className="text-sm text-muted-foreground mb-4">{plan.descripcion || "Sin descripción"}</p>
			<div className="mb-6">
				<span className="text-3xl font-bold text-primary">
					{formatCurrency(plan.precio ?? 0, plan.moneda || "COP")}
				</span>
				<span className="text-muted-foreground">/mes</span>
			</div>

			<div className="space-y-3 mb-6">
				<div className="flex justify-between">
					<span className="text-muted-foreground">Usuarios</span>
					<span className="font-medium">{maxUsuarios.toLocaleString()}</span>
				</div>
				<div className="flex justify-between">
					<span className="text-muted-foreground">Productos</span>
					<span className="font-medium">{maxProductos.toLocaleString()}</span>
				</div>
				<div className="flex justify-between">
					<span className="text-muted-foreground">Cajas</span>
					<span className="font-medium">{maxCajasRegistradoras.toLocaleString()}</span>
				</div>
			</div>

			<div className="flex flex-wrap gap-2 mb-6">
				{features.map((feature) => (
					<FeatureBadge key={feature.nombre} feature={feature} />
				))}
			</div>

			<Button variant="outline" className="w-full" onClick={() => onEdit(plan)}>
				Editar Plan
			</Button>
		</div>
	);
}

export function PlansPage() {
	const { t } = useTranslation();
	const {
		plans,
		isLoading,
		error,
		createPlan,
		updatePlan,
		loadPlans,
	} = usePlans();

	// Modal state
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedPlan, setSelectedPlan] = useState<PlanEntity | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Open modal for creating new plan
	const handleNewPlan = () => {
		setSelectedPlan(null);
		setIsModalOpen(true);
	};

	// Open modal for editing plan
	const handleEditPlan = (plan: PlanEntity) => {
		setSelectedPlan(plan);
		setIsModalOpen(true);
	};

	// Close modal
	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedPlan(null);
	};

	// Handle form submit
	const handleSubmit = async (planData: Omit<PlanEntity, "id"> | PlanEntity) => {
		setIsSubmitting(true);
		try {
			if ("id" in planData && planData.id) {
				// Update existing plan
				await updatePlan(planData.id, planData);
			} else {
				// Create new plan
				await createPlan(planData as Omit<PlanEntity, "id">);
			}
			handleCloseModal();
			loadPlans(); // Refresh the list
		} catch (error) {
			console.error("Error saving plan:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	// Show loading state
	if (isLoading && plans.length === 0) {
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
					<Button variant="outline" className="mt-2" onClick={loadPlans}>
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
					<h1 className="text-2xl font-bold">{t("plans.title")}</h1>
					<p className="text-muted-foreground mt-1">{t("plans.description")}</p>
				</div>
				<Button className="bg-primary hover:bg-primary/90" onClick={handleNewPlan}>
					<Icon icon="lucide:plus" className="mr-2 h-4 w-4" />
					{t("plans.newPlan", "Nuevo Plan")}
				</Button>
			</div>

			{/* Plans Grid */}
			{plans.length === 0 ? (
				<div className="bg-card rounded-xl border p-12 text-center">
					<Icon icon="lucide:package" size={48} className="mx-auto text-muted-foreground mb-4" />
					<h3 className="text-lg font-medium mb-2">{t("plans.noPlans", "No hay planes")}</h3>
					<p className="text-muted-foreground mb-4">
						{t("plans.noPlansDescription", "Crea tu primer plan para comenzar")}
					</p>
					<Button onClick={handleNewPlan}>
						<Icon icon="lucide:plus" className="mr-2 h-4 w-4" />
						{t("plans.createFirst", "Crear primer plan")}
					</Button>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{plans.map((plan) => (
						<PlanCard key={plan.id} plan={plan} onEdit={handleEditPlan} />
					))}
				</div>
			)}

			{/* Modal Form */}
			<ModalFormPlan
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				onSubmit={handleSubmit}
				plan={selectedPlan}
				isLoading={isSubmitting}
			/>
		</div>
	);
}

export default PlansPage;
