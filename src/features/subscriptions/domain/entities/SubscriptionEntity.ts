export type SubscriptionStatus = "activa" | "pendiente" | "vencida" | "suspendida";

export type PlanType = "basico" | "profesional" | "enterprise";

export interface SubscriptionEntity {
	id: string;
	negocioId: string;
	negocioNombre: string;
	plan: PlanType;
	estado: SubscriptionStatus;
	fechaVencimiento: string;
	valorMensual: number;
	fechaCreacion?: string;
	fechaActualizacion?: string;
}

export interface SubscriptionListResponse {
	data: SubscriptionEntity[];
	total: number;
	page: number;
	pageSize: number;
}
