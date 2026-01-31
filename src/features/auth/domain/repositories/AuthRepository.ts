import type { LoginEntity } from "../entities/LoginEntity";
import type { LoginResponseEntity } from "../entities/LoginResponseEntity";
import type { RegisterEntity } from "../entities/RegisterEntity";

export interface AuthRepository {
	login(data: LoginEntity): Promise<LoginResponseEntity>;
	refreshToken(refreshToken: string): Promise<LoginResponseEntity>;
	logout(): Promise<void>;
	signup(data: RegisterEntity): Promise<LoginResponseEntity>;

	sendVerificationCode: (email: string) => Promise<boolean>;
	validateVerificationCode: (code: string, email: string) => Promise<boolean>;
	changePassword: (email: string, newPassword: string) => Promise<boolean>;
}
