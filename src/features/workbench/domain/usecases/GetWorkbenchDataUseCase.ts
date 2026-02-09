import type { ObjetivosConfig, WorkbenchData } from "../entities/WorkbenchEntity";
import type { WorkbenchRepository } from "../repositories/WorkbenchRepository";

export interface GetWorkbenchDataUseCase {
	execute(negocioId?: string, objetivos?: ObjetivosConfig): Promise<WorkbenchData>;
}

export class GetWorkbenchDataUseCaseImpl implements GetWorkbenchDataUseCase {
	constructor(private readonly workbenchRepository: WorkbenchRepository) {}

	async execute(negocioId?: string, objetivos?: ObjetivosConfig): Promise<WorkbenchData> {
		try {
			return await this.workbenchRepository.getWorkbenchData(negocioId, objetivos);
		} catch (error) {
			console.error("❌ Error in GetWorkbenchDataUseCase:", error);
			throw error;
		}
	}
}
