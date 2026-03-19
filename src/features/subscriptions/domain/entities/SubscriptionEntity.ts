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

// Límites actuales de la suscripción (API puede enviar cajasRegistradorasActivas)
export interface SubscriptionLimitesActuales {
	maxUsuarios?: number;
	maxProductos?: number;
	maxFacturasPorMes?: number;
	maxCajasRegistradoras?: number;
	usuariosActivos?: number;
	productosCreados?: number;
	facturasDelMes?: number;
	cajasActivas?: number;
	cajasRegistradorasActivas?: number;
}

// Datos de facturación del negocio (API)
export interface SubscriptionDatosFacturacion {
	name?: string;
	last_name?: string;
	email?: string;
	doc_type?: string;
	doc_number?: string;
	type_person?: string;
	city?: string;
	address?: string;
	phone?: string;
	cell_phone?: string;
	id?: string;
	_id?: string;
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
	active?: boolean;
	updatedAt?: string;
	nit?: string;
	cedula?: string;
	epaycoCustomerId?: string;
	datosFacturacion?: SubscriptionDatosFacturacion;
}

// Respuesta de lista
export interface SubscriptionListResponse {
	data: SubscriptionEntity[];
	total: number;
	page: number;
	pageSize: number;
}

// Prorrateo aplicado a una transacción
export interface SubscriptionTransactionProrrateo {
	aplicaProrrateo: boolean;
	diasRestantes: number;
	creditoDiasNoUsados: number;
	precioPlanSinDescuento: number;
	totalAPagar: number;
}

// Descuento anual aplicado a una transacción
export interface SubscriptionTransactionDescuentoAnual {
	porcentaje: number;
	totalDescuento: number;
	descripcion: string;
}

// Datos adicionales de la pasarela (ePayco, etc.)
export interface SubscriptionTransactionDatosAdicionales {
	x_ref_payco?: string;
	x_cardnumber?: string;
	x_currency_code?: string;
	x_amount?: string;
	x_response_reason_text?: string;
	x_cod_transaction_state?: string;
	x_cod_respuesta?: string;
	x_transaction_id?: string;
	x_franchise?: string;
	x_test_request?: string;
	x_3ds_authentication?: string;
	[key: string]: string | undefined;
}

// Transacción ePayco (respuesta GET /epayco/transactions/by-business/:negocioId)
export interface SubscriptionTransactionEntity {
	id: string;
	negocioId: string;
	referencia: string;
	descripcion: string;
	valor: number;
	moneda: string;
	estado: string;
	metodoPago: string;
	transaccionId?: string;
	clienteNombre?: string;
	clienteEmail?: string;
	subscriptionId?: string;
	planId?: string;
	planName?: string;
	billingPeriod?: string;
	periodoFechaInicio?: string;
	periodoFechaFin?: string;
	prorrateo?: SubscriptionTransactionProrrateo;
	descuentoAnual?: SubscriptionTransactionDescuentoAnual;
	createdAt?: string;
	updatedAt?: string;
	// Campos adicionales del API
	factura?: string;
	bancoNombre?: string;
	codigoRespuesta?: string;
	mensajeRespuesta?: string;
	codigoAprobacion?: string;
	fechaTransaccion?: string;
	datosAdicionales?: SubscriptionTransactionDatosAdicionales;
}

export interface SubscriptionTransactionListResponse {
	data: SubscriptionTransactionEntity[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
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
		const actual = limitesActuales.usuariosActivos ?? 0;
		const maximo = limitesActuales.maxUsuarios ?? 0;
		if (maximo <= 0) return 0;
		return Math.min((actual / maximo) * 100, 100);
	},

	porcentajeUsoProductos(subscription: SubscriptionEntity): number {
		const { limitesActuales } = subscription;
		if (!limitesActuales) return 0;
		const actual = limitesActuales.productosCreados ?? 0;
		const maximo = limitesActuales.maxProductos ?? 0;
		if (maximo <= 0) return 0;
		return Math.min((actual / maximo) * 100, 100);
	},

	porcentajeUsoFacturas(subscription: SubscriptionEntity): number {
		const { limitesActuales } = subscription;
		if (!limitesActuales) return 0;
		const actual = limitesActuales.facturasDelMes ?? 0;
		const maximo = limitesActuales.maxFacturasPorMes ?? 0;
		if (maximo <= 0) return 0;
		return Math.min((actual / maximo) * 100, 100);
	},

	puedeCrearUsuario(subscription: SubscriptionEntity): boolean {
		const l = subscription.limitesActuales;
		if (!l) return true;
		if (l.maxUsuarios == null) return true;
		return (l.usuariosActivos ?? 0) < l.maxUsuarios;
	},

	puedeCrearProducto(subscription: SubscriptionEntity): boolean {
		const l = subscription.limitesActuales;
		if (!l) return true;
		if (l.maxProductos == null) return true;
		return (l.productosCreados ?? 0) < l.maxProductos;
	},

	puedeCrearFactura(subscription: SubscriptionEntity): boolean {
		const l = subscription.limitesActuales;
		if (!l) return true;
		if (l.maxFacturasPorMes == null) return true;
		return (l.facturasDelMes ?? 0) < l.maxFacturasPorMes;
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
		const la = subscription.limitesActuales;
		if (!la) return null;
		return {
			usuarios: {
				actual: la.usuariosActivos ?? 0,
				maximo: la.maxUsuarios ?? 0,
				porcentaje: SubscriptionHelpers.porcentajeUsoUsuarios(subscription),
			},
			productos: {
				actual: la.productosCreados ?? 0,
				maximo: la.maxProductos ?? 0,
				porcentaje: SubscriptionHelpers.porcentajeUsoProductos(subscription),
			},
			facturas: {
				actual: la.facturasDelMes ?? 0,
				maximo: la.maxFacturasPorMes ?? 0,
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
