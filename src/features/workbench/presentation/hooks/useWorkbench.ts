import { useQuery } from "@tanstack/react-query";
import { container } from "@/core/di/DIContainer";
import { useUserInfo } from "@/features/auth/presentation/hooks/userStore";
import { WORKBENCH_TOKENS } from "../../di/workbench.container.config";
import type { WorkbenchData, ObjetivosConfig } from "../../domain/entities/WorkbenchEntity";
import type { GetWorkbenchDataUseCase } from "../../domain/usecases";

/**
 * Hook para obtener todos los datos del workbench usando Clean Architecture
 * Obtiene los objetivos del negocio desde el endpoint /business/get-business-by-business/:negocioId
 */
export const useWorkbench = (objetivosOverride?: ObjetivosConfig) => {
	const { negocioId } = useUserInfo();
	const getWorkbenchDataUseCase = container.get<GetWorkbenchDataUseCase>(WORKBENCH_TOKENS.GetWorkbenchDataUseCase);


	return useQuery<WorkbenchData>({
		queryKey: ["workbench", "data", negocioId, objetivosOverride],
		queryFn: async () => {
			return await getWorkbenchDataUseCase.execute(negocioId || undefined, objetivosOverride);
		},
		staleTime: 2 * 60 * 1000, // 2 minutes
		refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
	});
};

export default useWorkbench;
