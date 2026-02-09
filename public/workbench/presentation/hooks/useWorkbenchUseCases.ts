import { useMutation, useQuery } from "@tanstack/react-query";
import { container } from "@/core/di/DIContainer";
import { useBusiness } from "@/features/business/presentation/hooks/useBusiness";
import { WORKBENCH_TOKENS } from "../../di/workbench.container.config";
import type { OrderByHour, RevenueByDay, TopProduct, WorkbenchData } from "../../domain/entities/WorkbenchEntity";
import type {
	GetOrdersByHourUseCase,
	GetRevenueLast7DaysUseCase,
	GetTop5ProductsThisMonthUseCase,
	GetTotalRevenueUseCase,
	GetWorkbenchDataUseCase,
} from "../../domain/usecases";

/**
 * Hook para usar los casos de uso del workbench con Clean Architecture
 */
export const useWorkbenchUseCases = () => {
	// Obtener instancias de los casos de uso desde el contenedor
	const getOrdersByHourUseCase = container.get<GetOrdersByHourUseCase>(WORKBENCH_TOKENS.GetOrdersByHourUseCase);
	const getRevenueLast7DaysUseCase = container.get<GetRevenueLast7DaysUseCase>(
		WORKBENCH_TOKENS.GetRevenueLast7DaysUseCase,
	);
	const getTotalRevenueUseCase = container.get<GetTotalRevenueUseCase>(WORKBENCH_TOKENS.GetTotalRevenueUseCase);
	const getTop5ProductsUseCase = container.get<GetTop5ProductsThisMonthUseCase>(
		WORKBENCH_TOKENS.GetTop5ProductsThisMonthUseCase,
	);
	const getWorkbenchDataUseCase = container.get<GetWorkbenchDataUseCase>(WORKBENCH_TOKENS.GetWorkbenchDataUseCase);

	return {
		getOrdersByHourUseCase,
		getRevenueLast7DaysUseCase,
		getTotalRevenueUseCase,
		getTop5ProductsUseCase,
		getWorkbenchDataUseCase,
	};
};

/**
 * Hook para obtener órdenes por hora
 */
export const useGetOrdersByHour = (businessId: string) => {
	const { getOrdersByHourUseCase } = useWorkbenchUseCases();

	return useQuery<OrderByHour[]>({
		queryKey: ["workbench", "ordersByHour", businessId],
		queryFn: async () => {
			const today = new Date();
			return await getOrdersByHourUseCase.execute(today, businessId, { lastHours: 12 });
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
		enabled: !!businessId,
	});
};

/**
 * Hook para obtener ingresos de los últimos 7 días
 */
export const useGetRevenueLast7Days = () => {
	const { getRevenueLast7DaysUseCase } = useWorkbenchUseCases();

	return useQuery<RevenueByDay[]>({
		queryKey: ["workbench", "revenueLast7Days"],
		queryFn: async () => {
			return await getRevenueLast7DaysUseCase.execute();
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
	});
};

/**
 * Hook para obtener el total de ingresos
 */
export const useGetTotalRevenue = (startDate: Date, endDate: Date) => {
	const { getTotalRevenueUseCase } = useWorkbenchUseCases();

	return useQuery<number>({
		queryKey: ["workbench", "totalRevenue", startDate.toISOString(), endDate.toISOString()],
		queryFn: async () => {
			return await getTotalRevenueUseCase.execute(startDate, endDate);
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
		enabled: !!startDate && !!endDate,
	});
};

/**
 * Hook para obtener los top 5 productos del mes
 */
export const useGetTop5ProductsThisMonth = (startDate: Date, endDate: Date) => {
	const { getTop5ProductsUseCase } = useWorkbenchUseCases();

	return useQuery<TopProduct[]>({
		queryKey: ["workbench", "top5Products", startDate.toISOString(), endDate.toISOString()],
		queryFn: async () => {
			return await getTop5ProductsUseCase.execute(startDate, endDate);
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
		enabled: !!startDate && !!endDate,
	});
};

/**
 * Hook principal para obtener todos los datos del workbench
 */
export const useGetWorkbenchData = (businessId: string) => {
	const { getWorkbenchDataUseCase } = useWorkbenchUseCases();

	// Import useBusiness here to avoid circular dependency
	const { business } = useBusiness();

	return useQuery<WorkbenchData>({
		queryKey: ["workbench", "allData", businessId],
		queryFn: async () => {
			// Extraer objetivos del negocio si están disponibles
			const objetivos = business?.configuracion?.objetivos;
			return await getWorkbenchDataUseCase.execute(businessId, objetivos);
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
		enabled: !!businessId,
	});
};

/**
 * Hook para mutaciones (actualizar datos)
 */
export const useWorkbenchMutations = () => {
	const { getOrdersByHourUseCase, getRevenueLast7DaysUseCase, getTotalRevenueUseCase, getTop5ProductsUseCase } =
		useWorkbenchUseCases();

	const refreshOrdersByHour = useMutation({
		mutationFn: async ({
			businessId,
			targetDate,
			options,
		}: {
			businessId: string;
			targetDate: Date;
			options?: { lastHours?: number; range?: { start: string; end: string } };
		}) => {
			return await getOrdersByHourUseCase.execute(targetDate, businessId, options);
		},
	});

	const refreshRevenueLast7Days = useMutation({
		mutationFn: async () => {
			return await getRevenueLast7DaysUseCase.execute();
		},
	});

	const refreshTotalRevenue = useMutation({
		mutationFn: async ({ startDate, endDate }: { startDate: Date; endDate: Date }) => {
			return await getTotalRevenueUseCase.execute(startDate, endDate);
		},
	});

	const refreshTop5Products = useMutation({
		mutationFn: async ({ startDate, endDate }: { startDate: Date; endDate: Date }) => {
			return await getTop5ProductsUseCase.execute(startDate, endDate);
		},
	});

	return {
		refreshOrdersByHour,
		refreshRevenueLast7Days,
		refreshTotalRevenue,
		refreshTop5Products,
		isAnyLoading:
			refreshOrdersByHour.isPending ||
			refreshRevenueLast7Days.isPending ||
			refreshTotalRevenue.isPending ||
			refreshTop5Products.isPending,
	};
};
