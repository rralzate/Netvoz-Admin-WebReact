import type { PlanEntity } from "../entities/PlanEntity";
import type { PlanRepository } from "../repositories/PlanRepository";

export interface GetPlanByIdUseCase {
	execute(id: string): Promise<PlanEntity>;
}

export class GetPlanByIdUseCaseImpl implements GetPlanByIdUseCase {
	constructor(private readonly repository: PlanRepository) {}

	async execute(id: string): Promise<PlanEntity> {
		if (!id || id.trim().length === 0) {
			throw new Error("El ID del plan es requerido");
		}

		return this.repository.getById(id);
	}
}
