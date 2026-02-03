import type { PlanEntity } from "../entities/PlanEntity";
import type { PlanRepository } from "../repositories/PlanRepository";

export interface CreatePlanUseCase {
	execute(data: Omit<PlanEntity, "id">): Promise<PlanEntity>;
}

export class CreatePlanUseCaseImpl implements CreatePlanUseCase {
	constructor(private readonly repository: PlanRepository) {}

	async execute(data: Omit<PlanEntity, "id">): Promise<PlanEntity> {
		// Validaciones de negocio
		if (!data.nombre || data.nombre.trim().length === 0) {
			throw new Error("El nombre del plan es requerido");
		}

		if (!data.descripcion || data.descripcion.trim().length === 0) {
			throw new Error("La descripción del plan es requerida");
		}

		if (data.precio < 0) {
			throw new Error("El precio no puede ser negativo");
		}

		if (!["COP", "USD"].includes(data.moneda)) {
			throw new Error("La moneda debe ser COP o USD");
		}

		if (data.duracionMeses < 1 || data.duracionMeses > 24) {
			throw new Error("La duración debe estar entre 1 y 24 meses");
		}

		if (data.caracteristicas.maxUsuarios < 1) {
			throw new Error("Debe permitir al menos 1 usuario");
		}

		if (data.caracteristicas.maxProductos < 1) {
			throw new Error("Debe permitir al menos 1 producto");
		}

		if (data.caracteristicas.maxFacturasPorMes < 1) {
			throw new Error("Debe permitir al menos 1 factura por mes");
		}

		return this.repository.create(data);
	}
}
