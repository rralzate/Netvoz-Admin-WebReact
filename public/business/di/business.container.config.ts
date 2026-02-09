import { container } from "@/core/di/DIContainer";
import { BusinessDatasourceImpl } from "../data/datasource/BusinessDatasourceImpl";
import { BusinessRepositoryImpl } from "../data/repositories/BusinessRepositoryImpl";
import { GetBusinessUseCase } from "../domain/usecases/GetBusinessUseCase";
import { UpdateBusinessUseCase } from "../domain/usecases/UpdateBusinessUseCase";
import { UploadLogoUseCase } from "../domain/usecases/UploadLogoUseCase";

export const TOKENS_BUSINESS = {
	BusinessDatasource: Symbol("BusinessDatasource"),
	BusinessRepository: Symbol("BusinessRepository"),
	GetBusinessUseCase: Symbol("GetBusinessUseCase"),
	UpdateBusinessUseCase: Symbol("UpdateBusinessUseCase"),
	UploadLogoUseCase: Symbol("UploadLogoUseCase"),
} as const;

export const businessContainerConfig = {
	[TOKENS_BUSINESS.BusinessDatasource]: {
		useClass: BusinessDatasourceImpl,
	},
	[TOKENS_BUSINESS.BusinessRepository]: {
		useClass: BusinessRepositoryImpl,
		deps: [TOKENS_BUSINESS.BusinessDatasource],
	},
	[TOKENS_BUSINESS.GetBusinessUseCase]: {
		useClass: GetBusinessUseCase,
		deps: [TOKENS_BUSINESS.BusinessRepository],
	},
	[TOKENS_BUSINESS.UpdateBusinessUseCase]: {
		useClass: UpdateBusinessUseCase,
		deps: [TOKENS_BUSINESS.BusinessRepository],
	},
	[TOKENS_BUSINESS.UploadLogoUseCase]: {
		useClass: UploadLogoUseCase,
		deps: [TOKENS_BUSINESS.BusinessRepository],
	},
};

export function businessConfigureContainer(): void {
	// Register Datasources
	container.registerClass(
		TOKENS_BUSINESS.BusinessDatasource,
		BusinessDatasourceImpl,
		[], // No dependencies
	);

	// Register Repositories
	container.registerClass(TOKENS_BUSINESS.BusinessRepository, BusinessRepositoryImpl, [
		TOKENS_BUSINESS.BusinessDatasource,
	]);

	// Register Use Cases
	container.registerClass(TOKENS_BUSINESS.GetBusinessUseCase, GetBusinessUseCase, [TOKENS_BUSINESS.BusinessRepository]);

	container.registerClass(TOKENS_BUSINESS.UpdateBusinessUseCase, UpdateBusinessUseCase, [
		TOKENS_BUSINESS.BusinessRepository,
	]);

	container.registerClass(TOKENS_BUSINESS.UploadLogoUseCase, UploadLogoUseCase, [TOKENS_BUSINESS.BusinessRepository]);
}
