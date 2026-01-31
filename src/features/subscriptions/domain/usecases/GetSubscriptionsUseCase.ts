import type { SubscriptionListResponse, SubscriptionStatus } from "../entities/SubscriptionEntity";
import type { SubscriptionRepository } from "../repositories/SubscriptionRepository";

export interface GetSubscriptionsUseCase {
	execute(filters?: { status?: SubscriptionStatus; page?: number; pageSize?: number }): Promise<SubscriptionListResponse>;
}

export class GetSubscriptionsUseCaseImpl implements GetSubscriptionsUseCase {
	constructor(private readonly repository: SubscriptionRepository) {}

	async execute(filters?: { status?: SubscriptionStatus; page?: number; pageSize?: number }): Promise<SubscriptionListResponse> {
		return this.repository.getAll(filters);
	}
}
