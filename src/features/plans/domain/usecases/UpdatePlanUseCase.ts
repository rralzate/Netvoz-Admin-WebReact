import type { PlanEntity } from "../entities/PlanEntity";
import type { PlanRepository } from "../repositories/PlanRepository";

export interface UpdatePlanUseCase {
	execute(id: string, data: Partial<PlanEntity>): Promise<PlanEntity>;
}

export class UpdatePlanUseCaseImpl implements UpdatePlanUseCase {
	constructor(private readonly repository: PlanRepository) {}

	async execute(id: string, data: Partial<PlanEntity>): Promise<PlanEntity> {
		// Validaciones de negocio
		if (!id || id.trim().length === 0) {
			throw new Error("El ID del plan es requerido");
		}

		if (data.nombre !== undefined && data.nombre.trim().length === 0) {
			throw new Error("El nombre del plan no puede estar vacío");
		}

		if (data.descripcion !== undefined && data.descripcion.trim().length === 0) {
			throw new Error("La descripción del plan no puede estar vacía");
		}

		if (data.precio !== undefined && data.precio < 0) {
			throw new Error("El precio no puede ser negativo");
		}

		if (data.moneda !== undefined && !["COP", "USD"].includes(data.moneda)) {
			throw new Error("La moneda debe ser COP o USD");
		}

		if (data.duracionMeses !== undefined && (data.duracionMeses < 1 || data.duracionMeses > 24)) {
			throw new Error("La duración debe estar entre 1 y 24 meses");
		}

		if (data.caracteristicas) {
			if (data.caracteristicas.maxUsuarios !== undefined && data.caracteristicas.maxUsuarios < 1) {
				throw new Error("Debe permitir al menos 1 usuario");
			}

			if (data.caracteristicas.maxProductos !== undefined && data.caracteristicas.maxProductos < 1) {
				throw new Error("Debe permitir al menos 1 producto");
			}

			if (data.caracteristicas.maxFacturasPorMes !== undefined && data.caracteristicas.maxFacturasPorMes < 1) {
				throw new Error("Debe permitir al menos 1 factura por mes");
			}
		}

		return this.repository.update(id, data);
	}
}
