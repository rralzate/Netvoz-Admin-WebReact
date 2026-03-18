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

function normalizeItem(raw: any): RecommendationEntity | null {
	if (raw == null) return null;
	return {
		...raw,
		id: raw.id || raw._id,
	};
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
		const data = unwrapData(response);
		const list = Array.isArray(data) ? data : data?.data ?? [];
		return {
			data: list.map(normalizeItem),
			total: data?.total ?? list.length,
			page: data?.page ?? 1,
			pageSize: data?.pageSize ?? list.length,
		};
	}

	async getAdminAll(estado?: RecommendationEstado): Promise<RecommendationListResponse> {
		const params = new URLSearchParams();
		if (estado) params.set("estado", estado);
		const url = params.toString()
			? `${recommendationUrls.adminAll}?${params}`
			: recommendationUrls.adminAll;
		const response = await APIClient.get<any>({ url });
		const data = unwrapData(response);
		const list = Array.isArray(data) ? data : data?.data ?? [];
		return {
			data: list.map(normalizeItem),
			total: data?.total ?? list.length,
			page: data?.page ?? 1,
			pageSize: data?.pageSize ?? list.length,
		};
	}

	async getById(id: string): Promise<RecommendationEntity> {
		const response = await APIClient.get<any>({ url: recommendationUrls.byId(id) });
		return normalizeItem(unwrapData(response));
	}

	async create(data: RecommendationCreateRequest): Promise<RecommendationEntity> {
		const response = await APIClient.post<any>({ url: recommendationUrls.list, data });
		return normalizeItem(unwrapData(response));
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
		return normalizeItem(unwrapData(response));
	}

	async markPaid(recommendationId: string): Promise<RecommendationEntity> {
		const response = await APIClient.post<any>({
			url: recommendationUrls.markPaid,
			data: { recommendationId },
		});
		return normalizeItem(unwrapData(response));
	}
}
