import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import useLocale from "@/core/locales/use-locale";
import { Button } from "@/core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/ui/card";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { useBusiness } from "../hooks/useBusiness";

// Currency symbols from the image
const CURRENCY_SYMBOLS = [
	{ symbol: "$", name: "Colombian Peso" },
	{ symbol: "$", name: "US Dollar" },
	{ symbol: "R$", name: "Brazilian Real" },
	{ symbol: "¢", name: "Cent" },
	{ symbol: "Q", name: "Guatemalan Quetzal" },
	{ symbol: "L", name: "Honduran Lempira" },
	{ symbol: "C$", name: "Nicaraguan Córdoba" },
	{ symbol: "₲", name: "Paraguayan Guarani" },
	{ symbol: "B/.", name: "Panamanian Balboa" },
	{ symbol: "S/.", name: "Peruvian Sol" },
	{ symbol: "RD$", name: "Dominican Peso" },
	{ symbol: "Bs.F.", name: "Venezuelan Bolívar Fuerte" },
];

type CurrencyFormValues = {
	symbol: string;
	decimalQuantity: number;
};

interface CurrencyFormProps {
	onSuccess?: () => void;
}

export function CurrencyForm({ onSuccess }: CurrencyFormProps) {
	const { t } = useLocale();
	const { business, updateBusiness, isUpdating } = useBusiness();
	const [exampleValue, setExampleValue] = useState("12.000");

	// Validation schema with translations
	const currencyFormSchema = z.object({
		symbol: z.string().min(1, t("business.currency.form.messages.symbolRequired")),
		decimalQuantity: z.number().min(0, t("business.currency.form.messages.decimalQuantityMin")),
	});

	const form = useForm<CurrencyFormValues>({
		resolver: zodResolver(currencyFormSchema),
		defaultValues: {
			symbol: "$",
			decimalQuantity: 0,
		},
	});

	// Update example value when form values change
	const updateExampleValue = useCallback((symbol: string, decimals: number) => {
		const value = 12000;
		const formattedValue = value.toLocaleString("es-ES", {
			minimumFractionDigits: decimals,
			maximumFractionDigits: decimals,
		});
		setExampleValue(`${symbol} ${formattedValue}`);
	}, []);

	// Load business data into form
	useEffect(() => {
		if (business?.configuracion?.moneda) {
			const { simbolo, cantidadDecimales } = business.configuracion.moneda;
			form.reset({
				symbol: simbolo || "$",
				decimalQuantity: cantidadDecimales || 0,
			});
			updateExampleValue(simbolo || "$", cantidadDecimales || 0);
		}
	}, [business, form, updateExampleValue]);

	// Watch form values to update example
	const watchedValues = form.watch();
	useEffect(() => {
		updateExampleValue(watchedValues.symbol, watchedValues.decimalQuantity);
	}, [watchedValues.symbol, watchedValues.decimalQuantity, updateExampleValue]);

	const onSubmit = async (data: CurrencyFormValues) => {
		if (!business?.id) {
			toast.error("Business information not found");
			return;
		}

		try {
			// Update the business configuration with new currency settings
			const businessData = {
				configuracion: {
					...business.configuracion,
					moneda: {
						simbolo: data.symbol,
						cantidadDecimales: data.decimalQuantity,
					},
				},
			};

			await updateBusiness(business.id, businessData);
			toast.success(t("business.currency.form.messages.success"));
			onSuccess?.();
		} catch (error) {
			console.error("Error saving currency settings:", error);
			toast.error(t("business.currency.form.messages.error"));
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-xl">{t("business.currency.form.title")}</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					{/* Currency Input Fields */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Currency Symbol */}
						<div className="space-y-2">
							<Label htmlFor="symbol" className="text-sm font-medium text-gray-700">
								{t("business.currency.form.fields.symbol")}
							</Label>
							<Select value={form.watch("symbol")} onValueChange={(value) => form.setValue("symbol", value)}>
								<SelectTrigger className="w-full">
									<SelectValue placeholder={t("business.currency.form.placeholders.symbol")} />
								</SelectTrigger>
								<SelectContent>
									{CURRENCY_SYMBOLS.map((currency) => (
										<SelectItem key={currency.symbol} value={currency.symbol}>
											{currency.symbol} - {currency.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{form.formState.errors.symbol && (
								<p className="text-sm text-red-600">{form.formState.errors.symbol.message}</p>
							)}
						</div>

						{/* Decimal Quantity */}
						<div className="space-y-2">
							<Label htmlFor="decimalQuantity" className="text-sm font-medium text-gray-700">
								{t("business.currency.form.fields.decimalQuantity")}
							</Label>
							<Input
								id="decimalQuantity"
								type="number"
								min="0"
								max="4"
								placeholder={t("business.currency.form.placeholders.decimalQuantity")}
								{...form.register("decimalQuantity", { valueAsNumber: true })}
								className="w-full"
							/>
							{form.formState.errors.decimalQuantity && (
								<p className="text-sm text-red-600">{form.formState.errors.decimalQuantity.message}</p>
							)}
						</div>
					</div>

					{/* Example Display */}
					<div className="space-y-2">
						<Label className="text-sm font-medium text-gray-700">{t("business.currency.form.example")}</Label>
						<div className="p-4 bg-gray-50 rounded-lg border">
							<p className="text-lg font-medium text-gray-800">{exampleValue}</p>
						</div>
					</div>

					{/* Save Button */}
					<div className="flex justify-center pt-6">
						<Button type="submit" disabled={isUpdating} className="min-w-[200px] text-white">
							{isUpdating ? t("business.currency.form.messages.saving") : t("business.currency.form.messages.save")}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
