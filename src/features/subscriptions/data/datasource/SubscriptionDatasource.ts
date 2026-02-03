import APIClient from "@/core/api/apiClient";
import type {
	SubscriptionEntity,
	SubscriptionListResponse,
	SubscriptionEstado,
	SubscriptionCreateRequest,
	SubscriptionUpdateRequest,
} from "../../domain/entities/SubscriptionEntity";
import { urls } from "./constants";

export interface SubscriptionDatasource {
	getAll(filters?: { estado?: SubscriptionEstado; page?: number; pageSize?: number }): Promise<SubscriptionListResponse>;
	getById(id: string): Promise<SubscriptionEntity>;
	create(data: SubscriptionCreateRequest): Promise<SubscriptionEntity>;
	update(id: string, data: SubscriptionUpdateRequest): Promise<SubscriptionEntity>;
	delete(id: string): Promise<void>;
}

export class SubscriptionDatasourceImpl implements SubscriptionDatasource {
	async getAll(filters?: { estado?: SubscriptionEstado; page?: number; pageSize?: number }): Promise<SubscriptionListResponse> {
		const params = new URLSearchParams();
		if (filters?.estado) params.append("estado", filters.estado);
		if (filters?.page) params.append("page", String(filters.page));
		if (filters?.pageSize) params.append("pageSize", String(filters.pageSize));

		const queryString = params.toString();
		const url = queryString ? `${urls.subscriptionsAll}?${queryString}` : urls.subscriptionsAll;

		const response = await APIClient.get<any>({ url });

		console.log("=== SubscriptionDatasource.getAll ===");
		console.log("Raw response:", response);

		// La API envuelve la respuesta en { data: [...], status: "success", ... }
		// Extraer el array de suscripciones
		let rawData: any[];
		if (Array.isArray(response)) {
			// Respuesta es directamente un array
			rawData = response;
		} else if (response?.data && Array.isArray(response.data)) {
			// Respuesta envuelta: { data: [...] }
			rawData = response.data;
		} else if (response?.data?.data && Array.isArray(response.data.data)) {
			// Doble envuelta: { data: { data: [...] } }
			rawData = response.data.data;
		} else {
			console.error("Estructura de respuesta desconocida:", response);
			rawData = [];
		}

		console.log("Extracted subscriptions:", rawData.length, rawData);

		// Mapear _id a id si es necesario (MongoDB usa _id)
		const mappedData = rawData.map((item: any) => ({
			...item,
			id: item.id || item._id,
		}));

		return {
			data: mappedData,
			total: response?.total || response?.data?.total || mappedData.length,
			page: response?.page || response?.data?.page || 1,
			pageSize: response?.pageSize || response?.data?.pageSize || mappedData.length,
		};
	}

	async getById(id: string): Promise<SubscriptionEntity> {
		const response = await APIClient.get<any>({ url: urls.subscriptionById(id) });
		console.log("SubscriptionDatasource.getById - Raw response:", response);

		// La API envuelve la respuesta en { data: {...}, status: "success", ... }
		const subscriptionData = response?.data || response;

		// Mapear _id a id si es necesario
		return {
			...subscriptionData,
			id: subscriptionData.id || subscriptionData._id,
		};
	}

	async create(data: SubscriptionCreateRequest): Promise<SubscriptionEntity> {
		const response = await APIClient.post<any>({ url: urls.subscriptions, data });
		console.log("SubscriptionDatasource.create - Raw response:", response);

		// La API envuelve la respuesta en { data: {...}, status: "success", ... }
		const subscriptionData = response?.data || response;

		return {
			...subscriptionData,
			id: subscriptionData.id || subscriptionData._id,
		};
	}

	async update(id: string, data: SubscriptionUpdateRequest): Promise<SubscriptionEntity> {
		console.log("SubscriptionDatasource.update - URL:", urls.subscriptionById(id));
		console.log("SubscriptionDatasource.update - Data:", JSON.stringify(data, null, 2));

		const response = await APIClient.put<any>({ url: urls.subscriptionById(id), data });

		console.log("SubscriptionDatasource.update - Raw Response:", response);

		// La API envuelve la respuesta en { data: {...}, status: "success", ... }
		const subscriptionData = response?.data || response;

		console.log("SubscriptionDatasource.update - Subscription Data:", subscriptionData);

		// Mapear _id a id si es necesario
		const mapped = {
			...subscriptionData,
			id: subscriptionData.id || subscriptionData._id,
		};

		console.log("SubscriptionDatasource.update - Mapped:", mapped);
		return mapped;
	}

	async delete(id: string): Promise<void> {
		await APIClient.delete<void>({ url: urls.subscriptionById(id) });
	}
}
