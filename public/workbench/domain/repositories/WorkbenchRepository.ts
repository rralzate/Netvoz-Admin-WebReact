import type { ObjetivosConfig } from "@/features/business/domain/interfaces/Business.Interfaces";
import type { OrderByHour, RevenueByDay, TopProduct, WorkbenchData } from "../entities/WorkbenchEntity";

export interface WorkbenchRepository {
	//Dashboard metrics
	getOrdersByHour(
		targetDate: Date,
		businessId: string,
		options?: {
			lastHours?: number; // Ej: 12 → últimas 12h desde targetDate
			range?: { start: string; end: string }; // Ej: { start: "08:00", end: "20:00" }
		},
	): Promise<OrderByHour[]>;
	getRevenueLast7Days(): Promise<RevenueByDay[]>;
	getTotalRevenue(startDate: Date, endDate: Date): Promise<number>;
	getTop5ProductsThisMonth(startDate: Date, endDate: Date): Promise<TopProduct[]>;
	getWorkbenchData(businessId: string, objetivos?: ObjetivosConfig): Promise<WorkbenchData>;
}
