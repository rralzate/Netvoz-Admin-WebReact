import type { SubscriptionRepository } from "../repositories/SubscriptionRepository";

export interface DeleteSubscriptionUseCase {
	execute(id: string): Promise<void>;
}

export class DeleteSubscriptionUseCaseImpl implements DeleteSubscriptionUseCase {
	constructor(private readonly repository: SubscriptionRepository) {}

	async execute(id: string): Promise<void> {
		if (!id || id.trim() === "") {
			throw new Error("El ID de la suscripción es requerido");
		}
		return this.repository.delete(id);
	}
}
