import APIClient from "@/core/api/apiClient";
import { AppError } from "@/core/errors/AppError";
import userStore from "@/features/auth/presentation/hooks/userStore";
import type { LoginModel } from "../model/LoginModel";
import { LoginResponseModel } from "../model/LoginResponseModel";
import type { RegisterModel } from "../model/RegisterModel";
import { urls } from "./constants";

export interface AuthDatasource {
	signin: (data: LoginModel) => Promise<LoginResponseModel>;
	signup: (data: RegisterModel) => Promise<LoginResponseModel>;
	logout: () => Promise<void>;
	refresh: (refreshToken: string) => Promise<LoginResponseModel>;

	sendVerificationCode: (email: string) => Promise<boolean>;
	validateVerificationCode: (code: string, email: string) => Promise<boolean>;
	changePassword: (email: string, newPassword: string) => Promise<boolean>;
}

// Admin token for login-admin endpoint
const ADMIN_TOKEN = "8lgkgjeEs1pepExJJbnTNZbaTSh4OxZ9o19jGrpo34kw8du0dXaAsJd441xWeviSeXMmDIy4yX/BUtTizh6nIw==";

export class AuthDatasourceImpl implements AuthDatasource {
	signin = async (data: LoginModel): Promise<LoginResponseModel> => {
		try {
			const responseData = await APIClient.post<any>({
				url: urls.login,
				data: {
					email: data.email,
					password: data.password,
					adminToken: ADMIN_TOKEN,
				},
			});

			// Validate response structure before processing
			if (!LoginResponseModel.isValidApiResponse(responseData)) {
				console.error("Invalid API response structure:", responseData);
				throw new Error("Invalid response structure from server");
			}

			const loginResponse = LoginResponseModel.fromApiResponse(responseData);

			// Validate that we have the required data
			if (!loginResponse.isSuccess()) {
				throw new Error(loginResponse.message || "Login failed");
			}

			if (!loginResponse.data?.user?.id) {
				throw new Error("Missing user data in response");
			}

			// Store tokens in userStore
			userStore.getState().actions.setUserToken({
				accessToken: loginResponse.data.token,
				refreshToken: loginResponse.data.refreshToken,
			});

			// Store user info
			userStore.getState().actions.setUserInfo(loginResponse.data.user);

			return loginResponse;
		} catch (error) {
			console.error("Login error in AuthDatasourceImpl:", error);

			// If it's already a processed error, re-throw it
			if (error instanceof Error) {
				throw error;
			}

			// Handle APIClient errors
			if (typeof error === "object" && error !== null) {
				const errorMessage = (error as any).message || "Login failed";
				throw new Error(errorMessage);
			}

			throw new Error("Unknown login error occurred");
		}
	};

	signup = async (data: RegisterModel): Promise<LoginResponseModel> => {
		try {
			const responseData = await APIClient.post<any>({
				url: urls.signup,
				data: {
					nombre: data.nombre,
					apellido: data.apellido,
					telefono: data.telefono,
					residencia: data.residencia,
					nit: data.nit,
					nombreNegocio: data.nombreNegocio,
					tipoNegocio: data.tipoNegocio,
					email: data.email,
					password: data.password,
					active: data.active,
				},
			});

			const loginResponse = LoginResponseModel.fromApiResponse(responseData);

			if (!loginResponse.isSuccess()) {
				throw new Error(loginResponse.message || "Signup failed");
			}

			return loginResponse;
		} catch (error) {
			console.error("Signup error in AuthDatasourceImpl:", error);

			// Convert axios errors to AppError to preserve status code and field information
			if (error && typeof error === "object") {
				const appError = AppError.fromError(error, "Error al registrar el usuario");
				throw appError;
			}

			if (error instanceof Error) {
				throw error;
			}

			throw new Error("Unknown signup error occurred");
		}
	};

	logout = async (): Promise<void> => {
		try {
			await APIClient.post<void>({
				url: urls.logout,
			});
		} catch (error) {
			// Log error but don't throw - we want to clear local data regardless
			console.warn("Logout request failed:", error);
		} finally {
			// Always clear local user data
			userStore.getState().actions.clearUserInfoAndToken();
		}
	};

	refresh = async (refreshToken: string): Promise<LoginResponseModel> => {
		try {
			if (!refreshToken) {
				throw new Error("No refresh token available");
			}

			const responseData = await APIClient.post<any>({
				url: urls.refresh,
				data: {
					refreshToken: refreshToken,
				},
			});

			// Validate response structure
			if (!LoginResponseModel.isValidApiResponse(responseData)) {
				console.error("Invalid refresh token response structure:", responseData);
				throw new Error("Invalid response structure from server");
			}

			const loginResponse = LoginResponseModel.fromApiResponse(responseData);

			if (!loginResponse.isSuccess()) {
				throw new Error(loginResponse.message || "Token refresh failed");
			}

			// Update tokens in userStore
			userStore.getState().actions.setUserToken({
				accessToken: loginResponse.data.token,
				refreshToken: loginResponse.data.refreshToken,
			});

			// Update user info if provided
			if (loginResponse.data.user) {
				userStore.getState().actions.setUserInfo(loginResponse.data.user);
			}

			return loginResponse;
		} catch (error) {
			console.error("Token refresh error:", error);

			// If refresh fails, clear user data (handled by APIClient interceptor at 401)
			if (error instanceof Error) {
				throw error;
			}

			throw new Error("Token refresh failed");
		}
	};

	sendVerificationCode = async (email: string): Promise<boolean> => {
		try {
			await APIClient.post<any>({
				url: urls.sendVerificationCode,
				data: { email },
			});
			return true;
		} catch (error) {
			console.error("Send verification code error in AuthDatasourceImpl:", error);
			return false;
		}
	};

	validateVerificationCode = async (code: string, email: string): Promise<boolean> => {
		try {
			await APIClient.post<any>({
				url: urls.validateVerificationCode,
				data: { code, email },
			});
			return true;
		} catch (error) {
			console.error("Validate verification code error in AuthDatasourceImpl:", error);
			return false;
		}
	};
	changePassword = async (email: string, newPassword: string): Promise<boolean> => {
		try {
			await APIClient.put<any>({
				url: urls.changePassword,
				data: { email, password: newPassword },
			});
			return true;
		} catch (error) {
			console.error("Change password error in AuthDatasourceImpl:", error);
			return false;
		}
	};
}
