// src/features/subscriptions/domain/entities/SubscriptionEntity.ts

// Tipos de método de pago
export type SubscriptionMetodoPagoTipo =
	| "tarjeta_credito"
	| "tarjeta_debito"
	| "pse"
	| "transferencia"
	| "efectivo";

export interface SubscriptionMetodoPago {
	tipo: SubscriptionMetodoPagoTipo;
	ultimosCuatroDigitos?: string;
	proveedor?: string;
}

// Estado del pago en historial
export type SubscriptionPagoEstado = "exitoso" | "fallido" | "pendiente";

export interface SubscriptionHistorialPago {
	fechaPago: string;
	monto: number;
	metodoPago: string;
	transaccionId: string;
	estado: SubscriptionPagoEstado;
	comprobanteUrl?: string;
}

// Límites actuales de la suscripción
export interface SubscriptionLimitesActuales {
	maxUsuarios: number;
	maxProductos: number;
	maxFacturasPorMes: number;
	usuariosActivos: number;
	productosCreados: number;
	facturasDelMes: number;
}

// Estado de la suscripción
export type SubscriptionEstado =
	| "activa"
	| "suspendida"
	| "cancelada"
	| "vencida"
	| "pendiente_pago";

// Moneda
export type SubscriptionMoneda = "COP" | "USD";

// Entidad principal de suscripción
export interface SubscriptionEntity {
	id: string;
	negocioId: string;
	nombreNegocio?: string;
	planId: string;
	nombrePlan?: string;
	estado: SubscriptionEstado;
	fechaInicio: string;
	fechaVencimiento: string;
	fechaCancelacion?: string;
	metodoPago: SubscriptionMetodoPago;
	valorMensual: number;
	valorTotal: number;
	moneda: SubscriptionMoneda;
	renovacionAutomatica: boolean;
	historialPagos?: SubscriptionHistorialPago[];
	limitesActuales?: SubscriptionLimitesActuales;
	notas?: string;
	creadoPor?: string;
	createdAt?: string;
	updatedAt?: string;
}

// Respuesta de lista
export interface SubscriptionListResponse {
	data: SubscriptionEntity[];
	total: number;
	page: number;
	pageSize: number;
}

// Helpers para la entidad (funciones de utilidad)
export const SubscriptionHelpers = {
	estaActiva(subscription: SubscriptionEntity): boolean {
		return subscription.estado === "activa" && new Date(subscription.fechaVencimiento) > new Date();
	},

	estaVencida(subscription: SubscriptionEntity): boolean {
		return new Date(subscription.fechaVencimiento) <= new Date();
	},

	puedeRenovarse(subscription: SubscriptionEntity): boolean {
		return (
			subscription.renovacionAutomatica &&
			(subscription.estado === "activa" || subscription.estado === "vencida") &&
			!subscription.fechaCancelacion
		);
	},

	estaCancelada(subscription: SubscriptionEntity): boolean {
		return subscription.estado === "cancelada" || !!subscription.fechaCancelacion;
	},

	diasRestantes(subscription: SubscriptionEntity): number {
		const hoy = new Date();
		const vencimiento = new Date(subscription.fechaVencimiento);
		const diferencia = vencimiento.getTime() - hoy.getTime();
		return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
	},

	porcentajeUsoUsuarios(subscription: SubscriptionEntity): number {
		const { limitesActuales } = subscription;
		if (!limitesActuales) return 0;
		return Math.min(
			(limitesActuales.usuariosActivos / limitesActuales.maxUsuarios) * 100,
			100
		);
	},

	porcentajeUsoProductos(subscription: SubscriptionEntity): number {
		const { limitesActuales } = subscription;
		if (!limitesActuales) return 0;
		return Math.min(
			(limitesActuales.productosCreados / limitesActuales.maxProductos) * 100,
			100
		);
	},

	porcentajeUsoFacturas(subscription: SubscriptionEntity): number {
		const { limitesActuales } = subscription;
		if (!limitesActuales) return 0;
		return Math.min(
			(limitesActuales.facturasDelMes / limitesActuales.maxFacturasPorMes) * 100,
			100
		);
	},

	puedeCrearUsuario(subscription: SubscriptionEntity): boolean {
		if (!subscription.limitesActuales) return true;
		return subscription.limitesActuales.usuariosActivos < subscription.limitesActuales.maxUsuarios;
	},

	puedeCrearProducto(subscription: SubscriptionEntity): boolean {
		if (!subscription.limitesActuales) return true;
		return subscription.limitesActuales.productosCreados < subscription.limitesActuales.maxProductos;
	},

	puedeCrearFactura(subscription: SubscriptionEntity): boolean {
		if (!subscription.limitesActuales) return true;
		return subscription.limitesActuales.facturasDelMes < subscription.limitesActuales.maxFacturasPorMes;
	},

	obtenerUltimoPago(subscription: SubscriptionEntity): SubscriptionHistorialPago | undefined {
		if (!subscription.historialPagos) return undefined;
		return subscription.historialPagos
			.filter((pago) => pago.estado === "exitoso")
			.sort((a, b) => new Date(b.fechaPago).getTime() - new Date(a.fechaPago).getTime())[0];
	},

	calcularTotalPagado(subscription: SubscriptionEntity): number {
		if (!subscription.historialPagos) return 0;
		return subscription.historialPagos
			.filter((pago) => pago.estado === "exitoso")
			.reduce((total, pago) => total + pago.monto, 0);
	},

	tienePagosPendientes(subscription: SubscriptionEntity): boolean {
		if (!subscription.historialPagos) return false;
		return subscription.historialPagos.some((pago) => pago.estado === "pendiente");
	},

	tienePagosFallidos(subscription: SubscriptionEntity): boolean {
		if (!subscription.historialPagos) return false;
		return subscription.historialPagos.some((pago) => pago.estado === "fallido");
	},

	necesitaRenovacion(subscription: SubscriptionEntity, diasAnticipacion: number = 7): boolean {
		const fechaLimite = new Date();
		fechaLimite.setDate(fechaLimite.getDate() + diasAnticipacion);
		return (
			new Date(subscription.fechaVencimiento) <= fechaLimite &&
			SubscriptionHelpers.estaActiva(subscription)
		);
	},

	obtenerResumenUso(subscription: SubscriptionEntity): {
		usuarios: { actual: number; maximo: number; porcentaje: number };
		productos: { actual: number; maximo: number; porcentaje: number };
		facturas: { actual: number; maximo: number; porcentaje: number };
	} | null {
		if (!subscription.limitesActuales) return null;
		return {
			usuarios: {
				actual: subscription.limitesActuales.usuariosActivos,
				maximo: subscription.limitesActuales.maxUsuarios,
				porcentaje: SubscriptionHelpers.porcentajeUsoUsuarios(subscription),
			},
			productos: {
				actual: subscription.limitesActuales.productosCreados,
				maximo: subscription.limitesActuales.maxProductos,
				porcentaje: SubscriptionHelpers.porcentajeUsoProductos(subscription),
			},
			facturas: {
				actual: subscription.limitesActuales.facturasDelMes,
				maximo: subscription.limitesActuales.maxFacturasPorMes,
				porcentaje: SubscriptionHelpers.porcentajeUsoFacturas(subscription),
			},
		};
	},
};

// Tipos para operaciones CRUD
export interface SubscriptionCreateRequest {
	negocioId: string;
	nombreNegocio: string;
	planId: string;
	nombrePlan: string;
	estado?: SubscriptionEstado;
	fechaInicio: string;
	fechaVencimiento: string;
	metodoPago: SubscriptionMetodoPago;
	valorMensual: number;
	valorTotal: number;
	moneda: SubscriptionMoneda;
	renovacionAutomatica?: boolean;
	notas?: string;
}

export interface SubscriptionUpdateRequest {
	planId?: string;
	nombreNegocio?: string;
	nombrePlan?: string;
	estado?: SubscriptionEstado;
	fechaInicio?: string;
	fechaVencimiento?: string;
	metodoPago?: SubscriptionMetodoPago;
	valorMensual?: number;
	valorTotal?: number;
	moneda?: SubscriptionMoneda;
	renovacionAutomatica?: boolean;
	notas?: string;
}
