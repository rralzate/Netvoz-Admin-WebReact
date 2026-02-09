import apiClient from "@/core/api/apiClient";
import type { ApiResponseWithData } from "@/core/api/BaseApiResponse";
import type { OrderByHour, RevenueByDay, TopProduct } from "../../domain/entities/WorkbenchEntity";
import { urlsWorkbench } from "./constants";
import type { WorkbenchDataSource } from "./WorkbenchDataSource";

export class WorkbenchDataSourceImpl implements WorkbenchDataSource {
	async getOrdersByHour(
		_targetDate: Date,
		_businessId: string,
		options?: {
			lastHours?: number;
			range?: { start: string; end: string };
		},
	): Promise<OrderByHour[]> {
		const lastHours = options?.lastHours || 12;

		try {
			const response = await apiClient.get<ApiResponseWithData<OrderByHour[]>>({
				url: urlsWorkbench.getOrdersByHour.replace(":hours", lastHours.toString()),
			});

			return response.data;
		} catch (error) {
			console.error("Error fetching orders by hour:", error);
			throw error;
		}
	}

	async getRevenueLast7Days(): Promise<RevenueByDay[]> {
		try {
			const response = await apiClient.get<ApiResponseWithData<RevenueByDay[]>>({
				url: urlsWorkbench.getRevenueLast7Days,
			});

			return response.data;
		} catch (error) {
			console.error("Error fetching revenue last 7 days:", error);
			throw error;
		}
	}

	async getTotalRevenue(startDate: Date, endDate: Date): Promise<number> {
		try {
			const response = await apiClient.get<ApiResponseWithData<number>>({
				url: urlsWorkbench.getTotalRevenue,
				params: {
					startDate: startDate.toISOString(),
					endDate: endDate.toISOString(),
				},
			});

			return response.data;
		} catch (error) {
			console.error("Error fetching total revenue:", error);
			throw error;
		}
	}

	async getTop5ProductsThisMonth(startDate: Date, endDate: Date): Promise<TopProduct[]> {
		try {
			const response = await apiClient.get<ApiResponseWithData<TopProduct[]>>({
				url: urlsWorkbench.getTop5ProductsThisMonth,
				params: {
					startDate: startDate.toISOString(),
					endDate: endDate.toISOString(),
				},
			});

			return response.data;
		} catch (error) {
			console.error("Error fetching top 5 products:", error);
			throw error;
		}
	}
}
