export const urlsWorkbench = {
	// Dashboard metrics
	getOrdersByHour: "/orders/hours/:hours",
	getRevenueLast7Days: "/orders/revenue-last-7-days",
	getTotalRevenue: "/orders/total-revenue",
	getTop5ProductsThisMonth: "/orders/top-5-products-this-month",
	// Subscriptions
	subscriptionsAll: "/subscriptions/all",
	// Business (for objectives)
	getBusinessByNegocioId: "/business/get-business-by-business/:negocioId",
} as const;
