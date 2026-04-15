import { useCallback, useEffect, useState } from "react";
import type {
	RecommendationEntity,
	RecommendationEstado,
	RecommendationUpdateStatusRequest,
} from "../../domain/entities/RecommendationEntity";
import { RecommendationDatasourceImpl } from "../../data/datasource/RecommendationDatasource";

const datasource = new RecommendationDatasourceImpl();

export interface UseRecommendationsOptions {
	/** Si true, usa GET /recommendations/admin/all (todas las recomendaciones). Si false, GET /recommendations (solo del negocio del usuario). */
	adminMode?: boolean;
}

export function useRecommendations(options: UseRecommendationsOptions = {}) {
	const { adminMode = true } = options;

	const [recommendations, setRecommendations] = useState<RecommendationEntity[]>([]);
	const [filterEstado, setFilterEstado] = useState<RecommendationEstado | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const loadRecommendations = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const result = adminMode
				? await datasource.getAdminAll(filterEstado ?? undefined)
				: await datasource.getByBusiness(filterEstado ?? undefined);
			setRecommendations(result.data ?? []);
		} catch (e: any) {
			const message = e?.response?.data?.message || e?.message || "Error al cargar recomendaciones";
			setError(message);
			setRecommendations([]);
		} finally {
			setIsLoading(false);
		}
	}, [adminMode, filterEstado]);

	useEffect(() => {
		loadRecommendations();
	}, [loadRecommendations]);

	const updateStatus = useCallback(
		async (id: string, data: RecommendationUpdateStatusRequest): Promise<RecommendationEntity | null> => {
			try {
				const updated = await datasource.updateStatus(id, data);
				setRecommendations((prev) =>
					prev.map((r) =>
						r.id === id ? { ...r, ...updated, id: r.id } : r
					)
				);
				return updated;
			} catch (e: any) {
				const message = e?.response?.data?.message || e?.message || "Error al actualizar estado";
				setError(message);
				return null;
			}
		},
		[]
	);

	const getById = useCallback(
		(id: string) => recommendations.find((r) => r.id === id),
		[recommendations]
	);

	return {
		recommendations,
		isLoading,
		error,
		filterEstado,
		setFilterEstado,
		loadRecommendations,
		updateStatus,
		getById,
	};
}
