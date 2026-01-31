import type { LoginData } from "./UserEntity";

export interface LoginResponseEntity {
	status: string;
	statusCode: number;
	responseCode: string;
	responseMessage: string;
	message: string;
	data: LoginData;
	timestamp: string;
}
