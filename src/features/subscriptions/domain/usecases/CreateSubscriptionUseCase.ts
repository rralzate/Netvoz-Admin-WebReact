import type { SubscriptionEntity, SubscriptionCreateRequest } from "../entities/SubscriptionEntity";
import type { SubscriptionRepository } from "../repositories/SubscriptionRepository";

export interface CreateSubscriptionUseCase {
	execute(data: SubscriptionCreateRequest): Promise<SubscriptionEntity>;
}

export class CreateSubscriptionUseCaseImpl implements CreateSubscriptionUseCase {
	constructor(private readonly repository: SubscriptionRepository) {}

	async execute(data: SubscriptionCreateRequest): Promise<SubscriptionEntity> {
		// Validations
		if (!data.negocioId || data.negocioId.trim() === "") {
			throw new Error("El ID del negocio es requerido");
		}

		if (!data.nombreNegocio || data.nombreNegocio.trim() === "") {
			throw new Error("El nombre del negocio es requerido");
		}

		if (!data.planId || data.planId.trim() === "") {
			throw new Error("El ID del plan es requerido");
		}

		if (!data.nombrePlan || data.nombrePlan.trim() === "") {
			throw new Error("El nombre del plan es requerido");
		}

		if (!data.fechaInicio) {
			throw new Error("La fecha de inicio es requerida");
		}

		if (!data.fechaVencimiento) {
			throw new Error("La fecha de vencimiento es requerida");
		}

		if (!data.metodoPago || !data.metodoPago.tipo) {
			throw new Error("El método de pago es requerido");
		}

		if (data.valorMensual < 0) {
			throw new Error("El valor mensual no puede ser negativo");
		}

		if (data.valorTotal < 0) {
			throw new Error("El valor total no puede ser negativo");
		}

		return this.repository.create(data);
	}
}
