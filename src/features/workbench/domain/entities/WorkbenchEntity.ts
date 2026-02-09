export interface WorkbenchKPIs {
	facturadoHoy: {
		amount: number;
		objective: number;
		percentage: number;
	};
	ultimos7Dias: {
		amount: number;
		objective: number;
		percentage: number;
	};
	ultimos30Dias: {
		amount: number;
		objective: number;
		percentage: number;
	};
}

export interface SubscriptionSummary {
	total: number;
	activas: number;
	pendientesPago: number;
	vencidas: number;
	suspendidas: number;
	canceladas: number;
}

export interface RecentSubscription {
	id: string;
	nombreNegocio: string;
	nombrePlan: string;
	valorMensual: number;
	fecha: string;
	estado: string;
}

export interface WorkbenchData {
	kpis: WorkbenchKPIs;
	summary: SubscriptionSummary;
	recentSubscriptions: RecentSubscription[];
	expiredSubscriptions: RecentSubscription[];
	pendingPaymentSubscriptions: RecentSubscription[];
}

export interface ObjetivosConfig {
	facturadoHoy: number;
	ultimos7Dias: number;
	ultimos30Dias: number;
}
