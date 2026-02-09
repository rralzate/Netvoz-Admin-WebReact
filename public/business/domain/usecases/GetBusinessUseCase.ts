import type { BusinessEntity } from "../entities/BusinessEntity";
import type { BusinessRepository } from "../repositories/BusinessRepository";

/**
 * Caso de uso para obtener el negocio del usuario autenticado.
 *
 * IMPORTANTE: Este caso de uso usa getBusinessByNegocioId() que llama al endpoint
 * `/business/get-business-by-business`, el cual obtiene el negocio usando el
 * negocioId del token del usuario autenticado.
 *
 * Este es el método recomendado porque:
 * - No requiere parámetros (usa el negocioId del token)
 * - Siempre devuelve el negocio correcto del usuario autenticado
 * - Es más seguro y confiable que usar endpoints por email
 */
export class GetBusinessUseCase {
	constructor(private businessRepository: BusinessRepository) {}

	async execute(negocioId: string): Promise<BusinessEntity | null> {
		return await this.businessRepository.getBusinessByNegocioId(negocioId);
	}
}
