import type { BusinessEntity } from "../entities/BusinessEntity";
import type { UpdateBusinessDTO } from "../interfaces/Business.Interfaces";
import type { BusinessRepository } from "../repositories/BusinessRepository";

export class UpdateBusinessUseCase {
	constructor(private businessRepository: BusinessRepository) {}

	async execute(id: string, businessData: UpdateBusinessDTO): Promise<BusinessEntity> {
		if (!id) {
			throw new Error("Business ID is required");
		}

		if (!businessData || Object.keys(businessData).length === 0) {
			throw new Error("Business data is required");
		}

		return await this.businessRepository.updateBusiness(id, businessData);
	}
}
