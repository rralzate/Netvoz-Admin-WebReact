import { useMemo } from "react";
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
	const sendVerificationCodeUseCase = useMemo(() => {
		if (!container.has(AUTH_TOKENS.SendVerificationCodeUseCase)) {
			console.warn("SendVerificationCodeUseCase not registered in container");
			return null;
		}
		return container.get<SendVerificationCodeUseCase>(AUTH_TOKENS.SendVerificationCodeUseCase);
	}, []);

	return useMutation({
		mutationFn: async (email: string) => {
			if (!sendVerificationCodeUseCase) {
				throw new Error("SendVerificationCodeUseCase not available");
			}
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
	const validateVerificationCodeUseCase = useMemo(() => {
		if (!container.has(AUTH_TOKENS.ValidateVerificationCodeUseCase)) {
			console.warn("ValidateVerificationCodeUseCase not registered in container");
			return null;
		}
		return container.get<ValidateVerificationCodeUseCase>(AUTH_TOKENS.ValidateVerificationCodeUseCase);
	}, []);

	return useMutation({
		mutationFn: async ({ code, email }: { code: string; email: string }) => {
			if (!validateVerificationCodeUseCase) {
				throw new Error("ValidateVerificationCodeUseCase not available");
			}
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
	const changePasswordUseCase = useMemo(() => {
		if (!container.has(AUTH_TOKENS.ChangePasswordUseCase)) {
			console.warn("ChangePasswordUseCase not registered in container");
			return null;
		}
		return container.get<ChangePasswordUseCase>(AUTH_TOKENS.ChangePasswordUseCase);
	}, []);

	return useMutation({
		mutationFn: async ({ email, newPassword }: { email: string; newPassword: string }) => {
			if (!changePasswordUseCase) {
				throw new Error("ChangePasswordUseCase not available");
			}
			return await changePasswordUseCase.execute(email, newPassword);
		},
		onError: (error) => {
			console.error("❌ Error changing password:", error);
		},
	});
};
