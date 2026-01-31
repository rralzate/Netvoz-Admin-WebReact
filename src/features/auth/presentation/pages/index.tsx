import { Navigate } from "react-router";
import LocalePicker from "@/components/locale-picker";
import Logo from "@/components/logo";
import SettingButton from "@/core/layouts/components/setting-button";
import { useUserToken } from "@/features/auth/presentation/hooks/userStore";
import { GLOBAL_CONFIG } from "@/global-config";
import { LoginProvider } from "../hooks/login-provider";
import LoginForm from "./login-form";
import MobileForm from "./mobile-form";
import NewPasswordForm from "./new-password-form";
import QrCodeFrom from "./qrcode-form";
import RegisterForm from "./register-form";
import ResetForm from "./reset-form";
import VerifyCodeForm from "./verify-code-form";

function LoginPage() {
	const token = useUserToken();

	if (token.accessToken) {
		return <Navigate to={GLOBAL_CONFIG.defaultRoute} replace />;
	}

	return (
		<div className="relative grid min-h-svh lg:grid-cols-2 bg-background">
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex justify-center gap-2 md:justify-start">
					<div className="flex items-center gap-2 font-medium cursor-pointer">
						<Logo size={28} />
						<span>{GLOBAL_CONFIG.appName}</span>
					</div>
				</div>
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-md">
						<LoginProvider>
							<LoginForm />
							<MobileForm />
							<QrCodeFrom />
							<RegisterForm />
							<ResetForm />
							<VerifyCodeForm />
							<NewPasswordForm />
						</LoginProvider>
					</div>
				</div>
			</div>

			<div className="relative hidden bg-background-paper lg:block overflow-hidden">
				<div className="absolute inset-0 h-full w-full bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/10 dark:to-transparent" />
			</div>

			<div className="absolute right-2 top-0 flex flex-row z-10">
				<LocalePicker />
				<SettingButton />
			</div>
		</div>
	);
}

export default LoginPage;
