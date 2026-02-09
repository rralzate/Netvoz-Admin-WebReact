import type { SubscriptionEntity } from "../entities/SubscriptionEntity";
import type { SubscriptionRepository, ChangePlanRequest } from "../repositories/SubscriptionRepository";

export interface ChangePlanUseCase {
	execute(subscriptionId: string, data: ChangePlanRequest): Promise<SubscriptionEntity>;
}

export class ChangePlanUseCaseImpl implements ChangePlanUseCase {
	constructor(private readonly repository: SubscriptionRepository) {}

	async execute(subscriptionId: string, data: ChangePlanRequest): Promise<SubscriptionEntity> {
		if (!subscriptionId || subscriptionId.trim() === "") {
			throw new Error("El ID de la suscripción es requerido");
		}

		if (!data.planId || data.planId.trim() === "") {
			throw new Error("El ID del plan es requerido");
		}

		if (!data.nombrePlan || data.nombrePlan.trim() === "") {
			throw new Error("El nombre del plan es requerido");
		}

		return this.repository.changePlan(subscriptionId, data);
	}
}
