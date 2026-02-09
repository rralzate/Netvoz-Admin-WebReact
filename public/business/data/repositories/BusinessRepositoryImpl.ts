import type { BusinessEntity } from "../../domain/entities/BusinessEntity";
import type { CreateBusinessDTO, UpdateBusinessDTO } from "../../domain/interfaces/Business.Interfaces";
import type { BusinessRepository } from "../../domain/repositories/BusinessRepository";
import type { BusinessDatasource } from "../datasource/BusinessDatasource";

export class BusinessRepositoryImpl implements BusinessRepository {
	constructor(private datasource: BusinessDatasource) {}

	async getBusinessById(id: string): Promise<BusinessEntity | null> {
		return await this.datasource.getBusinessById(id);
	}

	async getBusinessByNegocioId(negocioId: string): Promise<BusinessEntity | null> {
		return await this.datasource.getBusinessByNegocioId(negocioId);
	}

	async createBusiness(business: CreateBusinessDTO): Promise<BusinessEntity> {
		return await this.datasource.createBusiness(business);
	}

	async updateBusiness(id: string, business: UpdateBusinessDTO): Promise<BusinessEntity> {
		return await this.datasource.updateBusiness(id, business);
	}

	async deleteBusiness(id: string): Promise<boolean> {
		return await this.datasource.deleteBusiness(id);
	}

	async uploadLogo(logoFile: File, previousLogoUrl?: string): Promise<string> {
		return await this.datasource.uploadLogo(logoFile, previousLogoUrl);
	}
}
