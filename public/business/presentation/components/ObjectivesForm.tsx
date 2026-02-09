import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import useLocale from "@/core/locales/use-locale";
import { Button } from "@/core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/ui/card";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { useBusiness } from "../hooks/useBusiness";

type ObjectivesFormValues = {
	billedToday: number;
	last7Days: number;
	last30Days: number;
	currentYear: number;
};

interface ObjectivesFormProps {
	onSuccess?: () => void;
}

export function ObjectivesForm({ onSuccess }: ObjectivesFormProps) {
	const { t } = useLocale();
	const { business, updateBusiness, isUpdating } = useBusiness();

	// Validation schema with translations
	const objectivesFormSchema = z.object({
		billedToday: z.number().min(0, t("business.objectives.form.validation.valueMin")),
		last7Days: z.number().min(0, t("business.objectives.form.validation.valueMin")),
		last30Days: z.number().min(0, t("business.objectives.form.validation.valueMin")),
		currentYear: z.number().min(0, t("business.objectives.form.validation.valueMin")),
	});

	const form = useForm<ObjectivesFormValues>({
		resolver: zodResolver(objectivesFormSchema),
		defaultValues: {
			billedToday: 0,
			last7Days: 0,
			last30Days: 0,
			currentYear: 0,
		},
	});

	// Load business data into form
	useEffect(() => {
		if (business?.configuracion?.objetivos) {
			const { facturadoHoy, ultimos7Dias, ultimos30Dias, anioActual } = business.configuracion.objetivos;
			form.reset({
				billedToday: facturadoHoy || 0,
				last7Days: ultimos7Dias || 0,
				last30Days: ultimos30Dias || 0,
				currentYear: anioActual || 0,
			});
		}
	}, [business, form]);

	const onSubmit = async (data: ObjectivesFormValues) => {
		if (!business?.id) {
			toast.error("Business information not found");
			return;
		}

		try {
			// Update the business configuration with new objectives
			const businessData = {
				configuracion: {
					...business.configuracion,
					objetivos: {
						facturadoHoy: data.billedToday,
						ultimos7Dias: data.last7Days,
						ultimos30Dias: data.last30Days,
						anioActual: data.currentYear,
					},
				},
			};

			await updateBusiness(business.id, businessData);
			toast.success(t("business.objectives.form.messages.success"));
			onSuccess?.();
		} catch (error) {
			console.error("Error saving objectives:", error);
			toast.error(t("business.objectives.form.messages.error"));
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-xl">{t("business.objectives.form.title")}</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					{/* Objectives Input Fields */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Billed Today */}
						<div className="space-y-2">
							<Label htmlFor="billedToday" className="text-sm font-medium text-gray-700">
								{t("business.objectives.form.fields.billedToday")}
							</Label>
							<Input
								id="billedToday"
								type="number"
								min="0"
								step="0.01"
								placeholder={t("business.objectives.form.placeholders.billedToday")}
								{...form.register("billedToday", { valueAsNumber: true })}
								className="w-full"
							/>
							{form.formState.errors.billedToday && (
								<p className="text-sm text-red-600">{form.formState.errors.billedToday.message}</p>
							)}
						</div>

						{/* Last 7 Days */}
						<div className="space-y-2">
							<Label htmlFor="last7Days" className="text-sm font-medium text-gray-700">
								{t("business.objectives.form.fields.last7Days")}
							</Label>
							<Input
								id="last7Days"
								type="number"
								min="0"
								step="0.01"
								placeholder={t("business.objectives.form.placeholders.last7Days")}
								{...form.register("last7Days", { valueAsNumber: true })}
								className="w-full"
							/>
							{form.formState.errors.last7Days && (
								<p className="text-sm text-red-600">{form.formState.errors.last7Days.message}</p>
							)}
						</div>

						{/* Last 30 Days */}
						<div className="space-y-2">
							<Label htmlFor="last30Days" className="text-sm font-medium text-gray-700">
								{t("business.objectives.form.fields.last30Days")}
							</Label>
							<Input
								id="last30Days"
								type="number"
								min="0"
								step="0.01"
								placeholder={t("business.objectives.form.placeholders.last30Days")}
								{...form.register("last30Days", { valueAsNumber: true })}
								className="w-full"
							/>
							{form.formState.errors.last30Days && (
								<p className="text-sm text-red-600">{form.formState.errors.last30Days.message}</p>
							)}
						</div>

						{/* Current Year */}
						<div className="space-y-2">
							<Label htmlFor="currentYear" className="text-sm font-medium text-gray-700">
								{t("business.objectives.form.fields.currentYear")}
							</Label>
							<Input
								id="currentYear"
								type="number"
								min="0"
								step="0.01"
								placeholder={t("business.objectives.form.placeholders.currentYear")}
								{...form.register("currentYear", { valueAsNumber: true })}
								className="w-full"
							/>
							{form.formState.errors.currentYear && (
								<p className="text-sm text-red-600">{form.formState.errors.currentYear.message}</p>
							)}
						</div>
					</div>

					{/* Save Button */}
					<div className="flex justify-center pt-6">
						<Button type="submit" disabled={isUpdating} className="min-w-[200px] text-white">
							{isUpdating ? t("business.objectives.form.messages.saving") : t("business.objectives.form.messages.save")}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
