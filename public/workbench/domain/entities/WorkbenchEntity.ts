export interface OrderByHour {
	hour: string;
	date: string;
	count: number;
	totalRevenue: number;
	percentage: number;
}

export interface RevenueByDay {
	orderCount: number;
	date: string;
	revenue: number;
	averageOrderValue: number;
}

export interface TopProduct {
	totalSold: number;
	totalOrders: number;
	productoId: string;
	productName: string;
	revenue: number;
	averageQuantityPerOrder: number;
}

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

export interface WorkbenchData {
	kpis: WorkbenchKPIs;
	ordersByHour: OrderByHour[];
	revenueLast7Days: RevenueByDay[];
	top5Products: TopProduct[];
	totalRevenue: number;
}
