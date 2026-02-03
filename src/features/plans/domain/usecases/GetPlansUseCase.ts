import type { PlanListResponse } from "../entities/PlanEntity";
import type { PlanRepository } from "../repositories/PlanRepository";

export interface GetPlansUseCase {
	execute(): Promise<PlanListResponse>;
}

export class GetPlansUseCaseImpl implements GetPlansUseCase {
	constructor(private readonly repository: PlanRepository) {}

	async execute(): Promise<PlanListResponse> {
		return this.repository.getAll();
	}
}
