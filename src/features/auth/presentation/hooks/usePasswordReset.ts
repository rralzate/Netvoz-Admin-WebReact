import { useMutation } from "@tanstack/react-query";
import { container } from "@/core/di/DIContainer";
import { AUTH_TOKENS } from "../../di/auth.container.config";
import type {
	ChangePasswordUseCase,
	SendVerificationCodeUseCase,
	ValidateVerificationCodeUseCase,
} from "../../domain/usecases";

/**
 * Hook para enviar código de verificación por email
 */
export const useSendVerificationCode = () => {
	const sendVerificationCodeUseCase = container.get<SendVerificationCodeUseCase>(
		AUTH_TOKENS.SendVerificationCodeUseCase,
	);

	return useMutation({
		mutationFn: async (email: string) => {
			return await sendVerificationCodeUseCase.execute(email);
		},
		onError: (error) => {
			console.error("❌ Error sending verification code:", error);
		},
	});
};

/**
 * Hook para validar código de verificación
 */
export const useValidateVerificationCode = () => {
	const validateVerificationCodeUseCase = container.get<ValidateVerificationCodeUseCase>(
		AUTH_TOKENS.ValidateVerificationCodeUseCase,
	);

	return useMutation({
		mutationFn: async ({ code, email }: { code: string; email: string }) => {
			return await validateVerificationCodeUseCase.execute(code, email);
		},
		onError: (error) => {
			console.error("❌ Error validating verification code:", error);
		},
	});
};

/**
 * Hook para cambiar contraseña
 */
export const useChangePassword = () => {
	const changePasswordUseCase = container.get<ChangePasswordUseCase>(AUTH_TOKENS.ChangePasswordUseCase);

	return useMutation({
		mutationFn: async ({ email, newPassword }: { email: string; newPassword: string }) => {
			return await changePasswordUseCase.execute(email, newPassword);
		},
		onError: (error) => {
			console.error("❌ Error changing password:", error);
		},
	});
};
