import type { SubscriptionEntity, SubscriptionUpdateRequest } from "../entities/SubscriptionEntity";
import type { SubscriptionRepository } from "../repositories/SubscriptionRepository";

export interface UpdateSubscriptionUseCase {
	execute(id: string, data: SubscriptionUpdateRequest): Promise<SubscriptionEntity>;
}

export class UpdateSubscriptionUseCaseImpl implements UpdateSubscriptionUseCase {
	constructor(private readonly repository: SubscriptionRepository) {}

	async execute(id: string, data: SubscriptionUpdateRequest): Promise<SubscriptionEntity> {
		if (!id || id.trim() === "") {
			throw new Error("El ID de la suscripción es requerido");
		}

		// Validate optional fields if provided
		if (data.valorMensual !== undefined && data.valorMensual < 0) {
			throw new Error("El valor mensual no puede ser negativo");
		}

		if (data.valorTotal !== undefined && data.valorTotal < 0) {
			throw new Error("El valor total no puede ser negativo");
		}

		return this.repository.update(id, data);
	}
}
