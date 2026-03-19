import APIClient from "@/core/api/apiClient";
import type {
	RecommendationEntity,
	RecommendationListResponse,
	RecommendationCreateRequest,
	RecommendationUpdateStatusRequest,
	RecommendationEstado,
} from "../../domain/entities/RecommendationEntity";
import { recommendationUrls } from "./constants";

function unwrapData<T>(response: any): T {
	if (response?.data !== undefined) return response.data as T;
	return response as T;
}

/** Respuesta de listado paginado o array plano desde el API */
type RecommendationListUnwrapped =
	| unknown[]
	| {
			data?: unknown[];
			total?: number;
			page?: number;
			pageSize?: number;
	  };

function normalizeItem(raw: any): RecommendationEntity | null {
	if (raw == null) return null;
	return {
		...raw,
		id: raw.id || raw._id,
	};
}

function requireRecommendationEntity(
	entity: RecommendationEntity | null,
	message = "Respuesta inválida del servidor",
): RecommendationEntity {
	if (!entity) throw new Error(message);
	return entity;
}

export interface RecommendationDatasource {
	getByBusiness(estado?: RecommendationEstado): Promise<RecommendationListResponse>;
	getAdminAll(estado?: RecommendationEstado): Promise<RecommendationListResponse>;
	getById(id: string): Promise<RecommendationEntity>;
	create(data: RecommendationCreateRequest): Promise<RecommendationEntity>;
	updateStatus(id: string, data: RecommendationUpdateStatusRequest): Promise<RecommendationEntity>;
	markRegistered(recommendationId: string): Promise<RecommendationEntity>;
	markPaid(recommendationId: string): Promise<RecommendationEntity>;
}

export class RecommendationDatasourceImpl implements RecommendationDatasource {
	async getByBusiness(estado?: RecommendationEstado): Promise<RecommendationListResponse> {
		const params = new URLSearchParams();
		if (estado) params.set("estado", estado);
		const url = params.toString() ? `${recommendationUrls.list}?${params}` : recommendationUrls.list;
		const response = await APIClient.get<any>({ url });
		const data = unwrapData<RecommendationListUnwrapped>(response);
		const list = Array.isArray(data) ? data : (data?.data ?? []);
		const meta = Array.isArray(data) ? undefined : data;
		return {
			data: list
				.map(normalizeItem)
				.filter((item): item is RecommendationEntity => item != null),
			total: meta?.total ?? list.length,
			page: meta?.page ?? 1,
			pageSize: meta?.pageSize ?? list.length,
		};
	}

	async getAdminAll(estado?: RecommendationEstado): Promise<RecommendationListResponse> {
		const params = new URLSearchParams();
		if (estado) params.set("estado", estado);
		const url = params.toString()
			? `${recommendationUrls.adminAll}?${params}`
			: recommendationUrls.adminAll;
		const response = await APIClient.get<any>({ url });
		const data = unwrapData<RecommendationListUnwrapped>(response);
		const list = Array.isArray(data) ? data : (data?.data ?? []);
		const meta = Array.isArray(data) ? undefined : data;
		return {
			data: list
				.map(normalizeItem)
				.filter((item): item is RecommendationEntity => item != null),
			total: meta?.total ?? list.length,
			page: meta?.page ?? 1,
			pageSize: meta?.pageSize ?? list.length,
		};
	}

	async getById(id: string): Promise<RecommendationEntity> {
		const response = await APIClient.get<any>({ url: recommendationUrls.byId(id) });
		return requireRecommendationEntity(normalizeItem(unwrapData(response)));
	}

	async create(data: RecommendationCreateRequest): Promise<RecommendationEntity> {
		const response = await APIClient.post<any>({ url: recommendationUrls.list, data });
		return requireRecommendationEntity(normalizeItem(unwrapData(response)));
	}

	async updateStatus(
		id: string,
		data: RecommendationUpdateStatusRequest
	): Promise<RecommendationEntity> {
		const response = await APIClient.patch<any>({
			url: recommendationUrls.status(id),
			data,
		});
		const raw = unwrapData(response);
		const normalized = normalizeItem(raw);
		// Si el API responde success pero data: null, actualizamos en memoria con el payload enviado
		if (normalized) return normalized;
		return { id, ...data } as RecommendationEntity;
	}

	async markRegistered(recommendationId: string): Promise<RecommendationEntity> {
		const response = await APIClient.post<any>({
			url: recommendationUrls.markRegistered,
			data: { recommendationId },
		});
		return requireRecommendationEntity(normalizeItem(unwrapData(response)));
	}

	async markPaid(recommendationId: string): Promise<RecommendationEntity> {
		const response = await APIClient.post<any>({
			url: recommendationUrls.markPaid,
			data: { recommendationId },
		});
		return requireRecommendationEntity(normalizeItem(unwrapData(response)));
	}
}
