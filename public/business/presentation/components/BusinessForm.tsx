import { zodResolver } from "@hookform/resolvers/zod";
import type React from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import useLocale from "@/core/locales/use-locale";
import { Button } from "@/core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/ui/card";
import { Checkbox } from "@/core/ui/checkbox";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Separator } from "@/core/ui/separator";
import { CityCombobox, CountryCombobox, DepartmentCombobox } from "@/features/location/presentation/components";
import { useLocation } from "@/features/location/presentation/hooks/useLocation";
import type { BusinessFormData } from "../../domain/interfaces/Business.Interfaces";
import { useBusiness } from "../hooks/useBusiness";
import { usePermissionCheck } from "@/core/hooks";
import { useDianConfigurationNetVoz } from "@/features/invoicing/presentation/hooks/useDianConfigurationNetVoz";
import { Icon } from "@/components/icon";

type BusinessFormValues = {
	nombre: string;
	nit: string;
	contacto: string;
	email: string;
	direccion: string;
	pais: string;
	departamento?: string;
	ciudad?: string;
	telefono: string;
	paginaWeb?: string;
	productosConIngredientes: boolean;
	utilizaMesas: boolean;
	envioADomicilio: boolean;
	imprimirComanda: boolean;
	manejaFacturacionElectronica: boolean;
};

interface BusinessFormProps {
	onSuccess?: () => void;
}

export function BusinessForm({ onSuccess }: BusinessFormProps) {
	const { t } = useLocale();
	const { business, businessLoading, updateBusiness, uploadLogo, isUpdating, isUploadingLogo, formData, getUpdateDTO } =
		useBusiness();
	const { getDepartmentsData, getCitiesData, countries } = useLocation();
	const { config } = useDianConfigurationNetVoz();
	const [logoFile, setLogoFile] = useState<File | null>(null);
	const [selectedCountryId, setSelectedCountryId] = useState<string>("");
	const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");

	const {
		canAccessInfocanEditBusiness,
		canEditInfoBusiness,
		canCreateInfoBusiness,
		canActivarDesactivarFacturacionElectronica,
	} = usePermissionCheck();

	// Validation schema with translations
	const businessFormSchema = z.object({
		nombre: z.string().min(1, t("business.form.validation.nameRequired")),
		nit: z.string().min(1, t("business.form.validation.nitRequired")),
		contacto: z.string().min(1, t("business.form.validation.contactRequired")),
		email: z.string().email(t("business.form.validation.emailInvalid")),
		direccion: z.string().min(1, t("business.form.validation.addressRequired")),
		pais: z.string().min(1, t("business.form.validation.countryRequired")),
		departamento: z.string().optional(),
		ciudad: z.string().optional(),
		telefono: z.string().min(1, t("business.form.validation.phoneRequired")),
		paginaWeb: z.string().url(t("business.form.validation.urlInvalid")).optional().or(z.literal("")),
		productosConIngredientes: z.boolean(),
		utilizaMesas: z.boolean(),
		envioADomicilio: z.boolean(),
		imprimirComanda: z.boolean(),
		manejaFacturacionElectronica: z.boolean(),
	});

	const form = useForm<BusinessFormValues>({
		resolver: zodResolver(businessFormSchema),
		defaultValues: {
			nombre: "",
			nit: "",
			contacto: "",
			email: "",
			direccion: "",
			pais: "",
			departamento: "",
			ciudad: "",
			telefono: "",
			paginaWeb: "",
			productosConIngredientes: false,
			utilizaMesas: false,
			envioADomicilio: false,
			imprimirComanda: false,
			manejaFacturacionElectronica: false,
		},
	});

	// Load business data into form
	useEffect(() => {
		if (business && formData) {
			// Map business data to form values
			const formValues: BusinessFormValues = {
				nombre: business.nombre,
				nit: business.nit,
				contacto: business.contacto,
				email: business.email,
				direccion: business.direccion,
				pais: "",
				departamento: "",
				ciudad: "",
				telefono: business.telefono,
				paginaWeb: business.paginaWeb || "",
				productosConIngredientes: business.configuracion.productosConIngredientes,
				utilizaMesas: business.configuracion.utilizoMesas,
				envioADomicilio: business.configuracion.envioADomicilio,
				imprimirComanda: business.configuracion.imprimirComanda,
				manejaFacturacionElectronica: business.facturacionElectronica.habilitada,
			};

			form.reset(formValues);
		}
	}, [business, form, formData]);

	useEffect(() => {
		const syncLocationFields = async () => {
			if (!business || !countries?.length) return;

			const country = countries.find((c) => c.codigo === business.residencia.pais.codigo);
			const countryIdValue = country?.id ? String(country.id) : "";
			setSelectedCountryId(countryIdValue);
			form.setValue("pais", countryIdValue);

			if (!countryIdValue || !business.residencia.departamento?.codigo) return;
			const departments = await getDepartmentsData(Number(countryIdValue));
			const department = departments.find((d) => d.codigo === business.residencia.departamento?.codigo);
			const departmentIdValue = department?.id ? String(department.id) : "";
			setSelectedDepartmentId(departmentIdValue);
			form.setValue("departamento", departmentIdValue);

			if (!departmentIdValue || !business.residencia.ciudad?.codigo) return;
			const cities = await getCitiesData(Number(departmentIdValue));
			const city = cities.find((c) => c.codigo === business.residencia.ciudad?.codigo);
			const cityIdValue = city?.id ? String(city.id) : "";
			form.setValue("ciudad", cityIdValue);
		};

		void syncLocationFields();
	}, [business, countries, form, getDepartmentsData, getCitiesData]);

	const onSubmit = async (data: BusinessFormValues) => {
		// Verificar acceso al módulo
		if (!canAccessInfocanEditBusiness()) {
			toast.error(t("business.form.messages.noAccessPermission"));
			return;
		}
		// Verificar permiso para editar información básica
		if (!canEditInfoBusiness()) {
			toast.error(t("business.form.messages.noEditPermission"));
			return;
		}

		// Verificar permiso para crear información del negocio
		if (!canCreateInfoBusiness()) {
			toast.error(t("business.form.messages.noCreatePermission"));
			return;
		}

		if (!business?.id) {
			toast.error(t("business.form.messages.businessNotFound"));
			return;
		}

		// Verificar permiso para cambiar configuración de facturación electrónica
		if (data.manejaFacturacionElectronica !== business.facturacionElectronica.habilitada) {
			if (!canActivarDesactivarFacturacionElectronica()) {
				toast.error(t("business.form.messages.noElectronicInvoicingPermission"));
				return;
			}
		}

		try {
			// Validate that country is selected
			if (!data.pais || data.pais.trim() === "") {
				toast.error(t("business.form.validation.countryRequired"));
				return;
			}

			// Get departments and cities data
			const countryIdNumber = Number(data.pais);
			const departmentIdNumber = Number(data.departamento || "");
			const departments = await getDepartmentsData(countryIdNumber);
			const cities = departmentIdNumber ? await getCitiesData(departmentIdNumber) : [];

			// Transform form data to proper structure
			const selectedCountry = countries?.find((c) => String(c.id) === data.pais);
			const countryNombre = selectedCountry?.nombre || business?.residencia.pais.nombre || "";

			// Validate that country name is available
			if (!countryNombre || countryNombre.trim() === "") {
				toast.error(t("business.form.messages.noCountryFound"));
				return;
			}

			if (!selectedCountry) {
				toast.error(t("business.form.messages.noCountryFound"));
				return;
			}

			const selectedDepartment = departments.find((d) => String(d.id) === data.departamento);
			const selectedCity = cities.find((c) => String(c.id) === data.ciudad);

			const formData: BusinessFormData = {
				nombre: data.nombre,
				nit: data.nit,
				contacto: data.contacto,
				email: data.email,
				direccion: data.direccion,
				residencia: {
					pais: {
						codigo: selectedCountry.codigo,
						nombre: countryNombre,
					},
					departamento: data.departamento
						? {
								codigo: selectedDepartment?.codigo || "",
								nombre: selectedDepartment?.nombre || "",
							}
						: undefined,
					ciudad: data.ciudad
						? {
								codigo: selectedCity?.codigo || "",
								nombre: selectedCity?.nombre || "",
							}
						: undefined,
				},
				telefono: data.telefono,
				paginaWeb: data.paginaWeb || "",
				configuracion: {
					productosConIngredientes: data.productosConIngredientes,
					utilizoMesas: data.utilizaMesas,
					envioADomicilio: data.envioADomicilio,
					imprimirComanda: data.imprimirComanda,
					costosEnvio: business?.configuracion.costosEnvio || [],
					moneda: business?.configuracion.moneda || { simbolo: "$", cantidadDecimales: 2 },
					objetivos: business?.configuracion.objetivos || {
						facturadoHoy: 0,
						ultimos7Dias: 0,
						ultimos30Dias: 0,
						anioActual: 0,
					},
				},
				facturacionElectronica: {
					habilitada: data.manejaFacturacionElectronica,
					testId: business?.facturacionElectronica.testId || "",
					responsabilidadFiscal: business?.facturacionElectronica.responsabilidadFiscal || [],
					responsableDe: business?.facturacionElectronica.responsableDe || [],
				},
			};

			const updateDTO = getUpdateDTO(formData, departments, cities);
			await updateBusiness(business.id, updateDTO);

			// Upload logo if selected
			if (logoFile) {
				await uploadLogo(logoFile, business.logoUrl);
				setLogoFile(null);
			}

			toast.success(t("business.form.messages.updateSuccess"));
			onSuccess?.();
		} catch (error) {
			console.error("Error updating business:", error);
			toast.error(t("business.form.messages.updateError"));
		}
	};

	const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setLogoFile(file);
		}
	};

	const handleRemoveLogo = () => {
		setLogoFile(null);
		// Reset the file input
		const fileInput = document.getElementById("logo") as HTMLInputElement;
		if (fileInput) {
			fileInput.value = "";
		}
	};

	const handleCountryChange = (countryId: string) => {
		setSelectedCountryId(countryId);
		setSelectedDepartmentId(""); // Reset department when country changes
		form.setValue("pais", countryId, { shouldValidate: true });
		form.setValue("departamento", "");
		form.setValue("ciudad", "");
	};

	const handleDepartmentChange = (departmentId: string) => {
		setSelectedDepartmentId(departmentId);
		form.setValue("departamento", departmentId);
		form.setValue("ciudad", ""); // Reset city when department changes
	};

	if (businessLoading) {
		return (
			<Card>
				<CardContent className="p-6">
					<div className="flex items-center justify-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
						<span className="ml-2">{t("business.form.messages.loading")}</span>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t("business.form.title")}</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
					{/* Plan Actual */}
					<div className="flex items-center justify-between">
						<Label className="text-sm font-medium">{t("business.form.currentPlan")}</Label>
						<span className="text-sm text-muted-foreground">{t("business.form.universal")}</span>
					</div>

					<Separator />

					{/* Información Básica */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="nombre">{t("business.form.fields.name")} *</Label>
							<Input id="nombre" {...form.register("nombre")} placeholder={t("business.form.placeholders.name")} />
							{form.formState.errors.nombre && (
								<p className="text-sm text-primary">{form.formState.errors.nombre.message}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="nit">{t("business.form.fields.nit")} *</Label>
							<Input id="nit" {...form.register("nit")} placeholder={t("business.form.placeholders.nit")} />
							{form.formState.errors.nit && <p className="text-sm text-primary">{form.formState.errors.nit.message}</p>}
						</div>

						<div className="space-y-2">
							<Label htmlFor="contacto">{t("business.form.fields.contact")} *</Label>
							<Input
								id="contacto"
								{...form.register("contacto")}
								placeholder={t("business.form.placeholders.contact")}
							/>
							{form.formState.errors.contacto && (
								<p className="text-sm text-primary">{form.formState.errors.contacto.message}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="email">{t("business.form.fields.email")} *</Label>
							<Input
								id="email"
								type="email"
								{...form.register("email")}
								placeholder={t("business.form.placeholders.email")}
							/>
							{form.formState.errors.email && (
								<p className="text-sm text-primary">{form.formState.errors.email.message}</p>
							)}
						</div>

						<div className="space-y-2 md:col-span-2">
							<Label htmlFor="direccion">{t("business.form.fields.address")} *</Label>
							<Input
								id="direccion"
								{...form.register("direccion")}
								placeholder={t("business.form.placeholders.address")}
							/>
							{form.formState.errors.direccion && (
								<p className="text-sm text-primary">{form.formState.errors.direccion.message}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="pais">{t("business.form.fields.country")} *</Label>
							{/* Hidden input for react-hook-form validation */}
							<input
								type="hidden"
								{...form.register("pais", {
									required: t("business.form.validation.countryRequired"),
								})}
							/>
							<CountryCombobox
								value={selectedCountryId}
								onValueChange={handleCountryChange}
								placeholder={t("business.form.placeholders.country")}
							/>
							{form.formState.errors.pais && (
								<p className="text-sm text-destructive mt-1">{form.formState.errors.pais.message}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="departamento">{t("business.form.fields.department")}</Label>
							<DepartmentCombobox
								countryId={selectedCountryId}
								value={selectedDepartmentId}
								onValueChange={handleDepartmentChange}
								placeholder={t("business.form.placeholders.department")}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="ciudad">{t("business.form.fields.city")}</Label>
							<CityCombobox
								departmentId={selectedDepartmentId}
								value={form.watch("ciudad")}
								onValueChange={(cityCode) => form.setValue("ciudad", cityCode)}
								placeholder={t("business.form.placeholders.city")}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="telefono">{t("business.form.fields.phone")} *</Label>
							<Input id="telefono" {...form.register("telefono")} placeholder={t("business.form.placeholders.phone")} />
							{form.formState.errors.telefono && (
								<p className="text-sm text-primary">{form.formState.errors.telefono.message}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="paginaWeb">{t("business.form.fields.website")}</Label>
							<Input
								id="paginaWeb"
								{...form.register("paginaWeb")}
								placeholder={t("business.form.placeholders.website")}
							/>
							{form.formState.errors.paginaWeb && (
								<p className="text-sm text-primary">{form.formState.errors.paginaWeb.message}</p>
							)}
						</div>
					</div>

					<Separator />

					{/* Opciones del Negocio */}
					<div className="space-y-4">
						<h3 className="text-lg font-medium">{t("business.form.businessOptions")}</h3>

						<div className="space-y-3">
							<div className="flex justify-between">
								<div className="flex items-center space-x-2">
									<Checkbox
										id="manejaFacturacionElectronica"
										checked={form.watch("manejaFacturacionElectronica")}
										onCheckedChange={(checked) => form.setValue("manejaFacturacionElectronica", !!checked)}
									/>
									<Label htmlFor="manejaFacturacionElectronica">{t("business.form.fields.electronicInvoicing")}</Label>
								</div>
								<div>
									{form.watch("manejaFacturacionElectronica") === true &&
										!config &&
										toast.error(
											<div className="space-y-2">
												<p className="font-semibold">
													{t("orders.electronicInvoice.notConfigured", "Facturación electrónica no configurada")}
												</p>
												<p className="text-sm">
													{t(
														"orders.electronicInvoice.contactSupport",
														"Para activar la facturación electrónica, contacta a soporte:",
													)}
												</p>
												<a
													href="https://wa.me/573166540958?text=Hola,%20necesito%20activar%20la%20facturación%20electrónica%20en%20mi%20cuenta"
													target="_blank"
													rel="noopener noreferrer"
													className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700 font-medium"
												>
													<Icon icon="mdi:whatsapp" className="w-5 h-5" />
													<span>{t("orders.electronicInvoice.whatsappSupport")}</span>
												</a>
											</div>,
											{
												duration: 8000,
												position: "top-center",
											},
										)}
								</div>
							</div>

							<div className="flex items-center space-x-2">
								<Checkbox
									id="productosConIngredientes"
									checked={form.watch("productosConIngredientes")}
									onCheckedChange={(checked) => form.setValue("productosConIngredientes", !!checked)}
								/>
								<Label htmlFor="productosConIngredientes">{t("business.form.fields.productsWithIngredients")}</Label>
							</div>

							<div className="flex items-center space-x-2">
								<Checkbox
									id="utilizaMesas"
									checked={form.watch("utilizaMesas")}
									onCheckedChange={(checked) => form.setValue("utilizaMesas", !!checked)}
								/>
								<Label htmlFor="utilizaMesas">{t("business.form.fields.usesTables")}</Label>
							</div>

							<div className="flex items-center space-x-2">
								<Checkbox
									id="envioADomicilio"
									checked={form.watch("envioADomicilio")}
									onCheckedChange={(checked) => form.setValue("envioADomicilio", !!checked)}
								/>
								<Label htmlFor="envioADomicilio">{t("business.form.fields.homeDelivery")}</Label>
							</div>

							<div className="flex items-center space-x-2">
								<Checkbox
									id="imprimirComanda"
									checked={form.watch("imprimirComanda")}
									onCheckedChange={(checked) => form.setValue("imprimirComanda", !!checked)}
								/>
								<Label htmlFor="imprimirComanda">{t("business.form.fields.printOrder")}</Label>
							</div>
						</div>
					</div>

					<Separator />

					{/* Cargar Logo */}
					<div className="space-y-6">
						<h3 className="text-lg font-medium">{t("business.form.logo")}</h3>

						{/* Logo actual */}
						{business?.logoUrl && (
							<div className="space-y-3">
								<Label className="text-base font-medium">{t("business.form.fields.currentLogo")}</Label>
								<div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border">
									<div className="flex-shrink-0">
										<div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm bg-white flex items-center justify-center">
											<img
												src={business.logoUrl}
												alt={t("business.form.fields.currentLogo")}
												className="w-full h-full object-cover"
												onError={(e) => {
													e.currentTarget.src =
														"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDgiIGN5PSI0OCIgcj0iNDgiIGZpbGw9IiNGM0Y0RjYiLz4KPGNpcmNsZSBjeD0iNDgiIGN5PSI0OCIgcj0iMzIiIGZpbGw9IiNEMUQ1REIiLz4KPGNpcmNsZSBjeD0iNDgiIGN5PSI0OCIgcj0iMTYiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+Cg==";
													e.currentTarget.alt = "Logo no disponible";
												}}
											/>
										</div>
									</div>
									<div className="flex-1">
										<p className="text-sm text-gray-600 mb-2">{t("business.form.messages.currentLogo")}</p>
										<div className="text-xs text-gray-500">
											<p>{t("business.form.messages.logoSpecifications")}</p>
											<p>{t("business.form.messages.logoFormats")}</p>
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Preview del nuevo logo */}
						{logoFile && (
							<div className="space-y-3">
								<Label className="text-base font-medium text-green-700">
									{t("business.form.fields.newLogoPreview")}
								</Label>
								<div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
									<div className="flex-shrink-0">
										<div className="w-24 h-24 rounded-full overflow-hidden border-2 border-green-300 shadow-sm bg-white flex items-center justify-center">
											<img
												src={URL.createObjectURL(logoFile)}
												alt={t("business.form.fields.newLogoPreview")}
												className="w-full h-full object-cover"
											/>
										</div>
									</div>
									<div className="flex-1">
										<p className="text-sm text-green-700 mb-2">{t("business.form.messages.newLogoPreview")}</p>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={handleRemoveLogo}
											className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
										>
											{t("business.form.actions.removeLogo")}
										</Button>
									</div>
								</div>
							</div>
						)}

						{/* Sección de carga */}
						<div className="space-y-3">
							<Label htmlFor="logo" className="text-base font-medium">
								{logoFile
									? t("business.form.actions.changeLogo")
									: business?.logoUrl
										? t("business.form.actions.updateLogo")
										: t("business.form.actions.uploadLogo")}
							</Label>
							<div className="space-y-2">
								<Input
									id="logo"
									type="file"
									accept="image/*"
									onChange={handleLogoChange}
									className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/80"
								/>
								<div className="text-sm text-gray-600 space-y-1">
									<p>• {t("business.form.messages.logoSpecifications")}</p>
									<p>• {t("business.form.messages.logoFormats")}</p>
									<p>• {t("business.form.messages.logoMaxSize")}</p>
									<p>• {t("business.form.messages.logoRecommendation")}</p>
								</div>
							</div>
						</div>
					</div>

					{/* Botones */}
					<div className="flex justify-end space-x-2">
						<Button type="submit" disabled={isUpdating || isUploadingLogo} className="min-w-[120px] text-white">
							{isUpdating || isUploadingLogo ? (
								<>
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
									{t("business.form.messages.saving")}
								</>
							) : (
								t("business.form.messages.save")
							)}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
