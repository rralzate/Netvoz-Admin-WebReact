import type {
	SubscriptionEntity,
	SubscriptionListResponse,
	SubscriptionEstado,
	SubscriptionCreateRequest,
	SubscriptionUpdateRequest,
} from "../entities/SubscriptionEntity";
import type { SubscriptionRenew } from "../entities/suscriptionRenew";

export interface ChangePlanRequest {
	planId: string;
	nombrePlan: string;
	valorMensual?: number;
	valorTotal?: number;
	fechaInicio?: string;
	fechaVencimiento?: string;
}

export interface SubscriptionRepository {
	getAll(filters?: { estado?: SubscriptionEstado; page?: number; pageSize?: number }): Promise<SubscriptionListResponse>;
	getById(id: string): Promise<SubscriptionEntity>;
	create(data: SubscriptionCreateRequest): Promise<SubscriptionEntity>;
	update(id: string, data: SubscriptionUpdateRequest): Promise<SubscriptionEntity>;
	changePlan(id: string, data: ChangePlanRequest): Promise<SubscriptionEntity>;
	renewSubscription(id: string, data: SubscriptionRenew): Promise<SubscriptionEntity>;
	delete(id: string): Promise<void>;
}
