export type PaymentStatus = "exitoso" | "pendiente" | "fallido";

export type PaymentMethod = "transferencia" | "tarjeta" | "pse";

export interface PaymentEntity {
	id: string;
	fecha: string;
	negocioId: string;
	negocioNombre: string;
	monto: number;
	moneda?: string;
	metodo: PaymentMethod;
	transaccionId: string;
	referencia?: string;
	descripcion?: string;
	planName?: string;
	clienteNombre?: string;
	clienteEmail?: string;
	codigoRespuesta?: string;
	mensajeRespuesta?: string;
	estado: PaymentStatus;
}

export interface PaymentStats {
	exitosos: { count: number; total: number };
	pendientes: { count: number; total: number };
	fallidos: { count: number; total: number };
}

export interface PaymentListResponse {
	data: PaymentEntity[];
	stats: PaymentStats;
	total: number;
	page: number;
	pageSize: number;
}
