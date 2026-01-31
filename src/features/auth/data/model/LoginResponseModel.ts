import type { ResponseCode } from "@/core/constants/ResponseCodes";
import type { LoginResponseEntity } from "../../domain/entities/LoginResponseEntity";
import type { UserEntity } from "../../domain/entities/UserEntity";

export interface UserModel {
	id: string;
	email: string;
	nombre: string;
	apellido: string;
	fullName: string;
	rolId: string;
	negocioId: string;
	avatar?: string;
	active?: boolean;
}

// Interfaz para los datos de login
export interface LoginDataEntity {
	token: string;
	refreshToken: string;
	user: UserEntity;
}

// Modelo base para todas las respuestas
export abstract class BaseApiResponseModel {
	status: "success" | "fail" | "error";
	statusCode: number;
	responseCode: ResponseCode;
	responseMessage: string;
	message: string;
	timestamp: string;

	constructor(apiResponse: any) {
		this.status = apiResponse.status;
		this.statusCode = apiResponse.statusCode;
		this.responseCode = apiResponse.responseCode;
		this.responseMessage = apiResponse.responseMessage;
		this.message = apiResponse.message;
		this.timestamp = apiResponse.timestamp;
	}

	// Método para verificar si la respuesta fue exitosa
	isSuccess(): boolean {
		return this.status === "success";
	}

	// Método para verificar si hubo un error
	isError(): boolean {
		return this.status === "error";
	}

	// Método para verificar si hubo una falla (error del cliente)
	isFail(): boolean {
		return this.status === "fail";
	}
}

// Modelo para respuestas de login
export class LoginResponseModel extends BaseApiResponseModel implements LoginResponseEntity {
	data: LoginDataEntity;

	constructor(apiResponse: any) {
		super(apiResponse);

		// La estructura de datos es directa: apiResponse.data contiene token, refreshToken y user
		if (!apiResponse.data) {
			throw new Error("Invalid API response: missing data field");
		}

		const { token, refreshToken, user } = apiResponse.data;

		if (!user) {
			throw new Error("Invalid API response: missing user data");
		}

		this.data = {
			token: token,
			refreshToken: refreshToken,
			user: {
				id: user.id,
				email: user.email,
				nombre: user.nombre,
				apellido: user.apellido,
				fullName: user.fullName,
				rolId: user.rolId,
				negocioId: user.negocioId,
				avatar: user.avatar,
				active: user.active ?? true,
			},
		};

		// Validar campos requeridos
		if (!this.data.token || !this.data.refreshToken) {
			throw new Error("Invalid API response: missing authentication tokens");
		}

		if (!this.data.user.id || !this.data.user.email) {
			throw new Error("Invalid API response: missing required user fields");
		}
	}

	// Método para verificar si el login fue exitoso
	isLoginSuccessful(): boolean {
		return this.isSuccess() && this.statusCode === 200;
	}

	// Método para obtener solo los datos del usuario
	getUser(): UserEntity {
		return this.data.user;
	}

	// Método para obtener solo el token
	getToken(): string {
		return this.data.token;
	}

	// Método para obtener solo el refresh token
	getRefreshToken(): string {
		return this.data.refreshToken;
	}

	// Método para verificar si el usuario está activo
	isUserActive(): boolean {
		return this.data.user.active ?? true;
	}

	// Método para obtener el nombre completo del usuario
	getUserFullName(): string {
		return this.data.user.fullName || `${this.data.user.nombre} ${this.data.user.apellido}`;
	}

	// Método para verificar si el token está presente y es válido
	hasValidToken(): boolean {
		return !!this.data.token;
	}

	// Método para convertir a entidad de dominio
	toEntity(): LoginResponseEntity {
		return {
			status: this.status,
			statusCode: this.statusCode,
			responseCode: this.responseCode,
			responseMessage: this.responseMessage,
			message: this.message,
			timestamp: this.timestamp,
			data: this.data,
		};
	}

	// Factory method para crear desde respuesta de API
	static fromApiResponse(apiResponse: any): LoginResponseModel {
		try {
			if (!LoginResponseModel.isValidApiResponse(apiResponse)) {
				console.error("Invalid API response structure:", apiResponse);
				throw new Error("Invalid API response structure");
			}

			const model = new LoginResponseModel(apiResponse);

			return model;
		} catch (error) {
			console.error("Error creating LoginResponseModel:", error);
			console.error("Original API response:", JSON.stringify(apiResponse, null, 2));
			throw error;
		}
	}

	// Método para validar la estructura de la respuesta
	static isValidApiResponse(apiResponse: any): boolean {
		try {
			// Validación de estructura básica
			if (!apiResponse) {
				console.error("❌ API response is null or undefined");
				return false;
			}

			// Verificar campos base de la respuesta
			const requiredFields = ["status", "statusCode", "responseCode", "responseMessage", "message", "timestamp"];

			for (const field of requiredFields) {
				if (!(field in apiResponse)) {
					console.error(`❌ Missing required field: ${field}`);
					return false;
				}
			}

			if (typeof apiResponse.status !== "string") {
				console.error("❌ Invalid status field:", apiResponse.status);
				return false;
			}

			if (typeof apiResponse.statusCode !== "number") {
				console.error("❌ Invalid statusCode field:", apiResponse.statusCode);
				return false;
			}

			// Verificar estructura de data
			if (!apiResponse.data) {
				console.error("❌ Missing data field");
				return false;
			}

			const { token, refreshToken, user } = apiResponse.data;

			if (!token || typeof token !== "string") {
				console.error("❌ Missing or invalid token in response");
				return false;
			}

			if (!refreshToken || typeof refreshToken !== "string") {
				console.error("❌ Missing or invalid refreshToken in response");
				return false;
			}

			if (!user) {
				console.error("❌ Missing user data in response");
				return false;
			}

			// Verificar campos requeridos del usuario
			const requiredUserFields = ["id", "email", "nombre", "apellido", "fullName", "rolId", "negocioId"];

			for (const field of requiredUserFields) {
				if (!user[field] || typeof user[field] !== "string") {
					console.error(`❌ Missing or invalid user field: ${field}`, user[field]);
					return false;
				}
			}
			return true;
		} catch (error) {
			console.error("💥 Error during validation:", error);
			return false;
		}
	}
}
