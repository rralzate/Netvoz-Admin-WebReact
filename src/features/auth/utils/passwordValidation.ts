export interface PasswordValidationResult {
	isValid: boolean;
	errors: string[];
}

export interface PasswordRequirements {
	minLength: number;
	requireUppercase: boolean;
	requireLowercase: boolean;
	requireNumbers: boolean;
	requireSpecialChars: boolean;
}

export const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
	minLength: 8,
	requireUppercase: true,
	requireLowercase: true,
	requireNumbers: true,
	requireSpecialChars: true,
};

export function validatePassword(
	password: string,
	requirements: PasswordRequirements = DEFAULT_PASSWORD_REQUIREMENTS,
): PasswordValidationResult {
	const errors: string[] = [];

	// Verificar longitud mínima
	if (password.length < requirements.minLength) {
		errors.push(`passwordMinLength`);
	}

	// Verificar mayúscula
	if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
		errors.push(`passwordRequireUppercase`);
	}

	// Verificar minúscula
	if (requirements.requireLowercase && !/[a-z]/.test(password)) {
		errors.push(`passwordRequireLowercase`);
	}

	// Verificar números
	if (requirements.requireNumbers && !/\d/.test(password)) {
		errors.push(`passwordRequireNumbers`);
	}

	// Verificar caracteres especiales
	if (requirements.requireSpecialChars && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
		errors.push(`passwordRequireSpecialChars`);
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
}

export function getPasswordStrength(password: string): "weak" | "medium" | "strong" {
	const validation = validatePassword(password);

	if (!validation.isValid) {
		return "weak";
	}

	let score = 0;

	// Puntos por longitud
	if (password.length >= 8) score += 1;
	if (password.length >= 12) score += 1;

	// Puntos por complejidad
	if (/[A-Z]/.test(password)) score += 1;
	if (/[a-z]/.test(password)) score += 1;
	if (/\d/.test(password)) score += 1;
	if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score += 1;

	if (score <= 3) return "weak";
	if (score <= 5) return "medium";
	return "strong";
}
