import type { WorkbenchRepository } from "../repositories/WorkbenchRepository";

export interface GetTotalRevenueUseCase {
	execute(startDate: Date, endDate: Date): Promise<number>;
}

export class GetTotalRevenueUseCaseImpl implements GetTotalRevenueUseCase {
	constructor(private readonly workbenchRepository: WorkbenchRepository) {}

	async execute(startDate: Date, endDate: Date): Promise<number> {
		try {
			const result = await this.workbenchRepository.getTotalRevenue(startDate, endDate);

			return result;
		} catch (error) {
			console.error("❌ Error in GetTotalRevenueUseCase:", error);
			throw error;
		}
	}
}
