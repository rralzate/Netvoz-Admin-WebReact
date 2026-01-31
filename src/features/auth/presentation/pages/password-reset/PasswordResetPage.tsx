import type React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/icon";
import { Alert, AlertDescription } from "@/core/ui/alert";
import { Button } from "@/core/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/ui/card";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { PasswordRequirements } from "../../../components/PasswordRequirements";
import { validatePassword } from "../../../utils/passwordValidation";
import { useChangePassword, useSendVerificationCode, useValidateVerificationCode } from "../../hooks/usePasswordReset";

type PasswordResetStep = "email" | "code" | "new-password";

export default function PasswordResetPage() {
	const { t } = useTranslation();
	const [step, setStep] = useState<PasswordResetStep>("email");
	const [email, setEmail] = useState("");
	const [verificationCode, setVerificationCode] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	// Mutations
	const sendVerificationCodeMutation = useSendVerificationCode();
	const validateVerificationCodeMutation = useValidateVerificationCode();
	const changePasswordMutation = useChangePassword();

	const handleSendCode = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess("");

		if (!email) {
			setError(t("sys.login.passwordResetPage.errorMessages.emailRequired"));
			return;
		}

		try {
			const result = await sendVerificationCodeMutation.mutateAsync(email);
			if (result) {
				setSuccess(t("sys.login.passwordResetPage.successMessages.codeSent"));
				setStep("code");
			} else {
				setError(t("sys.login.passwordResetPage.errorMessages.sendCodeFailed"));
			}
		} catch (error) {
			setError(t("sys.login.passwordResetPage.errorMessages.sendCodeFailed"));
		}
	};

	const handleValidateCode = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess("");

		if (!verificationCode) {
			setError(t("sys.login.passwordResetPage.errorMessages.codeRequired"));
			return;
		}

		try {
			const result = await validateVerificationCodeMutation.mutateAsync({ code: verificationCode, email: email });
			if (result) {
				setSuccess(t("sys.login.passwordResetPage.successMessages.codeValid"));
				setStep("new-password");
			} else {
				setError(t("sys.login.passwordResetPage.errorMessages.invalidCode"));
			}
		} catch (error) {
			setError(t("sys.login.passwordResetPage.errorMessages.validateCodeFailed"));
		}
	};

	const handleChangePassword = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess("");

		if (!newPassword || !confirmPassword) {
			setError(t("sys.login.passwordResetPage.errorMessages.passwordsRequired"));
			return;
		}

		if (newPassword !== confirmPassword) {
			setError(t("sys.login.passwordResetPage.errorMessages.passwordsMismatch"));
			return;
		}

		// Validación robusta de contraseña
		const passwordValidation = validatePassword(newPassword);
		if (!passwordValidation.isValid) {
			const errorMessages = passwordValidation.errors
				.map((errorKey: string) => t(`sys.login.passwordResetPage.errorMessages.${errorKey}`))
				.join(". ");
			setError(errorMessages);
			return;
		}

		try {
			const result = await changePasswordMutation.mutateAsync({
				email,
				newPassword,
			});

			if (result) {
				setSuccess(t("sys.login.passwordResetPage.successMessages.passwordChanged"));
				// Reset form
				setStep("email");
				setEmail("");
				setVerificationCode("");
				setNewPassword("");
				setConfirmPassword("");
			} else {
				setError(t("sys.login.passwordResetPage.errorMessages.changePasswordFailed"));
			}
		} catch (error) {
			setError(t("sys.login.passwordResetPage.errorMessages.changePasswordFailed"));
		}
	};

	const handleResendCode = async () => {
		setError("");
		setSuccess("");

		try {
			const result = await sendVerificationCodeMutation.mutateAsync(email);
			if (result) {
				setSuccess(t("sys.login.passwordResetPage.successMessages.codeResent"));
			} else {
				setError(t("sys.login.passwordResetPage.errorMessages.resendCodeFailed"));
			}
		} catch (error) {
			setError(t("sys.login.passwordResetPage.errorMessages.resendCodeFailed"));
		}
	};

	const renderEmailStep = () => (
		<>
			<CardHeader className="text-center">
				<div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
					<Icon icon="solar:lock-keyhole-bold" className="h-8 w-8 text-primary" />
				</div>
				<CardTitle className="text-2xl font-bold">{t("sys.login.passwordResetPage.title")}</CardTitle>
				<CardDescription>{t("sys.login.passwordResetPage.description")}</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSendCode} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="email">{t("sys.login.passwordResetPage.emailLabel")}</Label>
						<Input
							id="email"
							type="email"
							placeholder={t("sys.login.passwordResetPage.emailPlaceholder")}
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							disabled={sendVerificationCodeMutation.isPending}
							required
						/>
					</div>

					{error && (
						<Alert variant="destructive">
							<Icon icon="solar:danger-triangle-bold" className="h-4 w-4" />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					{success && (
						<Alert>
							<Icon icon="solar:check-circle-bold" className="h-4 w-4" />
							<AlertDescription>{success}</AlertDescription>
						</Alert>
					)}

					<Button type="submit" className="w-full" disabled={sendVerificationCodeMutation.isPending}>
						{sendVerificationCodeMutation.isPending ? (
							<>
								<Icon icon="solar:loading-bold" className="mr-2 h-4 w-4 animate-spin" />
								{t("sys.login.passwordResetPage.loadingStates.sending")}
							</>
						) : (
							<>
								<Icon icon="solar:letter-unread-bold" className="mr-2 h-4 w-4" />
								{t("sys.login.passwordResetPage.buttons.sendEmail")}
							</>
						)}
					</Button>
				</form>
			</CardContent>
		</>
	);

	const renderCodeStep = () => (
		<>
			<CardHeader className="text-center">
				<div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
					<Icon icon="solar:shield-check-bold" className="h-8 w-8 text-primary" />
				</div>
				<CardTitle className="text-2xl font-bold">{t("sys.login.passwordResetPage.verifyCodeTitle")}</CardTitle>
				<CardDescription>
					{t("sys.login.passwordResetPage.verifyCodeDescription")}{" "}
					<strong>{email.replace(/(.{2}).*(@.*)/, "$1****$2")}</strong>.{" "}
					{t("sys.login.passwordResetPage.enterCodeDescription")}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleValidateCode} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="code">{t("sys.login.passwordResetPage.codeLabel")}</Label>
						<Input
							id="code"
							type="text"
							placeholder={t("sys.login.passwordResetPage.codePlaceholder")}
							value={verificationCode}
							onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
							disabled={validateVerificationCodeMutation.isPending}
							className="text-center text-2xl tracking-widest"
							required
						/>
					</div>

					{error && (
						<Alert variant="destructive">
							<Icon icon="solar:danger-triangle-bold" className="h-4 w-4" />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					{success && (
						<Alert>
							<Icon icon="solar:check-circle-bold" className="h-4 w-4" />
							<AlertDescription>{success}</AlertDescription>
						</Alert>
					)}

					<Button
						type="submit"
						className="w-full"
						disabled={validateVerificationCodeMutation.isPending || verificationCode.length !== 4}
					>
						{validateVerificationCodeMutation.isPending ? (
							<>
								<Icon icon="solar:loading-bold" className="mr-2 h-4 w-4 animate-spin" />
								{t("sys.login.passwordResetPage.loadingStates.validating")}
							</>
						) : (
							<>
								<Icon icon="solar:check-circle-bold" className="mr-2 h-4 w-4" />
								{t("sys.login.passwordResetPage.buttons.validateCode")}
							</>
						)}
					</Button>

					<div className="text-center">
						<Button
							type="button"
							variant="link"
							onClick={handleResendCode}
							disabled={sendVerificationCodeMutation.isPending}
							className="text-sm"
						>
							{sendVerificationCodeMutation.isPending ? (
								<>
									<Icon icon="solar:loading-bold" className="mr-2 h-3 w-3 animate-spin" />
									{t("sys.login.passwordResetPage.loadingStates.resending")}
								</>
							) : (
								<>
									<Icon icon="solar:letter-unread-bold" className="mr-2 h-3 w-3" />
									{t("sys.login.passwordResetPage.buttons.resendCode")}
								</>
							)}
						</Button>
					</div>
				</form>
			</CardContent>
		</>
	);

	const renderNewPasswordStep = () => (
		<>
			<CardHeader className="text-center">
				<div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
					<Icon icon="solar:key-bold" className="h-8 w-8 text-primary" />
				</div>
				<CardTitle className="text-2xl font-bold">{t("sys.login.passwordResetPage.newPasswordTitle")}</CardTitle>
				<CardDescription>{t("sys.login.passwordResetPage.newPasswordDescription")}</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleChangePassword} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="newPassword">{t("sys.login.passwordResetPage.newPasswordLabel")}</Label>
						<Input
							id="newPassword"
							type="password"
							placeholder={t("sys.login.passwordResetPage.newPasswordPlaceholder")}
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							disabled={changePasswordMutation.isPending}
							required
						/>

						{/* Indicador de requisitos de contraseña */}
						<PasswordRequirements password={newPassword} className="mt-2" />
					</div>

					<div className="space-y-2">
						<Label htmlFor="confirmPassword">{t("sys.login.passwordResetPage.confirmPasswordLabel")}</Label>
						<Input
							id="confirmPassword"
							type="password"
							placeholder={t("sys.login.passwordResetPage.confirmPasswordPlaceholder")}
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							disabled={changePasswordMutation.isPending}
							required
						/>
					</div>

					{error && (
						<Alert variant="destructive">
							<Icon icon="solar:danger-triangle-bold" className="h-4 w-4" />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					{success && (
						<Alert>
							<Icon icon="solar:check-circle-bold" className="h-4 w-4" />
							<AlertDescription>{success}</AlertDescription>
						</Alert>
					)}

					<Button type="submit" className="w-full" disabled={changePasswordMutation.isPending}>
						{changePasswordMutation.isPending ? (
							<>
								<Icon icon="solar:loading-bold" className="mr-2 h-4 w-4 animate-spin" />
								{t("sys.login.passwordResetPage.loadingStates.changing")}
							</>
						) : (
							<>
								<Icon icon="solar:check-circle-bold" className="mr-2 h-4 w-4" />
								{t("sys.login.passwordResetPage.buttons.changePassword")}
							</>
						)}
					</Button>
				</form>
			</CardContent>
		</>
	);

	const renderBackButton = () => {
		if (step === "email") return null;

		return (
			<div className="mb-4">
				<Button
					variant="ghost"
					onClick={() => {
						if (step === "code") {
							setStep("email");
							setVerificationCode("");
						} else if (step === "new-password") {
							setStep("code");
							setNewPassword("");
							setConfirmPassword("");
						}
						setError("");
						setSuccess("");
					}}
					className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
				>
					<Icon icon="solar:arrow-left-bold" className="h-4 w-4" />
					{t("sys.login.passwordResetPage.buttons.back")}
				</Button>
			</div>
		);
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<Card>
					{renderBackButton()}

					{step === "email" && renderEmailStep()}
					{step === "code" && renderCodeStep()}
					{step === "new-password" && renderNewPasswordStep()}

					<CardContent className="pt-0">
						<div className="text-center">
							<Button variant="link" asChild className="text-sm">
								<a href="/auth/login" className="flex items-center gap-2">
									<Icon icon="solar:arrow-left-bold" className="h-3 w-3" />
									{t("sys.login.passwordResetPage.buttons.backToLogin")}
								</a>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
