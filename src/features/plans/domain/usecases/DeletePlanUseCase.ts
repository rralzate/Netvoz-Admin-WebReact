import type { PlanRepository } from "../repositories/PlanRepository";

export interface DeletePlanUseCase {
	execute(id: string): Promise<void>;
}

export class DeletePlanUseCaseImpl implements DeletePlanUseCase {
	constructor(private readonly repository: PlanRepository) {}

	async execute(id: string): Promise<void> {
		if (!id || id.trim().length === 0) {
			throw new Error("El ID del plan es requerido");
		}

		return this.repository.delete(id);
	}
}
