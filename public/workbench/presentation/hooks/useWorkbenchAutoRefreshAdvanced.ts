import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useUserInfo } from "@/features/auth/presentation/hooks/userStore";

/**
 * Hook avanzado que automáticamente invalida y refresca todas las queries del workbench
 * cuando cambia el usuario o el negocio
 */
export const useWorkbenchAutoRefreshAdvanced = () => {
	const { negocioId } = useUserInfo();
	const queryClient = useQueryClient();
	const previousBusinessIdRef = useRef<string | undefined>(undefined);
	const previousUserIdRef = useRef<string | undefined>(undefined);

	useEffect(() => {
		const currentBusinessId = negocioId;
		const currentUserId = undefined; // No tenemos userInfo en useUserInfo

		// Si es la primera carga y tenemos datos, guardar la referencia
		if (!previousBusinessIdRef.current && !previousUserIdRef.current) {
			previousBusinessIdRef.current = currentBusinessId;
			previousUserIdRef.current = currentUserId;
			return;
		}

		// Si cambió el businessId o el userId, invalidar todas las queries del workbench
		const businessIdChanged = previousBusinessIdRef.current !== currentBusinessId;
		const userIdChanged = previousUserIdRef.current !== currentUserId;

		if (businessIdChanged || userIdChanged) {
			console.log("🔄 User or business changed, invalidating all workbench queries:", {
				previousBusinessId: previousBusinessIdRef.current,
				currentBusinessId,
				previousUserId: previousUserIdRef.current,
				currentUserId,
				businessIdChanged,
				userIdChanged,
			});

			// Actualizar las referencias
			previousBusinessIdRef.current = currentBusinessId;
			previousUserIdRef.current = currentUserId;

			// Invalidar todas las queries que empiecen con "workbench"
			queryClient.invalidateQueries({
				queryKey: ["workbench"],
			});

			// También invalidar queries específicas del workbench
			queryClient.invalidateQueries({
				queryKey: ["workbench", "ordersByHour"],
			});

			queryClient.invalidateQueries({
				queryKey: ["workbench", "revenueLast7Days"],
			});

			queryClient.invalidateQueries({
				queryKey: ["workbench", "totalRevenue"],
			});

			queryClient.invalidateQueries({
				queryKey: ["workbench", "top5Products"],
			});

			queryClient.invalidateQueries({
				queryKey: ["workbench", "allData"],
			});

			queryClient.invalidateQueries({
				queryKey: ["workbench", "legacy"],
			});
		}
	}, [negocioId, queryClient]);

	// Limpiar referencias cuando el componente se desmonta
	useEffect(() => {
		return () => {
			previousBusinessIdRef.current = undefined;
			previousUserIdRef.current = undefined;
		};
	}, []);

	return {
		// Función para invalidar manualmente todas las queries del workbench
		invalidateAllWorkbenchQueries: () => {
			queryClient.invalidateQueries({
				queryKey: ["workbench"],
			});
		},
		// Función para limpiar todas las queries del workbench
		clearAllWorkbenchQueries: () => {
			queryClient.removeQueries({
				queryKey: ["workbench"],
			});
		},
	};
};
