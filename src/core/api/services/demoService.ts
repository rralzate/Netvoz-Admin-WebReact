// Demo service for testing/mocking
export const DemoApi = {
	TOKEN_EXPIRED: "/api/demo/token-expired",
	TEST: "/api/demo/test",
};

const demoService = {
	testTokenExpired: async () => {
		return { success: true };
	},
	mockTokenExpired: async () => {
		return { success: true };
	},
};

export default demoService;
