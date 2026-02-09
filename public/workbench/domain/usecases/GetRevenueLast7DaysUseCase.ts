import type { RevenueByDay } from "../entities/WorkbenchEntity";
import type { WorkbenchRepository } from "../repositories/WorkbenchRepository";

export interface GetRevenueLast7DaysUseCase {
	execute(): Promise<RevenueByDay[]>;
}

export class GetRevenueLast7DaysUseCaseImpl implements GetRevenueLast7DaysUseCase {
	constructor(private readonly workbenchRepository: WorkbenchRepository) {}

	async execute(): Promise<RevenueByDay[]> {
		try {
			const result = await this.workbenchRepository.getRevenueLast7Days();

			return result;
		} catch (error) {
			console.error("❌ Error in GetRevenueLast7DaysUseCase:", error);
			throw error;
		}
	}
}
