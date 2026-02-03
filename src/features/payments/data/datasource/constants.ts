export const urls = {
	payments: "/payments",
	paymentById: (id: string) => `/payments/${id}`,
	retryPayment: (id: string) => `/payments/${id}/retry`,
	confirmPayment: (id: string) => `/payments/${id}/confirm`,
};
