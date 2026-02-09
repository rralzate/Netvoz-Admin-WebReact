import type { BusinessEntity } from "../../domain/entities/BusinessEntity";
import type { CreateBusinessDTO, UpdateBusinessDTO } from "../../domain/interfaces/Business.Interfaces";

export interface BusinessDatasource {
	getBusinessById(id: string): Promise<BusinessEntity | null>;
	getBusinessByNegocioId(negocioId: string): Promise<BusinessEntity | null>;
	createBusiness(business: CreateBusinessDTO): Promise<BusinessEntity>;
	updateBusiness(id: string, business: UpdateBusinessDTO): Promise<BusinessEntity>;
	deleteBusiness(id: string): Promise<boolean>;
	uploadLogo(logoFile: File, previousLogoUrl?: string): Promise<string>;
}
