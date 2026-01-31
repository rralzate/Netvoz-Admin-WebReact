import { HttpResponse, http } from "msw";
import { DemoApi } from "@/core/api/services/demoService";
import { ResultStatus } from "@/core/types/enum";

const mockTokenExpired = http.post(`/api${DemoApi.TOKEN_EXPIRED}`, () => {
	return new HttpResponse(null, { status: ResultStatus.TIMEOUT });
});

export { mockTokenExpired };
