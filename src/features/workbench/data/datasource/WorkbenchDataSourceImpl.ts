import apiClient from "@/core/api/apiClient";
import type { SubscriptionEntity } from "@/features/subscriptions/domain/entities/SubscriptionEntity";
import type { WorkbenchKPIs, SubscriptionSummary, RecentSubscription, ObjetivosConfig } from "../../domain/entities/WorkbenchEntity";
import { urlsWorkbench } from "./constants";
import type { WorkbenchDataSource } from "./WorkbenchDataSource";

interface SubscriptionApiResponse {
	data: SubscriptionEntity[];
}

// Item crudo de GET /epayco/transactions/all (solo campos usados para KPIs)
interface ApiTransactionItem {
	id: string;
	valor: number;
	estado: string;
	fechaTransaccion?: string;
	createdAt?: string;
	[key: string]: unknown;
}

// Default objectives if none are configured
const DEFAULT_OBJECTIVES: ObjetivosConfig = {
	facturadoHoy: 500000,
	ultimos7Dias: 2000000,
	ultimos30Dias: 5000000,
};

export class WorkbenchDataSourceImpl implements WorkbenchDataSource {
	async getBusinessObjectives(negocioId: string): Promise<ObjetivosConfig | null> {
		try {
			const url = urlsWorkbench.getBusinessByNegocioId.replace(":negocioId", negocioId);

			const response = await apiClient.get<any>({ url });

			// Handle different response structures
			const apiResponse = response?.data || response;
			let businessData = null;

			if (apiResponse?.status === "success" && apiResponse.data) {
				businessData = apiResponse.data;
			} else if (apiResponse?.id && apiResponse.nombre) {
				businessData = apiResponse;
			} else if (response?.data?.id && response.data.nombre) {
				businessData = response.data;
			}

			if (businessData) {
				// Extract objectives - they can be at root level or inside configuracion
				let objetivos = businessData.configuracion?.objetivos || businessData.objetivos;

				if (objetivos) {
					return {
						facturadoHoy: objetivos.facturadoHoy || DEFAULT_OBJECTIVES.facturadoHoy,
						ultimos7Dias: objetivos.ultimos7Dias || DEFAULT_OBJECTIVES.ultimos7Dias,
						ultimos30Dias: objetivos.ultimos30Dias || DEFAULT_OBJECTIVES.ultimos30Dias,
					};
				}
			}

			console.log("⚠️ No objectives found, using defaults");
			return null;
		} catch (error) {
			console.error("❌ Error fetching business objectives:", error);
			return null;
		}
	}

	/**
	 * Obtiene KPIs (Facturado hoy, Últimos 7 días, Últimos 30 días) a partir de las
	 * transacciones ePayco aprobadas (GET /epayco/transactions/all).
	 */
	async getKPIs(objetivos?: ObjetivosConfig): Promise<WorkbenchKPIs> {
		const objectives = objetivos || DEFAULT_OBJECTIVES;

		try {
			const allTransactions: ApiTransactionItem[] = [];
			let page = 1;
			const limit = 100;
			let totalPages = 1;

			do {
				const response = await apiClient.get<{ data: ApiTransactionItem[]; total: number; page: number; totalPages: number }>({
					url: urlsWorkbench.transactionsAll,
					config: { params: { page, limit, rango: "ultimos_30_dias" } },
				});
				const data = Array.isArray(response?.data) ? response.data : [];
				allTransactions.push(...data);
				totalPages = response?.totalPages ?? 1;
				page++;
			} while (page <= totalPages);

			const todayStart = new Date();
			todayStart.setHours(0, 0, 0, 0);
			const todayEnd = new Date();
			todayEnd.setHours(23, 59, 59, 999);
			const sevenDaysAgo = new Date(todayStart);
			sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

			let todayRevenue = 0;
			let weekRevenue = 0;
			let monthRevenue = 0;

			for (const t of allTransactions) {
				const estado = (t.estado || "").toLowerCase();
				if (estado !== "aprobada") continue;
				const valor = Number(t.valor) || 0;
				const dateStr = t.fechaTransaccion || t.createdAt;
				if (!dateStr) {
					monthRevenue += valor;
					continue;
				}
				const date = new Date(dateStr);
				monthRevenue += valor;
				if (date >= sevenDaysAgo) weekRevenue += valor;
				if (date >= todayStart && date <= todayEnd) todayRevenue += valor;
			}

			const kpis: WorkbenchKPIs = {
				facturadoHoy: {
					amount: todayRevenue,
					objective: objectives.facturadoHoy,
					percentage: objectives.facturadoHoy > 0 ? Math.min((todayRevenue / objectives.facturadoHoy) * 100, 100) : 0,
				},
				ultimos7Dias: {
					amount: weekRevenue,
					objective: objectives.ultimos7Dias,
					percentage: objectives.ultimos7Dias > 0 ? Math.min((weekRevenue / objectives.ultimos7Dias) * 100, 100) : 0,
				},
				ultimos30Dias: {
					amount: monthRevenue,
					objective: objectives.ultimos30Dias,
					percentage: objectives.ultimos30Dias > 0 ? Math.min((monthRevenue / objectives.ultimos30Dias) * 100, 100) : 0,
				},
			};
			return kpis;
		} catch (error) {
			console.error("❌ Error fetching KPIs from transactions:", error);
			return {
				facturadoHoy: { amount: 0, objective: objectives.facturadoHoy, percentage: 0 },
				ultimos7Dias: { amount: 0, objective: objectives.ultimos7Dias, percentage: 0 },
				ultimos30Dias: { amount: 0, objective: objectives.ultimos30Dias, percentage: 0 },
			};
		}
	}

	async getSummary(): Promise<SubscriptionSummary> {
		try {
			console.log("🔍 Fetching subscriptions from:", urlsWorkbench.subscriptionsAll);
			const response = await apiClient.get<SubscriptionApiResponse>({
				url: urlsWorkbench.subscriptionsAll,
			});
			console.log("📊 Subscriptions Response:", response);

			const subscriptions = response?.data || [];

			const summary: SubscriptionSummary = {
				total: subscriptions.length,
				activas: subscriptions.filter((s) => s.estado === "activa").length,
				pendientesPago: subscriptions.filter((s) => s.estado === "pendiente_pago").length,
				vencidas: subscriptions.filter((s) => s.estado === "vencida").length,
				suspendidas: subscriptions.filter((s) => s.estado === "suspendida").length,
				canceladas: subscriptions.filter((s) => s.estado === "cancelada").length,
			};

			console.log("✅ Calculated Summary:", summary);
			return summary;
		} catch (error) {
			console.error("❌ Error fetching subscriptions summary:", error);
			return {
				total: 0,
				activas: 0,
				pendientesPago: 0,
				vencidas: 0,
				suspendidas: 0,
				canceladas: 0,
			};
		}
	}

	private mapToRecentSubscription(sub: SubscriptionEntity, dateField: string): RecentSubscription {
		return {
			id: sub.id,
			nombreNegocio: sub.nombreNegocio || "Negocio sin nombre",
			nombrePlan: sub.nombrePlan || "Plan no especificado",
			valorMensual: sub.valorMensual,
			fecha: dateField,
			estado: sub.estado,
		};
	}

	async getRecentSubscriptions(): Promise<RecentSubscription[]> {
		try {
			const response = await apiClient.get<SubscriptionApiResponse>({
				url: urlsWorkbench.subscriptionsAll,
			});

			const subscriptions = response?.data || [];
			const sevenDaysAgo = new Date();
			sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
			sevenDaysAgo.setHours(0, 0, 0, 0);

			const recent = [...subscriptions]
				.filter((s) => new Date(s.fechaInicio) >= sevenDaysAgo)
				.sort((a, b) => new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime())
				.slice(0, 5)
				.map((sub) => this.mapToRecentSubscription(sub, sub.fechaInicio));

			console.log("✅ Recent Subscriptions:", recent);
			return recent;
		} catch (error) {
			console.error("❌ Error fetching recent subscriptions:", error);
			return [];
		}
	}

	async getExpiredSubscriptions(): Promise<RecentSubscription[]> {
		try {
			const response = await apiClient.get<SubscriptionApiResponse>({
				url: urlsWorkbench.subscriptionsAll,
			});

			const subscriptions = response?.data || [];
			const sevenDaysAgo = new Date();
			sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
			sevenDaysAgo.setHours(0, 0, 0, 0);

			const expired = subscriptions
				.filter((s) => s.estado === "vencida" && new Date(s.fechaVencimiento) >= sevenDaysAgo)
				.sort((a, b) => new Date(b.fechaVencimiento).getTime() - new Date(a.fechaVencimiento).getTime())
				.slice(0, 5)
				.map((sub) => this.mapToRecentSubscription(sub, sub.fechaVencimiento));

			console.log("✅ Expired Subscriptions:", expired);
			return expired;
		} catch (error) {
			console.error("❌ Error fetching expired subscriptions:", error);
			return [];
		}
	}

	async getPendingPaymentSubscriptions(): Promise<RecentSubscription[]> {
		try {
			const response = await apiClient.get<SubscriptionApiResponse>({
				url: urlsWorkbench.subscriptionsAll,
			});

			const subscriptions = response?.data || [];
			const sevenDaysAgo = new Date();
			sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
			sevenDaysAgo.setHours(0, 0, 0, 0);

			const pending = subscriptions
				.filter((s) => s.estado === "pendiente_pago" && new Date(s.fechaVencimiento) >= sevenDaysAgo)
				.sort((a, b) => new Date(b.fechaVencimiento).getTime() - new Date(a.fechaVencimiento).getTime())
				.slice(0, 5)
				.map((sub) => this.mapToRecentSubscription(sub, sub.fechaVencimiento));

			return pending;
		} catch (error) {
			console.error("❌ Error fetching pending payment subscriptions:", error);
			return [];
		}
	}
}
