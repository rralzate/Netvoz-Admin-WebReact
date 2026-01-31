import type { LoginEntity } from "../entities/LoginEntity";
import type { LoginResponseEntity } from "../entities/LoginResponseEntity";
import type { AuthRepository } from "../repositories/AuthRepository";

export class LoginUseCase {
	constructor(private authRepository: AuthRepository) {}

	async execute(data: LoginEntity): Promise<LoginResponseEntity> {
		try {
			// Validate input data
			if (!data) {
				throw new Error("Login data is required");
			}

			if (!data.email || !data.password) {
				throw new Error("Email and password are required");
			}

			// Validate email format (basic validation)
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(data.email)) {
				throw new Error("Invalid email format");
			}

			// Validate password (basic validation)
			if (data.password.length < 1) {
				throw new Error("Password is required");
			}
			// Call repository
			const response = await this.authRepository.login(data);

			// Validate response
			if (!response) {
				console.error("❌ AuthRepository returned null/undefined response");
				throw new Error("No response received from repository");
			}

			// Additional business logic validation if needed
			if (!response.data) {
				console.error("❌ AuthRepository response missing data:", response);
				throw new Error("Invalid login response: missing data");
			}

			if (!response.data.user) {
				console.error("❌ AuthRepository response missing user data:", response.data);
				throw new Error("Invalid login response: missing user data");
			}

			// Check if user is active (business rule)
			if (response.data.user.active === false) {
				throw new Error("User account is deactivated. Please contact support.");
			}
			return response;
		} catch (error) {
			console.error("💥 Error in LoginUseCase.execute:", error);

			// Enhanced error logging
			if (error instanceof Error) {
				console.error("Error details:", {
					name: error.name,
					message: error.message,
					stack: error.stack,
				});
			} else {
				console.error("Non-Error object thrown:", typeof error, error);
			}

			// Re-throw with use case context
			if (error instanceof Error) {
				throw error; // Don't modify the error message, just re-throw as-is
			} else {
				throw new Error("Login use case failed: Unknown error occurred");
			}
		}
	}
}
