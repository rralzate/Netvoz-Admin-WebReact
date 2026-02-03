import type { PlanEntity, PlanListResponse } from "../entities/PlanEntity";

export interface PlanRepository {
	getAll(): Promise<PlanListResponse>;
	getById(id: string): Promise<PlanEntity>;
	create(data: Omit<PlanEntity, "id">): Promise<PlanEntity>;
	update(id: string, data: Partial<PlanEntity>): Promise<PlanEntity>;
	delete(id: string): Promise<void>;
}
