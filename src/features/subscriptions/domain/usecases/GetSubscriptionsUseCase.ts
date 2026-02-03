import type { SubscriptionListResponse, SubscriptionEstado } from "../entities/SubscriptionEntity";
import type { SubscriptionRepository } from "../repositories/SubscriptionRepository";

export interface GetSubscriptionsUseCase {
	execute(filters?: { estado?: SubscriptionEstado; page?: number; pageSize?: number }): Promise<SubscriptionListResponse>;
}

export class GetSubscriptionsUseCaseImpl implements GetSubscriptionsUseCase {
	constructor(private readonly repository: SubscriptionRepository) {}

	async execute(filters?: { estado?: SubscriptionEstado; page?: number; pageSize?: number }): Promise<SubscriptionListResponse> {
		return this.repository.getAll(filters);
	}
}
