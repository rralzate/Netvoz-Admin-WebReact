export const urlsWorkbench = {
	// Dashboard metrics (orders - pueden no existir)
	getOrdersByHour: "/orders/hours/:hours",
	getRevenueLast7Days: "/orders/revenue-last-7-days",
	getTotalRevenue: "/orders/total-revenue",
	getTop5ProductsThisMonth: "/orders/top-5-products-this-month",
	// Transacciones ePayco (admin) para KPIs: Facturado hoy, Últimos 7/30 días
	transactionsAll: "/epayco/transactions/all",
	// Subscriptions
	subscriptionsAll: "/subscriptions/all",
	// Business (for objectives)
	getBusinessByNegocioId: "/business/get-business-by-business/:negocioId",
} as const;
