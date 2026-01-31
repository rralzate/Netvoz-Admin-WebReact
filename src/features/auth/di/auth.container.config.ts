import { container } from "@/core/di/DIContainer";
import { AuthDatasourceImpl } from "../data/datasource/AuthDatasource";
import { AuthRepositoryImpl } from "../data/repositories/AuthRepositoryImpl";
import {
	ChangePasswordUseCaseImpl,
	LoginUseCase,
	LogoutUseCase,
	SendVerificationCodeUseCaseImpl,
	ValidateVerificationCodeUseCaseImpl,
} from "../domain/usecases";
import { RegisterUseCase } from "../domain/usecases/RegisterUseCase";

// Service tokens (símbolos únicos para evitar colisiones)
export const TOKENS = {
	// Datasources
	AuthDatasource: Symbol("AuthDatasource"),

	// Repositories
	AuthRepository: Symbol("AuthRepository"),

	// Use Cases
	LoginUseCase: Symbol("LoginUseCase"),
	LogoutUseCase: Symbol("LogoutUseCase"),
	RefreshTokenUseCase: Symbol("RefreshTokenUseCase"),
	RegisterUseCase: Symbol("RegisterUseCase"),
	SendVerificationCodeUseCase: Symbol("SendVerificationCodeUseCase"),
	ValidateVerificationCodeUseCase: Symbol("ValidateVerificationCodeUseCase"),
	ChangePasswordUseCase: Symbol("ChangePasswordUseCase"),
} as const;

// Export tokens for external use
export const AUTH_TOKENS = TOKENS;

export function authConfigureContainer(): void {
	// Register Datasources
	container.registerClass(
		TOKENS.AuthDatasource,
		AuthDatasourceImpl,
		[], // No dependencies
	);

	// Register Repositories
	container.registerClass(
		TOKENS.AuthRepository,
		AuthRepositoryImpl,
		[TOKENS.AuthDatasource], // Depends on AuthDatasource
	);

	// Register Use Cases
	container.registerClass(
		TOKENS.LoginUseCase,
		LoginUseCase,
		[TOKENS.AuthRepository], // Depends on AuthRepository
	);
	container.registerClass(
		TOKENS.LogoutUseCase,
		LogoutUseCase,
		[TOKENS.AuthRepository], // Depends on AuthRepository
	);
	container.registerClass(
		TOKENS.RegisterUseCase,
		RegisterUseCase,
		[TOKENS.AuthRepository], // Depends on AuthRepository
	);
	container.registerClass(
		TOKENS.SendVerificationCodeUseCase,
		SendVerificationCodeUseCaseImpl,
		[TOKENS.AuthRepository], // Depends on AuthRepository
	);
	container.registerClass(
		TOKENS.ValidateVerificationCodeUseCase,
		ValidateVerificationCodeUseCaseImpl,
		[TOKENS.AuthRepository], // Depends on AuthRepository
	);
	container.registerClass(
		TOKENS.ChangePasswordUseCase,
		ChangePasswordUseCaseImpl,
		[TOKENS.AuthRepository], // Depends on AuthRepository
	);
}
