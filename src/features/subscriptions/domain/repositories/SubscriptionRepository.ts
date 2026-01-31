import type { SubscriptionEntity, SubscriptionListResponse, SubscriptionStatus } from "../entities/SubscriptionEntity";

export interface SubscriptionRepository {
	getAll(filters?: { status?: SubscriptionStatus; page?: number; pageSize?: number }): Promise<SubscriptionListResponse>;
	getById(id: string): Promise<SubscriptionEntity>;
	create(data: Omit<SubscriptionEntity, "id">): Promise<SubscriptionEntity>;
	update(id: string, data: Partial<SubscriptionEntity>): Promise<SubscriptionEntity>;
	delete(id: string): Promise<void>;
}
