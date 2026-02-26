import type { SubscriptionEntity } from "../entities/SubscriptionEntity";
import type { SubscriptionRenew } from "../entities/suscriptionRenew";
import type { SubscriptionRepository } from "../repositories/SubscriptionRepository";

export interface RenewSubscriptionUseCase {
	execute(subscriptionId: string, data: SubscriptionRenew): Promise<SubscriptionEntity>;
}

export class RenewSubscriptionUseCaseImpl implements RenewSubscriptionUseCase {
	constructor(private readonly repository: SubscriptionRepository) {}

	async execute(subscriptionId: string, data: SubscriptionRenew): Promise<SubscriptionEntity> {
		if (!subscriptionId || subscriptionId.trim() === "") {
			throw new Error("El ID de la suscripción es requerido");
		}

		if (!data.meses || data.meses <= 0) {
			throw new Error("La cantidad de meses debe ser mayor a 0");
		}

		if (!data.pago) {
			throw new Error("La información de pago es requerida");
		}

		return this.repository.renewSubscription(subscriptionId, data);
	}
}
