import APIClient from "@/core/api/apiClient";
import type { PlanEntity, PlanListResponse } from "../../domain/entities/PlanEntity";
import { urls } from "./constants";

export interface PlanDatasource {
	getAll(): Promise<PlanListResponse>;
	getById(id: string): Promise<PlanEntity>;
	create(data: Omit<PlanEntity, "id">): Promise<PlanEntity>;
	update(id: string, data: Partial<PlanEntity>): Promise<PlanEntity>;
	delete(id: string): Promise<void>;
}

export class PlanDatasourceImpl implements PlanDatasource {
	async getAll(): Promise<PlanListResponse> {
		const response = await APIClient.get<any>({ url: urls.plans });
		console.log("PlanDatasource.getAll - Raw response:", response);

		// La API envuelve la respuesta en { data: [...], status: "success", ... }
		let rawData: any[];
		if (Array.isArray(response)) {
			rawData = response;
		} else if (response?.data && Array.isArray(response.data)) {
			rawData = response.data;
		} else {
			console.error("Estructura de respuesta de planes desconocida:", response);
			rawData = [];
		}

		// Mapear _id a id si es necesario
		const mappedData = rawData.map((item: any) => ({
			...item,
			id: item.id || item._id,
		}));

		console.log("PlanDatasource.getAll - Mapped plans:", mappedData);

		return {
			data: mappedData,
			total: response?.total || mappedData.length,
		};
	}

	async getById(id: string): Promise<PlanEntity> {
		const response = await APIClient.get<any>({ url: urls.planById(id) });
		const planData = response?.data || response;
		return {
			...planData,
			id: planData.id || planData._id,
		};
	}

	async create(data: Omit<PlanEntity, "id">): Promise<PlanEntity> {
		const response = await APIClient.post<any>({ url: urls.plans, data });
		const planData = response?.data || response;
		return {
			...planData,
			id: planData.id || planData._id,
		};
	}

	async update(id: string, data: Partial<PlanEntity>): Promise<PlanEntity> {
		const response = await APIClient.put<any>({ url: urls.planById(id), data });
		const planData = response?.data || response;
		return {
			...planData,
			id: planData.id || planData._id,
		};
	}

	async delete(id: string): Promise<void> {
		await APIClient.delete<void>({ url: urls.planById(id) });
	}
}
