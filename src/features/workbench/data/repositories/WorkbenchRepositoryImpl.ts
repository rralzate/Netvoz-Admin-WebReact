import type { ObjetivosConfig, WorkbenchData } from "../../domain/entities/WorkbenchEntity";
import type { WorkbenchRepository } from "../../domain/repositories/WorkbenchRepository";
import type { WorkbenchDataSource } from "../datasource/WorkbenchDataSource";

export class WorkbenchRepositoryImpl implements WorkbenchRepository {
	constructor(private readonly dataSource: WorkbenchDataSource) {}

	async getWorkbenchData(negocioId?: string, objetivosOverride?: ObjetivosConfig): Promise<WorkbenchData> {
		console.log("🔍 WorkbenchRepositoryImpl.getWorkbenchData - negocioId:", negocioId);

		// First, try to fetch objectives from business if negocioId is provided
		let objetivos: ObjetivosConfig | null = null;
		if (negocioId) {
			objetivos = await this.dataSource.getBusinessObjectives(negocioId);
			console.log("📊 Objectives from business:", objetivos);
		}

		// Use override objectives if provided, otherwise use fetched or null
		const finalObjetivos = objetivosOverride || objetivos || undefined;
		console.log("📊 Final objectives to use:", finalObjetivos);

		// Get all data in parallel, passing objectives to getKPIs
		const [kpis, summary, recentSubscriptions, expiredSubscriptions, pendingPaymentSubscriptions] = await Promise.all([
			this.dataSource.getKPIs(finalObjetivos || undefined),
			this.dataSource.getSummary(),
			this.dataSource.getRecentSubscriptions(),
			this.dataSource.getExpiredSubscriptions(),
			this.dataSource.getPendingPaymentSubscriptions(),
		]);

		console.log("✅ WorkbenchData assembled successfully");

		return {
			kpis,
			summary,
			recentSubscriptions,
			expiredSubscriptions,
			pendingPaymentSubscriptions,
		};
	}
}
