import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { container } from "@/core/di/DIContainer";
import { PLAN_TOKENS } from "../../di/plans.container.config";
import type {
	GetPlansUseCase,
	CreatePlanUseCase,
	UpdatePlanUseCase,
	DeletePlanUseCase,
} from "../../domain/usecases";
import type { PlanEntity } from "../../domain/entities/PlanEntity";
import { PlanHelpers } from "../../domain/entities/PlanEntity";

// State interface
export interface PlansState {
	plans: PlanEntity[];
	selectedPlan: PlanEntity | null;
	filteredPlans: PlanEntity[];
	searchTerm: string;
	filterActive: boolean | null;
	isLoading: boolean;
	error: string | null;
}

// Return interface
export interface UsePlansReturn {
	// State
	plans: PlanEntity[];
	selectedPlan: PlanEntity | null;
	filteredPlans: PlanEntity[];
	searchTerm: string;
	filterActive: boolean | null;
	isLoading: boolean;
	error: string | null;

	// Actions
	loadPlans: () => Promise<void>;
	selectPlan: (plan: PlanEntity | null) => void;
	setSearchTerm: (term: string) => void;
	setFilterActive: (filter: boolean | null) => void;
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
	clearError: () => void;
	createPlan: (plan: Omit<PlanEntity, "id">) => Promise<PlanEntity | null>;
	updatePlan: (id: string, plan: Partial<PlanEntity>) => Promise<PlanEntity | null>;
	deletePlan: (id: string) => Promise<boolean>;

	// Helpers
	getPlanById: (id: string) => PlanEntity | undefined;
	comparePlans: (planA: PlanEntity, planB: PlanEntity) => {
		esMasCaro: boolean;
		esMasCompleto: boolean;
		diferenciaPrecio: number;
		caracteristicasAdicionales: string[];
	};
	calculatePriceWithDiscount: (plan: PlanEntity, porcentajeDescuento: number) => number;
	checkPlanHasCapacity: (plan: PlanEntity, tipo: "usuarios" | "productos" | "facturas", cantidad: number) => boolean;
}

export const usePlans = (): UsePlansReturn => {
	const { t } = useTranslation();

	const [state, setState] = useState<PlansState>({
		plans: [],
		selectedPlan: null,
		filteredPlans: [],
		searchTerm: "",
		filterActive: null,
		isLoading: false,
		error: null,
	});

	// Setters
	const setLoading = useCallback((loading: boolean) => {
		setState((prev) => ({
			...prev,
			isLoading: loading,
		}));
	}, []);

	const setError = useCallback((error: string | null) => {
		setState((prev) => ({
			...prev,
			error,
		}));
	}, []);

	const clearError = useCallback(() => {
		setState((prev) => ({
			...prev,
			error: null,
		}));
	}, []);

	// Filter plans based on search term and active filter
	const applyFilters = useCallback((plans: PlanEntity[], searchTerm: string, filterActive: boolean | null) => {
		let filtered = [...plans];

		// Filter by active status
		if (filterActive !== null) {
			filtered = filtered.filter((plan) => plan.activo === filterActive);
		}

		// Filter by search term
		if (searchTerm.trim()) {
			const term = searchTerm.toLowerCase();
			filtered = filtered.filter(
				(plan) =>
					plan.nombre.toLowerCase().includes(term) ||
					plan.descripcion.toLowerCase().includes(term)
			);
		}

		return filtered;
	}, []);

	// Load plans from repository
	const loadPlans = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			const useCase = container.get<GetPlansUseCase>(PLAN_TOKENS.GetPlansUseCase);
			const response = await useCase.execute();

			setState((prev) => ({
				...prev,
				plans: response.data,
				filteredPlans: applyFilters(response.data, prev.searchTerm, prev.filterActive),
				isLoading: false,
			}));
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: t("plans.errors.loadPlans", "Error al cargar los planes");
			setError(errorMessage);
			setLoading(false);
		}
	}, [t, setLoading, setError, applyFilters]);

	// Create plan
	const createPlan = useCallback(
		async (planData: Omit<PlanEntity, "id">): Promise<PlanEntity | null> => {
			try {
				setLoading(true);
				setError(null);

				const useCase = container.get<CreatePlanUseCase>(PLAN_TOKENS.CreatePlanUseCase);
				const newPlan = await useCase.execute(planData);

				// Update state with new plan
				setState((prev) => {
					const updatedPlans = [...prev.plans, newPlan];
					return {
						...prev,
						plans: updatedPlans,
						filteredPlans: applyFilters(updatedPlans, prev.searchTerm, prev.filterActive),
						isLoading: false,
					};
				});

				return newPlan;
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: t("plans.errors.createPlan", "Error al crear el plan");
				setError(errorMessage);
				setLoading(false);
				return null;
			}
		},
		[t, setLoading, setError, applyFilters]
	);

	// Update plan
	const updatePlan = useCallback(
		async (id: string, planData: Partial<PlanEntity>): Promise<PlanEntity | null> => {
			try {
				setLoading(true);
				setError(null);

				const useCase = container.get<UpdatePlanUseCase>(PLAN_TOKENS.UpdatePlanUseCase);
				const updatedPlan = await useCase.execute(id, planData);

				// Update state with updated plan
				setState((prev) => {
					const updatedPlans = prev.plans.map((plan) =>
						plan.id === id ? updatedPlan : plan
					);
					return {
						...prev,
						plans: updatedPlans,
						filteredPlans: applyFilters(updatedPlans, prev.searchTerm, prev.filterActive),
						selectedPlan: prev.selectedPlan?.id === id ? updatedPlan : prev.selectedPlan,
						isLoading: false,
					};
				});

				return updatedPlan;
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: t("plans.errors.updatePlan", "Error al actualizar el plan");
				setError(errorMessage);
				setLoading(false);
				return null;
			}
		},
		[t, setLoading, setError, applyFilters]
	);

	// Delete plan
	const deletePlan = useCallback(
		async (id: string): Promise<boolean> => {
			try {
				setLoading(true);
				setError(null);

				const useCase = container.get<DeletePlanUseCase>(PLAN_TOKENS.DeletePlanUseCase);
				await useCase.execute(id);

				// Remove plan from state
				setState((prev) => {
					const updatedPlans = prev.plans.filter((plan) => plan.id !== id);
					return {
						...prev,
						plans: updatedPlans,
						filteredPlans: applyFilters(updatedPlans, prev.searchTerm, prev.filterActive),
						selectedPlan: prev.selectedPlan?.id === id ? null : prev.selectedPlan,
						isLoading: false,
					};
				});

				return true;
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: t("plans.errors.deletePlan", "Error al eliminar el plan");
				setError(errorMessage);
				setLoading(false);
				return false;
			}
		},
		[t, setLoading, setError, applyFilters]
	);

	// Select a plan
	const selectPlan = useCallback((plan: PlanEntity | null) => {
		setState((prev) => ({
			...prev,
			selectedPlan: plan,
			error: null,
		}));
	}, []);

	// Set search term and filter
	const setSearchTerm = useCallback((term: string) => {
		setState((prev) => ({
			...prev,
			searchTerm: term,
			filteredPlans: applyFilters(prev.plans, term, prev.filterActive),
			error: null,
		}));
	}, [applyFilters]);

	// Set active filter
	const setFilterActive = useCallback((filter: boolean | null) => {
		setState((prev) => ({
			...prev,
			filterActive: filter,
			filteredPlans: applyFilters(prev.plans, prev.searchTerm, filter),
			error: null,
		}));
	}, [applyFilters]);

	// Get plan by ID
	const getPlanById = useCallback(
		(id: string): PlanEntity | undefined => {
			return state.plans.find((plan) => plan.id === id);
		},
		[state.plans]
	);

	// Compare two plans
	const comparePlans = useCallback(
		(planA: PlanEntity, planB: PlanEntity) => {
			const diferenciaPrecio = planA.precio - planB.precio;
			const esMasCaro = diferenciaPrecio > 0;

			const caracteristicasA = PlanHelpers.contarCaracteristicasActivas(planA);
			const caracteristicasB = PlanHelpers.contarCaracteristicasActivas(planB);
			const esMasCompleto = caracteristicasA > caracteristicasB;

			const caracteristicasAdicionales: string[] = [];

			if (planA.caracteristicas.soporteTecnico && !planB.caracteristicas.soporteTecnico) {
				caracteristicasAdicionales.push(t("plans.features.support", "Soporte Técnico"));
			}
			if (planA.caracteristicas.reportesAvanzados && !planB.caracteristicas.reportesAvanzados) {
				caracteristicasAdicionales.push(t("plans.features.reports", "Reportes Avanzados"));
			}
			if (planA.caracteristicas.integracionContabilidad && !planB.caracteristicas.integracionContabilidad) {
				caracteristicasAdicionales.push(t("plans.features.accounting", "Integración Contabilidad"));
			}
			if (planA.caracteristicas.backup && !planB.caracteristicas.backup) {
				caracteristicasAdicionales.push(t("plans.features.backup", "Backup Automático"));
			}

			return {
				esMasCaro,
				esMasCompleto,
				diferenciaPrecio,
				caracteristicasAdicionales,
			};
		},
		[t]
	);

	// Calculate price with discount
	const calculatePriceWithDiscount = useCallback(
		(plan: PlanEntity, porcentajeDescuento: number): number => {
			return PlanHelpers.calcularPrecioConDescuento(plan, porcentajeDescuento);
		},
		[]
	);

	// Check if plan has capacity
	const checkPlanHasCapacity = useCallback(
		(plan: PlanEntity, tipo: "usuarios" | "productos" | "facturas", cantidad: number): boolean => {
			return PlanHelpers.tieneCapacidadPara(plan, tipo, cantidad);
		},
		[]
	);

	// Load plans on mount
	useEffect(() => {
		loadPlans();
	}, [loadPlans]);

	return {
		// State
		plans: state.plans,
		selectedPlan: state.selectedPlan,
		filteredPlans: state.filteredPlans,
		searchTerm: state.searchTerm,
		filterActive: state.filterActive,
		isLoading: state.isLoading,
		error: state.error,

		// Actions
		loadPlans,
		selectPlan,
		setSearchTerm,
		setFilterActive,
		setLoading,
		setError,
		clearError,
		createPlan,
		updatePlan,
		deletePlan,

		// Helpers
		getPlanById,
		comparePlans,
		calculatePriceWithDiscount,
		checkPlanHasCapacity,
	};
};

export default usePlans;
