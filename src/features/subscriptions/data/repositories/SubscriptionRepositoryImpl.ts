import type { SubscriptionEntity, SubscriptionListResponse, SubscriptionStatus } from "../../domain/entities/SubscriptionEntity";
import type { SubscriptionRepository } from "../../domain/repositories/SubscriptionRepository";
import type { SubscriptionDatasource } from "../datasource/SubscriptionDatasource";

export class SubscriptionRepositoryImpl implements SubscriptionRepository {
	constructor(private readonly datasource: SubscriptionDatasource) {}

	async getAll(filters?: { status?: SubscriptionStatus; page?: number; pageSize?: number }): Promise<SubscriptionListResponse> {
		return this.datasource.getAll(filters);
	}

	async getById(id: string): Promise<SubscriptionEntity> {
		return this.datasource.getById(id);
	}

	async create(data: Omit<SubscriptionEntity, "id">): Promise<SubscriptionEntity> {
		return this.datasource.create(data);
	}

	async update(id: string, data: Partial<SubscriptionEntity>): Promise<SubscriptionEntity> {
		return this.datasource.update(id, data);
	}

	async delete(id: string): Promise<void> {
		return this.datasource.delete(id);
	}
}
