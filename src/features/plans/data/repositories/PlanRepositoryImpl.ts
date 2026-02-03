import type { PlanEntity, PlanListResponse } from "../../domain/entities/PlanEntity";
import type { PlanRepository } from "../../domain/repositories/PlanRepository";
import type { PlanDatasource } from "../datasource/PlanDatasource";

export class PlanRepositoryImpl implements PlanRepository {
	constructor(private readonly datasource: PlanDatasource) {}

	async getAll(): Promise<PlanListResponse> {
		return this.datasource.getAll();
	}

	async getById(id: string): Promise<PlanEntity> {
		return this.datasource.getById(id);
	}

	async create(data: Omit<PlanEntity, "id">): Promise<PlanEntity> {
		return this.datasource.create(data);
	}

	async update(id: string, data: Partial<PlanEntity>): Promise<PlanEntity> {
		return this.datasource.update(id, data);
	}

	async delete(id: string): Promise<void> {
		return this.datasource.delete(id);
	}
}
