export interface Payment {
	monto: number;
	metodoPago: string;
	transaccionId: string;
}

export interface SubscriptionRenew {
	meses: number;
	pago: Payment;
}
