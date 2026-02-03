import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { container } from "@/core/di/DIContainer";
import { SUBSCRIPTION_TOKENS } from "../../di/subscriptions.container.config";
import type {
	GetSubscriptionsUseCase,
	CreateSubscriptionUseCase,
	UpdateSubscriptionUseCase,
	DeleteSubscriptionUseCase,
} from "../../domain/usecases";
import type {
	SubscriptionEntity,
	SubscriptionEstado,
	SubscriptionCreateRequest,
	SubscriptionUpdateRequest,
} from "../../domain/entities/SubscriptionEntity";
import { SubscriptionHelpers } from "../../domain/entities/SubscriptionEntity";

// State interface
export interface SubscriptionsState {
	subscriptions: SubscriptionEntity[];
	selectedSubscription: SubscriptionEntity | null;
	filteredSubscriptions: SubscriptionEntity[];
	searchTerm: string;
	filterEstado: SubscriptionEstado | null;
	isLoading: boolean;
	error: string | null;
}

// Return interface
export interface UseSubscriptionsReturn {
	// State
	subscriptions: SubscriptionEntity[];
	selectedSubscription: SubscriptionEntity | null;
	filteredSubscriptions: SubscriptionEntity[];
	searchTerm: string;
	filterEstado: SubscriptionEstado | null;
	isLoading: boolean;
	error: string | null;

	// Actions
	loadSubscriptions: () => Promise<void>;
	selectSubscription: (subscription: SubscriptionEntity | null) => void;
	setSearchTerm: (term: string) => void;
	setFilterEstado: (estado: SubscriptionEstado | null) => void;
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
	clearError: () => void;
	createSubscription: (data: SubscriptionCreateRequest) => Promise<SubscriptionEntity | null>;
	updateSubscription: (id: string, data: SubscriptionUpdateRequest) => Promise<SubscriptionEntity | null>;
	deleteSubscription: (id: string) => Promise<boolean>;

	// Helpers
	findSubscriptionById: (id: string) => SubscriptionEntity | undefined;
	getActiveSubscriptions: () => SubscriptionEntity[];
	getExpiredSubscriptions: () => SubscriptionEntity[];
	getPendingSubscriptions: () => SubscriptionEntity[];
	getSubscriptionsNeedingRenewal: (days?: number) => SubscriptionEntity[];
	calculateTotalRevenue: () => number;
}

export const useSubscriptions = (): UseSubscriptionsReturn => {
	const { t } = useTranslation();

	const [state, setState] = useState<SubscriptionsState>({
		subscriptions: [],
		selectedSubscription: null,
		filteredSubscriptions: [],
		searchTerm: "",
		filterEstado: null,
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

	// Filter subscriptions based on search term and estado filter
	const applyFilters = useCallback(
		(subscriptions: SubscriptionEntity[], searchTerm: string, filterEstado: SubscriptionEstado | null) => {
			let filtered = [...subscriptions];

			// Filter by estado
			if (filterEstado !== null) {
				filtered = filtered.filter((sub) => sub.estado === filterEstado);
			}

			// Filter by search term
			if (searchTerm.trim()) {
				const term = searchTerm.toLowerCase();
				filtered = filtered.filter(
					(sub) =>
						sub.nombreNegocio?.toLowerCase().includes(term) ||
						sub.nombrePlan?.toLowerCase().includes(term) ||
						sub.negocioId.toLowerCase().includes(term)
				);
			}

			return filtered;
		},
		[]
	);

	// Load subscriptions from repository
	const loadSubscriptions = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			const useCase = container.get<GetSubscriptionsUseCase>(SUBSCRIPTION_TOKENS.GetSubscriptionsUseCase);
			const response = await useCase.execute();

			setState((prev) => ({
				...prev,
				subscriptions: response.data,
				filteredSubscriptions: applyFilters(response.data, prev.searchTerm, prev.filterEstado),
				isLoading: false,
			}));
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: t("subscriptions.errors.load", "Error al cargar las suscripciones");
			setError(errorMessage);
			setLoading(false);
		}
	}, [t, setLoading, setError, applyFilters]);

	// Create subscription
	const createSubscription = useCallback(
		async (data: SubscriptionCreateRequest): Promise<SubscriptionEntity | null> => {
			try {
				setLoading(true);
				setError(null);

				const useCase = container.get<CreateSubscriptionUseCase>(SUBSCRIPTION_TOKENS.CreateSubscriptionUseCase);
				const newSubscription = await useCase.execute(data);

				// Update state with new subscription
				setState((prev) => {
					const updatedSubscriptions = [...prev.subscriptions, newSubscription];
					return {
						...prev,
						subscriptions: updatedSubscriptions,
						filteredSubscriptions: applyFilters(updatedSubscriptions, prev.searchTerm, prev.filterEstado),
						isLoading: false,
					};
				});

				return newSubscription;
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: t("subscriptions.errors.create", "Error al crear la suscripción");
				setError(errorMessage);
				setLoading(false);
				return null;
			}
		},
		[t, setLoading, setError, applyFilters]
	);

	// Update subscription
	const updateSubscription = useCallback(
		async (id: string, data: SubscriptionUpdateRequest): Promise<SubscriptionEntity | null> => {
			try {
				setLoading(true);
				setError(null);

				const useCase = container.get<UpdateSubscriptionUseCase>(SUBSCRIPTION_TOKENS.UpdateSubscriptionUseCase);
				const updatedSubscription = await useCase.execute(id, data);

				// Update state with updated subscription
				setState((prev) => {
					const updatedSubscriptions = prev.subscriptions.map((sub) =>
						sub.id === id ? updatedSubscription : sub
					);
					return {
						...prev,
						subscriptions: updatedSubscriptions,
						filteredSubscriptions: applyFilters(updatedSubscriptions, prev.searchTerm, prev.filterEstado),
						selectedSubscription:
							prev.selectedSubscription?.id === id ? updatedSubscription : prev.selectedSubscription,
						isLoading: false,
					};
				});

				return updatedSubscription;
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: t("subscriptions.errors.update", "Error al actualizar la suscripción");
				setError(errorMessage);
				setLoading(false);
				return null;
			}
		},
		[t, setLoading, setError, applyFilters]
	);

	// Delete subscription
	const deleteSubscription = useCallback(
		async (id: string): Promise<boolean> => {
			try {
				setLoading(true);
				setError(null);

				const useCase = container.get<DeleteSubscriptionUseCase>(SUBSCRIPTION_TOKENS.DeleteSubscriptionUseCase);
				await useCase.execute(id);

				// Remove subscription from state
				setState((prev) => {
					const updatedSubscriptions = prev.subscriptions.filter((sub) => sub.id !== id);
					return {
						...prev,
						subscriptions: updatedSubscriptions,
						filteredSubscriptions: applyFilters(updatedSubscriptions, prev.searchTerm, prev.filterEstado),
						selectedSubscription: prev.selectedSubscription?.id === id ? null : prev.selectedSubscription,
						isLoading: false,
					};
				});

				return true;
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: t("subscriptions.errors.delete", "Error al eliminar la suscripción");
				setError(errorMessage);
				setLoading(false);
				return false;
			}
		},
		[t, setLoading, setError, applyFilters]
	);

	// Select a subscription
	const selectSubscription = useCallback((subscription: SubscriptionEntity | null) => {
		setState((prev) => ({
			...prev,
			selectedSubscription: subscription,
			error: null,
		}));
	}, []);

	// Set search term
	const setSearchTerm = useCallback(
		(term: string) => {
			setState((prev) => ({
				...prev,
				searchTerm: term,
				filteredSubscriptions: applyFilters(prev.subscriptions, term, prev.filterEstado),
				error: null,
			}));
		},
		[applyFilters]
	);

	// Set estado filter
	const setFilterEstado = useCallback(
		(estado: SubscriptionEstado | null) => {
			setState((prev) => ({
				...prev,
				filterEstado: estado,
				filteredSubscriptions: applyFilters(prev.subscriptions, prev.searchTerm, estado),
				error: null,
			}));
		},
		[applyFilters]
	);

	// Find subscription by ID (from local state)
	const findSubscriptionById = useCallback(
		(id: string): SubscriptionEntity | undefined => {
			return state.subscriptions.find((sub) => sub.id === id);
		},
		[state.subscriptions]
	);

	// Get active subscriptions
	const getActiveSubscriptions = useCallback((): SubscriptionEntity[] => {
		return state.subscriptions.filter((sub) => SubscriptionHelpers.estaActiva(sub));
	}, [state.subscriptions]);

	// Get expired subscriptions
	const getExpiredSubscriptions = useCallback((): SubscriptionEntity[] => {
		return state.subscriptions.filter((sub) => sub.estado === "vencida");
	}, [state.subscriptions]);

	// Get pending subscriptions
	const getPendingSubscriptions = useCallback((): SubscriptionEntity[] => {
		return state.subscriptions.filter((sub) => sub.estado === "pendiente_pago");
	}, [state.subscriptions]);

	// Get subscriptions needing renewal
	const getSubscriptionsNeedingRenewal = useCallback(
		(days: number = 7): SubscriptionEntity[] => {
			return state.subscriptions.filter((sub) => SubscriptionHelpers.necesitaRenovacion(sub, days));
		},
		[state.subscriptions]
	);

	// Calculate total revenue from all subscriptions
	const calculateTotalRevenue = useCallback((): number => {
		return state.subscriptions.reduce((total, sub) => {
			return total + SubscriptionHelpers.calcularTotalPagado(sub);
		}, 0);
	}, [state.subscriptions]);

	// Load subscriptions on mount
	useEffect(() => {
		loadSubscriptions();
	}, [loadSubscriptions]);

	return {
		// State
		subscriptions: state.subscriptions,
		selectedSubscription: state.selectedSubscription,
		filteredSubscriptions: state.filteredSubscriptions,
		searchTerm: state.searchTerm,
		filterEstado: state.filterEstado,
		isLoading: state.isLoading,
		error: state.error,

		// Actions
		loadSubscriptions,
		selectSubscription,
		setSearchTerm,
		setFilterEstado,
		setLoading,
		setError,
		clearError,
		createSubscription,
		updateSubscription,
		deleteSubscription,

		// Helpers
		findSubscriptionById,
		getActiveSubscriptions,
		getExpiredSubscriptions,
		getPendingSubscriptions,
		getSubscriptionsNeedingRenewal,
		calculateTotalRevenue,
	};
};

export default useSubscriptions;
