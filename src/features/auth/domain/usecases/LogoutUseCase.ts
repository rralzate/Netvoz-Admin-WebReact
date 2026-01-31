import type { AuthRepository } from "../repositories/AuthRepository";

export class LogoutUseCase {
	private readonly authRepository: AuthRepository;

	constructor(authRepository: AuthRepository) {
		this.authRepository = authRepository;
	}

	async execute(): Promise<void> {
		return this.authRepository.logout();
	}
}
