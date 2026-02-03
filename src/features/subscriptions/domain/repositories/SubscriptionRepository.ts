import type {
	SubscriptionEntity,
	SubscriptionListResponse,
	SubscriptionEstado,
	SubscriptionCreateRequest,
	SubscriptionUpdateRequest,
} from "../entities/SubscriptionEntity";

export interface SubscriptionRepository {
	getAll(filters?: { estado?: SubscriptionEstado; page?: number; pageSize?: number }): Promise<SubscriptionListResponse>;
	getById(id: string): Promise<SubscriptionEntity>;
	create(data: SubscriptionCreateRequest): Promise<SubscriptionEntity>;
	update(id: string, data: SubscriptionUpdateRequest): Promise<SubscriptionEntity>;
	delete(id: string): Promise<void>;
}
