import type { OrderByHour } from "../entities/WorkbenchEntity";
import type { WorkbenchRepository } from "../repositories/WorkbenchRepository";

export interface GetOrdersByHourUseCase {
	execute(
		targetDate: Date,
		businessId: string,
		options?: {
			lastHours?: number;
			range?: { start: string; end: string };
		},
	): Promise<OrderByHour[]>;
}

export class GetOrdersByHourUseCaseImpl implements GetOrdersByHourUseCase {
	constructor(private readonly workbenchRepository: WorkbenchRepository) {}

	async execute(
		targetDate: Date,
		businessId: string,
		options?: {
			lastHours?: number;
			range?: { start: string; end: string };
		},
	): Promise<OrderByHour[]> {
		try {
			const result = await this.workbenchRepository.getOrdersByHour(targetDate, businessId, options);

			return result;
		} catch (error) {
			console.error("❌ Error in GetOrdersByHourUseCase:", error);
			throw error;
		}
	}
}
