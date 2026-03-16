import apiClient from "@/core/api/apiClient";
import type {
	PaymentEntity,
	PaymentListResponse,
	PaymentStats,
	PaymentStatus,
} from "../../domain/entities/PaymentEntity";
import type { PaymentMethod } from "../../domain/entities/PaymentEntity";
import { urls } from "./constants";

// Mapeo estado API (Aprobada, Pendiente, Rechazada, etc.) -> PaymentStatus
function mapApiEstadoToPaymentStatus(estado: string): PaymentStatus {
	const e = (estado || "").toLowerCase();
	if (e === "aprobada") return "exitoso";
	if (e === "pendiente") return "pendiente";
	return "fallido"; // Rechazada, Fallida, Cancelada, Reembolsada
}

// Mapeo metodoPago API -> PaymentMethod
function mapApiMetodoToPaymentMethod(metodo: string): PaymentMethod {
	const m = (metodo || "").toLowerCase();
	if (m.includes("pse")) return "pse";
	if (m.includes("tarjeta") || m.includes("card") || m.includes("credit") || m.includes("debit")) return "tarjeta";
	return "transferencia";
}

// Mapeo estado PaymentStatus -> query API (para filtro)
function mapPaymentStatusToApiEstado(status: PaymentStatus): string | undefined {
	if (status === "exitoso") return "Aprobada";
	if (status === "pendiente") return "Pendiente";
	// fallido: API no tiene un único valor (Rechazada, Fallida, Cancelada); no filtramos por estado
	return undefined;
}

// Item crudo del API (GET /epayco/transactions/all)
interface ApiTransactionItem {
	id: string;
	negocioId: string;
	valor: number;
	moneda?: string;
	estado: string;
	metodoPago?: string;
	transaccionId?: string;
	referencia?: string;
	descripcion?: string;
	planName?: string;
	clienteNombre?: string;
	clienteEmail?: string;
	codigoRespuesta?: string;
	mensajeRespuesta?: string;
	createdAt?: string;
	fechaTransaccion?: string;
	nombreNegocio?: string;
	[key: string]: unknown;
}

function mapApiTransactionToPayment(item: ApiTransactionItem): PaymentEntity {
	const fecha = item.fechaTransaccion || item.createdAt || "";
	return {
		id: item.id,
		fecha,
		negocioId: item.negocioId || "",
		negocioNombre: (item.nombreNegocio as string) || item.negocioId || "",
		monto: Number(item.valor) ?? 0,
		moneda: (item.moneda as string) || undefined,
		metodo: mapApiMetodoToPaymentMethod(item.metodoPago || ""),
		transaccionId: item.transaccionId || item.referencia || item.id,
		referencia: (item.referencia as string) || undefined,
		descripcion: (item.descripcion as string) || undefined,
		planName: (item.planName as string) || undefined,
		clienteNombre: (item.clienteNombre as string) || undefined,
		clienteEmail: (item.clienteEmail as string) || undefined,
		codigoRespuesta: (item.codigoRespuesta as string) || undefined,
		mensajeRespuesta: (item.mensajeRespuesta as string) || undefined,
		estado: mapApiEstadoToPaymentStatus(item.estado),
	};
}

function computeStatsFromData(data: PaymentEntity[]): PaymentStats {
	const exitosos = data.filter((p) => p.estado === "exitoso");
	const pendientes = data.filter((p) => p.estado === "pendiente");
	const fallidos = data.filter((p) => p.estado === "fallido");
	return {
		exitosos: { count: exitosos.length, total: exitosos.reduce((acc, p) => acc + p.monto, 0) },
		pendientes: { count: pendientes.length, total: pendientes.reduce((acc, p) => acc + p.monto, 0) },
		fallidos: { count: fallidos.length, total: fallidos.reduce((acc, p) => acc + p.monto, 0) },
	};
}

export interface PaymentDatasource {
	getAll(filters?: {
		status?: PaymentStatus;
		page?: number;
		pageSize?: number;
		rango?: string;
	}): Promise<PaymentListResponse>;
	getById(id: string): Promise<PaymentEntity>;
	retry(id: string): Promise<PaymentEntity>;
	confirm(id: string): Promise<PaymentEntity>;
}

export class PaymentDatasourceImpl implements PaymentDatasource {
	async getAll(filters?: {
		status?: PaymentStatus;
		page?: number;
		pageSize?: number;
		rango?: string;
	}): Promise<PaymentListResponse> {
		const page = filters?.page ?? 1;
		const pageSize = filters?.pageSize ?? 10;
		const params: Record<string, string | number> = {
			page,
			limit: Math.min(Math.max(1, pageSize), 100),
		};
		if (filters?.rango) params.rango = filters.rango;
		const apiEstado = filters?.status != null ? mapPaymentStatusToApiEstado(filters.status) : undefined;
		if (apiEstado) params.estado = apiEstado;

		const response = await apiClient.get<{ data: ApiTransactionItem[]; total: number; page: number; limit: number; totalPages: number }>({
			url: urls.transactionsAll,
			config: { params },
		});

		const rawData = Array.isArray(response?.data) ? response.data : [];
		const data = rawData.map(mapApiTransactionToPayment);
		const total = response?.total ?? 0;

		return {
			data,
			stats: computeStatsFromData(data),
			total,
			page: response?.page ?? page,
			pageSize: response?.limit ?? pageSize,
		};
	}

	async getById(id: string): Promise<PaymentEntity> {
		// Opcional: GET /epayco/transactions/:id si el backend lo expone
		throw new Error("getById no implementado para transacciones admin");
	}

	async retry(id: string): Promise<PaymentEntity> {
		// Opcional: endpoint de reintento si existe
		throw new Error("retry no implementado para transacciones admin");
	}

	async confirm(id: string): Promise<PaymentEntity> {
		// Opcional: endpoint de confirmación si existe
		throw new Error("confirm no implementado para transacciones admin");
	}
}
