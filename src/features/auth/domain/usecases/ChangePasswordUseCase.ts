import type { AuthRepository } from "../repositories/AuthRepository";

export interface ChangePasswordUseCase {
	execute(email: string, newPassword: string): Promise<boolean>;
}

export class ChangePasswordUseCaseImpl implements ChangePasswordUseCase {
	constructor(private readonly authRepository: AuthRepository) {}

	async execute(email: string, newPassword: string): Promise<boolean> {
		try {
			const result = await this.authRepository.changePassword(email, newPassword);
			return result;
		} catch (error) {
			console.error("❌ Error in ChangePasswordUseCase:", error);
			throw error;
		}
	}
}
