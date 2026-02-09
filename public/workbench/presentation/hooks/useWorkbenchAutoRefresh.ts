import { useEffect, useRef } from "react";
import { useUserInfo } from "@/features/auth/presentation/hooks/userStore";

/**
 * Hook que automáticamente refresca los datos del workbench cuando cambia el usuario
 * @param refetch - Función de refetch de TanStack Query
 */
export const useWorkbenchAutoRefresh = (refetch: () => void) => {
	const { negocioId } = useUserInfo();
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

		// Si cambió el businessId o el userId, refrescar los datos
		const businessIdChanged = previousBusinessIdRef.current !== currentBusinessId;
		const userIdChanged = previousUserIdRef.current !== currentUserId;

		if (businessIdChanged || userIdChanged) {
			console.log("🔄 User or business changed, refreshing workbench data:", {
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

			// Solo refrescar si tenemos un businessId válido
			if (currentBusinessId) {
				refetch();
			}
		}
	}, [negocioId, refetch]);

	// Limpiar referencias cuando el componente se desmonta
	useEffect(() => {
		return () => {
			previousBusinessIdRef.current = undefined;
			previousUserIdRef.current = undefined;
		};
	}, []);
};
