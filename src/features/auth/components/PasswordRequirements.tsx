import { useTranslation } from "react-i18next";
import { Icon } from "@/components/icon";
import { getPasswordStrength } from "../utils/passwordValidation";

interface PasswordRequirementsProps {
	password: string;
	className?: string;
}

export function PasswordRequirements({ password, className = "" }: PasswordRequirementsProps) {
	const { t } = useTranslation();

	if (!password) return null;

	const strength = getPasswordStrength(password);

	const requirements = [
		{
			key: "passwordMinLength",
			isValid: password.length >= 8,
		},
		{
			key: "passwordRequireUppercase",
			isValid: /[A-Z]/.test(password),
		},
		{
			key: "passwordRequireLowercase",
			isValid: /[a-z]/.test(password),
		},
		{
			key: "passwordRequireNumbers",
			isValid: /\d/.test(password),
		},
		{
			key: "passwordRequireSpecialChars",
			isValid: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
		},
	];

	const getStrengthColor = () => {
		switch (strength) {
			case "weak":
				return "text-red-500";
			case "medium":
				return "text-yellow-500";
			case "strong":
				return "text-green-500";
			default:
				return "text-gray-400";
		}
	};

	const getStrengthText = () => {
		switch (strength) {
			case "weak":
				return "Débil";
			case "medium":
				return "Media";
			case "strong":
				return "Fuerte";
			default:
				return "";
		}
	};

	return (
		<div className={`space-y-2 ${className}`}>
			{/* Indicador de fortaleza */}
			<div className="flex items-center gap-2">
				<span className="text-sm text-muted-foreground">Fortaleza:</span>
				<span className={`text-sm font-medium ${getStrengthColor()}`}>{getStrengthText()}</span>
			</div>

			{/* Lista de requisitos */}
			<div className="space-y-1">
				{requirements.map((requirement) => (
					<div key={requirement.key} className="flex items-center gap-2 text-sm">
						<Icon
							icon={requirement.isValid ? "solar:check-circle-bold" : "solar:close-circle-bold"}
							className={`h-4 w-4 ${requirement.isValid ? "text-green-500" : "text-red-500"}`}
						/>
						<span className={requirement.isValid ? "text-green-700" : "text-red-700"}>
							{t(`sys.login.passwordReset.errorMessages.${requirement.key}`)}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
