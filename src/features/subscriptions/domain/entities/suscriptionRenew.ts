export interface RenewPaymentMetodo {
	tipo: string;
	ultimosCuatroDigitos?: string;
	proveedor?: string;
}

export interface RenewPayment {
	monto: number;
	metodoPago: RenewPaymentMetodo;
}

export interface SubscriptionRenew {
	meses: number;
	fechaInicio: string;
	fechaVencimiento: string;
	valorTotal: number;
	valorMensual: number;
	pago: RenewPayment;
	notas?: string;
}
