import type { AuthRepository } from "../repositories/AuthRepository";

export interface SendVerificationCodeUseCase {
	execute(email: string): Promise<boolean>;
}

export class SendVerificationCodeUseCaseImpl implements SendVerificationCodeUseCase {
	constructor(private readonly authRepository: AuthRepository) {}

	async execute(email: string): Promise<boolean> {
		try {
			const result = await this.authRepository.sendVerificationCode(email);
			return result;
		} catch (error) {
			console.error("❌ Error in SendVerificationCodeUseCase:", error);
			throw error;
		}
	}
}
