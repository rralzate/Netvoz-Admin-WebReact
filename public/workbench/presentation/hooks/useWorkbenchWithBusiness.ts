import { useQuery } from "@tanstack/react-query";
import { container } from "@/core/di/DIContainer";
import { useBusiness } from "@/features/business/presentation/hooks/useBusiness";
import { WORKBENCH_TOKENS } from "../../di/workbench.container.config";
import type { WorkbenchData } from "../../domain/entities/WorkbenchEntity";
import type { GetWorkbenchDataUseCase } from "../../domain/usecases";

/**
 * Hook que combina los datos del workbench con los objetivos del negocio
 * Obtiene los objetivos desde BusinessEntity y los pasa al GetWorkbenchDataUseCase
 */
export const useWorkbenchWithBusiness = (businessId: string) => {
	const { business } = useBusiness();
	const getWorkbenchDataUseCase = container.get<GetWorkbenchDataUseCase>(WORKBENCH_TOKENS.GetWorkbenchDataUseCase);

	return useQuery<WorkbenchData>({
		queryKey: ["workbench", "withBusiness", businessId],
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
