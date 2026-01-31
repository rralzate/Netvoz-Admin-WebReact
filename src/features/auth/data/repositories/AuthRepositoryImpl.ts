import { AppError } from "@/core/errors/AppError";
import { ResponseCodes } from "@/core/constants/ResponseCodes";
import type { AuthDatasource } from "../../data/datasource/AuthDatasource";
import { LoginModel } from "../../data/model/LoginModel";
import type { LoginEntity } from "../../domain/entities/LoginEntity";
import type { LoginResponseEntity } from "../../domain/entities/LoginResponseEntity";
import type { RegisterEntity } from "../../domain/entities/RegisterEntity";
import type { AuthRepository } from "../../domain/repositories/AuthRepository";
import { RegisterModel } from "../model/RegisterModel";

export class AuthRepositoryImpl implements AuthRepository {
	constructor(private authDatasource: AuthDatasource) {}

	async login(data: LoginEntity): Promise<LoginResponseEntity> {
		// Convert domain entity to data model
		const loginModel: LoginModel = new LoginModel({
			email: data.email,
			password: data.password,
		});

		// Call datasource - DON'T wrap this in try/catch that treats success as failure
		const response = await this.authDatasource.signin(loginModel);

		// Validate response - but don't throw on success messages!
		if (!response) {
			throw new Error("No response received from datasource");
		}

		// Only throw if the response actually indicates failure
		if (!response.isSuccess()) {
			throw new Error(response.message || "Authentication failed");
		}

		// Validate required data
		if (!response.data?.token || !response.data?.refreshToken || !response.data?.user?.id) {
			throw new Error("Invalid response: missing required authentication data");
		}

		// Convert to domain entity and return
		const loginResponseEntity: LoginResponseEntity = response.toEntity();

		return loginResponseEntity;
	}

	async signup(data: RegisterEntity): Promise<LoginResponseEntity> {
		try {
			// Convert domain entity to data model
			const registerModel: RegisterModel = new RegisterModel(data);

			// Call datasource
			const response = await this.authDatasource.signup(registerModel);

			// Validate response
			if (!response) {
				throw new Error("No response received from datasource");
			}

			if (!response.isSuccess()) {
				throw new Error(response.message || "Signup failed");
			}

			if (!response.data?.token || !response.data?.refreshToken || !response.data?.user) {
				throw new Error("Invalid signup response: missing required data");
			}

			// Convert to domain entity
			const loginResponseEntity: LoginResponseEntity = response.toEntity();

			return loginResponseEntity;
		} catch (error) {
			// Preserve AppError with all its metadata (statusCode, field, responseCode, etc.)
			if (error instanceof AppError) {
				throw error;
			}

			// Convert other errors to AppError to preserve error information
			if (error instanceof Error) {
				// First, try to convert using AppError.fromError to extract axios error info
				const appError = AppError.fromError(error, error.message);
				
				// If it's already a 409 error, check the message to determine the field
				if (appError.statusCode === 409) {
					const errorMsgLower = error.message.toLowerCase();
					
					// Check if the error message contains information about duplicate email
					if (
						errorMsgLower.includes("email") ||
						errorMsgLower.includes("correo") ||
						errorMsgLower.includes("el email ya existe") ||
						errorMsgLower.includes("email ya está")
					) {
						// Override to ensure it's treated as a duplicate email error
						throw new AppError(
							"El correo electrónico ya está registrado",
							409,
							ResponseCodes.DUPLICATE_EMAIL,
							"email",
							error.message
						);
					}
					// Check if the error message contains information about duplicate NIT
					else if (
						errorMsgLower.includes("nit") ||
						errorMsgLower.includes("el nit ya existe") ||
						errorMsgLower.includes("nit ya está")
					) {
						throw new AppError(
							"El NIT ya está registrado",
							409,
							ResponseCodes.DUPLICATE_RESOURCE,
							"nit",
							error.message
						);
					}
				}

				// For other errors, use the converted AppError
				throw appError;
			}

			// Unknown error type
			throw AppError.fromError(error, "Error desconocido al registrar el usuario");
		}
	}

	async logout(): Promise<void> {
		try {
			await this.authDatasource.logout();
		} catch (error) {
			console.error("💥 Error in AuthRepositoryImpl.logout:", error);

			// For logout, we might want to succeed even if the server call fails
			// since the important part is clearing local data
			console.warn("Logout completed with warnings");
		}
	}

	async refreshToken(refreshToken: string): Promise<LoginResponseEntity> {
		try {
			if (!refreshToken) {
				throw new Error("No refresh token provided");
			}

			const response = await this.authDatasource.refresh(refreshToken);

			// Validate response
			if (!response) {
				throw new Error("No response received from datasource");
			}

			if (!response.isSuccess()) {
				throw new Error(response.message || "Token refresh failed");
			}

			if (!response.data?.token || !response.data?.refreshToken) {
				throw new Error("Invalid refresh response: missing required tokens");
			}

			// Convert to domain entity
			const loginResponseEntity: LoginResponseEntity = response.toEntity();

			return loginResponseEntity;
		} catch (error) {
			console.error("💥 Error in AuthRepositoryImpl.refreshToken:", error);

			if (error instanceof Error) {
				throw new Error(`Repository token refresh failed: ${error.message}`);
			} else {
				throw new Error("Repository token refresh failed: Unknown error occurred");
			}
		}
	}

	async sendVerificationCode(email: string): Promise<boolean> {
		return await this.authDatasource.sendVerificationCode(email);
	}

	async validateVerificationCode(code: string, email: string): Promise<boolean> {
		return await this.authDatasource.validateVerificationCode(code, email);
	}

	async changePassword(email: string, newPassword: string): Promise<boolean> {
		return await this.authDatasource.changePassword(email, newPassword);
	}
}
