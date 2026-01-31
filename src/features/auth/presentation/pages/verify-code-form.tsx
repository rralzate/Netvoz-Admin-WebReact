import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/icon";
import { Alert, AlertDescription } from "@/core/ui/alert";
import { Button } from "@/core/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/core/ui/form";
import { Input } from "@/core/ui/input";
import { ReturnButton } from "../components/ReturnButton";
import { LoginStateEnum, useLoginStateContext } from "../hooks/login-provider";
import { useSendVerificationCode, useValidateVerificationCode } from "../hooks/usePasswordReset";

function VerifyCodeForm() {
	const { t } = useTranslation();
	const { loginState, backToLogin, resetEmail, setLoginState } = useLoginStateContext();
	const form = useForm();
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const validateVerificationCodeMutation = useValidateVerificationCode();
	const sendVerificationCodeMutation = useSendVerificationCode();

	const onFinish = async (values: any) => {
		setError("");
		setSuccess("");

		if (!values.code || values.code.length !== 4) {
			setError(t("sys.login.passwordReset.errorMessages.codeRequired"));
			return;
		}

		try {
			const result = await validateVerificationCodeMutation.mutateAsync({
				code: values.code,
				email: resetEmail,
			});
			if (result) {
				setSuccess(t("sys.login.passwordReset.successMessages.codeValid"));
				setLoginState(LoginStateEnum.NEW_PASSWORD);
			} else {
				setError(t("sys.login.passwordReset.errorMessages.invalidCode"));
			}
		} catch (error) {
			setError(t("sys.login.passwordReset.errorMessages.validateCodeFailed"));
		}
	};

	const handleResendCode = async () => {
		setError("");
		setSuccess("");

		try {
			const result = await sendVerificationCodeMutation.mutateAsync(resetEmail);
			if (result) {
				setSuccess(t("sys.login.passwordReset.successMessages.codeResent"));
			} else {
				setError(t("sys.login.passwordReset.errorMessages.resendCodeFailed"));
			}
		} catch (error) {
			setError(t("sys.login.passwordReset.errorMessages.resendCodeFailed"));
		}
	};

	if (loginState !== LoginStateEnum.VERIFY_CODE) return null;

	return (
		<>
			<div className="mb-8 text-center">
				<Icon icon="solar:shield-check-bold" size="100" className="text-primary!" />
			</div>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onFinish)} className="space-y-4">
					<div className="flex flex-col items-center gap-2 text-center">
						<h1 className="text-2xl font-bold">{t("sys.login.passwordReset.verifyCodeTitle")}</h1>
						<p className="text-balance text-sm text-muted-foreground">
							{t("sys.login.passwordReset.verifyCodeDescription")}{" "}
							<strong>{resetEmail.replace(/(.{2}).*(@.*)/, "$1****$2")}</strong>.
							{t("sys.login.passwordReset.enterCodeDescription")}
						</p>
					</div>

					<FormField
						control={form.control}
						name="code"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Input
										type="text"
										placeholder={t("sys.login.passwordReset.codePlaceholder")}
										{...field}
										onChange={(e) => {
											const value = e.target.value.replace(/\D/g, "").slice(0, 4);
											field.onChange(value);
										}}
										disabled={validateVerificationCodeMutation.isPending}
										className="text-center text-2xl tracking-widest"
									/>
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

					<Button
						type="submit"
						className="w-full"
						disabled={validateVerificationCodeMutation.isPending || form.watch("code")?.length !== 4}
					>
						{validateVerificationCodeMutation.isPending ? (
							<>
								<Icon icon="solar:loading-bold" className="mr-2 h-4 w-4 animate-spin" />
								{t("sys.login.passwordReset.loadingStates.validating")}
							</>
						) : (
							<>
								<Icon icon="solar:check-circle-bold" className="mr-2 h-4 w-4" />
								{t("sys.login.passwordReset.validateCodeButton")}
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
									{t("sys.login.passwordReset.loadingStates.resending")}
								</>
							) : (
								<>
									<Icon icon="solar:letter-unread-bold" className="mr-2 h-3 w-3" />
									{t("sys.login.passwordReset.resendCodeButton")}
								</>
							)}
						</Button>
					</div>

					<ReturnButton onClick={backToLogin} />
				</form>
			</Form>
		</>
	);
}

export default VerifyCodeForm;
