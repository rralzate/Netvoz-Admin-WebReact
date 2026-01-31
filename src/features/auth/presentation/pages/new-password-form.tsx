import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/icon";
import { Alert, AlertDescription } from "@/core/ui/alert";
import { Button } from "@/core/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/core/ui/form";
import { Input } from "@/core/ui/input";
import { PasswordRequirements } from "../../components/PasswordRequirements";
import { validatePassword } from "../../utils/passwordValidation";
import { ReturnButton } from "../components/ReturnButton";
import { LoginStateEnum, useLoginStateContext } from "../hooks/login-provider";
import { useChangePassword } from "../hooks/usePasswordReset";

function NewPasswordForm() {
	const { t } = useTranslation();
	const { loginState, backToLogin, resetEmail } = useLoginStateContext();
	const form = useForm();
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [password, setPassword] = useState("");
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const changePasswordMutation = useChangePassword();

	const onFinish = async (values: any) => {
		setError("");
		setSuccess("");

		if (!values.newPassword || !values.confirmPassword) {
			setError(t("sys.login.passwordReset.errorMessages.passwordsRequired"));
			return;
		}

		if (values.newPassword !== values.confirmPassword) {
			setError(t("sys.login.passwordReset.errorMessages.passwordsMismatch"));
			return;
		}

		// Validación robusta de contraseña
		const passwordValidation = validatePassword(values.newPassword);
		if (!passwordValidation.isValid) {
			const errorMessages = passwordValidation.errors
				.map((errorKey: string) => t(`sys.login.passwordReset.errorMessages.${errorKey}`))
				.join(". ");
			setError(errorMessages);
			return;
		}

		try {
			const result = await changePasswordMutation.mutateAsync({
				email: resetEmail,
				newPassword: values.newPassword,
			});

			if (result) {
				setSuccess(t("sys.login.passwordReset.successMessages.passwordChanged"));
				// Reset form and go back to login after 2 seconds
				setTimeout(() => {
					backToLogin();
				}, 2000);
			} else {
				setError(t("sys.login.passwordReset.errorMessages.changePasswordFailed"));
			}
		} catch (_error) {
			setError(t("sys.login.passwordReset.errorMessages.changePasswordFailed"));
		}
	};

	if (loginState !== LoginStateEnum.NEW_PASSWORD) return null;

	return (
		<>
			<div className="mb-8 text-center">
				<Icon icon="solar:key-bold" size="100" className="text-primary!" />
			</div>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onFinish)} className="space-y-4">
					<div className="flex flex-col items-center gap-2 text-center">
						<h1 className="text-2xl font-bold">{t("sys.login.passwordReset.newPasswordTitle")}</h1>
						<p className="text-balance text-sm text-muted-foreground">
							{t("sys.login.passwordReset.newPasswordDescription")}
						</p>
					</div>

					<FormField
						control={form.control}
						name="newPassword"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<div className="relative">
										<Input
											type={showNewPassword ? "text" : "password"}
											placeholder={t("sys.login.passwordReset.newPasswordPlaceholder")}
											className="pr-10"
											{...field}
											onChange={(e) => {
												field.onChange(e);
												setPassword(e.target.value);
											}}
											disabled={changePasswordMutation.isPending}
										/>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
											onClick={() => setShowNewPassword(!showNewPassword)}
											disabled={changePasswordMutation.isPending}
										>
											{showNewPassword ? (
												<EyeOff className="h-4 w-4 text-muted-foreground" />
											) : (
												<Eye className="h-4 w-4 text-muted-foreground" />
											)}
										</Button>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Indicador de requisitos de contraseña */}
					<PasswordRequirements password={password} className="mt-2" />

					<FormField
						control={form.control}
						name="confirmPassword"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<div className="relative">
										<Input
											type={showConfirmPassword ? "text" : "password"}
											placeholder={t("sys.login.passwordReset.confirmPasswordPlaceholder")}
											className="pr-10"
											{...field}
											disabled={changePasswordMutation.isPending}
										/>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
											onClick={() => setShowConfirmPassword(!showConfirmPassword)}
											disabled={changePasswordMutation.isPending}
										>
											{showConfirmPassword ? (
												<EyeOff className="h-4 w-4 text-muted-foreground" />
											) : (
												<Eye className="h-4 w-4 text-muted-foreground" />
											)}
										</Button>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

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
								{t("sys.login.passwordReset.loadingStates.changing")}
							</>
						) : (
							<>
								<Icon icon="solar:check-circle-bold" className="mr-2 h-4 w-4" />
								{t("sys.login.passwordReset.changePasswordButton")}
							</>
						)}
					</Button>

					<ReturnButton onClick={backToLogin} />
				</form>
			</Form>
		</>
	);
}

export default NewPasswordForm;
