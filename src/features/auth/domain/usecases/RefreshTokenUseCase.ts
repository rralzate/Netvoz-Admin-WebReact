import type { LoginResponseEntity } from "../entities/LoginResponseEntity";
import type { AuthRepository } from "../repositories/AuthRepository";

export class RefreshTokenUseCase {
	private readonly authRepository: AuthRepository;

	constructor(authRepository: AuthRepository) {
		this.authRepository = authRepository;
	}

	async execute(refreshToken: string): Promise<LoginResponseEntity> {
		return this.authRepository.refreshToken(refreshToken);
	}
}
