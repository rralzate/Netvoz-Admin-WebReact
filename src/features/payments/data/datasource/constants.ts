export const urls = {
	payments: "/payments",
	paymentById: (id: string) => `/payments/${id}`,
	retryPayment: (id: string) => `/payments/${id}/retry`,
	confirmPayment: (id: string) => `/payments/${id}/confirm`,
	// Admin: todas las transacciones (GET /api/v1/epayco/transactions/all)
	transactionsAll: "/epayco/transactions/all",
};
