import type { ObjetivosConfig } from "@/features/business/domain/interfaces/Business.Interfaces";
import type { WorkbenchData } from "../entities/WorkbenchEntity";
import type { WorkbenchRepository } from "../repositories/WorkbenchRepository";

export interface GetWorkbenchDataUseCase {
	execute(businessId: string, objetivos?: ObjetivosConfig): Promise<WorkbenchData>;
}

export class GetWorkbenchDataUseCaseImpl implements GetWorkbenchDataUseCase {
	constructor(private readonly workbenchRepository: WorkbenchRepository) {}

	async execute(businessId: string, objetivos?: ObjetivosConfig): Promise<WorkbenchData> {
		try {
			return await this.workbenchRepository.getWorkbenchData(businessId, objetivos);
		} catch (error) {
			console.error("❌ Error in GetWorkbenchDataUseCase:", error);
			throw error;
		}
	}
}
