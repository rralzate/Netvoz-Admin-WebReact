import type { AuthRepository } from "../repositories/AuthRepository";

export interface ValidateVerificationCodeUseCase {
	execute(code: string, email: string): Promise<boolean>;
}

export class ValidateVerificationCodeUseCaseImpl implements ValidateVerificationCodeUseCase {
	constructor(private readonly authRepository: AuthRepository) {}

	async execute(code: string, email: string): Promise<boolean> {
		try {
			const result = await this.authRepository.validateVerificationCode(code, email);
			return result;
		} catch (error) {
			console.error("❌ Error in ValidateVerificationCodeUseCase:", error);
			throw error;
		}
	}
}
