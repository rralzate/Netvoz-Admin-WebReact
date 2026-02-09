import type { WorkbenchKPIs, SubscriptionSummary, RecentSubscription, ObjetivosConfig } from "../../domain/entities/WorkbenchEntity";

export interface WorkbenchDataSource {
	getBusinessObjectives(negocioId: string): Promise<ObjetivosConfig | null>;
	getKPIs(objetivos?: ObjetivosConfig): Promise<WorkbenchKPIs>;
	getSummary(): Promise<SubscriptionSummary>;
	getRecentSubscriptions(): Promise<RecentSubscription[]>;
	getExpiredSubscriptions(): Promise<RecentSubscription[]>;
	getPendingPaymentSubscriptions(): Promise<RecentSubscription[]>;
}
