export const urls = {
	subscriptions: "/subscriptions",
	subscriptionsAll: "/subscriptions/all",
	subscriptionById: (id: string) => `/subscriptions/${id}`,
	subscriptionChangePlan: (id: string) => `/subscriptions/${id}/plan`,
	businessInformation: "/auth/business-information",
	sendReminderEmail: "/auth/send-reminder-email",
};
