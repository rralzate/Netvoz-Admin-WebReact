import type { LoginResponseEntity } from "../entities/LoginResponseEntity";
import type { RegisterEntity } from "../entities/RegisterEntity";
import type { AuthRepository } from "../repositories/AuthRepository";

export class RegisterUseCase {
	constructor(private authRepository: AuthRepository) {}

	async execute(data: RegisterEntity): Promise<LoginResponseEntity> {
		return this.authRepository.signup(data);
	}
}
