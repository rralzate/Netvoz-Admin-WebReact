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
import { useSendVerificationCode } from "../hooks/usePasswordReset";

function ResetForm() {
	const { t } = useTranslation();
	const { loginState, backToLogin, setLoginState, setResetEmail } = useLoginStateContext();
	const form = useForm();
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const sendVerificationCodeMutation = useSendVerificationCode();

	const onFinish = async (values: any) => {
		setError("");
		setSuccess("");

		if (!values.email) {
			setError(t("sys.login.passwordReset.errorMessages.emailRequired"));
			return;
		}

		try {
			const result = await sendVerificationCodeMutation.mutateAsync(values.email);
			if (result) {
				setSuccess(t("sys.login.passwordReset.successMessages.codeSent"));
				setResetEmail(values.email);
				setLoginState(LoginStateEnum.VERIFY_CODE);
			} else {
				setError(t("sys.login.passwordReset.errorMessages.sendCodeFailed"));
			}
		} catch (_error) {
			setError(t("sys.login.passwordReset.errorMessages.sendCodeFailed"));
		}
	};

	if (loginState !== LoginStateEnum.RESET_PASSWORD) return null;

	return (
		<>
			<div className="mb-8 text-center">
				<Icon icon="local:ic-reset-password" size="100" className="text-primary!" />
			</div>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onFinish)} className="space-y-4">
					<div className="flex flex-col items-center gap-2 text-center">
						<h1 className="text-2xl font-bold">{t("sys.login.forgetFormTitle")}</h1>
						<p className="text-balance text-sm text-muted-foreground">{t("sys.login.forgetFormSecondTitle")}</p>
					</div>

					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Input
										type="email"
										placeholder={t("sys.login.email")}
										{...field}
										disabled={sendVerificationCodeMutation.isPending}
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

					<Button type="submit" className="w-full" disabled={sendVerificationCodeMutation.isPending}>
						{sendVerificationCodeMutation.isPending ? (
							<>
								<Icon icon="solar:loading-bold" className="mr-2 h-4 w-4 animate-spin" />
								{t("sys.login.passwordReset.loadingStates.sending")}
							</>
						) : (
							<>
								<Icon icon="solar:letter-unread-bold" className="mr-2 h-4 w-4" />
								{t("sys.login.sendEmailButton")}
							</>
						)}
					</Button>
					<ReturnButton onClick={backToLogin} />
				</form>
			</Form>
		</>
	);
}

export default ResetForm;
