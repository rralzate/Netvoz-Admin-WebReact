import type { SubscriptionEntity } from "../entities/SubscriptionEntity";
import type { SubscriptionRepository } from "../repositories/SubscriptionRepository";

export interface GetSubscriptionByIdUseCase {
	execute(id: string): Promise<SubscriptionEntity>;
}

export class GetSubscriptionByIdUseCaseImpl implements GetSubscriptionByIdUseCase {
	constructor(private readonly repository: SubscriptionRepository) {}

	async execute(id: string): Promise<SubscriptionEntity> {
		if (!id || id.trim() === "") {
			throw new Error("El ID de la suscripción es requerido");
		}
		return this.repository.getById(id);
	}
}
