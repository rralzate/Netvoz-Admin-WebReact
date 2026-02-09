import { useQuery } from "@tanstack/react-query";
import { container } from "@/core/di/DIContainer";
import { useBusiness } from "@/features/business/presentation/hooks/useBusiness";
import { WORKBENCH_TOKENS } from "../../di/workbench.container.config";
import type { WorkbenchData } from "../../domain/entities/WorkbenchEntity";
import type { GetWorkbenchDataUseCase } from "../../domain/usecases";

/**
 * Hook para obtener todos los datos del workbench usando Clean Architecture
 * Ahora incluye los objetivos del negocio desde BusinessEntity
 */
export const useWorkbench = (businessId: string) => {
	const { business } = useBusiness();
	const getWorkbenchDataUseCase = container.get<GetWorkbenchDataUseCase>(WORKBENCH_TOKENS.GetWorkbenchDataUseCase);

	return useQuery<WorkbenchData>({
		queryKey: ["workbench", "legacy", businessId],
		queryFn: async () => {
			// Extraer objetivos del negocio si están disponibles
			const objetivos = business?.configuracion?.objetivos;

			if (objetivos) {
				console.log("✅ Using real business objectives:", objetivos);
			} else {
				console.log("⚠️ No business objectives found, using default values");
			}

			return await getWorkbenchDataUseCase.execute(businessId, objetivos);
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
		enabled: !!businessId,
	});
};
