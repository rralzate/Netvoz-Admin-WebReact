import type { TopProduct } from "../entities/WorkbenchEntity";
import type { WorkbenchRepository } from "../repositories/WorkbenchRepository";

export interface GetTop5ProductsThisMonthUseCase {
	execute(startDate: Date, endDate: Date): Promise<TopProduct[]>;
}

export class GetTop5ProductsThisMonthUseCaseImpl implements GetTop5ProductsThisMonthUseCase {
	constructor(private readonly workbenchRepository: WorkbenchRepository) {}

	async execute(startDate: Date, endDate: Date): Promise<TopProduct[]> {
		try {
			const result = await this.workbenchRepository.getTop5ProductsThisMonth(startDate, endDate);

			return result;
		} catch (error) {
			console.error("❌ Error in GetTop5ProductsThisMonthUseCase:", error);
			throw error;
		}
	}
}
