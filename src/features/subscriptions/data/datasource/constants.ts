export const urls = {
	subscriptions: "/subscriptions",
	subscriptionsAll: "/subscriptions/all",
	subscriptionById: (id: string) => `/subscriptions/${id}`,
	subscriptionChangePlan: (id: string) => `/subscriptions/${id}/plan`,
	businessInformation: "/auth/business-information",
	sendReminderEmail: "/auth/send-reminder-email",

	// renew suscription
	suscriptionRenew: (id: string) => `/subscriptions/${id}/renew`,

	// ePayco: transacciones por negocio (mismo backend)
	transactionsByBusiness: (negocioId: string) => `/epayco/transactions/by-business/${negocioId}`,
};
