import type { ObjetivosConfig } from "@/features/business/domain/interfaces/Business.Interfaces";
import type {
	OrderByHour,
	RevenueByDay,
	TopProduct,
	WorkbenchData,
	WorkbenchKPIs,
} from "../../domain/entities/WorkbenchEntity";
import type { WorkbenchRepository } from "../../domain/repositories/WorkbenchRepository";
import type { WorkbenchDataSource } from "../datasource/WorkbenchDataSource";

export class WorkbenchRepositoryImpl implements WorkbenchRepository {
	constructor(private readonly dataSource: WorkbenchDataSource) {}

	async getOrdersByHour(
		targetDate: Date,
		businessId: string,
		options?: {
			lastHours?: number;
			range?: { start: string; end: string };
		},
	): Promise<OrderByHour[]> {
		return this.dataSource.getOrdersByHour(targetDate, businessId, options);
	}

	async getRevenueLast7Days(): Promise<RevenueByDay[]> {
		return this.dataSource.getRevenueLast7Days();
	}

	async getTotalRevenue(startDate: Date, endDate: Date): Promise<number> {
		return this.dataSource.getTotalRevenue(startDate, endDate);
	}

	async getTop5ProductsThisMonth(startDate: Date, endDate: Date): Promise<TopProduct[]> {
		return this.dataSource.getTop5ProductsThisMonth(startDate, endDate);
	}

	async getWorkbenchData(businessId: string, objetivos?: ObjetivosConfig): Promise<WorkbenchData> {
		const today = new Date();
		const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
		const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

		// Calculate last 30 days: from 30 days ago to today
		const last30DaysStart = new Date(today);
		last30DaysStart.setDate(today.getDate() - 30);
		last30DaysStart.setHours(0, 0, 0, 0); // Start of day
		const last30DaysEnd = new Date(today);
		last30DaysEnd.setHours(23, 59, 59, 999); // End of today

		// Get all data in parallel
		const [ordersByHour, revenueLast7Days, top5Products, totalRevenue] = await Promise.all([
			this.getOrdersByHour(today, businessId, { lastHours: 12 }),
			this.getRevenueLast7Days(),
			this.getTop5ProductsThisMonth(startOfMonth, endOfMonth),
			this.getTotalRevenue(last30DaysStart, last30DaysEnd),
		]);

		const objectives = objetivos;

		const kpis: WorkbenchKPIs = {
			facturadoHoy: {
				amount: revenueLast7Days[revenueLast7Days.length - 1]?.revenue || 0,
				objective: objectives?.facturadoHoy || 0,
				percentage: 0,
			},
			ultimos7Dias: {
				amount: revenueLast7Days.reduce((sum, day) => sum + day.revenue, 0),
				objective: objectives?.ultimos7Dias || 0,
				percentage: 0,
			},
			ultimos30Dias: {
				amount: totalRevenue,
				objective: objectives?.ultimos30Dias || 0,
				percentage: 0,
			},
		};

		// Calculate percentages
		kpis.facturadoHoy.percentage =
			kpis.facturadoHoy.objective > 0 ? (kpis.facturadoHoy.amount / kpis.facturadoHoy.objective) * 100 : 0;
		kpis.ultimos7Dias.percentage =
			kpis.ultimos7Dias.objective > 0 ? (kpis.ultimos7Dias.amount / kpis.ultimos7Dias.objective) * 100 : 0;
		kpis.ultimos30Dias.percentage =
			kpis.ultimos30Dias.objective > 0 ? (kpis.ultimos30Dias.amount / kpis.ultimos30Dias.objective) * 100 : 0;

		return {
			kpis,
			ordersByHour,
			revenueLast7Days,
			top5Products,
			totalRevenue,
		};
	}
}
