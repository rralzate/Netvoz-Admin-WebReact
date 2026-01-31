import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import BusinessTypeCombobox from "@/components/auth/BusinessTypeCombobox";
import CountryPhoneCombobox from "@/components/auth/CountryPhoneCombobox";
import { AppError } from "@/core/errors/AppError";
import { ResponseCodes } from "@/core/constants/ResponseCodes";
import { Button } from "@/core/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/core/ui/form";
import { Input } from "@/core/ui/input";
import type { RegisterEntity } from "../../domain/entities/RegisterEntity";
import { ReturnButton } from "../components/ReturnButton";
import { LoginStateEnum, useLoginStateContext } from "../hooks/login-provider";
import { useSignUp } from "../hooks/userStore";

// Type for form data
interface RegisterFormData {
	name: string;
	lastname: string;
	phone: string;
	countryCode: string;
	dialCode: string;
	country: string;
	nit: string;
	businessName: string;
	businessType: string;
	email: string;
	password: string;
	confirmPassword: string;
}

function RegisterForm() {
	const { t } = useTranslation();
	const { loginState, backToLogin } = useLoginStateContext();
	const { signUp, isLoading, error, reset } = useSignUp();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// Calculate error message based on error type
	const errorMessage = useMemo(() => {
		if (!error) return null;

		const appError = error instanceof AppError ? error : AppError.fromError(error, t("sys.login.registerFailed"));
		
		// Get original error message for pattern matching
		const originalErrorMsg = error instanceof Error ? error.message : String(error);
		const errorMsgLower = (appError.responseMessage || appError.message || "").toLowerCase();
		
		// Customize message based on the field that caused the conflict
		if (appError.statusCode === 409) {
			if (
				appError.field === "email" ||
				appError.responseCode === ResponseCodes.DUPLICATE_EMAIL ||
				errorMsgLower.includes("email") ||
				errorMsgLower.includes("correo") ||
				originalErrorMsg.toLowerCase().includes("email") ||
				originalErrorMsg.toLowerCase().includes("correo")
			) {
				return "El correo electrónico ya está registrado. Por favor, use otro correo.";
			} else if (
				appError.field === "nit" ||
				errorMsgLower.includes("nit") ||
				originalErrorMsg.toLowerCase().includes("nit")
			) {
				return "El NIT ya está registrado. Por favor, verifique el número de identificación.";
			} else if (appError.details) {
				return appError.details;
			} else if (originalErrorMsg && !originalErrorMsg.includes("Repository signup failed")) {
				// Use original error message if it's not the generic wrapper
				return originalErrorMsg;
			} else {
				return "Los datos ingresados ya existen en el sistema. Por favor, verifique la información.";
			}
		}

		// For non-409 errors, use the error message or fallback
		if (originalErrorMsg && !originalErrorMsg.includes("Repository signup failed")) {
			return originalErrorMsg;
		}

		return appError.responseMessage || appError.message || t("sys.login.registerFailed");
	}, [error, t]);

	// Memoize validation messages to prevent recreation on every render
	const validationMessages = useMemo(
		() => ({
			nameRequired: t("sys.login.nameRequired"),
			lastnameRequired: t("sys.login.lastnameRequired"),
			countryRequired: t("sys.login.countryRequired"),
			phoneRequired: t("sys.login.phoneRequired"),
			phoneInvalid: t("sys.login.phoneInvalid"),
			nitRequired: t("sys.login.nitRequired"),
			nitInvalid: t("sys.login.nitInvalid"),
			businessTypeRequired: t("sys.login.businessTypeRequired"),
			businessNameRequired: t("sys.login.businessNameRequired"),
			emailRequired: t("sys.login.emailRequired"),
			emailInvalid: t("sys.login.emailInvalid"),
			passwordRequired: t("sys.login.passwordRequired"),
			passwordMinLength: t("sys.login.passwordMinLength"),
			confirmPasswordRequired: t("sys.login.confirmPasswordRequired"),
			diffPwd: t("sys.login.diffPwd"),
		}),
		[t],
	);

	// Memoize validation rules to prevent recreation
	const validationRules = useMemo(
		() => ({
			name: {
				required: validationMessages.nameRequired,
			},
			lastname: {
				required: validationMessages.lastnameRequired,
			},
			countryCode: {
				required: validationMessages.countryRequired,
			},
			phone: {
				required: validationMessages.phoneRequired,
				pattern: {
					value: /^[0-9]+$/,
					message: validationMessages.phoneInvalid,
				},
			},
			nit: {
				required: validationMessages.nitRequired,
				pattern: {
					value: /^[0-9-]+$/,
					message: validationMessages.nitInvalid,
				},
			},
			businessType: {
				required: validationMessages.businessTypeRequired,
			},
			businessName: {
				required: validationMessages.businessNameRequired,
			},
			email: {
				required: validationMessages.emailRequired,
				pattern: {
					value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
					message: validationMessages.emailInvalid,
				},
			},
			password: {
				required: validationMessages.passwordRequired,
				minLength: {
					value: 8,
					message: validationMessages.passwordMinLength,
				},
				validate: (value: string) => {
					// Check for at least 8 characters, 1 uppercase, 1 number, 1 special character
					const hasMinLength = value.length >= 8;
					const hasUppercase = /[A-Z]/.test(value);
					const hasNumber = /\d/.test(value);
					const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value);

					if (!hasMinLength || !hasUppercase || !hasNumber || !hasSpecialChar) {
						return validationMessages.passwordMinLength;
					}
					return true;
				},
			},
			confirmPassword: {
				required: validationMessages.confirmPasswordRequired,
				validate: (value: string, formValues: RegisterFormData) => {
					return value === formValues.password || validationMessages.diffPwd;
				},
			},
		}),
		[validationMessages],
	);

	const form = useForm<RegisterFormData>({
		mode: "onBlur", // Less aggressive validation mode
		defaultValues: {
			name: "",
			lastname: "",
			phone: "",
			countryCode: "CO",
			dialCode: "+57",
			country: "Colombia",
			nit: "",
			businessName: "",
			businessType: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	// Function to map form data to backend expected format
	const mapFormDataToBackend = (formData: RegisterFormData): RegisterEntity => {
		// Clean and format phone number
		const phoneNumber = formData.phone?.trim() || "";
		const dialCode = formData.dialCode?.trim() || "+57";
		
		// Combine dial code and phone number, removing any extra spaces
		const telefono = phoneNumber ? `${dialCode}${phoneNumber}` : dialCode;

		return {
			nombre: formData.name,
			apellido: formData.lastname,
			telefono: telefono,
			residencia: {
				pais: {
					codigo: formData.countryCode,
					nombre: formData.country,
				},
			},
			nit: formData.nit,
			nombreNegocio: formData.businessName,
			tipoNegocio: formData.businessType,
			email: formData.email,
			password: formData.password,
			active: true,
		};
	};

	const onFinish = async (values: RegisterFormData) => {
		try {
			const backendData = mapFormDataToBackend(values);

			await signUp(backendData);

			backToLogin();
		} catch (err) {
			console.error("Register failed:", err);

			// Error handling is done in useSignUp hook's onError callback
			// This catch is mainly for logging and preventing unhandled promise rejections
		}
	};

	// Reset only when loginState changes to REGISTER
	useEffect(() => {
		if (loginState === LoginStateEnum.REGISTER) {
			reset();
		}
	}, [loginState, reset]);

	if (loginState !== LoginStateEnum.REGISTER) return null;

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onFinish)} className="space-y-4">
				<div className="flex flex-col items-center gap-2 text-center">
					<h1 className="text-2xl font-bold">{t("sys.login.signUpFormTitle")}</h1>
				</div>

				{errorMessage && (
					<div className="p-3 rounded-md bg-destructive/15 border border-destructive/20">
						<p className="text-sm text-destructive font-medium">
							{errorMessage}
						</p>
					</div>
				)}

				<div className="text-xs text-gray">
					<span className="text-xs font-bold text-primary">{t("sys.login.tryFree")}</span>
				</div>

				{/* Información Personal */}
				<div className="space-y-4">
					<div className="text-xs text-gray">
						<span className="text-xs font-bold">{t("sys.login.personalInformation")}</span>
					</div>

					{/* Nombre y Apellido */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="name"
							rules={validationRules.name}
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input placeholder={t("sys.login.name")} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="lastname"
							rules={validationRules.lastname}
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input placeholder={t("sys.login.lastname")} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					{/* País y Teléfono */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="countryCode"
							rules={validationRules.countryCode}
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<CountryPhoneCombobox
											value={field.value}
											onChange={(country) => {
												field.onChange(country.code);
												form.setValue("dialCode", country.dialCode);
												form.setValue("country", country.name);
											}}
											placeholder={t("sys.login.country")}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="phone"
							rules={validationRules.phone}
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<div className="flex">
											<div className="flex items-center justify-center px-3 h-10 text-sm bg-muted border border-r-0 border-input rounded-l-md text-muted-foreground font-medium min-w-[60px]">
												{form.watch("dialCode") || "+57"}
											</div>
											<Input placeholder={t("sys.login.phone")} {...field} className="rounded-l-none border-l-0 h-10" />
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</div>

				{/* Información Comercial */}
				<div className="space-y-4">
					<div className="text-xs text-gray">
						<span className="text-xs font-bold">{t("sys.login.comercialInformation")}</span>
					</div>

					{/* NIT y Tipo de Negocio */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="nit"
							rules={validationRules.nit}
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input placeholder={t("sys.login.nit")} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="businessType"
							rules={validationRules.businessType}
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<BusinessTypeCombobox
											value={field.value}
											onChange={(businessType) => {
												field.onChange(businessType.id);
												if (!form.getValues("businessName")) {
													form.setValue("businessName", businessType.name);
												}
											}}
											placeholder={t("sys.login.businessType")}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					{/* Nombre del Negocio */}
					<FormField
						control={form.control}
						name="businessName"
						rules={validationRules.businessName}
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Input placeholder={t("sys.login.businessName")} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				{/* Información de Acceso */}
				<div className="space-y-4">
					<div className="text-xs text-gray">
						<span className="text-xs font-bold">{t("sys.login.credentials")}</span>
					</div>
					<FormField
						control={form.control}
						name="email"
						rules={validationRules.email}
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Input type="email" placeholder={t("sys.login.email")} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Contraseñas */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="password"
							rules={validationRules.password}
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<div className="relative">
											<Input
												type={showPassword ? "text" : "password"}
												placeholder={t("sys.login.password")}
												className="pr-10"
												{...field}
											/>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
												onClick={() => setShowPassword(!showPassword)}
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

						<FormField
							control={form.control}
							name="confirmPassword"
							rules={validationRules.confirmPassword}
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<div className="relative">
											<Input
												type={showConfirmPassword ? "text" : "password"}
												placeholder={t("sys.login.confirmPassword")}
												className="pr-10"
												{...field}
											/>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
												onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
					</div>
				</div>

				<Button type="submit" className="w-full" disabled={isLoading}>
					{isLoading && <Loader2 className="animate-spin mr-2" />}
					{t("sys.login.registerButton")}
				</Button>

				<div className="text-xs text-gray text-center">
					<span>{t("sys.login.registerAndAgree")}</span>
					<a href="/auth/terms-and-conditions" className="text-sm underline! text-primary!">
						{t("sys.login.termsOfService")}
					</a>
					{" & "}
					<a href="/auth/privacy-policy" className="text-sm underline! text-primary!">
						{t("sys.login.privacyPolicy")}
					</a>
				</div>

				<ReturnButton onClick={backToLogin} />
			</form>
		</Form>
	);
}

export default RegisterForm;
