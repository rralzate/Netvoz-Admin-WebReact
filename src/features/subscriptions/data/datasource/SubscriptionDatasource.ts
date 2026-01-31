import APIClient from "@/core/api/apiClient";
import type { SubscriptionEntity, SubscriptionListResponse, SubscriptionStatus } from "../../domain/entities/SubscriptionEntity";
import { urls } from "./constants";

export interface SubscriptionDatasource {
	getAll(filters?: { status?: SubscriptionStatus; page?: number; pageSize?: number }): Promise<SubscriptionListResponse>;
	getById(id: string): Promise<SubscriptionEntity>;
	create(data: Omit<SubscriptionEntity, "id">): Promise<SubscriptionEntity>;
	update(id: string, data: Partial<SubscriptionEntity>): Promise<SubscriptionEntity>;
	delete(id: string): Promise<void>;
}

export class SubscriptionDatasourceImpl implements SubscriptionDatasource {
	async getAll(filters?: { status?: SubscriptionStatus; page?: number; pageSize?: number }): Promise<SubscriptionListResponse> {
		const params = new URLSearchParams();
		if (filters?.status) params.append("status", filters.status);
		if (filters?.page) params.append("page", String(filters.page));
		if (filters?.pageSize) params.append("pageSize", String(filters.pageSize));

		const queryString = params.toString();
		const url = queryString ? `${urls.subscriptions}?${queryString}` : urls.subscriptions;

		const response = await APIClient.get<SubscriptionListResponse>({ url });
		return response;
	}

	async getById(id: string): Promise<SubscriptionEntity> {
		const response = await APIClient.get<SubscriptionEntity>({ url: urls.subscriptionById(id) });
		return response;
	}

	async create(data: Omit<SubscriptionEntity, "id">): Promise<SubscriptionEntity> {
		const response = await APIClient.post<SubscriptionEntity>({ url: urls.subscriptions, data });
		return response;
	}

	async update(id: string, data: Partial<SubscriptionEntity>): Promise<SubscriptionEntity> {
		const response = await APIClient.put<SubscriptionEntity>({ url: urls.subscriptionById(id), data });
		return response;
	}

	async delete(id: string): Promise<void> {
		await APIClient.delete<void>({ url: urls.subscriptionById(id) });
	}
}
