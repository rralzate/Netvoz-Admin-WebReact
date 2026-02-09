import { useCallback, useState } from "react";
import APIClient from "@/core/api/apiClient";
import { urls } from "../../data/datasource/constants";

export interface BusinessInfo {
	negocioId: string;
	totalProductos: number;
	totalUsuarios: number;
	totalCajasRegistradoras: number;
	consultedAt: string;
}

export interface ReminderEmailResponse {
	emailSent: boolean;
	recipientEmail: string;
	suscripcionId: string;
	diasRestantes: number;
	fechaVencimiento: string;
	nombrePlan: string;
	valorRenovacion: number;
	moneda: string;
	sentAt: string;
}

interface UseBusinessInfoReturn {
	businessInfo: BusinessInfo | null;
	isLoading: boolean;
	error: string | null;
	fetchBusinessInfo: (negocioId: string) => Promise<void>;
	sendReminderEmail: (negocioId: string) => Promise<ReminderEmailResponse | null>;
	isSendingReminder: boolean;
}

export const useBusinessInfo = (): UseBusinessInfoReturn => {
	const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isSendingReminder, setIsSendingReminder] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchBusinessInfo = useCallback(async (negocioId: string) => {
		if (!negocioId) return;

		setIsLoading(true);
		setError(null);

		try {
			const response = await APIClient.post<any>({
				url: urls.businessInformation,
				data: { negocioId },
			});

			console.log("useBusinessInfo - Response:", response);

			// Extract data from response
			const data = response?.data || response;

			if (data) {
				setBusinessInfo({
					negocioId: data.negocioId,
					totalProductos: data.totalProductos ?? 0,
					totalUsuarios: data.totalUsuarios ?? 0,
					totalCajasRegistradoras: data.totalCajasRegistradoras ?? 0,
					consultedAt: data.consultedAt,
				});
			}
		} catch (err) {
			console.error("Error fetching business info:", err);
			setError(err instanceof Error ? err.message : "Error al obtener información del negocio");
		} finally {
			setIsLoading(false);
		}
	}, []);

	const sendReminderEmail = useCallback(async (negocioId: string): Promise<ReminderEmailResponse | null> => {
		if (!negocioId) return null;

		setIsSendingReminder(true);

		try {
			const response = await APIClient.post<any>({
				url: urls.sendReminderEmail,
				data: { negocioId },
			});

			console.log("sendReminderEmail - Response:", response);

			// Extract data from response
			const data = response?.data || response;

			if (data) {
				return {
					emailSent: data.emailSent,
					recipientEmail: data.recipientEmail,
					suscripcionId: data.suscripcionId,
					diasRestantes: data.diasRestantes,
					fechaVencimiento: data.fechaVencimiento,
					nombrePlan: data.nombrePlan,
					valorRenovacion: data.valorRenovacion,
					moneda: data.moneda,
					sentAt: data.sentAt,
				};
			}
			return null;
		} catch (err) {
			console.error("Error sending reminder email:", err);
			throw err;
		} finally {
			setIsSendingReminder(false);
		}
	}, []);

	return {
		businessInfo,
		isLoading,
		error,
		fetchBusinessInfo,
		sendReminderEmail,
		isSendingReminder,
	};
};

export default useBusinessInfo;
