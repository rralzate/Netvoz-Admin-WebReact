export interface RenewPaymentMetodo {
	tipo: string;
	ultimosCuatroDigitos?: string;
	proveedor?: string;
}

export interface RenewPayment {
	monto: number;
	metodoPago: RenewPaymentMetodo;
}

/** Datos de facturación para el endpoint renew (opcional). */
export interface DatosFacturacionRenew {
	name?: string;
	last_name?: string;
	email?: string;
	doc_type?: string;
	doc_number?: string;
	city?: string;
	address?: string;
	phone?: string;
	cell_phone?: string;
}

export interface SubscriptionRenew {
	/** Solo uso interno/UI; no se envía al API en POST /subscriptions/:id/renew */
	meses?: number;
	fechaInicio: string;
	fechaVencimiento: string;
	valorTotal: number;
	valorMensual: number;
	pago: RenewPayment;
	notas?: string;
	datosFacturacion?: DatosFacturacionRenew;
}
