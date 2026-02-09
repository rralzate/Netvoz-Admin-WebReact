import axios from "axios";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/core/ui/button";
import { Checkbox } from "@/core/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/core/ui/form";
import { Input } from "@/core/ui/input";
import { cn } from "@/core/utils";
import { useAuthState, useSignIn } from "@/features/auth/presentation/hooks/userStore";
import { GLOBAL_CONFIG } from "@/global-config";
import type { LoginEntity } from "../../domain/entities/LoginEntity";
import { LoginStateEnum, useLoginStateContext } from "../hooks/login-provider";

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"form">) {
	const { t } = useTranslation();
	const [remember, setRemember] = useState(true);
	const [showPassword, setShowPassword] = useState(false);
	const navigate = useNavigate();

	const { loginState, setLoginState } = useLoginStateContext();
	const { signIn, isLoading, reset } = useSignIn();
	const { isAuthenticated } = useAuthState();

	const form = useForm<LoginEntity>({
		defaultValues: {
			email: "",
			password: "",
		},
	});

	// Watch form values to disable button when empty
	const email = form.watch("email");
	const password = form.watch("password");
	const isFormEmpty = !email || !password;

	// Redirect if already authenticated
	useEffect(() => {
		if (isAuthenticated) {
			navigate(GLOBAL_CONFIG.defaultRoute, { replace: true });
		}
	}, [isAuthenticated, navigate]);

	// Reset error state when component mounts
	useEffect(() => {
		reset();
	}, [reset]);

	if (loginState !== LoginStateEnum.LOGIN) return null;

	const handleFinish = async (values: LoginEntity) => {
		try {
			const response = await signIn(values);

			// Success toast
			toast.success(t("sys.login.loginSuccessTitle"), {
				description: `${t("sys.login.welcomeBack")} ${response.data.user.fullName || response.data.user.nombre}!`,
				closeButton: true,
			});

			// Navigate to default route
			navigate(GLOBAL_CONFIG.defaultRoute, { replace: true });
		} catch (err) {
			// Extract error message from axios error
			let errorTitle = t("sys.login.loginFailed");
			let errorDescription = t("sys.login.loginError");

			if (axios.isAxiosError(err)) {
				const data = err.response?.data as any;
				
				// Check for 422 (validation/authentication error)
				if (err.response?.status === 422 || err.response?.status === 401) {
					errorDescription = t("sys.login.loginFailedDescription");
				}
				
				// Try to get custom message from backend
				if (data?.responseMessage) {
					errorDescription = data.responseMessage;
				} else if (data?.message) {
					errorDescription = data.message;
				}
			}

			toast.error(errorTitle, {
				description: errorDescription,
				closeButton: true,
			});

			console.error("Login failed:", err);
		}
	};

	return (
		<div className={cn("flex flex-col gap-6", className)}>
			<Form {...form} {...props}>
				<form onSubmit={form.handleSubmit(handleFinish)} className="space-y-4">
					<div className="flex flex-col items-center gap-2 text-center">
						<h1 className="text-2xl font-bold">{t("sys.login.signInFormTitle")}</h1>
						<p className="text-balance text-sm text-muted-foreground">{t("sys.login.signInFormDescription")}</p>
					</div>

					<FormField
						control={form.control}
						name="email"
						rules={{
							required: t("sys.login.accountPlaceholder"),
							pattern: {
								value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
								message: t("sys.login.invalidEmail"),
							},
						}}
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("sys.login.userName")}</FormLabel>
								<FormControl>
									<Input placeholder={t("sys.login.userName")} disabled={isLoading} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="password"
						rules={{
							required: t("sys.login.passwordPlaceholder"),
							minLength: {
								value: 3,
								message: t("sys.login.passwordTooShort"),
							},
						}}
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("sys.login.password")}</FormLabel>
								<FormControl>
									<div className="relative">
										<Input
											type={showPassword ? "text" : "password"}
											placeholder={t("sys.login.password")}
											disabled={isLoading}
											suppressHydrationWarning
											className="pr-10"
											{...field}
										/>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
											onClick={() => setShowPassword(!showPassword)}
											disabled={isLoading}
										>
											{showPassword ? (
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

					<div className="flex flex-row justify-between">
						<div className="flex items-center space-x-2">
							<Checkbox
								id="remember"
								checked={remember}
								disabled={isLoading}
								onCheckedChange={(checked) => setRemember(checked === "indeterminate" ? false : checked)}
							/>
							<label
								htmlFor="remember"
								className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								{t("sys.login.rememberMe")}
							</label>
						</div>
						<Button
							variant="link"
							onClick={() => setLoginState(LoginStateEnum.RESET_PASSWORD)}
							size="sm"
							disabled={isLoading}
						>
							{t("sys.login.forgetPassword")}
						</Button>
					</div>

					<Button type="submit" className="w-full" disabled={isLoading || isFormEmpty}>
						{isLoading && <Loader2 className="animate-spin mr-2" />}
						{isLoading ? t("sys.login.signingIn") : t("sys.login.loginButton")}
					</Button>


				</form>
			</Form>
		</div>
	);
}

export default LoginForm;
