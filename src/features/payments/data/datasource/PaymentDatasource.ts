import type {
	PaymentEntity,
	PaymentListResponse,
	PaymentStatus,
} from "../../domain/entities/PaymentEntity";

// Mock data for payments
const mockPayments: PaymentEntity[] = [
	{
		id: "1",
		fecha: "2025-01-15",
		negocioId: "n1",
		negocioNombre: "Restaurante El Buen Sabor",
		monto: 99900,
		metodo: "transferencia",
		transaccionId: "TRX-001234",
		estado: "exitoso",
	},
	{
		id: "2",
		fecha: "2025-01-10",
		negocioId: "n2",
		negocioNombre: "Tienda Moda Express",
		monto: 49900,
		metodo: "transferencia",
		transaccionId: "TRX-001235",
		estado: "pendiente",
	},
	{
		id: "3",
		fecha: "2025-01-10",
		negocioId: "n3",
		negocioNombre: "Farmacia Salud Total",
		monto: 199900,
		metodo: "tarjeta",
		transaccionId: "TRX-001236",
		estado: "exitoso",
	},
	{
		id: "4",
		fecha: "2025-01-08",
		negocioId: "n4",
		negocioNombre: "Supermercado Don Pedro",
		monto: 99900,
		metodo: "pse",
		transaccionId: "TRX-001237",
		estado: "fallido",
	},
];

export interface PaymentDatasource {
	getAll(filters?: {
		status?: PaymentStatus;
		page?: number;
		pageSize?: number;
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
	}): Promise<PaymentListResponse> {
		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 500));

		let filteredPayments = [...mockPayments];

		if (filters?.status) {
			filteredPayments = filteredPayments.filter(
				(p) => p.estado === filters.status
			);
		}

		const page = filters?.page || 1;
		const pageSize = filters?.pageSize || 10;
		const start = (page - 1) * pageSize;
		const paginatedPayments = filteredPayments.slice(start, start + pageSize);

		// Calculate stats
		const exitosos = mockPayments.filter((p) => p.estado === "exitoso");
		const pendientes = mockPayments.filter((p) => p.estado === "pendiente");
		const fallidos = mockPayments.filter((p) => p.estado === "fallido");

		return {
			data: paginatedPayments,
			stats: {
				exitosos: {
					count: exitosos.length,
					total: exitosos.reduce((acc, p) => acc + p.monto, 0),
				},
				pendientes: {
					count: pendientes.length,
					total: pendientes.reduce((acc, p) => acc + p.monto, 0),
				},
				fallidos: {
					count: fallidos.length,
					total: fallidos.reduce((acc, p) => acc + p.monto, 0),
				},
			},
			total: filteredPayments.length,
			page,
			pageSize,
		};
	}

	async getById(id: string): Promise<PaymentEntity> {
		await new Promise((resolve) => setTimeout(resolve, 300));
		const payment = mockPayments.find((p) => p.id === id);
		if (!payment) {
			throw new Error("Payment not found");
		}
		return payment;
	}

	async retry(id: string): Promise<PaymentEntity> {
		await new Promise((resolve) => setTimeout(resolve, 500));
		const payment = mockPayments.find((p) => p.id === id);
		if (!payment) {
			throw new Error("Payment not found");
		}
		// In real implementation, this would trigger a retry
		return { ...payment, estado: "pendiente" };
	}

	async confirm(id: string): Promise<PaymentEntity> {
		await new Promise((resolve) => setTimeout(resolve, 500));
		const payment = mockPayments.find((p) => p.id === id);
		if (!payment) {
			throw new Error("Payment not found");
		}
		// In real implementation, this would confirm the payment
		return { ...payment, estado: "exitoso" };
	}
}
