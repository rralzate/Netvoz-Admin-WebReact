// Hooks existentes
export { useWorkbench } from "./useWorkbench";
// Hooks para auto-refresh
export { useWorkbenchAutoRefresh } from "./useWorkbenchAutoRefresh";
export { useWorkbenchAutoRefreshAdvanced } from "./useWorkbenchAutoRefreshAdvanced";
// Nuevos hooks con Clean Architecture
export {
	useGetOrdersByHour,
	useGetRevenueLast7Days,
	useGetTop5ProductsThisMonth,
	useGetTotalRevenue,
	useGetWorkbenchData,
	useWorkbenchMutations,
	useWorkbenchUseCases,
} from "./useWorkbenchUseCases";
// Hook con integración de objetivos del negocio
export { useWorkbenchWithBusiness } from "./useWorkbenchWithBusiness";
